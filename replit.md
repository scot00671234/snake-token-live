# Twitch Plays Snake

## Overview

A collaborative multiplayer Snake game where viewers can control the game through Twitch chat commands. The application features real-time gameplay, comment processing, and live statistics tracking. Built as a full-stack web application with real-time WebSocket communication for immediate command processing and game state updates.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **React with TypeScript**: Modern component-based UI using functional components and hooks
- **Vite Build System**: Fast development server and optimized production builds
- **Tailwind CSS + shadcn/ui**: Utility-first styling with a comprehensive component library
- **TanStack Query**: Server state management with caching and background updates
- **Wouter**: Lightweight client-side routing

### Backend Architecture
- **Express.js Server**: RESTful API endpoints with middleware for logging and error handling
- **WebSocket Integration**: Real-time bidirectional communication using native WebSocket API
- **Modular Route System**: Separated route definitions with comprehensive game state management
- **TypeScript**: End-to-end type safety across client and server

### Data Storage
- **PostgreSQL**: Primary database for persistent data storage
- **Drizzle ORM**: Type-safe database operations with schema-first approach
- **Database Schema**: 
  - Games table for game sessions and metadata
  - Comments table for chat commands and validation
  - High scores table for leaderboard functionality
  - Game stats table for analytics and metrics
- **In-Memory Game State**: Active game state maintained in server memory for real-time performance

### Real-Time Communication
- **WebSocket Server**: Handles live game updates, command processing, and player notifications
- **Event-Driven Architecture**: Message-based communication between client and server
- **Connection Management**: Automatic reconnection and connection state tracking

### Game Engine
- **Canvas-Based Rendering**: HTML5 Canvas for smooth game graphics
- **Client-Side Game Loop**: Optimized rendering with server-side state synchronization
- **Command Queue System**: Processes chat commands in real-time with validation

### External Dependencies
- **Neon Database**: Serverless PostgreSQL hosting with connection pooling
- **Radix UI**: Accessible component primitives for complex UI interactions
- **React Hook Form**: Form state management with validation
- **Date-fns**: Date manipulation and formatting utilities
- **Class Variance Authority**: Type-safe component variant management
- **Embla Carousel**: Touch-friendly carousel component for UI elements

### Development Tools
- **ESBuild**: Fast bundling for server-side code
- **Drizzle Kit**: Database migration and schema management
- **TypeScript Compiler**: Type checking and compilation
- **PostCSS**: CSS processing and optimization