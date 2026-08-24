# Student Picker

A clean, web-based tool for teachers to randomly select students for presentations without repeating until everyone has been called.

Built for classroom presentation management across multiple class periods with cloud syncing and presentation history tracking.

---

## Features

- **Fair Cycle Selection**: Students are chosen randomly from those who have not yet presented. No student is repeated until every person in the class has had a turn.
- **Interactive Spinner Wheel**: Smooth canvas-based wheel that displays all remaining uncalled students. Clicking the wheel spins it and selects a presenter.
- **Multiple Class Periods**: Create, edit, and organize multiple classes with custom period names (e.g., Period 1 AP CS, Period 4 Java).
- **Roster Management**:
  - Add students individually or bulk paste an entire roster at once.
  - Edit names inline directly from the roster view.
  - Delete individual students or remove classes.
- **Put Back / Absent Handling**: If a student is called but absent or unable to present, click the return arrow to place them back into the uncalled pool.
- **Automatic Cycle Reset**: Once all students in a class have been called, the cycle automatically resets so a new round of presentations can begin. You can also reset manually at any time.
- **Presentation History Log**: Records every student selection with date and time. Click "History" inside any class to see a chronological log grouped by day.
- **Cloud Sync & Authentication**:
  - Sign in with Email/Password or Google.
  - All classes, rosters, called states, and history are saved securely to Cloud Firestore and accessible from any computer or browser.
- **Clean Interface**: Minimalist design built with standard web typography, responsive layout, and zero visual clutter.

---

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/amohantycode/Random-Student-Caller.git
   cd Random-Student-Caller
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure Firebase:
   Create or verify the Firebase configuration in `src/lib/firebase.ts` with your Firebase project credentials.

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS
- **Authentication**: Firebase Authentication
- **Database**: Cloud Firestore
- **Graphics**: HTML5 Canvas for the spinner wheel
- **Deployment**: Vercel
