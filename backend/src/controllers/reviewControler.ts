const fs = require('fs');
const connection = require('../config/database');
const cloudinary = require('../config/cloudinary');

const reviewControler = {
  getAllReview: async (req: any, res: any) => {
    try {
      const query = 'SELECT * FROM reviews';
      connection.query(query, (error: any, results: any) => {
        if (error) console.log('ERROR', error);
        return res.status(200).json({ success: true, data: results });
      });
    } catch (error) {
      return res
        .status(500)
        .json({ success: false, error: 'Internal Server Error' });
    }
  },

  getReviewByBook: async (req: any, res: any) => {
    try {
      const handle = req.params.handle;
      const query = `SELECT * FROM reviews WHERE handle = '${handle}'`;
      connection.query(query, (error: any, results: any) => {
        if (error) console.log('ERROR', error);
        return res.status(200).json({ success: true, data: results });
      });
    } catch (error) {
      return res
        .status(500)
        .json({ success: false, error: 'Internal Server Error' });
    }
  },

  addReview: async (req: any, res: any) => {
    try {
      let query = null;
      const email = req.body.email;
      const userId = req.body.userId;
      const rating = req.body.rating;
      const comment = req.body.comment;
      const handle = req.body.handle;

      if (!req.file) {
        query = `INSERT INTO reviews (email, userId, rating, comment, handle) VALUES ('${email}', '${userId}', ${rating}, '${comment}', '${handle}')`;
      } else {
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: 'Reviews',
        });
        fs.unlinkSync(req.file.path);
        const image_url = result.secure_url;
        query = `INSERT INTO reviews (email, userId, rating, comment, image_url, handle) VALUES ('${email}', '${userId}', ${rating}, '${comment}', '${image_url}',  '${handle}')`;
      }

      connection.query(query, (error: any, results: any) => {
        if (error)
          return res.status(400).json({
            success: false,
            message: 'INSERT INTO reviews errors',
            error: error,
          });
        return res
          .status(200)
          .json({ success: true, message: 'Add review successfully!' });
      });
    } catch (error) {
      return res
        .status(500)
        .json({ success: false, error: 'Internal Server Error' });
    }
  },

  updateReview: async (req: any, res: any) => {
    try {
      const id = req.params.id;
      let dataUpdate = Object.entries(req.body)
        .map(([key, value]) => {
          if (key === 'image_url') return null;
          if (key === 'rating') return `${key} = ${value}`;
          return `${key} = '${value}'`;
        })
        .join(', ');

      if (!!req.file) {
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: 'Reviews',
        });
        const image_url = result.secure_url;
        fs.unlinkSync(req.file.path);
        dataUpdate += `, image_url = '${image_url}'`;
      }

      const query = `UPDATE reviews SET ${dataUpdate} WHERE id = ${id};`;

      connection.query(query, (error: any, results: any) => {
        if (error)
          return res.status(400).json({
            success: false,
            message: 'Update reviews errors',
            error: error,
          });
        return res
          .status(200)
          .json({ success: true, message: 'Update review successfully!' });
      });
    } catch (error) {
      return res
        .status(500)
        .json({ success: false, error: 'Internal Server Error' });
    }
  },

  deleteReview: async (req: any, res: any) => {
    try {
      const id = req.params.id;
      const query = `DELETE FROM reviews WHERE id = ${id}`;

      connection.query(query, (error: any, results: any) => {
        if (error)
          return res.status(400).json({
            success: false,
            message: 'DELETE reviews record errors',
            error: error,
          });
        return res
          .status(200)
          .json({ success: true, message: 'Delete review successfully!' });
      });
    } catch (error) {
      return res
        .status(500)
        .json({ success: false, error: 'Internal Server Error' });
    }
  },
};

module.exports = reviewControler;
