const validateRegister = (req, res, next) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Please provide name, email, and password' });
  }
  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters long' });
  }
  next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Please provide email and password' });
  }
  next();
};

const validateBook = (req, res, next) => {
  const { title, author, genre, price, description } = req.body;
  if (!title || !author || !genre || price === undefined || !description) {
    return res.status(400).json({ message: 'Title, author, genre, price, and description are required' });
  }
  if (isNaN(price) || Number(price) < 0) {
    return res.status(400).json({ message: 'Price must be a valid non-negative number' });
  }
  next();
};

const validateReview = (req, res, next) => {
  const { bookId, rating, comment } = req.body;
  if (!bookId || !rating || !comment) {
    return res.status(400).json({ message: 'bookId, rating (1-5), and comment are required' });
  }
  if (rating < 1 || rating > 5) {
    return res.status(400).json({ message: 'Rating must be between 1 and 5' });
  }
  next();
};

module.exports = {
  validateRegister,
  validateLogin,
  validateBook,
  validateReview,
};
