# StackIt - Community Q&A Platform

A full-stack community question and answer platform built with React, Node.js, Express, and MySQL.

## 🚀 Features

- **User Authentication**: Register, login, and profile management
- **Questions & Answers**: Ask questions, provide answers, and vote on content
- **Search & Filter**: Search questions by title/content and filter by tags
- **Voting System**: Upvote/downvote questions and answers
- **Best Answer**: Mark answers as accepted solutions
- **User Profiles**: View user statistics and activity
- **Responsive Design**: Modern UI built with Tailwind CSS and shadcn/ui
- **Real-time Updates**: Live updates for votes and answers
- **Admin Panel**: User management and content moderation

## 🏗️ Project Structure

```
StackIt/
├── frontend/                 # React + Vite frontend
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom React hooks
│   │   └── lib/            # Utility functions
│   ├── public/             # Static assets
│   └── package.json        # Frontend dependencies
├── backend/                 # Node.js + Express backend
│   ├── src/
│   │   ├── controllers/    # Route controllers
│   │   ├── models/         # Data models
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Express middleware
│   │   ├── config/         # Configuration files
│   │   ├── services/       # Business logic
│   │   └── utils/          # Utility functions
│   ├── database/           # Database migrations and schema
│   ├── tests/              # Backend tests
│   └── package.json        # Backend dependencies
└── package.json            # Root package.json for scripts
```

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Component library
- **React Router** - Client-side routing
- **React Query** - Data fetching and caching
- **React Hook Form** - Form handling
- **Zod** - Schema validation

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MySQL** - Relational database
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **express-validator** - Input validation
- **cors** - Cross-origin resource sharing
- **helmet** - Security middleware

## 📋 Prerequisites

- Node.js (v18 or higher)
- MySQL (v8.0 or higher)
- npm or yarn package manager

## 🚀 Quick Start

### 1. Clone the repository
```bash
git clone <repository-url>
cd StackIt
```

### 2. Install dependencies
```bash
npm run install:all
```

### 3. Set up the database
```bash
# Create MySQL database and tables
mysql -u root -p < backend/database/schema.sql
```

### 4. Configure environment variables
```bash
# Copy environment example file
cp backend/env.example backend/.env

# Edit the .env file with your database credentials
# and other configuration settings
```

### 5. Start the development servers
```bash
# Start both frontend and backend
npm run dev

# Or start them separately:
npm run dev:frontend  # Frontend on http://localhost:3000
npm run dev:backend   # Backend on http://localhost:5000
```

## 📁 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Questions
- `GET /api/questions` - Get all questions (with pagination)
- `GET /api/questions/:id` - Get single question
- `POST /api/questions` - Create new question
- `PUT /api/questions/:id` - Update question
- `DELETE /api/questions/:id` - Delete question

### Answers
- `POST /api/answers` - Create new answer
- `PUT /api/answers/:id` - Update answer
- `DELETE /api/answers/:id` - Delete answer
- `POST /api/answers/:id/accept` - Accept answer
- `POST /api/answers/:id/vote` - Vote on answer

### Users
- `GET /api/users/profile` - Get current user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/:id` - Get user by ID
- `GET /api/users/:id/questions` - Get user's questions
- `GET /api/users/:id/answers` - Get user's answers

## 🗄️ Database Schema

The application uses MySQL with the following main tables:

- **users** - User accounts and profiles
- **questions** - Questions posted by users
- **answers** - Answers to questions
- **votes** - Upvotes/downvotes on questions and answers
- **comments** - Comments on questions and answers
- **tags** - Question tags for categorization
- **notifications** - User notifications
- **user_sessions** - JWT token management

## 🧪 Testing

```bash
# Run all tests
npm test

# Run frontend tests only
npm run test:frontend

# Run backend tests only
npm run test:backend
```

## 🏗️ Building for Production

```bash
# Build both frontend and backend
npm run build

# Start production servers
npm start
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the backend directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=production

# Database Configuration
DB_HOST=localhost
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=stackit_db
DB_PORT=3306

# JWT Configuration
JWT_SECRET=your_secure_jwt_secret
JWT_EXPIRE=30d

# Frontend URL (for CORS)
FRONTEND_URL=https://yourdomain.com
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/yourusername/stackit/issues) page
2. Create a new issue with detailed information
3. Contact the maintainers

## 🙏 Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) for the beautiful component library
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework
- [Vite](https://vitejs.dev/) for the fast build tool
- [Express.js](https://expressjs.com/) for the web framework
