# Campus Event Manager (EDC)

A full-stack web application designed for the Entrepreneurship Development Cell (EDC) to seamlessly manage campus events, student registrations, certificate generation, and payments.

## 🚀 Features

### For Students
* **Authentication**: Secure registration and login system with JWT.
* **Profile Management**: Maintain academic details (branch, semester, course, etc.).
* **Event Browsing**: View upcoming workshops, hackathons, and seminars.
* **Registrations & Payments**: Register for free events instantly, or view payment instructions (UPI/Bank) and submit transaction IDs for paid events.
* **Certificates**: Download dynamically generated PDF certificates for attended events.

### For Administrators (Committee Heads)
* **Role-Based Access Control**: Secure admin dashboard hidden from regular students.
* **Event Management**: Create, edit, and publish events with banners, capacity limits, and pricing.
* **Registration Tracking**: Monitor real-time registration counts and attendee lists.
* **Excel Export**: Download complete attendee lists as `.xlsx` files for check-ins or records.
* **Automated Certificates**: One-click generation of PDF certificates featuring dynamic text, student names, and custom signatures (Principal & Event Coordinator).

## 🛠️ Technology Stack

* **Frontend**: React.js, Vite, Tailwind CSS, Lucide Icons, React Router
* **Backend**: Node.js, Express.js
* **Database**: PostgreSQL (with `pg` driver)
* **Authentication**: JSON Web Tokens (JWT), bcryptjs
* **File Processing**: PDFKit (for certificate generation), ExcelJS (for data exports)
* **Deployment**: Render (Web Service for Backend, Static Site for Frontend)

## 📦 Local Setup Instructions

### Prerequisites
* Node.js (v18+ recommended)
* PostgreSQL database

### 1. Backend Setup
1. Open a terminal and navigate to the `server` directory:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `server` directory with the following variables:
   ```env
   PORT=5000
   DATABASE_URL=postgresql://user:password@localhost:5432/your_database_name
   JWT_SECRET=your_super_secret_key
   JWT_EXPIRES_IN=1d
   FRONTEND_URL=http://localhost:5173
   ```
4. Initialize the database schema and seed the admin user:
   ```bash
   # Make sure your PostgreSQL database is running first!
   node src/models/init.sql  # Run this SQL script in your database
   node seed-admin.js
   node seed-committee.js
   ```
5. Start the backend server:
   ```bash
   npm start
   # or for development: npm run dev
   ```

### 2. Frontend Setup
1. Open a new terminal window and navigate to the `client` directory:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `client` directory:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```
5. Open your browser to `http://localhost:5173`. You can log in using the default admin credentials:
   * **Email**: `admin@campus.com`
   * **Password**: `admin123`

## ☁️ Deployment Notes (Render)

This application is configured for easy deployment on Render:
* **Database**: Set up a PostgreSQL instance on Render and copy the `External Database URL`.
* **Backend**: Deploy as a *Web Service*. Add the `DATABASE_URL`, `FRONTEND_URL`, and `JWT_SECRET` environment variables. The build command is `npm install` and the start command is `node server.js`.
* **Frontend**: Deploy as a *Static Site*. Add the `VITE_API_URL` environment variable. The build command is `npm install && npm run build` and the publish directory is `dist`.

## 🎨 Customization

To change the primary color scheme, edit the `colors.primary` object inside `client/tailwind.config.js`. The current scheme uses a vibrant lime green palette to match the EDC logo. Official logos should be placed inside `client/src/assets/`.

## Figures
![Login Page]()
