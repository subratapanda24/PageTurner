# PageTurner — Complete Architecture, Technical Guide and Evaluation Notes

Subject: Full-Stack Web Development — Node.js, Express.js, MongoDB
Application: PageTurner Online Bookstore and Library Platform
Audience: Complete guide for viva, technical interview, and deployment evaluation with zero prior knowledge assumed.

---

## Table of Contents
1. Executive Summary and What the Project Does
2. Core Technologies and Concepts Used
3. Database Architecture: MongoDB Local vs MongoDB Compass vs MongoDB Atlas
4. System Architecture and MVC Request Flow
5. Authentication and Role-Based Access Control (User vs Admin)
6. Admin Book Upload and Media Pipeline (Multer and Firebase)
7. Digital Payments and Razorpay Verification Flow
8. Step-by-Step Postman Testing Guide
9. Step-by-Step Swagger UI Documentation Guide
10. Step-by-Step Render Deployment Guide
11. Viva Questions and Answers Reference

---

## 1. Executive Summary and What the Project Does

PageTurner is a full-stack online bookstore and library platform. It solves real-world book discovery, browsing, purchasing, and reading management needs:

* Customers can browse books by genre, search by keyword, view verified reviews, add books to a shopping cart, save titles to a personal wishlist, place orders via digital checkout (Razorpay), and access their reading and browsing history.
* Administrators have a dedicated management panel to create, update, and delete books, upload cover art through cloud/local storage, and manage stock inventory.
* Evaluators and developers can inspect the platform through three independent interfaces:
  1. The Web UI (Dashboard at `/`)
  2. The Interactive API Documentation (Swagger UI at `/api-docs`)
  3. The API Test Suite (Postman collection at `/api/postman-collection`)

---

## 2. Core Technologies and Concepts Used

### 2.1 Backend Environment
* Node.js: Asynchronous event-driven JavaScript runtime executing server-side logic.
* Express.js: Lightweight HTTP web framework routing requests, parsing JSON, handling multipart uploads, and mounting middleware.

### 2.2 Database and Data Modeling
* MongoDB: NoSQL document-oriented database storing JSON-like BSON records.
* Mongoose: Object Data Modeling (ODM) library defining strict schemas, field validation, relationship population (`populate`), and pre-save hooks (such as automatic bcrypt password hashing).
* MongoMemoryServer: Zero-setup in-memory database used as an automatic fallback when an external database is offline or not configured.

### 2.3 Security and Authentication
* JSON Web Tokens (JWT): Stateless bearer tokens signed with HMAC-SHA256 containing user ID and role claims.
* Bcrypt.js: One-way cryptographic salting and hashing algorithm ensuring raw passwords are never saved in plain text.
* Role-Based Access Control (RBAC): Middleware distinguishing standard `user` permissions from privileged `admin` permissions.

### 2.4 Cloud Integrations
* Razorpay: Payment gateway integration creating server-side order receipts and verifying transactions using cryptographic HMAC-SHA256 signature matching.
* Firebase Admin SDK: Google Cloud storage integration enabling book cover image uploads directly to cloud buckets with local disk fallback.
* Swagger (OpenAPI 3.0): Interactive in-browser documentation generating standardized API endpoint test forms.

---

## 3. Database Architecture: MongoDB Local vs Compass vs Atlas

Understanding the difference between these three components is critical during project evaluations:

### 3.1 MongoDB (The Database Engine)
MongoDB is the actual database software engine that stores collections of documents (Users, Books, Orders, Reviews).
* When running locally, it listens on `mongodb://127.0.0.1:27017`.
* When neither local MongoDB nor cloud MongoDB is present, our application starts `mongodb-memory-server`, providing an isolated database inside Node.js memory.

### 3.2 MongoDB Compass (The Desktop GUI)
MongoDB Compass is a visual viewer application installed on your personal computer. It does NOT store data itself; instead, it connects to a database (local or cloud) so you can visually click through documents, edit fields, and run queries without typing terminal commands.

### 3.3 MongoDB Atlas (The Cloud Database)
MongoDB Atlas is MongoDB hosted on cloud servers (AWS, Google Cloud, or Azure).
* Why is Atlas needed for Render?
  Render is a cloud hosting provider. When your app is deployed to Render, it runs on remote Linux machines in a cloud datacenter. Render cannot reach your Mac laptop's local `127.0.0.1` address.
* Therefore, a cloud database like MongoDB Atlas provides a connection string (`mongodb+srv://<username>:<password>@cluster.mongodb.net/pageturner`) accessible from both Render and your Mac.
* You can connect MongoDB Compass to that same Atlas string to view live cloud records from your laptop.

---

## 4. System Architecture and MVC Request Flow

The project strictly adheres to the Model-View-Controller (MVC) architectural pattern:

```
Client (Browser / Postman)
       │
       ▼
Express Server (src/server.js)
  - CORS, JSON Parser, Static /uploads
       │
       ▼
Routes (src/routes/*.js)
  - Maps URL and HTTP Method to Controller
       │
       ▼
Middleware (src/middleware/*.js)
  - authMiddleware: Verifies Bearer JWT & Admin Role
  - uploadMiddleware: Multer parses multipart file
  - validationMiddleware: Validates required payload fields
       │
       ▼
Controllers (src/controllers/*.js)
  - Business logic, pricing calculations, queries
       │
       ▼
Models (src/models/*.js)
  - Mongoose Schemas (User, Book, Cart, Order, Review)
       │
       ▼
Database (MongoDB / MongoMemoryServer)
```

### Directory Structure
* `src/server.js`: Application entry point, mounts routes, static files, Swagger, and server listener.
* `src/config/`: Configuration for MongoDB (`db.js`), Firebase (`firebase.js`), Razorpay (`razorpay.js`), and Swagger (`swagger.js`).
* `src/models/`: Data definitions for `User`, `Book`, `Cart`, `Order`, and `Review`.
* `src/routes/`: Express routers binding HTTP endpoints to controller methods.
* `src/controllers/`: Core business logic handlers.
* `src/middleware/`: Reusable validation, auth verification, and file upload handlers.
* `src/utils/`: Database seed script with curated book titles, covers, and demo users.
* `public/`: HTML5 dashboard, vanilla CSS design tokens, and modular frontend JavaScript.

---

## 5. Authentication and Role-Based Access Control

### 5.1 Registration Flow (`POST /api/auth/register`)
1. Client sends JSON payload: `{ name, email, password }`.
2. Controller verifies email uniqueness in `User` collection.
3. Pre-save Mongoose hook runs `bcrypt.genSalt(10)` and `bcrypt.hash(password, salt)`.
4. User document is persisted with hashed password.
5. Server signs a JWT with `{ id: user._id, role: user.role }` using `JWT_SECRET` with a 30-day expiration.
6. Server returns user details and the token.

### 5.2 Login Flow (`POST /api/auth/login`)
1. Client sends `{ email, password }`.
2. Controller fetches user by email.
3. Controller runs `bcrypt.compare(enteredPassword, user.password)`.
4. If valid, signs and returns a new JWT token.

### 5.3 Protected Routes (`protect` middleware)
1. Middleware inspects the incoming `Authorization` HTTP header.
2. Expects format: `Bearer <token>`.
3. Verifies token signature using `jwt.verify(token, process.env.JWT_SECRET)`.
4. Decodes payload, finds user record, and attaches it to `req.user`.

### 5.4 Admin Access (`adminOnly` middleware)
1. Checks `req.user.role === 'admin'`.
2. If role is standard `user`, responds with HTTP 403 Forbidden (`Not authorized as an admin`).
3. If `admin`, execution continues to the protected controller.

---

## 6. Admin Book Upload and Media Pipeline

Admins can upload custom cover art alongside book metadata.

### 6.1 The Pipeline
1. Client sends an HTTP `POST /api/books` request as `multipart/form-data`.
2. Multer middleware (`src/middleware/uploadMiddleware.js`) intercepts the file stream into memory (`multer.memoryStorage()`) with a 5MB size limit and image MIME-type filter (`image/jpeg`, `image/png`, `image/webp`).
3. If Firebase Admin SDK is configured:
   - File buffer is written to Firebase Storage bucket.
   - A public download URL is retrieved.
4. Fallback mechanism:
   - If Firebase credentials are not supplied, the buffer is saved directly to `public/uploads/` on the local filesystem.
   - The book document stores the relative cover path (e.g., `/uploads/book-123.jpg`).
5. Book document is saved in MongoDB with title, author, genre, price, stock, description, and cover image.

---

## 7. Digital Payments and Razorpay Verification Flow

The application implements a 2-step financial verification flow to prevent fraudulent order status modifications:

```
[ Step 1: Order Creation ]
Client -> POST /api/orders (with shipping address)
  1. Server calculates total cart amount.
  2. Server requests order from Razorpay API: amount in paisa (amount * 100).
  3. Razorpay returns razorpay_order_id.
  4. Server creates local Order document with paymentStatus = 'pending'.
  5. Server returns Order ID + razorpay_order_id to Client.

[ Step 2: Client Payment ]
Client opens Razorpay Checkout modal -> User enters payment details -> Razorpay returns:
  - razorpay_order_id
  - razorpay_payment_id
  - razorpay_signature

[ Step 3: Cryptographic Server Verification ]
Client -> POST /api/orders/verify (with the 3 Razorpay fields above)
  1. Server generates HMAC-SHA256 signature:
     hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
     hmac.update(razorpay_order_id + "|" + razorpay_payment_id)
     expectedSignature = hmac.digest('hex')
  2. Server compares expectedSignature with received razorpay_signature.
  3. If signatures match:
     - Order paymentStatus is updated to 'paid'.
     - Cart items are cleared.
     - Book stock inventory is decremented.
  4. If signatures do not match, request is rejected with HTTP 400.
```

---

## 8. Step-by-Step Postman Testing Guide

If an evaluator asks you to test the API in Postman, follow these exact steps:

### Step 1: Import the Collection
1. Open the Postman desktop application.
2. Click **Import** (top left).
3. Select the file `postman_collection.json` located in the root of this project.
   *(Or download it from your running app at `http://localhost:5050/api/postman-collection`).*
4. A collection named **PageTurner Online Bookstore API** will appear on the left sidebar.

### Step 2: Configure Environment Variables
1. Click on the collection name in Postman.
2. Select the **Variables** tab.
3. Verify that `baseUrl` is set to:
   - For local testing: `http://localhost:5050/api`
   - For Render testing: `https://<your-render-service>.onrender.com/api`
4. Leave `authToken` blank for now.

### Step 3: Test Health Check
1. Open `Health Check` -> Click **Send**.
2. Expect HTTP 200 with status: `ok`.

### Step 4: Test Authentication
1. Open `Auth` -> `Login User`.
2. Inspect request body:
   ```json
   {
     "email": "user@pageturner.com",
     "password": "password123"
   }
   ```
3. Click **Send**.
4. In the response, locate the `token` string.
5. Copy the token.
6. In the Collection Variables tab, paste the token into the `authToken` Current Value field and click **Save**.
*(All protected requests automatically use `Bearer {{authToken}}`)*.

### Step 5: Test Book Browsing
1. Open `Books` -> `Get All Books` -> Click **Send**.
2. Expect an array of books with ratings, prices, and cover image paths.
3. Open `Books` -> `Search Books` (e.g. `?keyword=psychology`) -> Click **Send**.

### Step 6: Test Cart and Wishlist
1. Open `Cart` -> `Get User Cart` -> Click **Send**.
2. Open `Cart` -> `Add to Cart` -> Paste a book `_id` into the JSON body -> Click **Send**.
3. Open `Wishlist` -> `Get User Wishlist` -> Click **Send**.

### Step 7: Test Admin Privileges
1. Run `Auth` -> `Login Admin` (`admin@pageturner.com` / `password123`).
2. Copy the admin token into `authToken`.
3. Open `Books` -> `Create Book (Admin)` -> Click **Send**.
4. The server accepts the request and creates the book.
5. If you repeat this request using a standard user token, the server returns HTTP 403 Forbidden.

---

## 9. Step-by-Step Swagger UI Documentation Guide

Swagger provides a self-documenting web interface:

1. Open your browser and navigate to:
   - Locally: `http://localhost:5050/api-docs`
   - On Render: `https://<your-app>.onrender.com/api-docs`
2. You will see all endpoints grouped into categories:
   - **Health**: Server uptime status.
   - **Books**: Public catalog listings, search, and admin endpoints.
   - **Auth**: User registration and login.
   - **Cart**: Cart queries and item updates.
   - **Wishlist**: Personal favorites management.
   - **Orders**: Checkout and payment verification.
   - **Reviews**: Public book reviews and submissions.
3. Testing an endpoint:
   - Click on any route (e.g., `GET /api/books`).
   - Click **Try it out**.
   - Set optional parameters (e.g. `limit = 5`).
   - Click **Execute**.
   - Swagger displays the real server response, headers, and status code.
4. Authorizing protected routes:
   - Run `POST /api/auth/login` inside Swagger or Postman and copy the token.
   - Click the green **Authorize** button at the top right of the Swagger UI.
   - Enter your token and click **Authorize**.
   - Now you can test protected routes (such as `GET /api/cart` or `POST /api/orders`) directly inside the browser.

---

## 10. Step-by-Step Render Deployment Guide

Follow these steps to deploy your repository to Render:

### Step 1: Push Code to GitHub
Ensure you are in the project root directory:
```bash
git add .
git status
```
Verify that `.env` is NOT listed in the staging area. Then run:
```bash
git commit -m "Deploy-ready PageTurner Bookstore"
git branch -M main
git remote add origin https://github.com/<YOUR-USERNAME>/<YOUR-REPO-NAME>.git
git push -u origin main
```

### Step 2: Create Web Service on Render
1. Go to [render.com](https://render.com) and log in.
2. In your Render Dashboard, click **New +** -> Select **Web Service**.
3. Select **Build and deploy from a Git repository**.
4. Connect your GitHub account and choose your bookstore repository.

### Step 3: Configure Build and Start Settings
* **Name**: `pageturner-bookstore` (or any name you choose)
* **Region**: Choose the closest region (e.g., Singapore, Frankfurt, Oregon)
* **Branch**: `main`
* **Root Directory**: Leave blank (root of repository)
* **Runtime**: `Node`
* **Build Command**: `npm install`
* **Start Command**: `npm start`
* **Instance Type**: `Free`

### Step 4: Configure Environment Variables
Click **Advanced** or navigate to the **Environment** tab on Render. Add the following variables:
1. `NODE_ENV`: `production`
2. `JWT_SECRET`: `pageturner_secure_production_secret_key_2026` (or any random string)
3. `MONGO_URI`: *(Optional)* If you have MongoDB Atlas, paste your connection string here. If left empty, the application automatically runs the built-in MongoMemoryServer.
4. `RAZORPAY_KEY_ID`: *(Optional)* Your Razorpay test key ID.
5. `RAZORPAY_KEY_SECRET`: *(Optional)* Your Razorpay test secret.

### Step 5: Deploy and Verify
1. Click **Create Web Service**.
2. Render will run `npm install`, start the server via `node src/server.js`, and seed the 15 curated books.
3. Once the build log says "Live", click the URL at the top left of the Render dashboard (e.g., `https://pageturner-bookstore.onrender.com`).
4. Verify:
   - Main Dashboard: `https://<your-app>.onrender.com`
   - Swagger UI: `https://<your-app>.onrender.com/api-docs`
   - API Health: `https://<your-app>.onrender.com/api/health`

---

## 11. Viva Questions and Answers Reference

### Q1: Why did you use Express and Node.js for this project?
Node.js offers high I/O throughput with an asynchronous, non-blocking event loop ideal for handling concurrent requests (browsing, cart updates, payments). Express provides a minimalist, robust routing system with middleware extensibility for CORS, authentication, and error handling.

### Q2: What is the difference between MongoDB Compass and MongoDB Atlas?
MongoDB Compass is a client desktop application for inspecting documents visually on a developer's computer. MongoDB Atlas is a managed database running in the cloud. Cloud deployment on Render requires Atlas (or our in-memory fallback) because remote cloud servers cannot access a developer's private local machine (`127.0.0.1`).

### Q3: How do you protect passwords in the database?
Passwords are never stored in plain text. Before saving a user record, a Mongoose pre-save hook invokes `bcryptjs` with 10 salt rounds. During authentication, `bcrypt.compare` verifies the submitted plain password against the cryptographic hash using constant-time comparison to prevent timing attacks.

### Q4: How is Role-Based Access Control (RBAC) enforced?
Routes specify middleware chains. A public endpoint uses no auth middleware. A customer route uses `protect`, which decodes the JWT and confirms token validity. An admin endpoint uses `protect, adminOnly`, which checks `req.user.role === 'admin'`. If the user is not an admin, it halts execution and returns HTTP 403 Forbidden.

### Q5: How is payment tampering prevented in the Razorpay integration?
Payments use a two-step handshake. When checkout begins, the server creates a Razorpay order. Upon payment completion, Razorpay returns a cryptographic signature. The server independently calculates the HMAC-SHA256 signature using the order ID, payment ID, and the private `RAZORPAY_KEY_SECRET`. The order is marked paid only if the signatures match identically.

### Q6: What happens if external services like Firebase or MongoDB are temporarily unavailable?
The backend was designed with progressive fallback layers:
* If MongoDB is unreachable, it automatically starts `mongodb-memory-server`.
* If Firebase credentials are not provided, image uploads write to `public/uploads/` on local disk.
* If Razorpay live keys are omitted, the payment subsystem activates an evaluation sandbox mode.
This ensures the platform is resilient and runs cleanly in any evaluation environment.
