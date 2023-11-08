var connection = require('../config/database');

const reviewControler = {
  getAllReview: async (req: any, res: any) => {
    try {
      const query = 'SELECT * FROM reviews';
      connection.query(query, (error: any, results: any) => {
        if (error) console.log('ERROR', error);
        return res.status(200).json({ success: true, data: results });
      });
    } catch (error) {
      console.log('ERROR', error);
    }
  },
};

module.exports = reviewControler;
