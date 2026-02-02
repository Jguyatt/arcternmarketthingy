import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    // Load env vars from .env files
    const env = loadEnv(mode, process.cwd(), '');
    // Vercel exposes env vars as process.env during build - check there first
    const geminiApiKey = process.env.GEMINI_API_KEY || env.GEMINI_API_KEY || '';
    
    // #region agent log - build time only
    console.log('[VITE BUILD] Mode:', mode);
    console.log('[VITE BUILD] process.env.GEMINI_API_KEY exists:', !!process.env.GEMINI_API_KEY);
    console.log('[VITE BUILD] process.env.GEMINI_API_KEY length:', process.env.GEMINI_API_KEY?.length || 0);
    console.log('[VITE BUILD] env.GEMINI_API_KEY exists:', !!env.GEMINI_API_KEY);
    console.log('[VITE BUILD] Final geminiApiKey length:', geminiApiKey.length);
    // #endregion
    
    return {
      server: {
        port: 4000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(geminiApiKey),
        'process.env.GEMINI_API_KEY': JSON.stringify(geminiApiKey)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
