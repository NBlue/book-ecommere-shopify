const express = require('express');
const router = express.Router();
const files = require('../middleware/multer');

const reviewController = require('../controllers/reviewControler');

router.post(
  '/import',
  files.single('reviews-csv'),
  reviewController.importReviews
);
router.get('/export', reviewController.exportReviews);
router.delete('/:id', reviewController.deleteReview);
router.put('/:id', files.single('image_url'), reviewController.updateReview);
router.post('/', files.single('image_url'), reviewController.addReview);
router.get('/rating-count/:handle', reviewController.getRatingCount);
router.get('/:handle', reviewController.getReviewByBook);
router.get('/', reviewController.getReviews);
// router.get('/', reviewController.getAllReview);

module.exports = router;
