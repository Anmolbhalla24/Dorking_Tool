# Dork Tool

A full-stack web application for advanced Google search query building and management. This tool helps users construct complex search queries using various Google dorking operators in a user-friendly interface.

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Features](#features)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Usage](#usage)
- [Configuration](#configuration)
- [Project Architecture](#project-architecture)
- [Contributing](#contributing)
- [License](#license)

## 🎯 Project Overview

**Dork Tool** is designed to simplify the creation of advanced Google search queries by providing an intuitive interface for combining multiple dorking operators. Whether you're a researcher, security professional, or SEO specialist, this tool helps you construct precise search queries to find specific information on the web.

### What is Google Dorking?

Google dorking is an advanced search technique that uses specific operators and search parameters to find publicly available information on Google. These operators allow you to narrow down search results to find very specific pages or information.

## ✨ Features

- **Advanced Search Operators**: Support for a comprehensive set of Google dorking operators including:
  - Exact phrase matching
  - Site and URL restrictions
  - Title, header, and body text filtering
  - File type and extension filtering
  - Cache and metadata queries
  - Date range filtering
  - And many more!

- **Bookmark Management**: Save and organize your favorite search queries into folders
- **Search History**: Track previously executed searches
- **Interactive UI**: Clean, intuitive interface built with React
- **Real-time Query Building**: See your search query update as you configure operators
- **CORS-Enabled Backend**: Secure backend API with configurable CORS origins

## 📁 Project Structure

```
dork-tool/
├── dork-tool-frontend/          # React frontend application
│   ├── src/
│   │   ├── App.jsx              # Main React component
│   │   ├── App.css              # Application styles
│   │   ├── main.jsx             # Entry point
│   │   ├── index.css            # Global styles
│   │   └── assets/              # Static assets
│   ├── public/                  # Public files
│   ├── package.json
│   ├── vite.config.js
│   ├── eslint.config.js
│   └── README.md
│
├── dork-tool-backend/           # Express backend API
│   ├── index.js                 # Server entry point
│   ├── package.json
│   ├── data/
│   │   └── bookmarks.json       # User bookmarks storage
│   └── .env                     # Environment variables (create this)
│
└── package.json                 # Root package configuration
```

## 🔧 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v14 or higher)
- **npm** or **yarn** (comes with Node.js)

## 📦 Installation

### Step 1: Clone the Repository

```bash
git clone https://github.com/Anmolbhalla24/Dorking_Tool.git
cd dork-tool
```

### Step 2: Install Backend Dependencies

```bash
cd dork-tool-backend
npm install
```

### Step 3: Install Frontend Dependencies

```bash
cd ../dork-tool-frontend
npm install
```

### Step 4: Configure Environment Variables

Create a `.env` file in the `dork-tool-backend` directory:

```bash
# Backend Environment Variables
PORT=5000
GOOGLE_API_KEY=your_google_api_key_here
GOOGLE_CX=your_custom_search_engine_id_here
ALLOWED_ORIGINS=http://localhost:5173
```

## 🚀 Usage

### Development Mode

#### Start the Backend Server

```bash
cd dork-tool-backend
npm run dev
```

The backend will start on `http://localhost:5000`

#### Start the Frontend Development Server

In a new terminal:

```bash
cd dork-tool-frontend
npm run dev
```

The frontend will start on `http://localhost:5173`

### Production Build

#### Build Frontend

```bash
cd dork-tool-frontend
npm run build
```

This creates an optimized production build in the `dist/` directory.

#### Start Backend for Production

```bash
cd dork-tool-backend
npm start
```

## ⚙️ Configuration

### Backend Configuration

Edit `.env` file in `dork-tool-backend`:

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 5000 |
| `GOOGLE_API_KEY` | Google Custom Search API key | Empty |
| `GOOGLE_CX` | Custom Search Engine ID | Empty |
| `ALLOWED_ORIGINS` | CORS allowed origins (comma-separated) | http://localhost:5173 |

### Frontend Configuration

- Frontend is configured via `vite.config.js` for Vite build tool
- ESLint configuration is in `eslint.config.js`
- Styles are defined in CSS files within `src/`

## 🏗️ Project Architecture

### Frontend (React + Vite)

- **Framework**: React 19.x
- **Build Tool**: Vite (next-generation frontend tooling)
- **Styling**: CSS
- **Linting**: ESLint with React plugins

The frontend provides:
- Interactive form for building dorking queries
- Bookmark management interface
- Search history display
- Query preview and execution

### Backend (Express.js)

- **Framework**: Express.js
- **API Key Management**: Dotenv for environment variables
- **HTTP Client**: Axios for external API calls
- **CORS**: Configured CORS middleware for security
- **Data Storage**: JSON file-based storage for bookmarks

The backend provides:
- RESTful API endpoints
- Google Custom Search API integration
- Bookmark CRUD operations
- CORS-protected routes

## 🤝 Contributing

Contributions are welcome! To contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License - see the LICENSE file for details.

## 📞 Support

If you encounter any issues or have questions, please open an issue on the GitHub repository.

---

**Repository**: [Dorking_Tool](https://github.com/Anmolbhalla24/Dorking_Tool)  
**Author**: Anmol Bhalla
