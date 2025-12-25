# Tzav Rishon - הכנה לצו ראשון

פלטפורמה מקיפה להכנה למבחן הפסיכומטרי של צה"ל ("צו ראשון") עם תמיכה מלאה בעברית ו-RTL.

A comprehensive platform for preparing for the IDF "Tzav Rishon" psychometric test with full Hebrew and RTL support.

## 🎯 Features

- **Practice Mode (תרגול)**: Practice each question type separately with immediate feedback
  - Guest users: 5 questions per type
  - Authenticated users: Unlimited practice
  - Answer validation with Hebrew text normalization
  
- **Exam Mode (מבחן)**: Full timed simulation with 4 sections
  - Section locking (cannot return to previous sections)
  - Server-side timer enforcement
  - Score out of 90 points
  
- **Progress Tracking (מעקב)**: Detailed analytics and improvement tracking
  - Accuracy by question type
  - Time per question
  - Improvement trends over time
  
- **Four Question Types**:
  1. Verbal Analogy (אנלוגיה מילולית)
  2. Shape Analogy (אנלוגיה צורנית)  
  3. Instructions & Directions (הוראות וכיוונים)
  4. Quantitative Reasoning (חשיבה כמותית)

- **Security**: OAuth2 Google login, JWT authentication, CSRF protection
- **Full RTL Support**: Complete Hebrew interface with proper text direction
- **Mobile-First**: Responsive design for all devices
- **Animations**: Smooth transitions with Framer Motion
- **Sound Effects**: Optional audio feedback (muted by default)

## 🏗️ Architecture

### Backend
- **Java 21** with **Spring Boot 3.x**
- **PostgreSQL** database with UUID primary keys
- **Spring Security** with OAuth2 + JWT
- **Flyway** for database migrations
- **MapStruct** for DTO mapping
- **Testcontainers** for integration tests

### Frontend
- **React 18** with **TypeScript**
- **Vite** for build tooling
- **Material-UI (MUI)** with RTL support
- **React Router** for navigation
- **i18next** for Hebrew translations
- **Framer Motion** for animations
- **Recharts** for data visualization
- **Playwright** for E2E testing

### Infrastructure
- **Docker Compose** for local development
- **Nginx** for production deployment
- **PostgreSQL** with persistent volumes

## 📋 Prerequisites

- **Java 21** or higher
- **Node.js 18** or higher
- **Docker** and **Docker Compose**
- **Google OAuth2 credentials** (for authentication)

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd private-dev
```

### 2. Set Up Google OAuth2

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials:
   - Application type: Web application
   - Authorized redirect URIs: `http://localhost:8080/api/v1/auth/google/callback`
5. Copy Client ID and Client Secret

### 3. Configure Environment Variables

#### Backend (`server/.env`)

```bash
cp server/.env.example server/.env
```

Edit `server/.env`:

```env
DATABASE_URL=jdbc:postgresql://localhost:5432/tzav
DATABASE_USERNAME=tzav
DATABASE_PASSWORD=tzav
JWT_SECRET=your-secure-random-string-minimum-256-bits
OAUTH_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
OAUTH_GOOGLE_CLIENT_SECRET=your-google-client-secret
OAUTH_GOOGLE_REDIRECT_URI=http://localhost:8080/api/v1/auth/google/callback
APP_FRONTEND_URL=http://localhost:3000
```

#### Frontend (`web/.env`)

```bash
cp web/.env.example web/.env
```

Edit `web/.env`:

```env
VITE_API_BASE=http://localhost:8080/api/v1
VITE_ADSENSE_ENABLED=false
```

### 4. Start with Docker Compose

```bash
docker-compose up
```

This will start:
- PostgreSQL database (port 5432)
- Spring Boot backend (port 8080)
- React frontend (port 3000)

### 5. Access the Application

Open your browser to: **http://localhost:3000**

The database will be automatically migrated and seeded with sample questions.

## 🛠️ Development

### Backend Development

```bash
cd server

# Run with Gradle
./gradlew bootRun

# Run tests
./gradlew test

# Format code
./gradlew spotlessApply
```

### Frontend Development

```bash
cd web

# Install dependencies
npm install

# Run dev server
npm run dev

# Run tests
npm run test

# Run E2E tests
npm run test:e2e

# Build for production
npm run build
```

## 📊 Database

### Migrations

Flyway migrations are located in `server/src/main/resources/db/migration/`:
- `V1__initial_schema.sql`: Database schema
- `V2__seed_data.sql`: Sample questions in Hebrew

Migrations run automatically on application startup.

### Seed Data

The application comes with 8+ questions per type in Hebrew:
- Verbal analogies with multiple acceptable answers
- Shape analogies with image URLs (placeholder images)
- Logic puzzles and directions
- Quantitative math problems

## 🔐 Authentication Flow

1. User clicks "Login with Google"
2. Redirected to Google OAuth consent screen
3. After approval, redirected to `/api/v1/auth/google/callback`
4. Backend creates/updates user and sets HTTP-only JWT cookie
5. Frontend redirected to `/auth/callback` then to home
6. Subsequent requests include JWT cookie automatically

## 🧪 Testing

### Backend Tests

```bash
cd server
./gradlew test
```

Tests cover:
- Answer normalization (Hebrew text + niqqud)
- Exam section locking
- Score calculation (out of 90)
- Guest practice limits

### Frontend Tests

```bash
cd web
npm run test:e2e
```

Tests cover:
- Guest home page viewing
- Guest limited practice
- Auth-protected exam access
- Progress dashboard

## 🎨 Customization

### Adding Questions

Use the admin endpoint to import questions:

```bash
POST /api/v1/admin/import-questions
Content-Type: application/json

[
  {
    "type": "VERBAL_ANALOGY",
    "format": "TEXT_INPUT",
    "promptText": "ספר : קריאה :: מזלג : ?",
    "explanation": "ספר משמש לקריאה, מזלג משמש לאכילה",
    "difficulty": 2,
    "acceptableAnswers": [
      {"value": "אכילה"},
      {"value": "לאכול"}
    ]
  }
]
```

### Configuring Exam Sections

Edit in `.env`:

```env
# Number of questions per section
APP_SECTION_COUNTS=VERBAL_ANALOGY:10,SHAPE_ANALOGY:10,INSTRUCTIONS_DIRECTIONS:10,QUANTITATIVE:10

# Duration in seconds
APP_SECTION_DURATIONS_SEC=VERBAL_ANALOGY:480,SHAPE_ANALOGY:480,INSTRUCTIONS_DIRECTIONS:360,QUANTITATIVE:600
```

### Enabling AdSense

1. Get AdSense account and ad slots
2. Update `.env`:

```env
VITE_ADSENSE_ENABLED=true
VITE_ADSENSE_CLIENT=ca-pub-xxxxxxxxxxxxx
VITE_ADSENSE_SLOT_HOME=1234567890
```

## 📱 Mobile Support

The application is fully responsive and optimized for mobile devices:
- Touch-friendly interface
- Adaptive layouts
- Proper text sizing
- Bottom navigation on small screens

## 🌐 Internationalization

Currently supports Hebrew (he-IL). Translations are in `web/src/i18n/locales/he.json`.

To add another language:
1. Create `web/src/i18n/locales/[lang].json`
2. Update `web/src/i18n/index.ts`
3. Add language selector in UI

## 🔒 Security Features

- HTTP-only cookies for JWT storage
- CSRF protection
- OAuth2 authentication
- Server-side answer validation
- Rate limiting for guest users
- Input sanitization
- SQL injection prevention (JPA)
- XSS protection (React escaping)

## 📈 Scoring Algorithm

Exam scoring is calculated as:

```
totalCorrect = count of correct answers across all sections
totalQuestions = count of all questions answered
score90 = round(90 * totalCorrect / totalQuestions)
```

Individual section scores are also tracked for detailed feedback.

## 🎵 Sound Effects

Place your sound files in `web/public/sfx/`:
- `correct.mp3` - Played on correct answer
- `incorrect.mp3` - Played on incorrect answer

Users can toggle sounds on/off via the volume icon in the app bar.

## 📄 API Documentation

Full OpenAPI 3.0 specification available at: `openapi.yaml`

View it with Swagger UI or import into Postman.

## 🐛 Troubleshooting

### Database Connection Issues

```bash
# Check if PostgreSQL is running
docker-compose ps

# View logs
docker-compose logs db

# Reset database
docker-compose down -v
docker-compose up
```

### OAuth Callback 404

Ensure the redirect URI in Google Console matches exactly:
```
http://localhost:8080/api/v1/auth/google/callback
```

### CORS Errors

Check that `APP_FRONTEND_URL` in backend `.env` matches your frontend URL.

### Port Already in Use

```bash
# Find and kill process on port 8080
lsof -ti:8080 | xargs kill -9

# Find and kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

## 📦 Production Deployment

### Build

```bash
# Build backend
cd server
./gradlew build

# Build frontend
cd web
npm run build
```

### Environment Variables

Update for production:
- Use strong `JWT_SECRET` (256+ bits)
- Set `APP_FRONTEND_URL` to production domain
- Configure production database
- Enable HTTPS
- Update OAuth redirect URI

### Docker Production

```bash
docker-compose -f docker-compose.prod.yml up -d
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📝 License

This project uses only permissive open-source libraries. See individual dependencies for their licenses.

## 📧 Support

For issues and questions:
- Open a GitHub issue
- Contact: [your-email]

## 🙏 Acknowledgments

- Material-UI for the excellent React component library
- Spring Boot for the robust backend framework
- The open-source community for amazing tools

---

**Made with ❤️ for Israeli teens preparing for IDF service**

בהצלחה! 🎖️

