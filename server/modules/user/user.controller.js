import { UserModel } from './user.model.js';

export const UserController = {
  async getFavorites(req, res, next) {
    try {
      const favorites = await UserModel.getFavorites(req.user.user_id);
      return res.json({ favorites, animeIds: favorites.map(a => a.id) });
    } catch (err) {
      next(err);
    }
  },

  async addFavorite(req, res, next) {
    try {
      const animeId = parseInt(req.params.animeId, 10);
      if (isNaN(animeId)) {
        return res.status(400).json({ error: 'Invalid anime ID' });
      }

      await UserModel.addFavorite(req.user.user_id, animeId);
      return res.json({ success: true, message: 'Added to favorites', animeId });
    } catch (err) {
      next(err);
    }
  },

  async removeFavorite(req, res, next) {
    try {
      const animeId = parseInt(req.params.animeId, 10);
      if (isNaN(animeId)) {
        return res.status(400).json({ error: 'Invalid anime ID' });
      }

      await UserModel.removeFavorite(req.user.user_id, animeId);
      return res.json({ success: true, message: 'Removed from favorites', animeId });
    } catch (err) {
      next(err);
    }
  },

  async getBookmarks(req, res, next) {
    try {
      const bookmarks = await UserModel.getBookmarks(req.user.user_id);
      return res.json({ bookmarks, animeIds: bookmarks.map(a => a.id) });
    } catch (err) {
      next(err);
    }
  },

  async addBookmark(req, res, next) {
    try {
      const animeId = parseInt(req.params.animeId, 10);
      if (isNaN(animeId)) {
        return res.status(400).json({ error: 'Invalid anime ID' });
      }

      await UserModel.addBookmark(req.user.user_id, animeId);
      return res.json({ success: true, message: 'Added to bookmarks', animeId });
    } catch (err) {
      next(err);
    }
  },

  async removeBookmark(req, res, next) {
    try {
      const animeId = parseInt(req.params.animeId, 10);
      if (isNaN(animeId)) {
        return res.status(400).json({ error: 'Invalid anime ID' });
      }

      await UserModel.removeBookmark(req.user.user_id, animeId);
      return res.json({ success: true, message: 'Removed from bookmarks', animeId });
    } catch (err) {
      next(err);
    }
  },

  async getPreferences(req, res, next) {
    try {
      const prefs = await UserModel.getPreferences(req.user.user_id);
      return res.json({ preferences: prefs || {} });
    } catch (err) {
      next(err);
    }
  },

  async updatePreferences(req, res, next) {
    try {
      await UserModel.updatePreferences(req.user.user_id, req.body);
      const updated = await UserModel.getPreferences(req.user.user_id);
      return res.json({ success: true, preferences: updated });
    } catch (err) {
      next(err);
    }
  },

  async getLibrary(req, res, next) {
    try {
      const library = await UserModel.getLibrary(req.user.user_id);
      return res.json({ library });
    } catch (err) {
      next(err);
    }
  },

  async updateLibrary(req, res, next) {
    try {
      const animeId = parseInt(req.params.animeId, 10);
      if (isNaN(animeId)) {
        return res.status(400).json({ error: 'Invalid anime ID' });
      }

      await UserModel.updateLibraryEntry(req.user.user_id, animeId, req.body);
      return res.json({ success: true, message: 'Library updated' });
    } catch (err) {
      next(err);
    }
  }
};

export default UserController;
