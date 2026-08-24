import { AdminModel } from '../modules/admin/admin.model.js';
import { validateGumletUrl } from './gumletService.js';

class StreamSupervisor {
  constructor() {
    this.intervalHandle = null;
    this.isRunningAudit = false;
    this.lastAuditResult = null;
    this.auditIntervalMinutes = parseInt(process.env.SUPERVISOR_INTERVAL_MINUTES || '30', 10);
  }

  start() {
    if (this.intervalHandle) return;

    console.log(`[StreamSupervisor] Initialized. Background catalog audits every ${this.auditIntervalMinutes} minutes.`);

    // Initial audit after 5s
    setTimeout(() => {
      this.runAudit('scheduled_initial');
    }, 5000);

    const intervalMs = this.auditIntervalMinutes * 60 * 1000;
    this.intervalHandle = setInterval(() => {
      this.runAudit('scheduled_cron');
    }, intervalMs);
  }

  stop() {
    if (this.intervalHandle) {
      clearInterval(this.intervalHandle);
      this.intervalHandle = null;
      console.log('[StreamSupervisor] Stopped.');
    }
  }

  async runAudit(trigger = 'manual') {
    if (this.isRunningAudit) {
      return {
        status: 'already_running',
        message: 'A stream audit is already in progress.',
        lastAudit: this.lastAuditResult
      };
    }

    this.isRunningAudit = true;
    const startTime = new Date();
    console.log(`[StreamSupervisor] Starting stream health audit triggered by: ${trigger}...`);

    let totalChecked = 0;
    let healthyCount = 0;
    let brokenCount = 0;
    let repairedCount = 0;
    const brokenItems = [];

    try {
      const episodes = await AdminModel.getAllEpisodesForAudit();

      for (const ep of episodes) {
        if (!ep.gumlet_url && !ep.gumlet_asset_id) continue;

        totalChecked++;
        const targetUrl = ep.gumlet_url || ep.gumlet_asset_id;
        const validation = await validateGumletUrl(targetUrl, true);

        const newStatus = validation.valid ? 'healthy' : 'broken';
        const errorMsg = validation.valid ? null : (validation.error || 'Stream validation failed');

        if (validation.valid) {
          healthyCount++;
          if (ep.stream_status === 'broken') {
            repairedCount++;
            console.log(`[StreamSupervisor] Self-repaired link for Anime #${ep.anime_id} Ep #${ep.episode_number}!`);
          }
        } else {
          brokenCount++;
          brokenItems.push({
            animeId: ep.anime_id,
            animeTitle: ep.anime_title || `Anime #${ep.anime_id}`,
            episodeNumber: ep.episode_number,
            episodeTitle: ep.title,
            gumletUrl: ep.gumlet_url,
            error: errorMsg,
            lastCheckedAt: new Date().toISOString()
          });

          await AdminModel.logStreamError({
            animeId: ep.anime_id,
            episodeNumber: ep.episode_number,
            url: targetUrl,
            errorReason: errorMsg,
            httpStatus: validation.httpStatus || 0
          });
        }

        await AdminModel.updateEpisodeStreamStatus({
          animeId: ep.anime_id,
          episodeNumber: ep.episode_number,
          streamStatus: newStatus,
          lastCheckedAt: new Date(),
          errorMessage: errorMsg,
          gumletAssetId: validation.assetId || ep.gumlet_asset_id
        });
      }

      const endTime = new Date();
      const durationMs = endTime - startTime;

      this.lastAuditResult = {
        trigger,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        durationMs,
        totalChecked,
        healthyCount,
        brokenCount,
        repairedCount,
        brokenItems
      };

      console.log(`[StreamSupervisor] Audit completed in ${durationMs}ms: ${healthyCount} healthy, ${brokenCount} broken.`);
      return this.lastAuditResult;
    } catch (err) {
      console.error('[StreamSupervisor] Audit error:', err);
      return {
        status: 'error',
        error: err.message,
        timestamp: new Date().toISOString()
      };
    } finally {
      this.isRunningAudit = false;
    }
  }

  getStatus() {
    return {
      active: !!this.intervalHandle,
      intervalMinutes: this.auditIntervalMinutes,
      isRunningAudit: this.isRunningAudit,
      lastAudit: this.lastAuditResult
    };
  }
}

export const streamSupervisor = new StreamSupervisor();
export default streamSupervisor;
