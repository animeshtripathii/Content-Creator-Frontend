# Git Branch & Commit Guide for CreatorConnect Frontend

This file explains where (which branch) to commit each file, page, and function, along with sample commit messages.

---

## Branches
- **main**: Production-ready, stable code only.
- **dev**: Integration branch for all features and fixes before release.
- **feature/* or bugfix/**: For new features or bug fixes (e.g., feature/login, feature/navbar, bugfix/auth-error).

---

## Where to Commit

### Pages
- `src/pages/Login.jsx`, `Signup.jsx`, `Dashboard.jsx`
  - **Branch:** feature/login, feature/signup, feature/dashboard
  - **Commit message:**
    - `Feat: Add Login page UI and logic`
    - `Feat: Implement Signup page with API`
    - `Feat: Create Dashboard page layout`

### Components
- `src/components/Button.jsx`, `Footer.jsx`, `Navbar.jsx`
  - **Branch:** feature/components
  - **Commit message:**
    - `Feat: Add reusable Button component`
    - `Feat: Add Footer component`
    - `Feat: Add Navbar with navigation links`

### API Functions
- `src/api/axiosInstance.js`, `authApi.js`
  - **Branch:** feature/api
  - **Commit message:**
    - `Chore: Setup axios instance for API calls`
    - `Feat: Add login and signup API functions`

### Context
- `src/context/AuthContext.jsx`
  - **Branch:** feature/auth-context
  - **Commit message:**
    - `Feat: Add AuthContext for user state management`

### Routing
- `src/routes/ProtectedRoute.jsx`
  - **Branch:** feature/routing
  - **Commit message:**
    - `Feat: Add ProtectedRoute for authenticated pages`

### App Structure
- `src/App.jsx`, `src/main.jsx`
  - **Branch:** dev (after merging all features)
  - **Commit message:**
    - `Chore: Integrate all pages and components in App`

---

## Merging
- After feature is complete and tested, merge feature branch into **dev**:
  - `Merge branch 'feature/login' into dev`
- After all features are tested in **dev**, merge **dev** into **main** for release:
  - `Release: Merge dev to main for v1.0.0`

---

## Example Workflow
1. Create feature branch: `git checkout -b feature/login`
2. Work on `Login.jsx`, commit: `git commit -am "Feat: Add Login page UI and logic"`
3. Merge to dev: `git checkout dev && git merge feature/login`
4. After all features: `git checkout main && git merge dev`

---

Keep commit messages clear and descriptive for each change!
