# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# Development
pnpm dev          # Start development server on localhost:3000
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run Next.js linting
```

## Architecture Overview

This is a **Next.js 15 + React 19** Korean AI idea generator with Firebase integration. Key architectural decisions:

### Core Structure
- **Main Component**: `idea-generator.tsx` contains the primary application logic with 2-column responsive layout
- **App Router**: Pages in `app/` directory with API routes in `app/api/`
- **shadcn/ui**: Comprehensive component library (40+ components) with Tailwind CSS
- **TypeScript**: Strict typing throughout the application

### Data Flow
- **Dual Storage**: localStorage for immediate access + Firestore for authenticated users
- **AI Integration**: Single API endpoint `/api/generate-idea` using OpenRouter + DeepSeek Chat v3
- **Category System**: 5 predefined categories (스타트업, 비즈니스 자동화, 블로그, 유튜브, 프로젝트)

### Authentication & Database
- **Firebase Auth**: Email/password + Google OAuth
- **Custom Hook**: `useAuthUser.ts` manages auth state
- **Firestore**: User-scoped data with security rules requiring authentication
- **Progressive Enhancement**: App works without login (localStorage only)

### API Architecture
- **Single Endpoint**: `/api/generate-idea` with category-specific Korean prompts
- **Structured Output**: Markdown-formatted responses with typography support
- **Error Handling**: Graceful fallbacks with user-friendly messages

## Key Files and Components

### Main Application Files
- `idea-generator.tsx` - Core application component with state management
- `app/api/generate-idea/route.ts` - AI idea generation endpoint
- `hooks/useAuthUser.ts` - Firebase authentication state management
- `lib/firebase.ts` - Firebase configuration and initialization
- `components/NavBar.tsx` - Navigation with authentication controls

### Configuration
- Firebase settings require `NEXT_PUBLIC_` prefix for client-side access
- OpenRouter API key for AI functionality
- Firestore security rules enforce user-scoped data access

## Development Notes

### Environment Setup
```bash
# Required environment variables in .env.local
OPENROUTER_API_KEY=your_key
OPENROUTER_MODEL=deepseek/deepseek-chat-v3-0324:free
NEXT_PUBLIC_FIREBASE_API_KEY=your_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
# ... additional Firebase config
```

### State Management
- No external state library - uses React useState with localStorage persistence
- Authentication state managed through Firebase Auth + custom hook
- Ideas stored both locally and in Firestore for authenticated users

### Styling System
- Tailwind CSS with custom gradient themes
- CSS variables for consistent theming
- Responsive design with mobile-first approach
- Component variants using `class-variance-authority`

## Common Development Patterns

When modifying this codebase:
- Follow the existing dual-storage pattern (local + cloud)
- Maintain Korean language focus in prompts and UI
- Use existing shadcn/ui components rather than creating new ones
- Preserve the responsive 2-column layout structure
- Follow TypeScript interfaces for data structures (`LikedIdea`, `FirestoreIdea`)