# Shine Photo Frames Gallery - Management System

![Project Banner](https://img.shields.io/badge/Status-Active-brightgreen.svg)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)

A full-stack, comprehensive web application built to streamline operations for **Shine Photo Frames Gallery**. It serves as an all-in-one business management, order tracking, and financial analytics dashboard. 

The application is split into a robust **Node.js/Express Backend** connected to a **MongoDB Database**, and a beautiful, highly responsive **React Frontend** that uses modern UI principles like glassmorphism and smooth micro-animations.

---

## 🌟 Key Features & Functionality

### 1. 📦 Advanced Order Management
- **Complete CRUD Operations**: Create, read, update, and delete photo frame orders easily.
- **Smart Payment Tracking**: Automatically tracks "Total Amount", "Advance Paid", and "Pending Balance". Supports adding partial payments post-order.
- **Automated Payment Status**: Automatically flags orders as "Paid" once the balance hits zero.
- **Archive System**: Automatically bundles past years' orders into expandable "Archive Folders", keeping the main view clean while ensuring historic data remains instantly accessible.

### 2. 🧾 Billing & Communication
- **Instant WhatsApp Billing**: Generates a pre-formatted WhatsApp message summarizing the order (customer, size, balance) and opens it directly via the WhatsApp API.
- **PDF Invoices**: Dynamically generates and downloads highly professional, printable PDF invoices for individual customers.
- **Monthly Exporting**: Export any month's specific data—or a specific day's report—as a **Spreadsheet (Excel)** or a bulk **PDF document** for accounting purposes.

### 3. 💸 Expense Tracking
- **Month-wise Grouping**: Daily expenses are logged, tracked, and automatically grouped by month/year to give a clean overview of outgoings.
- **Expense PDF Reports**: Download monthly expense summaries directly as PDFs to match against monthly profits.

### 4. 📈 Business Analytics Dashboard
- **Live Financial Overview**: At-a-glance summary cards displaying Total Orders, Total Advance, Pending Balance, Expenses, and Net Amount Collected.
- **Interactive Visualizations**: Includes responsive bar charts mapping out the exact sales over the past 7 days.
- **Inventory Insights**: Auto-calculates your Top 5 "Best Seller" frame sizes, helping guide restocking decisions.

---

## 🛠️ Technology Stack

**Frontend (`/frame-studio-app`)**
- **React.js** (via Vite for lightning-fast HMR)
- **Recharts** for beautiful, dynamic data visualization.
- **jsPDF & jsPDF-AutoTable** for client-side invoice and report generation.
- **XLSX** for Excel spreadsheet exports.
- **Vanilla CSS** employing modern design tokens, CSS variables, and gradients.

**Backend (`/backend`)**
- **Node.js & Express.js** providing the REST API architecture.
- **MongoDB & Mongoose** for NoSQL data persistence.
- **CORS & dotenv** for secure cross-origin requests and environment variable management.

---

## 🚀 Setup & Local Development

To run this application locally on your machine:

### 1. Backend Setup
1. Open a terminal and navigate to the backend directory: `cd backend`
2. Install dependencies: `npm install`
3. Create a `.env` file and add your MongoDB URI:
   ```env
   MONGO_URI=your_mongodb_connection_string
   PORT=5000
   ```
4. Start the server: `npm start` (or `npm run dev` for nodemon).

### 2. Frontend Setup
1. Open a new terminal and navigate to the frontend directory: `cd frame-studio-app`
2. Install dependencies: `npm install`
3. Start the Vite development server: `npm run dev`
4. The application will be accessible at `http://localhost:5173`.

---

## 🌐 Deployment Details

This project is configured for cloud deployment:
- **Backend Host**: [Render](https://render.com/) (Web Service)
- **Frontend Host**: [Netlify](https://www.netlify.com/)

Whenever changes are pushed to the `main` branch of this GitHub repository, both platforms automatically fetch the latest code, build the project, and deploy the live updates seamlessly.

---

*Designed and developed specifically to elevate the operational efficiency and aesthetics of Shine Photo Frames Gallery.*
