# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React-based budget tracking application built with TypeScript, Firebase, and Tailwind CSS. The app allows users to track income, expenses, budgets by category, and credit card utilization with a comprehensive dashboard interface.

## Core Architecture

- **Frontend**: React 18 with TypeScript
- **Backend**: Firebase Firestore for data persistence
- **UI Framework**: Tailwind CSS with a dark theme
- **Charts**: Chart.js via react-chartjs-2
- **Testing**: WebdriverIO with Sauce Labs integration
- **Build Tool**: Create React App

### Key Components

- `src/updated-budget-dashboard.tsx` - Main dashboard component with all budget functionality
- `src/services/budgetService.ts` - Firebase CRUD operations for expenses, income, and budgets
- `src/services/firebase.ts` - Firebase configuration and initialization

### Data Models

The app manages three main entities:
- **Expenses**: category, amount, date, description, paymentMethod
- **Income**: date, source, description, amount  
- **Budgets**: category-based budget allocations with spending tracking

## Development Commands

```bash
# Start development server
npm start

# Build for production
npm run build

# Run unit tests
npm test

# Run cross-browser tests via Sauce Labs
npm run test:sauce

# Run web-specific tests
npm run test:web

# Run mobile tests
npm run test:mobile

# Verify Sauce Labs setup
npm run sauce:verify
```

## Firebase Setup

The app requires Firebase environment variables in a `.env` file:
- `REACT_APP_FIREBASE_API_KEY`
- `REACT_APP_FIREBASE_AUTH_DOMAIN`
- `REACT_APP_FIREBASE_PROJECT_ID`
- `REACT_APP_FIREBASE_STORAGE_BUCKET`
- `REACT_APP_FIREBASE_MESSAGING_SENDER_ID`
- `REACT_APP_FIREBASE_APP_ID`
- `REACT_APP_FIREBASE_MEASUREMENT_ID`

## Testing Infrastructure

The project includes comprehensive testing setup:
- **WebdriverIO** configuration in `wdio.conf.js`
- **Sauce Labs** integration for cross-browser testing
- Test specs in `test/specs/` directory
- Page objects pattern in `test/pageObjects/`

## Key Features

- Monthly budget tracking with visual progress indicators
- Budget carry-forward system (budgets persist from month to month unless changed)
- Credit card utilization monitoring with limits and due dates
- Interactive charts showing budget vs actual spending
- Expense categorization with predefined categories
- Income tracking with multiple sources (resets monthly)
- Real-time budget alerts and notifications
- Pagination and filtering for transaction tables
- Month-by-month navigation
- Automatic current month default on app launch

## Development Notes

- The main dashboard component is quite large (~2000 lines) and handles all state management internally
- Firebase operations are abstracted through the budgetService
- The app uses a predefined set of expense categories but allows custom ones
- Credit card tracking includes statement dates, due dates, and utilization percentages
- The UI follows a dark theme throughout with gray-800/900 color scheme
- Budget carry-forward logic: budgets automatically carry forward from the most recent previous month
- Income resets monthly while budgets persist across months
- When users edit budgets, a new budget entry is created for that specific month