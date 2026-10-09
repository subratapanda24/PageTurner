# PageTurner Online Bookstore

PageTurner is a full-stack online bookstore project built with Node.js, Express.js, MongoDB, and a static frontend served from the same Express application. It includes authentication, book browsing, cart management, wishlist, orders, reviews, recommendations, Swagger documentation, and a Postman collection.

## Features

- User registration and login with JWT authentication
- Admin-protected book management with cover image upload
- Book catalog with search, genre filtering, pagination, and sorting support
- Shopping cart and wishlist APIs
- Order creation and Razorpay payment verification flow
- Review and rating system for purchased books
- Personalized recommendations based on purchase history
- Auto-seeded demo users and book data
- Swagger API documentation at `/api-docs`
- Downloadable Postman collection at `/api/postman-collection`
- MongoDB Memory Server fallback for zero-setup local execution
- Firebase Storage support with local upload fallback

## Tech Stack

- Backend: Node.js, Express.js
- Database: MongoDB, Mongoose, MongoDB Memory Server
- Authentication: JWT, bcrypt
- File Uploads: Multer, optional Firebase Admin SDK
- Payments: Razorpay SDK with mock-friendly configuration
- Documentation: Swagger UI, swagger-jsdoc
- Frontend: HTML, CSS, JavaScript served from `public/`

## Prerequisites

Install the following before running the project:

- Node.js 18 or newer
- npm
- MongoDB local server or MongoDB Atlas account, optional

The project can run without a MongoDB installation because it falls back to MongoDB Memory Server when `MONGO_URI` is not available or cannot be reached.

## Setup Instructions

1. Clone the repository and open the project folder.

```bash
git clone <repository-url>
cd Pageturner
```

2. Install dependencies.

```bash
npm install
```

3. Create the environment file.

```bash
cp .env.example .env
```

4. Update `.env` if needed.

For the simplest local run, keep the provided development values. To use persistent data, set `MONGO_URI` to a local MongoDB or MongoDB Atlas connection string.

```env
PORT=5000
NODE_ENV=development
JWT_SECRET=pageturner_super_secret_jwt_key_2026
MONGO_URI=mongodb://127.0.0.1:27017/pageturner
```

Razorpay and Firebase values are optional. If they are not configured, the app still runs with mock payment behavior and local disk uploads.

5. Start the development server.

```bash
npm run dev
```

For production-style execution:

```bash
npm start
```

The app runs on the port defined in `.env`. With the provided `.env.example`, open:

```text
http://localhost:5000
```

If no `PORT` is set, the application defaults to port `5050`.

## Demo Credentials

The database is seeded automatically when the server starts.

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@pageturner.com` | `password123` |
| User | `user@pageturner.com` | `password123` |

Use the admin account for protected book create, update, and delete operations.

## Important URLs

After starting the server:

- Frontend: `http://localhost:5000`
- Health check: `http://localhost:5000/api/health`
- Swagger API docs: `http://localhost:5000/api-docs`
- Postman collection download: `http://localhost:5000/api/postman-collection`

Replace `5000` with your configured port if you changed `PORT`.

## API Overview

| Module | Endpoints |
| --- | --- |
| Auth | `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/firebase`, `GET /api/auth/me` |
| Books | `GET /api/books`, `GET /api/books/search`, `GET /api/books/:id`, `POST /api/books`, `PUT /api/books/:id`, `DELETE /api/books/:id` |
| Cart | `GET /api/cart`, `POST /api/cart`, `DELETE /api/cart/:bookId`, `DELETE /api/cart` |
| Wishlist | `GET /api/wishlist`, `POST /api/wishlist`, `DELETE /api/wishlist/:bookId` |
| Orders | `POST /api/orders`, `POST /api/orders/verify`, `GET /api/orders`, `GET /api/orders/:id` |
| Reviews | `POST /api/reviews`, `GET /api/reviews/book/:bookId` |
| Recommendations | `GET /api/recommendations` |

Use Swagger or the included `postman_collection.json` for request bodies and testing.

## Suggested Evaluation Flow

1. Start the server with `npm run dev`.
2. Open `http://localhost:5000/api-docs`.
3. Login using the demo user account through `POST /api/auth/login`.
4. Copy the returned JWT token.
5. Click **Authorize** in Swagger and enter the token as a Bearer token.
6. Browse books using `GET /api/books`.
7. Add a book to cart using `POST /api/cart`.
8. Create an order using `POST /api/orders`.
9. Check order history using `GET /api/orders`.

## Environment Variables

| Variable | Description | Required |
| --- | --- | --- |
| `PORT` | Server port | No |
| `NODE_ENV` | Runtime environment | No |
| `JWT_SECRET` | Secret used to sign JWT tokens | Yes |
| `MONGO_URI` | MongoDB connection string | No |
| `RAZORPAY_KEY_ID` | Razorpay key ID | No |
| `RAZORPAY_KEY_SECRET` | Razorpay key secret | No |
| `FIREBASE_PROJECT_ID` | Firebase project ID | No |
| `FIREBASE_AUTH_DOMAIN` | Firebase auth domain | No |
| `FIREBASE_CLIENT_EMAIL` | Firebase service account email | No |
| `FIREBASE_PRIVATE_KEY` | Firebase service account private key | No |
| `FIREBASE_STORAGE_BUCKET` | Firebase storage bucket | No |
| `FIREBASE_WEB_API_KEY` | Firebase web API key for client login | No |

## Project Structure

```text
Pageturner/
|-- public/
|   |-- css/
|   |-- js/
|   |-- uploads/
|   `-- index.html
|-- src/
|   |-- config/
|   |-- controllers/
|   |-- middleware/
|   |-- models/
|   |-- routes/
|   |-- utils/
|   `-- server.js
|-- postman_collection.json
|-- render.yaml
|-- .env.example
|-- package.json
`-- README.md
```

## Available Scripts

```bash
npm run dev
```

Starts the Express server with Node watch mode for development.

```bash
npm start
```

Starts the Express server normally.

```bash
npm run seed
```

Runs the seed script manually.

## Deployment Notes

The repository includes `render.yaml` for Render deployment. Configure these environment variables in the Render dashboard:

- `NODE_ENV=production`
- `JWT_SECRET`
- `MONGO_URI`
- Optional Razorpay credentials
- Optional Firebase credentials

For production deployment, use a persistent MongoDB connection string. The in-memory database is useful for local demos only because data is lost after restart.

## Submission Contents

- Source code for the Express backend and static frontend
- Swagger API documentation
- Postman collection
- Environment example file
- Render deployment configuration
- Seeded demo users and book catalog

