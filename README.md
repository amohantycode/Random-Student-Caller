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
- **Put Back / Absent Handling**: If a student is called but absent or unable to present, choose "Put back" to return them to the current round.
- **Automatic Cycle Reset**: Once all students in a class have been called, the cycle automatically resets so a new round of presentations can begin. You can also reset manually at any time.
- **Presentation History Log**: Records every student selection with date and time. Click "History" inside any class to see a chronological log grouped by day.
- **Cloud Sync & Authentication**:
  - Sign in with Email/Password or Google.
  - All classes, rosters, called states, and history are saved securely to Cloud Firestore and accessible from any computer or browser.
- **Classroom-friendly Interface**: A calm, responsive layout that is easy for a teacher to operate and clear enough to project for students.

---

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/amohantycode/student-picker-v2.git
   cd student-picker-v2
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

## Browsing saved data in Firebase

In Firestore, open `users/{uid}` to see the teacher's `displayName` and `email`.
The user IDs stay unchanged so existing accounts keep their classes. These
identifying fields are merged when a signed-in user opens the updated app;
they do not replace any existing user fields or subcollections.

Under `users/{uid}/classes/{classId}`, each class has its existing `name` and
`period`, plus these console summaries:

- `studentNames`: alphabetized names (including duplicate names).
- `studentCount`: total number of students.
- `remainingCount`: students who have not been called this round.

The original `students` array remains the source of truth, including student
IDs, called flags, and timestamps. The `history` subcollection stays in place.
Use the website to edit rosters; summary fields are derived, not editable rosters.
New roster changes save the summaries together with the students. Existing
classes gain summaries in the background when opened or listed, and outdated
summaries are repaired on a later read. A failed backfill does not prevent reads.

This is an additive rollout, not a bulk migration: inactive accounts are updated
when they next use the deployed app. No production data needs to be deleted or
moved. Existing Firestore rules must allow each signed-in user to merge their own
`users/{uid}` document and update their own class documents; do not grant public
access. If profile writes are denied, the app still works and logs a warning,
but those account details will not appear until the existing rules permit them.

Run `node --test tests/storage.test.mjs` for isolated data-preservation checks.
