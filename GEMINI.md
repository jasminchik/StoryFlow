# StoryFlow

## Project Overview
StoryFlow is a full-stack web application designed for reading and tracking manga, comics, and fanfiction. It allows users to browse content, authors to upload new chapters, and administrators to moderate the platform.

The project is structured into a separated frontend and backend, orchestrated together using Docker.

**Tech Stack:**
*   **Frontend:** React 19, Vite 8, React Router DOM, SCSS Modules (component-oriented Vanilla CSS approach).
*   **Backend:** Node.js 20, Express 5, MongoDB with Mongoose.
*   **Authentication:** JWT (JSON Web Tokens) and Bcryptjs. Role-based access control (`user`, `author`, `admin`).
*   **Media Storage:** Local storage using Multer for image uploads (mounted via Docker volumes).
*   **Infrastructure:** Docker & Docker Compose.

## Architecture & Directory Structure
*   `/frontend`: Contains the React application. Uses Vite as the build tool. Styling is heavily reliant on SCSS modules and global CSS variables defined in `src/styles/_variables.scss` for theming (currently a dark theme with `#ff4757` red accents).
*   `/backend`: Contains the Express.js API. Includes directories for `config`, `middleware` (auth), `models` (Mongoose schemas), `routes`, and `uploads` (local media storage).
*   `docker-compose.yml`: Defines the orchestration for `frontend`, `backend`, and `mongodb` services.

## Building and Running

The project includes a root `package.json` with scripts to simplify development.

**Prerequisites:**
*   Node.js & npm installed locally (for running scripts).
*   Docker & Docker Desktop running.

**Commands:**

*   **Install Dependencies:** Installs packages for the root, frontend, and backend simultaneously.
    ```bash
    npm run install-all
    ```
*   **Run via Docker (Recommended):** Builds and starts all containers in the background, then attaches to the logs. Also prints clickable URLs to the console.
    ```bash
    npm run docker:up
    ```
    *Alternatively, you can use the provided Windows batch script: `start.bat`*

*   **Local Development (Without Docker):** Uses `concurrently` to start both the Vite dev server and the Express backend simultaneously. Ensure MongoDB is running locally before using this.
    ```bash
    npm run dev
    ```

**Service URLs (Docker Default):**
*   **Frontend:** `http://localhost:5173`
*   **Backend API:** `http://localhost:5000`

## Development Conventions

*   **Styling:** The frontend uses SCSS modules (`*.module.scss`). Global colors and theme variables are strictly managed in `frontend/src/styles/_variables.scss`. Always use `var(--color-name)` instead of hardcoded hex values in components to maintain theme consistency.
*   **Current Theme:** The project uses a "Classic Dark" theme:
    *   Background: `#121212`
    *   Cards/Navbar: `#1e1e1e` / `#1a1a1a`
    *   Primary Accent: `#ff4757`
    *   Text: `#ffffff`
*   **State Management:** Currently utilizing React `useState` and passing props. Session persistence (JWT/User data) is handled via `localStorage` and synchronized with local component state (e.g., in `Header.jsx`).
*   **SVGs:** Prefer inline SVG React components (like `src/components/Logo/Logo.jsx`) over raster images for icons and logos to allow dynamic styling via `fill="currentColor"`.
*   **Backend Structure:** Routes are modularized in `backend/routes/` and mounted in `backend/index.js` under the `/api/` prefix.
