
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // The third parameter '' allows loading all variables regardless of prefix.
  // Fix: Access cwd() through type casting to any to resolve 'Property cwd does not exist on type Process' error.
  const env = loadEnv(mode, (process as any).cwd(), '');
  
  // Use casting for process.env as well to ensure consistent property access if Process type is restricted.
  const apiKey = env.API_KEY || (process.env as any).API_KEY || "";

  return {
    plugins: [react()],
    define: {
      // This explicitly replaces "process.env.API_KEY" in the code with the actual key string
      'process.env.API_KEY': JSON.stringify(apiKey),
      // Provide a fallback for other process.env accesses
      'process.env': {
        NODE_ENV: JSON.stringify(mode),
        ...env
      }
    },
    build: {
      chunkSizeWarningLimit: 2000,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('jspdf')) return 'vendor-jspdf';
              if (id.includes('@google/genai')) return 'vendor-ai';
              return 'vendor';
            }
          },
        },
      },
    },
  };
});
