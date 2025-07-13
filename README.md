# AI News Summary App

A simplified backend API for AI-powered news summarization with user authentication.

## 🚀 Features

- **User Authentication**: Sign up and sign in with JWT tokens
- **News Summarization**: Generate summaries from news URLs (AI integration ready)
- **Simplified Architecture**: Single file backend for easy maintenance
- **MongoDB Integration**: User data storage with Mongoose

## 📁 Project Structure

```
ai-news-summary-app/
├── backend/
│   ├── app.js          # Main backend application (all-in-one)
│   ├── package.json    # Dependencies and scripts
│   └── package-lock.json
├── frontend/           # Frontend (to be developed)
└── README.md          # This file
```

## 🛠️ Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud)

### Installation

1. **Clone the repository**

   ```bash
   git clone <your-repo-url>
   cd ai-news-summary-app
   ```

2. **Install dependencies**

   ```bash
   cd backend
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the `backend` folder:

   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/ai-news-summary
   JWT_SECRET=your-secret-key-here
   ```

4. **Start the server**
   ```bash
   npm start
   # or for development
   npm run dev
   ```

## 🌐 API Endpoints

**Base URL:** `http://localhost:5000`

### Authentication

| Endpoint           | Method | Description       | Body                                                                         |
| ------------------ | ------ | ----------------- | ---------------------------------------------------------------------------- |
| `/api/auth/signup` | POST   | Register new user | `{ "name": "John", "email": "john@example.com", "password": "password123" }` |
| `/api/auth/signin` | POST   | Login user        | `{ "email": "john@example.com", "password": "password123" }`                 |

### News Summary

| Endpoint            | Method | Description           | Headers                         | Body                                    |
| ------------------- | ------ | --------------------- | ------------------------------- | --------------------------------------- |
| `/api/auth/summary` | POST   | Generate news summary | `Authorization: Bearer <token>` | `{ "url": "https://news-article.com" }` |

## 📝 Example Usage

### 1. Sign Up

```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

**Response:**

```json
{
  "message": "User created successfully"
}
```

### 2. Sign In

```bash
curl -X POST http://localhost:5000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

**Response:**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

### 3. Generate Summary

```bash
curl -X POST http://localhost:5000/api/auth/summary \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "url": "https://example-news-article.com"
  }'
```

**Response:**

```json
{
  "summary": "summerization of news from link: https://example-news-article.com"
}
```

## 🔧 Development

### Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon

### Dependencies

- **express** - Web framework
- **mongoose** - MongoDB ODM
- **bcryptjs** - Password hashing
- **jsonwebtoken** - JWT authentication
- **cors** - Cross-origin resource sharing
- **dotenv** - Environment variables

## 🎯 Next Steps

- [ ] Integrate AI API for actual news summarization
- [ ] Add frontend React/Vue application
- [ ] Implement user profile management
- [ ] Add news article history
- [ ] Implement rate limiting
- [ ] Add input validation middleware

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

For questions or issues, please create an issue in the GitHub repository.

---

**Note:** This is a simplified backend implementation. The news summarization currently returns a placeholder response. AI integration is planned for future development.
