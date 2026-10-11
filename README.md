# MeraTailor ✂️

MeraTailor is a modern full-stack tailoring marketplace built with the MERN stack (MongoDB, Express, React, Node.js), Clerk for user authentication & role management, and Google Gemini AI for multilingual voice assistance.

---

## 🚀 Progressive Development Workflow

To build and evolve MeraTailor progressively towards production, follow standard branch-based continuous development:

1. **Main Branch (`main`)**: The production-ready codebase. Every commit or merge to `main` can automatically trigger a build and deployment on Render.
2. **Feature Branches (`feature/<feature-name>`)**: Develop new features or refactors in isolated branches:
   ```bash
   git checkout -b feature/new-booking-flow
   # Make changes and test locally
   git add .
   git commit -m "feat: add new booking flow UI and validation"
   git push origin feature/new-booking-flow
   ```
3. **Pull Requests & Code Review**: Open a PR from your feature branch to `main`. Once tested and approved, merge to deploy automatically.

---

## 🛠️ Local Development

### Prerequisites
- Node.js 18+ (Node.js 20+ recommended)
- MongoDB running locally (or a free MongoDB Atlas connection string)
- Clerk account ([clerk.com](https://clerk.com))

### Setup Steps
1. **Install dependencies**:
   ```bash
   npm install
   ```
2. **Configure environment variables**:
   ```bash
   cp .env.example .env
   ```
   Fill in your values in `.env`:
   - `MONGO_URI`: `mongodb://127.0.0.1:27017/meratailor`
   - `VITE_CLERK_PUBLISHABLE_KEY` & `CLERK_SECRET_KEY`: from your Clerk dashboard.
   - `GEMINI_API_KEY`: from [Google AI Studio](https://aistudio.google.com/app/apikey) for voice transcription.
3. **Run local dev server**:
   ```bash
   npm run dev
   ```
   - Vite frontend: `http://localhost:5173`
   - Express backend: `http://localhost:5000` (Vite automatically proxies `/api` requests to Express)

---

## 📦 How to Publish to GitHub

1. **Initialize Git**:
   ```bash
   git init
   git branch -M main
   ```

2. **Verify `.gitignore` is active**:
   Check that `.env` and `node_modules` are ignored:
   ```bash
   git status
   ```

3. **Stage and commit your project**:
   ```bash
   git add .
   git commit -m "Initial commit: MeraTailor production-ready release"
   ```

4. **Link to your GitHub repository and push**:
   Create a new empty repository on [GitHub](https://github.com/new), then run:
   ```bash
   git remote add origin https://github.com/<your-username>/<your-repo-name>.git
   git push -u origin main
   ```

---

## 🌐 Deploying to Render

MeraTailor is designed to run as a unified single-service deployment on [Render](https://render.com) (Express serves both the API and the compiled Vite React frontend).

### Option A: One-Click Blueprint Deployment (Recommended)
This repository includes a [`render.yaml`](./render.yaml) file.
1. Sign in to [Render Dashboard](https://dashboard.render.com/).
2. Click **New +** → **Blueprint**.
3. Connect your GitHub repository.
4. Render will detect `render.yaml` and prompt you to input the environment variables.
5. Click **Apply**.

### Option B: Manual Web Service Deployment
1. On [Render](https://dashboard.render.com/), click **New +** → **Web Service**.
2. Connect your GitHub repository.
3. Configure the service settings:
   - **Name**: `meratailor` (or your preferred name)
   - **Runtime**: `Node`
   - **Branch**: `main`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Health Check Path**: `/api/health`
4. Under **Environment Variables**, add:
   | Key | Value / Source |
   | --- | --- |
   | `NODE_ENV` | `production` |
   | `MONGO_URI` | Your MongoDB Atlas connection string |
   | `VITE_CLERK_PUBLISHABLE_KEY` | Your Clerk Publishable Key (`pk_...`) |
   | `CLERK_PUBLISHABLE_KEY` | Same Clerk Publishable Key (`pk_...`) |
   | `CLERK_SECRET_KEY` | Your Clerk Secret Key (`sk_...`) |
   | `GEMINI_API_KEY` | Your Google Gemini API Key |
   | `GEMINI_TRANSCRIBE_MODEL` | `gemini-3.5-transcribe` |
   | `CLERK_ADMIN_IDS` | Comma-separated Clerk user IDs for admin access |

> **⚠️ Important for Vite + Clerk**: Ensure `VITE_CLERK_PUBLISHABLE_KEY` is configured in Render environment variables **before** triggering the build, because Vite bakes `VITE_*` keys into client JavaScript assets during `npm run build`.

---

## 🔒 Clerk Dashboard Setup for Production

Once Render deploys your application, it will provide you with a URL (e.g. `https://meratailor.onrender.com`).

1. Open your [Clerk Dashboard](https://dashboard.clerk.com/).
2. Go to **Configure** → **Domains & Paths** (or **Paths / Redirects**).
3. Under **Allowed Origins** and **Redirect URLs**, add your Render domain:
   - `https://meratailor.onrender.com`
4. If testing production auth with social logins (Google, etc.), configure the OAuth callback to include your Render domain.

---

## 🗄️ Database Setup (MongoDB Atlas)

For production hosting:
1. Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/atlas).
2. Under **Network Access**, allow access from anywhere (`0.0.0.0/0`) so Render instances can connect.
3. Under **Database Access**, create a user with read/write privileges.
4. In **Database** → **Connect** → **Drivers**, copy the connection string.
5. Replace `<password>` and set the database name to `meratailor`:
   `mongodb+srv://user:<password>@cluster0.mongodb.net/meratailor?retryWrites=true&w=majority`
6. Add this string as `MONGO_URI` in Render environment variables.

---

## 📂 Project Architecture

```
mera-tailor/
├── .env.example            # Environment variables template
├── .gitignore              # Git ignore rules (protects keys, builds, modules)
├── render.yaml             # Render infrastructure blueprint
├── package.json            # Node.js dependencies and scripts
├── vite.config.js          # Vite config with API proxy
├── server/
│   ├── index.js            # Express server entry point & SPA fallback
│   ├── config/             # Database connection
│   ├── controllers/        # Request handlers (auth, tailors, orders, voice)
│   ├── middleware/         # Clerk auth and request validation
│   ├── models/             # Mongoose database models & indexes
│   └── routes/             # REST API routes
├── src/
│   ├── components/         # Modular UI components (Navbar, Footer, Home)
│   ├── context/            # Auth and App React context
│   ├── pages/              # Application pages (Home, Tailors, Orders, Admin)
│   └── i18n/               # Hindi/English localization
└── public/                 # Static branding, images, and role avatars
```
