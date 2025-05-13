# Whatsping - WhatsApp Form Submission Platform

A SaaS platform that allows businesses to create customizable forms and receive submissions via WhatsApp instantly.

## Features

- User Authentication
- Form Builder with multiple input types
- Form Templates
- Google Forms Import
- WhatsApp Integration
- Real-time Form Submissions
- Analytics Dashboard

## Tech Stack

- Frontend: React + TypeScript
- Backend: Node.js + Express
- Database: Supabase (PostgreSQL)
- Authentication: Supabase Auth

## Project Structure

```
whatsping/
├── client/          # React frontend
└── server/          # Node.js backend
```

## Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Supabase account

### Environment Variables

Create `.env` files in both client and server directories:

#### Client (.env)
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

#### Server (.env)
```
PORT=3001
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_supabase_service_key
```

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   # Install client dependencies
   cd client
   npm install

   # Install server dependencies
   cd ../server
   npm install
   ```

3. Start the development servers:
   ```bash
   # Start client
   cd client
   npm run dev

   # Start server
   cd ../server
   npm run dev
   ```

## Database Schema

The application uses the following main tables in Supabase:

- users
- forms
- form_fields
- submissions

## License

MIT 