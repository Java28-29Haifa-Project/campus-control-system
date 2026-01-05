# Frontend

## Overview
React application for Campus Control System.

## User Roles & UI Access
Which screens are available for:
- USER
- SUPPORT
- ENGINEER
- ADMIN

## Tech Stack
- React
- TypeScript
- State management (if any)
- UI library (if any)

## Folder Structure
Explain major folders:
- components
- pages
- services (API)
- hooks
- styles

## API Communication
- API Gateway usage
- Auth via cookies
- Error handling strategy

## Environment Variables
List required frontend env vars.

## Local Development
- Install dependencies
- Run dev server
- Build for production

## Routing
High-level routing structure.

## Future Improvements
Optional section.
# Frontend - Campus Control System

# React + TypeScript + Vite

## How to run locally

1. Install dependencies:
```
cd frontend
npm install 
```
2. Run the dev server:
```
npm run dev
```
3. Open in browser: http://localhost:5173/
## Project structure:
````
frontend/
├─ src/
│  ├─ api/                 # API client (HTTP requests)
│  │  └─ client.ts         # fetch wrapper and endpoints (GET /health)
│  │
│  ├─ pages/               # Route-level page components (mocks)
│  ├─ components/          # Reusable UI components (Navbar, etc.)
│  ├─ layouts/             # Application layouts
│  ├─ utils/               # Types and constants
│  │
│  ├─ main.tsx
│  ├─ App.tsx
│  └─ index.css
│
├─ .env                    # Environment variables (API base URL)
├─ package.json
├─ vite.config.ts
└─ README.md
````
## Routing
```
npm react-router-dom @types/react-router-dom
```
Available routes:
````
| Path        | Page        | Description                         |
|-------------|-------------|-------------------------------------|
| `/`         | Home        | Main page (mock content)            |
| `/ticket`   | Ticket      | Ticket page mock                    |
| `/incident` | Incident    | Incident page mock                  |
| `/profile`  | Profile     | User profile page mock              |
| `/alarm`    | Alarm       | Alarm page mock                     |
| `/health`   | Health      | Backend health status mock page     |
| `*`         | ErrorPage   | 404 | Page not found                |
````
## Page mocks
All routes render mock pages with placeholder content.
Backend integration is not implemented at this stage

## The API base URL is defined in the .env file:
```
VITE_API_BASE_URL=http://localhost:3050
```
## API Client Health Check
You can see the answer of healthcheck on page Health
```
GET /health
```
## Proxy for connection front and back
vite.config.ts
```
export default defineConfig({
    plugins: [react()],
    server: {
        proxy: {
            "/health": "http://localhost:3050",
        },
    },
});
```






### plugins

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
