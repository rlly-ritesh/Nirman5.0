# 🎓 PadhAI - AI-Powered EdTech Platform
# testing
Transform any PDF into interactive learning materials with AI. PadhAI converts educational content into summaries, flashcards, quizzes, and more—making learning faster, simpler, and engaging for all age groups.

![PadhAI Banner](https://img.shields.io/badge/Next.js-14.2.25-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?style=for-the-badge&logo=tailwind-css)

## ✨ Features

### Core Features
- 📄 **PDF to Learning Materials**: Upload PDFs and instantly generate summaries, flashcards, and quizzes
- 🤖 **AI-Powered Content**: Uses advanced AI to create educational content from any document
- 🎯 **Interactive Quizzes**: Multiple-choice quizzes with instant feedback and detailed explanations
- 📚 **Smart Flashcards**: Practice mode with flip animations and progress tracking
- 📊 **Progress Analytics**: Comprehensive dashboard to track learning progress and performance
- 🎮 **Gamified Kid Mode**: Engaging interface for young learners with mini-games and rewards
- 📹 **YouTube Recommendations**: Smart video suggestions based on your study topics
- 👨‍🏫 **Teacher Dashboard**: Manage classes, create assignments, and track student performance
- 🔔 **Real-time Notifications**: Stay updated with quiz reminders and progress reports
- 🌍 **Multilingual Support**: Learn in English, Hindi, Bengali, Tamil, Telugu, and more

### Key Highlights
- ⚡ Fast and responsive dark-themed UI with neon gradient effects
- 🎨 3D orange button styling with smooth animations
- 📱 Fully responsive design for mobile, tablet, and desktop
- 🔒 Privacy-focused with content moderation for kid-safe learning
- 🎓 Three-tier pricing: Student (Free), Teacher (₹499/mo), School (₹2999/mo)

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/padhai.git
   cd padhai
   ```

2. **Install dependencies**
   ```bash
   npm install --legacy-peer-deps
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:
   ```env
   # OpenAI API (for AI content generation)
   OPENAI_API_KEY=your_openai_api_key_here
   
   # YouTube Data API (for video recommendations)
   YOUTUBE_API_KEY=your_youtube_api_key_here
   
   # Database (PostgreSQL or Supabase)
   DATABASE_URL=your_database_connection_string
   
   # Authentication (NextAuth.js or Clerk)
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your_nextauth_secret_here
   
   # File Storage (AWS S3 / Cloudflare R2 / Supabase Storage)
   STORAGE_BUCKET=your_storage_bucket_name
   STORAGE_ACCESS_KEY=your_storage_access_key
   STORAGE_SECRET_KEY=your_storage_secret_key
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
PadhAI/
├── app/
│   ├── api/                    # API routes
│   │   ├── upload/            # PDF upload endpoint
│   │   ├── generate/          # AI content generation
│   │   ├── quiz/submit/       # Quiz submission & scoring
│   │   └── youtube/           # YouTube recommendations
│   ├── dashboard/             # Dashboard pages
│   │   ├── page.tsx          # Dashboard home
│   │   ├── upload/           # PDF upload page
│   │   ├── documents/        # Documents library
│   │   ├── flashcards/       # Flashcard practice
│   │   ├── quizzes/          # Quiz interface
│   │   ├── kid-mode/         # Gamified kid mode
│   │   ├── progress/         # Progress analytics
│   │   ├── teacher/          # Teacher dashboard
│   │   └── settings/         # Settings page
│   ├── globals.css           # Global styles & utilities
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Landing page
├── components/               # Reusable components
│   ├── cta-section.tsx
│   ├── faq-section.tsx
│   ├── footer-section.tsx
│   ├── pricing-section.tsx
│   └── testimonials-section.tsx
├── types/
│   └── index.ts              # TypeScript type definitions
├── public/                   # Static assets
├── package.json
├── tailwind.config.ts        # Tailwind configuration
├── tsconfig.json             # TypeScript configuration
└── README.md
```

## 🎨 Design System

### Color Palette
- **Background**: `#0a0a0a` (Deep black)
- **Cards**: `rgba(255, 255, 255, 0.03)` with backdrop blur
- **Primary Orange**: `#f97316` (3D button gradient)
- **Neon Accents**: Purple `#a855f7`, Pink `#ec4899`, Blue `#3b82f6`, Cyan `#06b6d4`

### Custom CSS Classes
- `.btn-3d-orange` - Primary 3D orange button
- `.btn-3d-orange-secondary` - Secondary button variant
- `.dark-card` - Standard dark card with glass effect
- `.dark-card-elevated` - Elevated card with stronger shadow
- `.text-gradient-neon` - Neon gradient text effect
- `.neon-border` - Animated neon border

## 🔧 Technology Stack

### Frontend
- **Next.js 14.2.25** - React framework with App Router
- **React 19** - UI library
- **TypeScript** - Type-safe development
- **Tailwind CSS 3.4** - Utility-first CSS framework

### Backend (Production Setup)
- **Next.js API Routes** - Serverless API endpoints
- **PostgreSQL / Supabase** - Database for user data and content
- **OpenAI API** - AI content generation (summaries, flashcards, quizzes)
- **YouTube Data API v3** - Video recommendations
- **AWS S3 / Cloudflare R2** - PDF file storage
- **pdf-parse** - PDF text extraction

### Authentication (To Be Integrated)
- **NextAuth.js** or **Clerk** - User authentication
- **JWT** - Session management

## 🔌 API Endpoints

### PDF Upload
```
POST /api/upload
- Accepts: multipart/form-data (file + optional prompt)
- Returns: Document ID and processing status
```

### AI Content Generation
```
POST /api/generate
Body: {
  documentId: string,
  contentType: "summary" | "flashcards" | "quiz" | "all",
  difficulty?: "easy" | "medium" | "hard",
  language?: string
}
Returns: Generated content based on type
```

### Quiz Submission
```
POST /api/quiz/submit
Body: {
  quizId: string,
  userId: string,
  answers: Record<string, number>,
  timeSpent: number
}
Returns: Quiz results with score, percentage, and achievements
```

### YouTube Recommendations
```
GET /api/youtube/recommendations?topic={topic}&limit={limit}
Returns: List of relevant educational videos
```

## 📊 Database Schema (Recommended)

```sql
-- Users Table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'student', -- student, teacher, parent
  created_at TIMESTAMP DEFAULT NOW()
);

-- Documents Table
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  title VARCHAR(255) NOT NULL,
  file_url TEXT,
  extracted_text TEXT,
  status VARCHAR(50) DEFAULT 'processing', -- processing, completed, failed
  created_at TIMESTAMP DEFAULT NOW()
);

-- Flashcards Table
CREATE TABLE flashcards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID REFERENCES documents(id),
  front TEXT NOT NULL,
  back TEXT NOT NULL,
  difficulty VARCHAR(50),
  mastery_level INTEGER DEFAULT 0
);

-- Quizzes Table
CREATE TABLE quizzes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID REFERENCES documents(id),
  title VARCHAR(255),
  difficulty VARCHAR(50),
  time_limit INTEGER, -- in seconds
  created_at TIMESTAMP DEFAULT NOW()
);

-- Quiz Submissions Table
CREATE TABLE quiz_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quiz_id UUID REFERENCES quizzes(id),
  user_id UUID REFERENCES users(id),
  score INTEGER,
  percentage INTEGER,
  time_spent INTEGER,
  submitted_at TIMESTAMP DEFAULT NOW()
);
```

## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Import project in [Vercel Dashboard](https://vercel.com)
3. Add environment variables
4. Deploy

### Manual Deployment
```bash
# Build the production app
npm run build

# Start the production server
npm start
```

## 🔒 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `OPENAI_API_KEY` | OpenAI API key for content generation | Yes |
| `YOUTUBE_API_KEY` | YouTube Data API key | Yes |
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `NEXTAUTH_SECRET` | NextAuth secret key | Yes |
| `STORAGE_BUCKET` | Cloud storage bucket name | Yes |

## 📝 Features Roadmap

### Phase 1 (MVP - Current)
- ✅ Landing page with dark theme
- ✅ Dashboard UI with navigation
- ✅ PDF upload interface
- ✅ Documents library
- ✅ Flashcards practice
- ✅ Quiz system
- ✅ Kid Mode
- ✅ Progress analytics
- ✅ Teacher dashboard
- ✅ Settings page
- ✅ API routes (mock implementation)

### Phase 2 (Production)
- 🔄 Real PDF text extraction (pdf-parse)
- 🔄 OpenAI integration for content generation
- 🔄 Database integration (PostgreSQL/Supabase)
- 🔄 Authentication system (NextAuth.js/Clerk)
- 🔄 File storage (AWS S3/Cloudflare R2)
- 🔄 YouTube Data API integration

### Phase 3 (Advanced Features)
- ⏳ Text-to-speech for read-aloud functionality
- ⏳ AI Q&A chatbot for document questions
- ⏳ Real-time collaboration for teachers
- ⏳ Mobile app (React Native)
- ⏳ Offline mode with service workers
- ⏳ Advanced analytics with charts (Chart.js/Recharts)

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -m 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Design inspiration: Modern edutech platforms
- Icons: Emoji and Unicode characters
- Animations: Tailwind CSS transitions
- UI Framework: Next.js + React

## 📧 Contact

For questions or support, reach out at:
- Email: support@padhai.com
- Website: https://padhai.com
- Twitter: @PadhAI_official

---

**Built with ❤️ for learners everywhere**
