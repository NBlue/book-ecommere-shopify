const express = require('express');
const router = express.Router();

const reviewController = require('../controllers/reviewControler');

router.get('/', reviewController.getAllReview);

module.exports = router;
