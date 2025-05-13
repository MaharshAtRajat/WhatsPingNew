# Whatsping Client

The client application for Whatsping, a platform that allows businesses to create customizable forms and receive submissions via WhatsApp.

## Features

- User authentication (sign up, login, logout)
- Form builder with drag-and-drop interface
- Form templates
- Google Forms import
- WhatsApp integration
- Real-time form submissions
- Analytics dashboard

## Tech Stack

- React 18
- TypeScript
- Chakra UI
- React Router
- Supabase (Authentication & Database)

## Prerequisites

- Node.js 16 or later
- npm or yarn
- Supabase account and project

## Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/whatsping.git
cd whatsping/client
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Create a `.env` file in the root directory and add your Supabase credentials:
```
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Start the development server:
```bash
npm start
# or
yarn start
```

The application will be available at `http://localhost:3000`.

## Project Structure

```
src/
  ├── components/     # Reusable UI components
  ├── context/       # React context providers
  ├── lib/          # Utility functions and configurations
  ├── pages/        # Page components
  ├── theme.ts      # Chakra UI theme configuration
  └── App.tsx       # Main application component
```

## Available Scripts

- `npm start` - Runs the app in development mode
- `npm build` - Builds the app for production
- `npm test` - Runs the test suite
- `npm eject` - Ejects from Create React App

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 