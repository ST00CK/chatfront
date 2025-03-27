import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    'import.meta.env.VITE_STOOCK_API_URL': 'window.env.VITE_STOOCK_API_URL',
    'import.meta.env.VITE_STOOCK_KAKAO_API_KEY': 'window.env.VITE_STOOCK_KAKAO_API_KEY'
  },
  server: {
    port: 3000,
  },
})


