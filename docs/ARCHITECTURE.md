# Architecture Overview

This project follows a **Feature-Based Module** pattern with a focus on **Signals-based State Management** (Angular 19).

## 🏗 Directory Structure

- `src/app/core`: Singleton services, global state (Signals), and HTTP interceptors.
- `src/app/features`: Independent domain modules (Admin, Registration, Doctor, etc.). Each feature is self-contained with its own routes.
- `src/app/layouts`: Shared application layouts (e.g., the Main Shell).
- `src/app/shared`: Reusable dumb components and utility pipes/directives.

## ⚡ Technical Highlights

- **Zoneless Change Detection**: Utilizing Angular's latest `provideExperimentalZonelessChangeDetection()` for superior performance.
- **Signal-Based Stores**: Replaces complex RxJS boilerplates with clean, reactive Signals.
- **Standalone Components**: 100% standalone architecture for faster builds and easier testing.
- **Tailwind CSS 4.0**: Modern styling with zero runtime overhead.
- **Mock Persistence**: Interceptors provide a seamless "Full-Stack" experience in the browser without a physical database.
