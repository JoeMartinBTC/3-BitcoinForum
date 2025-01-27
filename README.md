# Interactive Event Scheduler

A modern, drag-and-drop event scheduling system built with React and Express. This application provides an intuitive interface for managing events across multiple days with precise time slot management.

## Features

- Interactive drag-and-drop event management
- Time grid with configurable transition periods
- Holding area for unscheduled events
- Visual feedback system for scheduling operations
- Multiple day view support
- Automatic conflict detection

## Tech Stack

- Frontend: React, TypeScript, TailwindCSS, Shadcn UI
- Backend: Express.js, Node.js
- Database: PostgreSQL with Drizzle ORM
- State Management: React Query
- Drag and Drop: React DnD

## Getting Started

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5000`

## Project Structure

- `/client` - Frontend React application
- `/server` - Express.js backend
- `/db` - Database schemas and configurations

## Development Status

Current version: v0.8.9.7
- ✅ Initial prototype
- ✅ Drag-and-drop functionality
- ✅ Time grid implementation
- ✅ Event management system
- 🚧 Multiple event templates (in progress)
- 📅 Schedule export feature (planned)
