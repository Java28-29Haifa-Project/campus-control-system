import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    // server: {
    //     proxy: {
    //         "/health": "http://localhost:8080",
    //         "/auth/login": "http://localhost:8080",
    //         "/auth/me": "http://localhost:8080",
    //         "/auth/refresh": "http://localhost:8080",
    //
    //     },
    // },
});

