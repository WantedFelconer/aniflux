import { AnimeModel } from './anime.model.js';

export const AnimeController = {
  async list(req, res, next) {
    try {
      const { q, genre, status, type, season, sort, page, limit } = req.query;
      const isAuthenticated = Boolean(req.user);

      const result = await AnimeModel.findAll(
        {
          search: q,
          genre,
          status,
          type,
          season,
          sort,
          page: parseInt(page || '1', 10),
          limit: parseInt(limit || '24', 10)
        },
        isAuthenticated
      );

      return res.json(result);
    } catch (err) {
      next(err);
    }
  },

  async getById(req, res, next) {
    try {
      const animeId = parseInt(req.params.id, 10);
      if (isNaN(animeId)) {
        return res.status(400).json({ error: 'Invalid anime ID' });
      }

      const isAuthenticated = Boolean(req.user);
      const anime = await AnimeModel.findById(animeId, isAuthenticated);

      if (!anime) {
        return res.status(404).json({ error: 'Anime not found' });
      }

      return res.json({ anime });
    } catch (err) {
      next(err);
    }
  },

  async create(req, res, next) {
    try {
      const { title } = req.body;
      if (!title || !title.trim()) {
        return res.status(400).json({ error: 'Title is required' });
      }

      const animeId = await AnimeModel.createAnime(req.body);
      const anime = await AnimeModel.findById(animeId, true);

      return res.status(201).json({
        success: true,
        message: 'Anime created successfully',
        anime
      });
    } catch (err) {
      next(err);
    }
  },

  async update(req, res, next) {
    try {
      const animeId = parseInt(req.params.id, 10);
      await AnimeModel.updateAnime(animeId, req.body);
      const updated = await AnimeModel.findById(animeId, true);

      return res.json({ success: true, anime: updated });
    } catch (err) {
      next(err);
    }
  },

  async remove(req, res, next) {
    try {
      const animeId = parseInt(req.params.id, 10);
      await AnimeModel.deleteAnime(animeId);
      return res.json({ success: true, message: 'Anime deleted' });
    } catch (err) {
      next(err);
    }
  },

  async updateStreams(req, res, next) {
    try {
      const animeId = parseInt(req.params.id, 10);
      const epNumber = parseInt(req.params.epNumber, 10);

      await AnimeModel.updateEpisodeStreams(animeId, epNumber, req.body);
      return res.json({ success: true, message: 'Episode stream updated successfully' });
    } catch (err) {
      next(err);
    }
  }
};

export default AnimeController;
