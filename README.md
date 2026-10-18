# CampusConnect

CampusConnect is a college event registration platform designed to streamline event discovery, registrations, and management.

## Tech Stack

- **Frontend:** React, Vite
- **Backend:** Node.js, Express
- **Database:** MySQL
- **Deployment Target:** AWS

---

## Project Structure

```text
AWS_Cloud_Project/
├── client/          # Frontend application (React + Vite)
│   ├── src/         # React source files
│   ├── public/      # Static assets
│   ├── index.html   # Entry HTML
│   ├── package.json
│   └── vite.config.js
├── server/          # Backend application (Node.js + Express)
│   ├── index.js     # Entrypoint and Express server
│   ├── package.json
│   └── .env.example
├── .env.example     # Root environment configuration template
├── .gitignore       # Root Git ignore rules
└── README.md        # Project documentation
```

---

## Prerequisites

- **Node.js**: v20 or higher (tested on v22.22.1)
- **npm**: v10 or higher (tested on 10.9.4)
- **Git**: v2.43 or higher
- **MySQL**: (for database integration in later phases)

---

## Getting Started

### 1. Frontend Setup (`client`)

Navigate to the `client` directory:

```bash
cd client
npm install
```

To run the development server:

```bash
npm run dev
```

To create a production build:

```bash
npm run build
```

---

### 2. Backend Setup (`server`)

Navigate to the `server` directory:

```bash
cd server
npm install
```

Copy the environment file template and configure variables:

```bash
cp .env.example .env
```

To run the backend server in development mode:

```bash
npm run dev
```

To run the backend in production mode:

```bash
npm start
```

Health check endpoint:
- `http://localhost:5000/api/health`

---

## Environment Variables

Refer to `.env.example` in the root directory or `server/.env.example` for required configuration keys:

| Variable | Description | Default / Example |
|---|---|---|
| `PORT` | Backend server port | `5000` |
| `NODE_ENV` | Environment mode | `development` |
| `DB_HOST` | MySQL hostname | `localhost` |
| `DB_PORT` | MySQL port | `3306` |
| `DB_USER` | MySQL username | `root` |
| `DB_PASSWORD` | MySQL password | `your_mysql_password` |
| `DB_NAME` | MySQL database name | `campusconnect_db` |
| `VITE_API_URL` | Frontend API base URL | `http://localhost:5000/api` |
# CampusConnect-AWS-Cloud-Project
