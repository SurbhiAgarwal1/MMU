# MMU Healthcare Platform 🏥

[![Angular](https://img.shields.io/badge/Angular-19-dd0031.svg?logo=angular)](https://angular.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-black?logo=vercel)](https://mmu-healthcare-demo.vercel.app)

MMU Healthcare is a high-performance, enterprise-grade **Standalone Healthcare Management System** built using the latest features of **Angular 19**. It is designed to handle complex clinical workflows with a focus on speed, reliability, and modern user experience.

🚀 **[View Live Demo](https://mmu-healthcare-demo.vercel.app)**

---

## 📺 Interactive Demo

Watch the platform in action, from authentication to patient management:

![Platform Walkthrough](./docs/assets/demo.webp)

---

## 🏥 Clinical Workflow

The platform mirrors real-world clinical operations through a multi-stage workflow:

1.  **Reception**: Patient registration and queue assignment.
2.  **Nurse Station**: Recording of vital signs (BP, Pulse, SpO2, Temperature).
3.  **Consultation**: Physician review, diagnosis, and electronic prescribing.
4.  **Auxiliary Services**: Pharmacy dispensing and Laboratory test processing.

![Workflow Demo](./docs/assets/app_run.webp)

---

## ✨ Core Capabilities

### 🛡️ Secure RBAC (Role-Based Access Control)
The application implements a strict security model where interfaces are dynamically generated based on the user's role.
- **Admin**: System-wide oversight and analytics.
- **Doctor**: Specialized workareas for consultations and prescriptions.
- **Nurse**: Focused vital entry and patient queue management.
- **Support**: Streamlined views for Pharmacists and Lab Technicians.

### 📶 Offline Synchronization & Resilience
Built for environments with intermittent connectivity, MMU Healthcare includes:
- **Sync Queue Service**: Captures actions while offline and replays them when the connection is restored.
- **Offline Interceptor**: Transparently handles network failures and triggers background synchronization.

### 🎥 Device & Media Integrations
The platform supports direct device interaction for enhanced clinical documentation:
- **Webcam Facade**: Integrated patient photo capture.
- **Audio Recorder**: Support for recording clinical notes or patient interactions.

---

## ⚡ Technical Innovation (Angular 19)

- **Zoneless Reactivity**: Leveraging `provideExperimentalZonelessChangeDetection` to eliminate Zone.js, reducing bundle size and improving rendering performance.
- **Signal-Based State Management**: Utilizing Angular Signals for a reactive, fine-grained state management system that replaces complex state libraries.
- **Tailwind CSS 4.0**: A future-proof styling engine using the latest CSS-variable based architecture.

---

## 📂 Detailed Project Structure

```text
mmu-ui/
├── src/
│   ├── app/
│   │   ├── core/                   # Global Singletons & Infrastructure
│   │   │   ├── api/                # Domain API Services (Auth, Patient, Vitals, etc.)
│   │   │   ├── config/             # App-wide injection tokens & config
│   │   │   ├── guards/             # Auth & Role-based routing protection
│   │   │   ├── interceptors/       # Mocking, Auth, Offline & Retry logic
│   │   │   └── state/              # Global Signal Stores (Auth, Notifications)
│   │   ├── features/               # Self-contained Domain Modules
│   │   │   ├── admin/              # Dashboard & Admin Oversight
│   │   │   ├── auth/               # Login & Session Management
│   │   │   ├── doctor/             # Consultation & Workarea
│   │   │   ├── lab/                # Lab Order Tracking
│   │   │   ├── nurse/              # Queue & Vitals Entry
│   │   │   ├── pharmacy/           # Prescription Dispensing
│   │   │   └── registration/       # Patient Onboarding & Search
│   │   ├── device-integrations/    # Hardware Abstraction Layers (Webcam, Audio)
│   │   ├── layouts/                # Shared UI Shells
│   │   ├── offline-sync/           # Background Synchronization Engine
│   │   └── shared/                 # Reusable UI Components & Pipes
│   ├── environments/               # Environment-specific Configurations
│   └── styles/                     # Tailwind & Global CSS Design System
└── docs/                           # Technical Docs & Media Assets
```

---

## 🚀 Getting Started

1. **Clone & Install**
   ```bash
   git clone https://github.com/SurbhiAgarwal1/MMU.git
   npm install
   ```

2. **Run Locally**
   ```bash
   npm start
   ```

3. **Explore the Demo**
   Login with **Username**: `admin` | **Password**: `admin`

---

## 📄 License
MIT License. Developed for modern healthcare efficiency.
