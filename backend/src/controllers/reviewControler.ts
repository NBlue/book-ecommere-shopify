const fs = require('fs');
const { connection, prsConnection } = require('../config/database');
const cloudinary = require('../config/cloudinary');
const data_export = require('json2csv').Parser;
const csv = require('csv-parser');

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

  getReviews: async (req: any, res: any) => {
    try {
      const { page, limit, sortBy, sortType } = req.query;
      const offset = (page - 1) * limit;

      const [data] = await prsConnection.query(
        `SELECT * FROM reviews ${
          sortBy && sortType ? `ORDER BY ${sortBy} ${sortType}` : ''
        } limit ? offset ?`,
        [+limit, +offset]
      );
      const [totalReviews] = await prsConnection.query(
        'SELECT count(*) AS count FROM reviews'
      );
      const totalPage = Math.ceil(+totalReviews[0]?.count / limit);

      return res.status(200).json({
        success: true,
        data: data,
        metadata: {
          totalItems: totalReviews[0]?.count,
          totalPages: totalPage,
        },
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

        let ratingCount = 0;
        for (let i = 0; i < results.length; i++) {
          ratingCount += results[i].rating;
        }
        const ratingMedium = Number((ratingCount / results.length).toFixed());
        return res
          .status(200)
          .json({ success: true, ratingMedium, data: results });
      });
    } catch (error) {
      return res
        .status(500)
        .json({ success: false, error: 'Internal Server Error' });
    }
  },

  getRatingCount: async (req: any, res: any) => {
    try {
      const handle = req.params.handle;
      let result: any = {};

      const countQueries = Array.from({ length: 5 }, (_, i) => {
        const rating = i + 1;
        const query = `SELECT COUNT(*) as count FROM reviews WHERE handle = '${handle}' and rating = ${rating}`;
        return new Promise<void>((resolve, reject) => {
          connection.query(query, (error: any, results: any) => {
            if (error) {
              console.log('ERROR', error);
              reject(error);
            } else {
              result[`rating-${rating}`] = results[0].count;
              resolve();
            }
          });
        });
      });

      // Wait for all count queries to finish
      await Promise.all(countQueries);

      const query = `SELECT * FROM reviews WHERE handle = '${handle}'`;
      connection.query(query, (error: any, results: any) => {
        if (error) {
          console.log('ERROR', error);
          return res
            .status(500)
            .json({ success: false, error: 'Internal Server Error' });
        }

        let ratingCount = 0;
        for (let i = 0; i < results.length; i++) {
          ratingCount += results[i].rating;
        }

        const ratingMedium = Number((ratingCount / results.length).toFixed());
        result['ratingMedium'] = ratingMedium;

        return res.status(200).json({ success: true, data: result });
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

  exportReviews: async (req: any, res: any) => {
    try {
      const [data] = await prsConnection.query(`SELECT * FROM reviews`);
      if (data.length > 0) {
        const mysqlData = JSON.parse(JSON.stringify(data));
        const fileHead = [
          'id',
          'email',
          'userId',
          'rating',
          'comment',
          'image_url',
          'handle',
          'createdAt',
          'updatedAt',
        ];
        const jsonData = new data_export({ fileHead });
        const csvData = jsonData.parse(mysqlData);

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader(
          'Content-Disposition',
          'attachment; filename=reviews.csv'
        );

        return res.status(200).end(csvData);
      } else {
        res.status(404).json({ error: 'No data found' });
      }
    } catch (error) {
      return res
        .status(500)
        .json({ success: false, error: 'Internal Server Error' });
    }
  },

  importReviews: async (req: any, res: any) => {
    try {
      const results: any = [];
      fs.createReadStream(req.file.path)
        .pipe(csv())
        .on('data', (data: any) => {
          results.push(data);
        })
        .on('end', () => {
          fs.unlinkSync(req.file.path);
          importResult(results);
          console.log(results);
        });

      const importResult = (data: any) => {
        console.log(data);
        const query =
          'INSERT INTO reviews (email, userId, rating, comment, image_url, handle) VALUES ?';
        const values = data.map((item: any) => [
          item.email,
          item.userId,
          item.rating,
          item.comment,
          item.image_url,
          item.handle,
        ]);
        connection.query(query, [values], (error: any, results: any) => {
          if (error)
            return res.status(400).json({
              success: false,
              message: 'import reviews errors',
              error: error,
            });
          return res
            .status(200)
            .json({ success: true, message: 'Add review successfully!' });
        });
      };
    } catch (error) {
      return res
        .status(500)
        .json({ success: false, error: 'Internal Server Error' });
    }
  },
};

module.exports = reviewControler;
