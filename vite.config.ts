import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'

// Set SINGLE_FILE=1 to bundle everything (JS + CSS) into one self-contained
// dist/index.html — handy for hosting the app anywhere without an assets folder.
const singleFile = process.env.SINGLE_FILE === '1'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), ...(singleFile ? [viteSingleFile()] : [])],
})
