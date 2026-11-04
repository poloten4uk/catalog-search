import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'development-csp',
      transformIndexHtml(html, context) {
        // React Fast Refresh injects an inline preamble in development only.
        // Production keeps script-src 'self' without unsafe-inline.
        return context.server
          ? html
              .replace("script-src 'self';", "script-src 'self' 'unsafe-inline';")
              .replace(
                "connect-src 'self' https://api.favorit-parts.ru;",
                "connect-src 'self' https://api.favorit-parts.ru ws://127.0.0.1:* ws://localhost:*;",
              )
          : html;
      },
    },
  ],
  server: { port: 5173, strictPort: true },
});
