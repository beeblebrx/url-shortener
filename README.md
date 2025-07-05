# URL Shortener

It's a URL shortener built with Python 3, Flask, and PostgreSQL. Not actually meant for "production use". It's mainly my toy project.

## Features

- **User Authentication**: JWT-based authentication for creating short URLs
- **URL Expiration**: URLs expire after some configurable time
- **Permanent URLs**: Option to create non-expiring URLs
- **Click Tracking**: Track usage statistics for each URL
- **Pagination & Sorting**: List URLs with pagination and multiple sorting options
- **Database Migrations**: Easy schema management with Flask-Migrate

## Project Structure

```
url-shortener/
├── app/
│   ├── __init__.py          # Flask app factory
│   ├── models.py            # Database models (User, Admin, URL)
│   ├── auth.py              # Authentication middleware
│   ├── utils.py             # Utility functions
│   └── routes/
│       ├── __init__.py
│       ├── public.py        # Public endpoints (redirect, stats)
│       ├── user.py          # User endpoints (shorten URLs)
│       └── admin.py         # Admin endpoints (management)
├── migrations/              # Database migration files
├── requirements.txt         # Python dependencies
├── run.py                   # Application entry point
├── create_user.py           # Script to create users
├── create_admin.py          # Script to create admins
├── .env                     # Environment variables
└── README.md               # This file
```

## Setup Instructions

### 1. Prerequisites

- Python 3.8+
- PostgreSQL 12+
- pip (Python package manager)

### 2. Database Setup

Create a PostgreSQL database:

```sql
CREATE DATABASE url_shortener;
CREATE USER username WITH PASSWORD 'password';
GRANT ALL PRIVILEGES ON DATABASE url_shortener TO username;
```

### 3. Environment Configuration

Update the `.env` file with your database credentials:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/url_shortener
POSTGRES_USER=username
POSTGRES_PASSWORD=password
POSTGRES_DB=url_shortener
SECRET_KEY=your-secret-key-change-this-in-production
```

### 3.1. Virtual environment

Create virtual environment and activate it:
```bash
python -m venv venv
source venv/bin/activate
```

### 4. Install Dependencies

With virtual environment created and activated:
```bash
pip install -r requirements.txt
```

### 5. Initialize Database

```bash
# Initialize migration repository
flask db init

# Create initial migration
flask db migrate -m "Initial migration"

# Apply migration to database
flask db upgrade
```

### 6. Create Users and Admins

Create a regular user:
```bash
python create_user.py --username john_doe
```

Create an admin user:
```bash
python create_admin.py --username admin_user
```

**Important**: Save the generated JWT tokens securely!

### 7. Run the Application

```bash
python run.py
```

The application will be available at `http://localhost:5000`

## API Endpoints

### Public Endpoints

- `GET /<short_code>` - Redirect to original URL
- `GET /stats/<short_code>` - Get URL statistics
- `GET /health` - Health check

### User Endpoints (Require Authentication)

- `POST /shorten` - Create a shortened URL
- `GET /my-urls` - List user's URLs with pagination

### Admin Endpoints (Require Admin Authentication)

- `GET /admin/urls` - List all URLs with pagination and sorting
- `DELETE /admin/cleanup` - Remove expired URLs
- `GET /admin/stats` - Get system-wide statistics
- `GET /admin/users` - List all users

## API Usage Examples

### Create a Short URL

```bash
curl -X POST http://localhost:5000/shorten \
  -H "Authorization: Bearer YOUR_USER_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com/very/long/url",
    "permanent": false
  }'
```

Response:
```json
{
  "short_url": "http://localhost:5000/abc123",
  "short_code": "abc123",
  "original_url": "https://example.com/very/long/url",
  "created_at": "2025-01-07T07:41:47.123456",
  "expires_at": "2025-07-07T07:41:47.123456",
  "is_permanent": false
}
```

### List URLs (Admin)

```bash
curl -X GET "http://localhost:5000/admin/urls?page=1&per_page=20&sort_by=created_at&order=desc" \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN"
```

### Get System Statistics (Admin)

```bash
curl -X GET http://localhost:5000/admin/stats \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN"
```

## Authentication

Authentication is handled via JSON Web Tokens (JWT). All protected endpoints require a valid JWT to be passed in the `Authorization` header with the `Bearer` scheme.

```
Authorization: Bearer YOUR_JWT
```

A JWT contains the user's `username`, `role` (either `user` or `admin`), and an `access_token`. The server validates the JWT signature and checks if the user is active and the `access_token` matches the one in the database.

- **User JWTs**: Required for creating short URLs and managing user-specific resources.
- **Admin JWTs**: Required for all administrative operations.

## Database Schema

### Users Table
- `id` - Primary key
- `username` - Unique username
- `access_token` - Access token used within JWT
- `created_at` - Creation timestamp
- `is_active` - Account status

### Admins Table
- `id` - Primary key
- `username` - Unique username
- `access_token` - Access token used within JWT
- `created_at` - Creation timestamp
- `is_active` - Account status

### URLs Table
- `id` - Primary key
- `original_url` - The original long URL
- `short_code` - 6-character short identifier
- `user_id` - Foreign key to users table
- `created_at` - Creation timestamp
- `expires_at` - Expiration timestamp
- `is_permanent` - Whether URL never expires
- `click_count` - Number of times accessed
- `last_accessed` - Last access timestamp

## Configuration

Environment variables in `.env`:

- `DATABASE_URL` - PostgreSQL connection string
- `SECRET_KEY` - Flask secret key for sessions
- `DEFAULT_EXPIRATION_MONTHS` - Default expiration period (default: 6)
- `SHORT_CODE_LENGTH` - Length of generated short codes (default: 6)

## Database Migrations

Common migration commands:

```bash
# Create a new migration after model changes
flask db migrate -m "Description of changes"

# Apply migrations to database
flask db upgrade

# Rollback to previous migration
flask db downgrade

# Show current migration status
flask db current

# Show migration history
flask db history
```
