import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// O proxy encaminha /api para o servidor: o front chama caminhos relativos e não há problema de CORS
export default defineConfig({
  plugins: [react()],
  server: { proxy: { '/api': process.env.API_URL || 'http://localhost:3001' } },
});
