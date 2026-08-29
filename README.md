# Hostel Complaint System — Frontend Starter

## What's here
- Role-select landing page (Student / Staff / Admin) — replaces login
- Student flow asks for **Roll Number + Room Number** once, then remembers it
- Basic routing with a guard so people can't skip straight to `/staff` or `/admin`
- Empty placeholder screens for each role, ready for you to fill in

## How to run it

1. Install [Node.js](https://nodejs.org/) (LTS version) if you don't have it.
2. Open a terminal in this folder and run:
   ```
   npm install
   npm run dev
   ```
3. Open the URL it prints (usually `http://localhost:5173`).

## Where to go next

- `src/pages/StudentHome.jsx` — build the "report complaint" form and "my complaints" list here
- `src/pages/StaffHome.jsx` — build the verify/assign/status-update screens here
- `src/pages/AdminHome.jsx` — build staff management + analytics dashboard here
- `src/context/UserContext.jsx` — holds the current role and the student's roll/room number in memory; read from `useUser()` in any page

## Notes
- There's no backend yet — build screens against fake local arrays first (e.g. a `sampleComplaints.js` file), then swap in real API calls once Member 2's backend is ready.
- The photo/camera upload input isn't added yet — when you build the "report complaint" form, use:
  ```jsx
  <input type="file" accept="image/*" capture="environment" />
  ```
