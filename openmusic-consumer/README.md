# OpenMusic Consumer

Consumer service for OpenMusic API that processes playlist export requests from RabbitMQ queue and sends them via email.

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL
- RabbitMQ
- SMTP server access

## Installation

1. Install dependencies:
```
npm install
```

2. Configure environment variables:
```
cp .env.example .env
```

Edit .env file with your configuration.

## Configuration

Create a .env file with the following variables:

```
# PostgreSQL
PGUSER=your_db_user
PGHOST=localhost
PGPASSWORD=your_db_password
PGDATABASE=openmusic
PGPORT=5432

# RabbitMQ
RABBITMQ_SERVER=amqp://localhost

# SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
```

## Running the Consumer

Development mode:
```
npm run dev
```

Production mode:
```
npm start
```

## How it Works

1. Connects to RabbitMQ server
2. Listens to 'export:playlists' queue
3. When a message is received:
   - Fetches playlist data from PostgreSQL
   - Fetches songs in the playlist
   - Sends email with playlist JSON attachment to the target email

## Message Format

The consumer expects messages in the following JSON format:

```json
{
  \"playlistId\": \"playlist-id\",
  \"targetEmail\": \"user@example.com\"
}
```
