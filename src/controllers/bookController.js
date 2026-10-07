const Book = require('../models/Book');
const { uploadToFirebaseStorage } = require('../config/firebase');

// @desc    Fetch all books with filtering & pagination
// @route   GET /api/books
// @access  Public
const getBooks = async (req, res) => {
  try {
    const { genre, sort, limit = 50, page = 1 } = req.query;
    let query = {};

    if (genre && genre !== 'All') {
      query.genre = new RegExp(`^${genre}$`, 'i');
    }

    let sortOptions = { createdAt: -1 };
    if (sort === 'price-asc') sortOptions = { price: 1 };
    if (sort === 'price-desc') sortOptions = { price: -1 };
    if (sort === 'rating') sortOptions = { averageRating: -1 };

    const count = await Book.countDocuments(query);
    const books = await Book.find(query)
      .sort(sortOptions)
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    res.json({
      books,
      page: Number(page),
      pages: Math.ceil(count / limit),
      totalBooks: count,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Search books by keyword (title, author, genre, description)
// @route   GET /api/books/search
// @access  Public
const searchBooks = async (req, res) => {
  try {
    const keyword = req.query.keyword || '';
    if (!keyword.trim()) {
      const books = await Book.find({}).limit(20);
      return res.json({ books, count: books.length });
    }

    const regex = new RegExp(keyword, 'i');
    const books = await Book.find({
      $or: [
        { title: regex },
        { author: regex },
        { genre: regex },
        { description: regex },
      ],
    });

    res.json({
      keyword,
      count: books.length,
      books,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Fetch single book by ID
// @route   GET /api/books/:id
// @access  Public
const getBookById = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (book) {
      res.json(book);
    } else {
      res.status(404).json({ message: 'Book not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new book (Supports cover image file upload to Firebase / Local disk)
// @route   POST /api/books
// @access  Private/Admin
const createBook = async (req, res) => {
  try {
    const { title, author, genre, price, description, stock, coverImageUrl } = req.body;

    let coverImage = coverImageUrl || '/uploads/default-book-cover.png';

    if (req.file) {
      const uploadedUrl = await uploadToFirebaseStorage(req.file);
      if (uploadedUrl) {
        coverImage = uploadedUrl;
      }
    }

    const book = new Book({
      title,
      author,
      genre,
      price: Number(price),
      description,
      stock: stock ? Number(stock) : 10,
      coverImage,
    });

    const createdBook = await book.save();
    res.status(201).json(createdBook);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a book
// @route   PUT /api/books/:id
// @access  Private/Admin
const updateBook = async (req, res) => {
  try {
    const { title, author, genre, price, description, stock, coverImageUrl } = req.body;

    const book = await Book.findById(req.params.id);

    if (book) {
      book.title = title || book.title;
      book.author = author || book.author;
      book.genre = genre || book.genre;
      if (price !== undefined) book.price = Number(price);
      book.description = description || book.description;
      if (stock !== undefined) book.stock = Number(stock);

      if (req.file) {
        const uploadedUrl = await uploadToFirebaseStorage(req.file);
        if (uploadedUrl) {
          book.coverImage = uploadedUrl;
        }
      } else if (coverImageUrl) {
        book.coverImage = coverImageUrl;
      }

      const updatedBook = await book.save();
      res.json(updatedBook);
    } else {
      res.status(404).json({ message: 'Book not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a book
// @route   DELETE /api/books/:id
// @access  Private/Admin
const deleteBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (book) {
      await Book.deleteOne({ _id: req.params.id });
      res.json({ message: 'Book deleted successfully' });
    } else {
      res.status(404).json({ message: 'Book not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getBooks,
  searchBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
};
