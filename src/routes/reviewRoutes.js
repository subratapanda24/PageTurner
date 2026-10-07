const express = require('express');
const router = express.Router();
const { addReview, getReviewsByBook } = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');
const { validateReview } = require('../middleware/validationMiddleware');

router.post('/', protect, validateReview, addReview);
router.get('/book/:id', getReviewsByBook);

module.exports = router;
