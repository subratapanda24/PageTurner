const User = require('../models/User');
const Book = require('../models/Book');
const Review = require('../models/Review');
const Order = require('../models/Order');

const initialBooks = [
  {
    title: 'The Psychology of Money',
    author: 'Morgan Housel',
    genre: 'Finance',
    price: 399,
    stock: 28,
    description: 'Doing well with money isn’t necessarily about what you know. It’s about how you behave. Timeless lessons on wealth, greed, and happiness.',
    coverImage: '/uploads/psychology-of-money.jpg',
    averageRating: 5.0,
    numReviews: 245,
  },
  {
    title: 'Atomic Habits',
    author: 'James Clear',
    genre: 'Self-Help',
    price: 499,
    stock: 30,
    description: 'An easy and proven way to build good habits and break bad ones. Tiny changes, remarkable results for transforming your everyday life.',
    coverImage: '/uploads/atomic-habits.jpg',
    averageRating: 4.9,
    numReviews: 312,
  },
  {
    title: 'The Last Thing He Told Me',
    author: 'Laura Dave',
    genre: 'Mystery',
    price: 499,
    stock: 25,
    description: 'Before Owen Michaels disappears, he smuggles a note to his beloved wife of one year: Protect her. A gripping mystery about family, identity, and secrets.',
    coverImage: '/uploads/the-last-thing-he-told-me.jpg',
    averageRating: 4.8,
    numReviews: 124,
  },
  {
    title: 'False Witness: A Novel',
    author: 'Karin Slaughter',
    genre: 'Fiction',
    price: 450,
    stock: 20,
    description: 'Leigh Collier has worked hard to build a normal life. She is a defense attorney on the brink of making partner, until a new high-profile case brings her past back.',
    coverImage: '/uploads/false-witness.jpg',
    averageRating: 4.5,
    numReviews: 89,
  },
  {
    title: 'Malibu Rising',
    author: 'Taylor Jenkins Reid',
    genre: 'Fiction',
    price: 520,
    stock: 18,
    description: 'Four famous siblings throw an epic party to celebrate the end of the summer. But over the course of twenty-four hours, the family secrets that shaped them explode.',
    coverImage: '/uploads/malibu-rising.jpg',
    averageRating: 4.7,
    numReviews: 210,
  },
  {
    title: 'Left to Fear',
    author: 'Blake Pierce',
    genre: 'Mystery',
    price: 380,
    stock: 15,
    description: 'An FBI suspense thriller that follows Adele Sharp as she races across Europe to track down an elusive killer before another victim disappears.',
    coverImage: '/uploads/left-to-fear.jpg',
    averageRating: 4.4,
    numReviews: 45,
  },
  {
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    genre: 'Fiction',
    price: 299,
    stock: 35,
    description: 'The story of the fabulously wealthy Jay Gatsby and his new love for the beautiful Daisy Buchanan. An exquisite portrait of the Jazz Age.',
    coverImage: '/uploads/great-gatsby.jpg',
    averageRating: 4.7,
    numReviews: 420,
  },
  {
    title: 'Game of Thrones',
    author: 'George R.R. Martin',
    genre: 'Fantasy',
    price: 699,
    stock: 22,
    description: 'A Song of Ice and Fire: Book One. Summer spans decades. Winter can last a lifetime. And the struggle for the Iron Throne has begun.',
    coverImage: '/uploads/game-of-thrones.jpg',
    averageRating: 4.9,
    numReviews: 530,
  },
  {
    title: 'Harry Potter',
    author: 'J.K. Rowling',
    genre: 'Fantasy',
    price: 599,
    stock: 40,
    description: 'Harry Potter has never even heard of Hogwarts when the letters start dropping on the doormat at number four, Privet Drive. A magical adventure.',
    coverImage: '/uploads/harry-potter.jpg',
    averageRating: 4.9,
    numReviews: 680,
  },
  {
    title: 'Dune',
    author: 'Frank Herbert',
    genre: 'Sci-Fi',
    price: 699,
    stock: 22,
    description: 'Set on the desert planet Arrakis, Dune is the story of Paul Atreides and his journey to become the savior of mankind.',
    coverImage: '/uploads/dune.jpg',
    averageRating: 4.9,
    numReviews: 180,
  },
  {
    title: 'Clean Code',
    author: 'Robert C. Martin',
    genre: 'Tech',
    price: 899,
    stock: 12,
    description: 'Even bad code can function. But if code isn’t clean, it can bring a development organization to its knees.',
    coverImage: '/uploads/clean-code.jpg',
    averageRating: 4.7,
    numReviews: 95,
  },
  {
    title: 'Black Ice',
    author: 'Brad Thor',
    genre: 'Mystery',
    price: 599,
    stock: 16,
    description: 'Scot Harvath faces a deadly rivalry in the frozen high north in this electrifying international espionage thriller by bestselling author Brad Thor.',
    coverImage: '/uploads/black-ice.jpg',
    averageRating: 4.6,
    numReviews: 68,
  },
  {
    title: 'Blind Tiger',
    author: 'Sandra Brown',
    genre: 'Fiction',
    price: 480,
    stock: 14,
    description: 'A riveting historical novel set in 1920 Texas, following a former soldier and an ambitious woman embroiled in the violent moonshine trade.',
    coverImage: '/uploads/blind-tiger.jpg',
    averageRating: 4.5,
    numReviews: 53,
  },
  {
    title: 'The Notebook',
    author: 'Nicholas Sparks',
    genre: 'Fiction',
    price: 350,
    stock: 20,
    description: 'A story of miracles and emotions that will stay with you forever. Set amid the austere beauty of coastal North Carolina.',
    coverImage: '/uploads/the-notebook.jpg',
    averageRating: 4.6,
    numReviews: 156,
  },
  {
    title: 'How to Stop Worrying and Start Living',
    author: 'Dale Carnegie',
    genre: 'Self-Help',
    price: 399,
    stock: 25,
    description: 'Time-tested methods for conquering anxiety, overcoming stress, and leading a happier, more fulfilling life.',
    coverImage: '/uploads/how-to-stop-worrying.jpg',
    averageRating: 4.8,
    numReviews: 178,
  }
];

const seedData = async () => {
  try {
    let adminUser = await User.findOne({ email: 'admin@pageturner.com' });
    if (!adminUser) {
      adminUser = await User.create({
        name: 'Admin User',
        email: 'admin@pageturner.com',
        password: 'password123',
        role: 'admin',
      });
    }

    let demoUser = await User.findOne({ email: 'user@pageturner.com' });
    if (!demoUser) {
      demoUser = await User.create({
        name: 'John Doe',
        email: 'user@pageturner.com',
        password: 'password123',
        role: 'user',
      });
    }

    // Ensure all curated books exist and have up-to-date covers and metadata
    for (const b of initialBooks) {
      const existing = await Book.findOne({ title: b.title });
      if (!existing) {
        await Book.create(b);
      } else {
        await Book.updateOne(
          { _id: existing._id },
          { 
            $set: { 
              coverImage: b.coverImage,
              author: b.author,
              price: b.price,
              genre: b.genre,
              averageRating: b.averageRating,
              description: b.description
            } 
          }
        );
      }
    }

    // Ensure at least one initial order and review exist for the demo user
    const orderCount = await Order.countDocuments();
    if (orderCount === 0) {
      const firstBook = await Book.findOne({ title: 'The Psychology of Money' }) || await Book.findOne();
      if (firstBook) {
        await Order.create({
          user: demoUser._id,
          items: [
            {
              book: firstBook._id,
              title: firstBook.title,
              price: firstBook.price,
              quantity: 1,
            },
          ],
          totalAmount: firstBook.price,
          paymentStatus: 'paid',
          orderStatus: 'delivered',
          razorpayOrderId: 'order_seed_demo_101',
          razorpayPaymentId: 'pay_seed_demo_101',
        });

        await Review.create({
          book: firstBook._id,
          user: demoUser._id,
          userName: demoUser.name,
          rating: 5,
          comment: 'Could not put it down! Captivating from start to finish.',
        });
      }
    }

    console.log(`Database synced successfully with all ${initialBooks.length} curated books.`);
  } catch (error) {
    console.error('Error seeding data:', error.message);
  }
};

module.exports = seedData;
