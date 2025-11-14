# 🎵 OpenMusic API 🎶

[![Node.js](https://img.shields.io/badge/Node.js-18.x-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5.x-blue.svg)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-8.x-blue.svg)](https://www.postgresql.org/)
[![License](https://img.shields.io/badge/License-ISC-yellow.svg)](./LICENSE)
[![Build Status](https://img.shields.io/badge/Build-Passing-brightgreen.svg)]()
[![Version](https://img.shields.io/badge/Version-1.0.0-orange.svg)]()

```
   ____                   __  ___           __
  / __ \____  ___  ____  /  |/  /___  _____/ /_
 / / / / __ \/ _ \/ __ \/ /|_/ / __ \/ ___/ __/
/ /_/ / /_/ /  __/ / / / /  / / /_/ / /  / /_
\____/ .___/\___/_/ /_/_/  /_/\____/_/   \__/
    /_/
```

> **OpenMusic API** is a robust RESTful API designed for managing music collections. It allows users to create, read, update, and delete albums and songs, with advanced filtering and validation features. Built with Node.js, Express, and PostgreSQL for high performance and scalability. 🎸🎤

## 🌟 Features

- **🎼 Album Management**: Full CRUD operations for music albums
- **🎵 Song Management**: Comprehensive song handling with filtering
- **✅ Data Validation**: Robust input validation using Joi
- **🗄️ PostgreSQL Database**: Reliable data storage with migrations
- **🔍 Advanced Filtering**: Filter songs by title and performer
- **🚀 RESTful Design**: Clean and intuitive API endpoints
- **🛡️ Error Handling**: Comprehensive error responses
- **📝 Logging**: Built-in request logging for monitoring

## 📋 Table of Contents

- [Installation](#installation)
- [Configuration](#configuration)
- [Database Setup](#database-setup)
- [API Endpoints](#api-endpoints)
- [Usage Examples](#usage-examples)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [License](#license)

## 🚀 Installation

1. **Clone the repository** 📥
   ```bash
   git clone https://github.com/yourusername/openmusic-api.git
   cd openmusic-api
   ```

2. **Install dependencies** 📦
   ```bash
   npm install
   ```

3. **Set up environment variables** 🔧
   Create a `.env` file in the root directory:
   ```env
   PORT=5000
   HOST=localhost
   DATABASE_URL=postgresql://username:password@localhost:5432/openmusic
   ```

4. **Start the development server** ▶️
   ```bash
   npm run dev
   ```

The API will be running at `http://localhost:5000` 🎉

## ⚙️ Configuration

The application uses the following environment variables:

| Variable      | Description              | Default     |
|---------------|--------------------------|-------------|
| `PORT`        | Server port              | 5000        |
| `HOST`        | Server host              | localhost   |
| `DATABASE_URL`| PostgreSQL connection URL| Required    |

## 🗄️ Database Setup

1. **Create PostgreSQL database** 🐘
   ```sql
   CREATE DATABASE openmusic;
   ```

2. **Run migrations** 📊
   ```bash
   npx node-pg-migrate up
   ```

## 📡 API Endpoints

### 🎼 Albums

| Method | Endpoint       | Description              |
|--------|----------------|--------------------------|
| POST   | `/albums`      | Create a new album       |
| GET    | `/albums/:id`  | Get album by ID          |
| PUT    | `/albums/:id`  | Update album by ID       |
| DELETE | `/albums/:id`  | Delete album by ID       |

### 🎵 Songs

| Method | Endpoint       | Description              |
|--------|----------------|--------------------------|
| POST   | `/songs`       | Create a new song        |
| GET    | `/songs`       | Get all songs (with filters) |
| GET    | `/songs/:id`   | Get song by ID           |
| PUT    | `/songs/:id`   | Update song by ID        |
| DELETE | `/songs/:id`   | Delete song by ID        |

## 💡 Usage Examples

### Create an Album 📝

```bash
curl -X POST http://localhost:5000/albums \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Greatest Hits",
    "year": 2023
  }'
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "albumId": "album-12345"
  }
}
```

### Get Songs with Filtering 🔍

```bash
curl "http://localhost:5000/songs?title=Love&performer=Artist"
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "songs": [
      {
        "id": "song-12345",
        "title": "Love Song",
        "year": 2023,
        "performer": "Artist",
        "genre": "Pop",
        "duration": 240,
        "albumId": "album-12345"
      }
    ]
  }
}
```

### Create a Song 🎵

```bash
curl -X POST http://localhost:5000/songs \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Amazing Song",
    "year": 2023,
    "performer": "Great Artist",
    "genre": "Rock",
    "duration": 300,
    "albumId": "album-12345"
  }'
```

## 🏗️ Project Structure

```
openmusic-api/
├── migrations/           # Database migrations 📊
├── src/
│   ├── controllers/      # Request handlers 🎛️
│   ├── routes/           # API routes 🛣️
│   ├── services/         # Business logic 🔧
│   ├── validators/       # Input validation ✅
│   ├── db/               # Database connection 🗄️
│   ├── app.js            # Express app setup 🚀
│   └── server.js         # Server entry point 🌐
├── package.json          # Dependencies 📦
├── .env                  # Environment variables 🔐
└── README.md             # This file 📖
```

## 🤝 Contributing

We welcome contributions! 🎉

1. Fork the repository 🍴
2. Create a feature branch: `git checkout -b feature/amazing-feature` 🌿
3. Commit your changes: `git commit -m 'Add amazing feature'` 💾
4. Push to the branch: `git push origin feature/amazing-feature` 📤
5. Open a Pull Request 🚀

## 📄 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details. 📜

---

**Made with ❤️ and lots of 🎵 by the OpenMusic Team**

> "Music is the universal language of mankind." - Henry Wadsworth Longfellow 🎼
