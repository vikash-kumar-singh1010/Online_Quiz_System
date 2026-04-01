# 🚀 Full-Stack Deployment Guide

Deploying a full-stack MERN application (MongoDB, Express, React, Node.js) is different from deploying a simple static website. You need to host three separate pieces: the Database, the Backend server, and the Frontend website.

Here is the easiest, completely free way to deploy your project:

---

## Step 1: Deploy the Database (MongoDB Atlas)
Your database is currently running locally on your laptop using MongoDB Compass. To make it accessible on the internet, you need a cloud database.

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) and create a free account.
2. Create a new **Free (M0) Cluster**.
3. Create a Database User with a username and password. **(Save this password!)**
4. Under "Network Access", add IP address `0.0.0.0/0` (This allows your cloud backend to connect to it).
5. Click **Connect** -> **Connect your application** and copy the **Connection String** (it starts with `mongodb+srv://...`).

---

## Step 2: Deploy the Backend Server (Render.com)
The Node.js server acts as the bridge between your frontend and database.

1. Create a free account on [Render](https://render.com/).
2. Push your `backend` folder to a GitHub repository.
3. On Render, click **New +** -> **Web Service**.
4. Connect your GitHub repository.
5. In the configuration:
   * **Root Directory**: `backend` (if it's in a subfolder, otherwise leave blank)
   * **Build Command**: `npm install`
   * **Start Command**: `node server.js`
6. Scroll down to **Environment Variables** and add two keys:
   * `MONGO_URI`: *(Paste the connection string from Step 1 here, remembering to replace `<password>` with your actual database user password)*
   * `JWT_SECRET`: `your_super_secret_key_here`
7. Click **Create Web Service**. Wait 2-3 minutes for it to build.
8. Once complete, copy the deployed backend URL (e.g., `https://quiz-backend.onrender.com`).

---

## Step 3: Connect Frontend to the New Backend
Before deploying the frontend, we must tell it to stop looking for `localhost:5000` and start looking at your newly deployed cloud backend.

1. In your `frontend/src/services/api.js` file, ensure the `API_URL` uses an environment variable:
   ```javascript
   const API_URL = process.env.REACT_APP_API_URL || '/api';
   ```
2. Create a file called `.env` inside your `frontend/` folder and add:
   ```env
   REACT_APP_API_URL=https://quiz-backend.onrender.com/api
   ```
   *(Replace with the actual URL from Step 2)*

---

## Step 4: Deploy the Frontend (Vercel or Netlify)
Finally, we host the React application.

1. Push your updated `frontend` code to GitHub.
2. Sign up for free at [Vercel](https://vercel.com/) or [Netlify](https://www.netlify.com/).
3. Click **Add New Project** and connect your GitHub repo.
4. In the build settings:
   * **Root Directory**: `frontend`
   * **Build Command**: `npm run build`
   * **Output Directory**: `build`
5. Go to **Environment Variables** in the Vercel/Netlify dashboard and add the same key from Step 3:
   * **Key**: `REACT_APP_API_URL` 
   * **Value**: `https://quiz-backend.onrender.com/api` *(Your Render URL)*
6. Click **Deploy**!

---

🎉 **You're Done!**
Your full-stack application is now live on the internet. Anyone with your Vercel/Netlify link can sign up, and all their data will be safely stored in your MongoDB Atlas cloud database.
