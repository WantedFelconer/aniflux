/**
 * Self-Supervised Stream Health Supervisor
 * Periodically audits Gumlet streams across all anime episodes, flags broken links,
 * auto-repairs metadata where possible, and maintains a timestamped error report log.
 */

import db from '../db.js';
import { validateGumletUrl } from './gumletService.js';

class StreamSupervisor {
  constructor() {
    this.intervalHandle = null;
    this.isRunningAudit = false;
    this.lastAuditResult = null;
    this.auditIntervalMinutes = parseInt(process.env.SUPERVISOR_INTERVAL_MINUTES || '30');
  }

  /**
   * Starts the background recurring audit job.
   */
  start() {
    if (this.intervalHandle) return;

    console.log(`[StreamSupervisor] Initialized. Background catalog audits every ${this.auditIntervalMinutes} minutes.`);

    // Run an initial quick audit after 5 seconds
    setTimeout(() => {
      this.runAudit('scheduled_initial');
    }, 5000);

    // Setup recurring timer
    const intervalMs = this.auditIntervalMinutes * 60 * 1000;
    this.intervalHandle = setInterval(() => {
      this.runAudit('scheduled_cron');
    }, intervalMs);
  }

  /**
   * Stops the supervisor interval.
   */
  stop() {
    if (this.intervalHandle) {
      clearInterval(this.intervalHandle);
      this.intervalHandle = null;
      console.log('[StreamSupervisor] Stopped.');
    }
  }

  /**
   * Executes a full self-supervised catalog audit.
   * @param {string} trigger - e.g. 'admin_manual', 'scheduled_cron'
   * @returns {Promise<object>} Audit summary
   */
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
      // 1. Fetch all episodes across all anime
      const episodes = await db.getAllEpisodesForAudit();

      for (const ep of episodes) {
        if (!ep.gumlet_url && !ep.gumlet_asset_id) continue;

        totalChecked++;
        const targetUrl = ep.gumlet_url || ep.gumlet_asset_id;
        const validation = await validateGumletUrl(targetUrl, true);

        const newStatus = validation.valid ? 'healthy' : 'broken';
        const errorMsg = validation.valid ? null : (validation.error || 'Stream validation failed');

        // Check if status changed
        const statusChanged = ep.stream_status !== newStatus;
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

          // Log error to DB
          await db.logStreamError({
            animeId: ep.anime_id,
            episodeNumber: ep.episode_number,
            url: targetUrl,
            errorReason: errorMsg,
            httpStatus: validation.httpStatus || 0
          });
        }

        // Update episode record in DB
        await db.updateEpisodeStreamStatus({
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

  /**
   * Returns current supervisor metrics & last audit details.
   */
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
