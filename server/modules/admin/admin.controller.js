import { AdminModel } from './admin.model.js';
import { validateGumletUrl } from '../../services/gumletService.js';
import { streamSupervisor } from '../../services/supervisor.js';

export const AdminController = {
  async getStats(req, res, next) {
    try {
      const stats = await AdminModel.getStats();
      return res.json({
        stats: {
          ...stats,
          streamingEngine: 'Gumlet Video Adaptive Player (HLS/Dash/MP4)',
          storageMode: process.env.DB_HOST ? 'MySQL Cloud' : 'In-Memory Mock',
          supervisorStatus: streamSupervisor.getStatus(),
          serverTime: new Date().toISOString()
        }
      });
    } catch (err) {
      next(err);
    }
  },

  async validateGumlet(req, res, next) {
    try {
      const { url } = req.body;
      if (!url || typeof url !== 'string' || !url.trim()) {
        return res.status(400).json({
          valid: false,
          error: 'Please provide a valid Gumlet video URL or Asset ID.'
        });
      }

      const validation = await validateGumletUrl(url.trim(), true);
      return res.json({
        success: true,
        url: url.trim(),
        ...validation
      });
    } catch (err) {
      next(err);
    }
  },

  async getBrokenStreams(req, res, next) {
    try {
      const brokenLogs = await AdminModel.getBrokenStreamReports();
      const allEpisodes = await AdminModel.getAllEpisodesForAudit();
      const brokenEpisodes = allEpisodes.filter(e => e.stream_status === 'broken');

      return res.json({
        summary: {
          totalAudited: allEpisodes.length,
          healthyCount: allEpisodes.filter(e => e.stream_status === 'healthy').length,
          brokenCount: brokenEpisodes.length,
          unverifiedCount: allEpisodes.filter(e => e.stream_status === 'unverified').length,
          lastAudit: streamSupervisor.getStatus().lastAudit
        },
        brokenEpisodes,
        errorLogs: brokenLogs
      });
    } catch (err) {
      next(err);
    }
  },

  async scanNow(req, res, next) {
    try {
      const auditResult = await streamSupervisor.runAudit('admin_manual');
      return res.json({
        success: true,
        message: 'Self-supervised catalog stream audit completed!',
        audit: auditResult
      });
    } catch (err) {
      next(err);
    }
  },

  async resolveError(req, res, next) {
    try {
      const logId = parseInt(req.params.id, 10);
      await AdminModel.resolveStreamError(logId);
      return res.json({ success: true, message: 'Error log resolved' });
    } catch (err) {
      next(err);
    }
  },

  async getUsers(req, res, next) {
    try {
      const users = await AdminModel.getUsers();
      return res.json({ users });
    } catch (err) {
      next(err);
    }
  }
};

export default AdminController;
