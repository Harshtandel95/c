import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import {BackEndUrl} from './src/config'
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      '/api': BackEndUrl ,
    }
  }
})
