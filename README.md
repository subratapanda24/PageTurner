# 📚 PageTurner — Online Bookstore

**Case Study 82: Backend Development — Online Bookstore**  
B.Tech CSE | Backend Development — Node.js / Express.js / MongoDB

A full-stack Online Bookstore web application with a REST API backend and a premium frontend, featuring JWT authentication, Razorpay payment integration, Firebase Storage for book covers, Swagger API documentation, and a downloadable Postman collection.

---

## ✨ Features

- **User Authentication** — Register, Login with JWT tokens
- **Book Catalog** — Browse, search, filter by genre, and sort books
- **Shopping Cart** — Add/remove/update cart items
- **Orders & Payments** — Place orders with Razorpay integration (sandbox/mock supported)
- **Reviews & Ratings** — Rate and review purchased books (auto-updates book ratings)
- **Recommendations** — Personalized book recommendations based on purchase history
- **Firebase Storage** — Upload book cover images (falls back to local disk if not configured)
- **Admin Panel** — Full CRUD for managing books (create, update, delete)
- **Swagger API Docs** — Interactive API documentation at `/api-docs`
- **Postman Collection** — Downloadable from `/api/postman-collection`

---

## 🚀 Quick Start

### Prerequisites
- Node.js v18+ and npm
- MongoDB (local or Atlas) — *optional, the app auto-starts an in-memory MongoDB if none is available*

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd Book

# Install dependencies
npm install

# Start development server
npm run dev
```

The server starts at **http://localhost:5050** (or port specified in `.env`) with auto-seeded demo data.

### Default Demo Accounts
| Role  | Email                   | Password     |
|-------|-------------------------|--------------|
| Admin | admin@pageturner.com    | password123  |
| User  | user@pageturner.com     | password123  |

---

## 📁 Project Structure

```
Book/
├── public/                   # Frontend (Served as static files)
│   ├── index.html
│   ├── css/styles.css
│   └── js/app.js
├── src/
│   ├── config/
│   │   ├── db.js             # MongoDB connection (with Memory Server fallback)
│   │   ├── firebase.js       # Firebase Admin SDK initialization
│   │   ├── razorpay.js       # Razorpay SDK initialization
│   │   └── swagger.js        # Swagger/OpenAPI configuration
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── bookController.js
│   │   ├── cartController.js
│   │   ├── orderController.js
│   │   ├── reviewController.js
│   │   └── recommendationController.js
│   ├── middleware/
│   │   ├── authMiddleware.js       # JWT verification & admin guard
│   │   ├── uploadMiddleware.js     # Multer file upload
│   │   ├── validationMiddleware.js # Request validation
│   │   └── errorMiddleware.js      # Error handling
│   ├── models/
│   │   ├── User.js
│   │   ├── Book.js
│   │   ├── Cart.js
│   │   ├── Order.js
│   │   └── Review.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── bookRoutes.js
│   │   ├── cartRoutes.js
│   │   ├── orderRoutes.js
│   │   ├── reviewRoutes.js
│   │   └── recommendationRoutes.js
│   ├── utils/
│   │   └── seedData.js       # Auto-seeds demo books, users, reviews
│   └── server.js             # Express app entry point
├── postman_collection.json   # Importable Postman collection
├── .env                      # Environment variables
├── .env.example
├── package.json
└── README.md
```

---

## 🔌 API Endpoints

### Auth
| Method | Endpoint              | Access  | Description                        |
|--------|-----------------------|---------|------------------------------------|
| POST   | `/api/auth/register`  | Public  | Register new user                  |
| POST   | `/api/auth/login`     | Public  | Login & get JWT                    |
| POST   | `/api/auth/firebase`  | Public  | Login/Verify via Firebase ID Token |
| GET    | `/api/auth/me`        | Private | Get user profile                   |

### Books
| Method | Endpoint                          | Access        | Description            |
|--------|-----------------------------------|---------------|------------------------|
| GET    | `/api/books`                      | Public        | List all books         |
| GET    | `/api/books/search?keyword=...`   | Public        | Search books           |
| GET    | `/api/books/:id`                  | Public        | Get book details       |
| POST   | `/api/books`                      | Admin         | Create a book (Upload) |
| PUT    | `/api/books/:id`                  | Admin         | Update a book          |
| DELETE | `/api/books/:id`                  | Admin         | Delete a book          |

### Cart
| Method | Endpoint            | Access  | Description            |
|--------|---------------------|---------|------------------------|
| GET    | `/api/cart`         | Private | Get user's cart        |
| POST   | `/api/cart`         | Private | Add/update cart item   |
| DELETE | `/api/cart/:bookId` | Private | Remove item from cart  |
| DELETE | `/api/cart`         | Private | Clear entire cart      |

### Wishlist
| Method | Endpoint                | Access  | Description                 |
|--------|-------------------------|---------|-----------------------------|
| GET    | `/api/wishlist`         | Private | Get user's wishlist items   |
| POST   | `/api/wishlist`         | Private | Add book to wishlist        |
| DELETE | `/api/wishlist/:bookId` | Private | Remove book from wishlist   |

### Orders
| Method | Endpoint              | Access  | Description                 |
|--------|-----------------------|---------|-----------------------------|
| POST   | `/api/orders`         | Private | Create order (+ Razorpay)   |
| POST   | `/api/orders/verify`  | Private | Verify Razorpay payment     |
| GET    | `/api/orders`         | Private | Get user's order history    |
| GET    | `/api/orders/:id`     | Private | Get order by ID             |

### Reviews
| Method | Endpoint                 | Access  | Description                            |
|--------|--------------------------|---------|----------------------------------------|
| POST   | `/api/reviews`           | Private | Submit review (for purchased books)    |
| GET    | `/api/reviews/book/:id`  | Public  | Get reviews for a book                 |

### Recommendations
| Method | Endpoint               | Access  | Description                    |
|--------|------------------------|---------|--------------------------------|
| GET    | `/api/recommendations` | Private | Personalized recommendations   |

---

## 🔧 Environment Variables

Copy `.env.example` to `.env` and configure:

| Variable                  | Description                              | Required |
|---------------------------|------------------------------------------|----------|
| `PORT`                    | Server port (default: 5050)              | No       |
| `MONGO_URI`               | MongoDB connection string                | No*      |
| `JWT_SECRET`              | Secret key for JWT signing               | Yes      |
| `RAZORPAY_KEY_ID`         | Razorpay test/live key ID                | No**     |
| `RAZORPAY_KEY_SECRET`     | Razorpay test/live key secret            | No**     |
| `FIREBASE_PROJECT_ID`     | Firebase project ID                      | No***    |
| `FIREBASE_AUTH_DOMAIN`    | Firebase web auth domain                 | No***    |
| `FIREBASE_CLIENT_EMAIL`   | Firebase service account email           | No***    |
| `FIREBASE_PRIVATE_KEY`    | Firebase service account private key     | No***    |
| `FIREBASE_STORAGE_BUCKET` | Firebase storage bucket name             | No***    |

> \* Falls back to in-memory MongoDB (MongoMemoryServer) if MONGO_URI is unavailable  
> \*\* Falls back to mock/sandbox payment mode if Razorpay keys are placeholders  
> \*\*\* Falls back to local disk file upload if Firebase is not configured

For Google Sign-In, add the domain you use to open the app to Firebase Console:
Authentication → Settings → Authorized domains. For local development this is usually `localhost`;
for deployment use your live host, for example `your-app.onrender.com`.

---

## 📖 Documentation

- **Swagger UI**: http://localhost:5050/api-docs
- **Postman Collection**: http://localhost:5050/api/postman-collection

---

## 📄 License

ISC — Case Study Project
