# Heart Disease Diagnosis System

A full-stack web application for cardiac diagnosis using AI-powered image analysis. The system allows users to upload cardiac images, receive AI-based diagnoses, and manage their medical reports with multi-language support (English/Arabic).

## Features

- 🔐 User authentication with JWT (Access & Refresh tokens)
- 🤖 AI-powered cardiac image analysis
- 📊 Report history and management
- 🌍 Multi-language support (English/Arabic)
- 🎨 Dark/Light theme toggle
- 📱 Responsive design with Bootstrap
- 🖼️ Image upload and processing with Sharp
- 🔒 Rate limiting and security features

## Tech Stack

### Backend

- **Node.js** with Express.js
- **MongoDB** with Mongoose
- **JWT** for authentication
- **Multer** for file uploads
- **Sharp** for image processing
- **bcrypt** for password hashing
- **Express Rate Limit** for API protection

### Frontend

- **React** 17
- **React Router** v6
- **Axios** for HTTP requests
- **React Bootstrap** for UI
- **i18next** for internationalization
- **Context API** for state management

## Prerequisites

Before setting up the project, ensure you have:

- **Node.js** (v14 or higher)
- **npm** or **yarn**
- **MongoDB** (local installation or MongoDB Atlas account)
- **Git** (for cloning the repository)

## Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/Abdelrhmanvs/heart.git
cd heart
```

### 2. Backend Setup

#### Navigate to backend directory

```bash
cd backend
```

#### Install dependencies

```bash
npm install
```

#### Create .env file

Create a `.env` file in the `backend` directory with the following variables:

```env
# Database
DATABASE_URI=mongodb://localhost:27017/heart-diagnosis
# Or use MongoDB Atlas:
# DATABASE_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/heart-diagnosis

# JWT Secrets (Generate secure random strings)
ACCESS_TOKEN_SECRET=your_access_token_secret_here
REFRESH_TOKEN_SECRET=your_refresh_token_secret_here

# Server Port
PORT=3500

# Environment
NODE_ENV=development

# AI Model Configuration (Optional)
AI_MODEL_TYPE=mock
# Options: mock, tensorflow, api, python
# For API-based models:
# AI_API_ENDPOINT=https://your-ai-api.com/predict
# AI_API_KEY=your_api_key_here
```

#### Generate Secure JWT Secrets

You can generate secure random strings for JWT secrets using Node.js:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Run this command twice to generate both `ACCESS_TOKEN_SECRET` and `REFRESH_TOKEN_SECRET`.

### 3. Frontend Setup

#### Navigate to frontend directory

```bash
cd ../frontend
```

#### Install dependencies

```bash
npm install
```

#### Configure API endpoint (Optional)

If your backend runs on a different URL, update the `BASE_URL` in `src/api/axios.js`:

```javascript
const BASE_URL = "http://localhost:3500"; // Change this if needed
```

Also update `allowedOrigin` in `backend/config/allowedOrigin.js` to include your frontend URL.

### 4. Database Setup

#### Local MongoDB

Ensure MongoDB is running:

```bash
# macOS (with Homebrew)
brew services start mongodb-community

# Or start manually
mongod --dbpath /path/to/your/data/directory
```

#### MongoDB Atlas (Cloud)

1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Get your connection string and add it to `.env` as `DATABASE_URI`
4. Whitelist your IP address in Atlas Network Access

## Running the Application

### Development Mode

#### Option 1: Run Both Servers Concurrently (Recommended)

From the `backend` directory:

```bash
npm run dev
```

This starts both backend (port 3500) and frontend (port 3000) simultaneously.

#### Option 2: Run Servers Separately

**Terminal 1 - Backend:**

```bash
cd backend
npm start
```

**Terminal 2 - Frontend:**

```bash
cd frontend
npm start
```

The application will be available at:

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:3500

### Production Mode

#### Build Frontend

```bash
cd frontend
npm run build
```

The optimized production build will be in the `frontend/build` directory.

#### Serve Production Build

You can serve the production build using:

1. A static file server (nginx, Apache)
2. Node.js with express.static
3. Deploy to hosting platforms (Vercel, Netlify, etc.)

#### Run Backend in Production

```bash
cd backend
NODE_ENV=production npm start
```

## Project Structure

```
heart-project/
├── backend/
│   ├── config/           # Configuration files (CORS, DB)
│   ├── controllers/      # Request handlers
│   ├── middleware/       # Express middleware
│   ├── models/          # MongoDB schemas
│   ├── routes/          # API routes
│   ├── utils/           # Utility functions (AI model, image processing)
│   ├── uploads/         # Uploaded images storage
│   ├── logs/            # Application logs
│   ├── server.js        # Entry point
│   └── package.json
│
└── frontend/
    ├── public/          # Static files
    ├── src/
    │   ├── api/         # Axios configuration
    │   ├── components/  # React components
    │   ├── context/     # React Context providers
    │   ├── hooks/       # Custom React hooks
    │   ├── locales/     # Translation files
    │   └── utils/       # Utility functions
    ├── build/           # Production build (generated)
    └── package.json
```

## API Endpoints

### Authentication

- `POST /auth/login` - User login
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - User logout

### Users

- `GET /users` - Get all users (Admin)
- `POST /users` - Create new user
- `PATCH /users` - Update user
- `DELETE /users` - Delete user

### Reports

- `GET /reports` - Get user reports
- `POST /reports` - Create new report (with image upload)
- `PATCH /reports` - Update report
- `DELETE /reports` - Delete report

## Environment Variables Reference

### Backend (.env)

| Variable               | Description                                | Required | Default     |
| ---------------------- | ------------------------------------------ | -------- | ----------- |
| `DATABASE_URI`         | MongoDB connection string                  | Yes      | -           |
| `ACCESS_TOKEN_SECRET`  | Secret for access tokens                   | Yes      | -           |
| `REFRESH_TOKEN_SECRET` | Secret for refresh tokens                  | Yes      | -           |
| `PORT`                 | Server port                                | No       | 3500        |
| `NODE_ENV`             | Environment (development/production)       | No       | development |
| `AI_MODEL_TYPE`        | AI model type (mock/tensorflow/api/python) | No       | mock        |
| `AI_API_ENDPOINT`      | AI service API endpoint                    | No       | -           |
| `AI_API_KEY`           | AI service API key                         | No       | -           |

## Troubleshooting

### MongoDB Connection Issues

- Verify MongoDB is running: `mongosh` or `mongo`
- Check `DATABASE_URI` in `.env`
- For Atlas, ensure IP is whitelisted

### CORS Errors

- Update `allowedOrigin` in `backend/config/allowedOrigin.js`
- Ensure frontend URL is included in allowed origins

### Port Already in Use

```bash
# Find process using port 3500
lsof -i :3500
# Kill the process
kill -9 <PID>
```

### Module Not Found Errors

```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

## Security Considerations

- Never commit `.env` files to version control
- Use strong, randomly generated JWT secrets
- Implement rate limiting for authentication endpoints
- Validate and sanitize all user inputs
- Use HTTPS in production
- Keep dependencies updated regularly

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License.

## Support

For issues and questions, please open an issue on the GitHub repository.

---

**Note:** This application is for educational/demonstration purposes. Consult healthcare professionals for actual medical diagnoses.
