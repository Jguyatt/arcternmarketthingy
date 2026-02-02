import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    // Load env vars from .env files
    const env = loadEnv(mode, process.cwd(), '');
    // Vercel exposes env vars as process.env during build - check there first
    // Also check all possible variations including common typos
    const geminiApiKey = 
      process.env.GEMINI_API_KEY || 
      process.env.gemeni_api_key ||  // Handle typo version
      process.env.GEMENI_API_KEY ||
      process.env.VITE_GEMINI_API_KEY ||
      env.GEMINI_API_KEY || 
      env.gemeni_api_key ||
      env.VITE_GEMINI_API_KEY ||
      '';
    
    // #region agent log - build time only
    console.log('[VITE BUILD] Mode:', mode);
    console.log('[VITE BUILD] process.env keys:', Object.keys(process.env).filter(k => k.includes('GEMINI') || k.includes('API')));
    console.log('[VITE BUILD] process.env.GEMINI_API_KEY exists:', !!process.env.GEMINI_API_KEY);
    console.log('[VITE BUILD] process.env.GEMINI_API_KEY length:', process.env.GEMINI_API_KEY?.length || 0);
    console.log('[VITE BUILD] process.env.VITE_GEMINI_API_KEY exists:', !!process.env.VITE_GEMINI_API_KEY);
    console.log('[VITE BUILD] env.GEMINI_API_KEY exists:', !!env.GEMINI_API_KEY);
    console.log('[VITE BUILD] Final geminiApiKey length:', geminiApiKey.length);
    if (geminiApiKey.length > 0) {
      console.log('[VITE BUILD] API key first 5 chars:', geminiApiKey.substring(0, 5));
    } else {
      console.error('[VITE BUILD] WARNING: No API key found! Check Vercel environment variables.');
    }
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
