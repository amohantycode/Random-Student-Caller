# 🎯 PickMe! — Student Presentation Picker

A fun, visual web app for teachers to randomly select students for class presentations. Features an animated spinner wheel, multi-class management, and persistent tracking.

## Features

- **🎡 Animated Spinner Wheel** — Colorful, smooth-spinning wheel that visually proves randomness
- **📚 Multi-Class Dashboard** — Manage multiple class periods from one clean interface
- **🔄 Fair Cycling** — Every student gets called before anyone repeats
- **↩️ Put Back** — Return absent students to the uncalled pool with one click
- **👥 Easy Roster Management** — Add students one-by-one or paste a list, edit names inline, remove students
- **💾 Persistent Storage** — Data saves in your browser automatically (localStorage)
- **📱 Responsive** — Works on desktop, tablet, and mobile
- **🚀 Auto-Reset** — Cycle restarts automatically when everyone has been called

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) 18+ installed

### Install & Run Locally
```bash
# Clone the repo (or download)
cd student-picker

# Install dependencies
npm install

# Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Deploy to Vercel

1. Push this project to a GitHub repository
2. Go to [vercel.com](https://vercel.com) and sign in with GitHub
3. Click "New Project" → Import your repo
4. Click "Deploy" — that's it!

Or use the Vercel CLI:
```bash
npm i -g vercel
vercel
```

## How to Use

### 1. Create a Class
Click **"+ Add Class"** on the dashboard. Enter the class name (e.g., "AP Computer Science Principles") and period (e.g., "3rd Period").

### 2. Add Students
Click on a class card → Click **"Manage Roster"** → Add students one at a time or use **"Switch to Bulk Add"** to paste a list of names (one per line).

### 3. Spin!
Click the **🎯 SPIN!** button (or click the wheel itself). The wheel animates and randomly selects a student from the uncalled pool.

### 4. Put Back (if absent)
If a selected student was absent, hover over their name in the **"Called"** list and click **"↩ Put Back"** to return them to the uncalled pool.

### 5. Cycle Resets Automatically
Once every student has been called, the cycle resets and everyone goes back to the uncalled list. You can also manually reset anytime via the **Reset** button.

## Important Notes

- **Data is stored in your browser** — use the same browser on the same device each time
- **Clearing browser data will erase your classes** — don't clear localStorage for this site
- If you need to switch devices, you'll need to re-enter your classes

## Tech Stack

- [Next.js](https://nextjs.org/) 16 (App Router)
- [Tailwind CSS](https://tailwindcss.com/) v4
- HTML5 Canvas (spinner wheel)
- localStorage (data persistence)

## License

Built with ❤️ for Mr. McLaughlin's CS classes at Marriotts Ridge High School.
