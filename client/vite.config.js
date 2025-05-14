import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      "/services": {
        target: "https://mini-project-fastapi-g9kp.onrender.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/services/, ""),
      },
    },
  },
});
