# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React + Vite application for stock recommendations. Currently a minimal Vite template setup with React 19, but intended to be developed into a stock recommendation system.

## Development Commands

- `npm run dev` - Start development server with hot module replacement
- `npm run build` - Build for production 
- `npm run lint` - Run ESLint to check code quality
- `npm run preview` - Preview production build locally

## Architecture

- **Frontend Framework**: React 19 with JSX
- **Build Tool**: Vite 7.1.2 with React plugin
- **Linting**: ESLint 9 with React Hooks and React Refresh plugins
- **Entry Point**: `src/main.jsx` renders `App` component into `index.html`
- **Main Component**: `src/App.jsx` - currently the default Vite counter example

## Code Structure

```
src/
├── main.jsx       # Application entry point
├── App.jsx        # Main App component 
├── App.css        # App-specific styles
├── index.css      # Global styles
└── assets/        # Static assets (images, etc.)
```

## Development Notes

- Uses ES modules (`"type": "module"` in package.json)
- ESLint configured for modern React with hooks and fast refresh
- No test framework currently configured
- Standard Vite development server runs on localhost:5173
- Production builds output to `dist/` directory