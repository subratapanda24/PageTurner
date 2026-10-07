const express = require('express');
const router = express.Router();
const {
  getBooks,
  searchBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
} = require('../controllers/bookController');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const { validateBook } = require('../middleware/validationMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Public search endpoint
router.get('/search', searchBooks);

// Base book endpoints
router.get('/', getBooks);
router.get('/:id', getBookById);

// Admin-protected CRUD endpoints with image upload support
router.post('/', protect, adminOnly, upload.single('coverImage'), validateBook, createBook);
router.put('/:id', protect, adminOnly, upload.single('coverImage'), updateBook);
router.delete('/:id', protect, adminOnly, deleteBook);

module.exports = router;
