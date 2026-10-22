import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

/**
 * Build the `404.html` used by GitHub Pages.
 *
 * GitHub Pages has no rewrite rules, so a deep link such as
 * `/login-page` is served as a 404. The page therefore stores the requested
 * URL in `sessionStorage` and bounces to `index.html`, where the app restores
 * the original path (see `src/main.tsx`).
 *
 * @param base The public base path of the deployment, e.g. `/my-repo/`.
 * @returns The HTML source.
 */
function spaFallbackHtml(base: string): string {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>2FA Live Code</title>
    <script>
      (function () {
        var base = ${JSON.stringify(base)};
        var location = window.location;
        try {
          sessionStorage.setItem('spa-redirect', location.pathname + location.search + location.hash);
        } catch (error) {}
        location.replace(base + 'index.html');
      })();
    </script>
    <style>
      body { background: #0B0F19; color: #94a3b8; font-family: system-ui, sans-serif; display: grid; place-items: center; height: 100vh; margin: 0; }
    </style>
  </head>
  <body>
    <p>Redirecting…</p>
  </body>
</html>
`;
}

/**
 * Emit the GitHub Pages SPA fallback into the build output.
 *
 * @param base The public base path of the deployment.
 * @returns The Vite plugin.
 */
function spaFallbackPlugin(base: string): Plugin {
  return {
    name: 'github-pages-spa-fallback',
    apply: 'build',
    generateBundle() {
      this.emitFile({
        type: 'asset',
        fileName: '404.html',
        source: spaFallbackHtml(base),
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  // Base path of the deployment. On GitHub Pages project sites this is
  // `/<repository>/`; on a custom domain or a local build it stays `/`.
  const repository = env.GITHUB_REPOSITORY ?? process.env.GITHUB_REPOSITORY;
  const repositoryName = repository ? repository.split('/')[1] : undefined;
  const base =
    env.VITE_BASE_URL ?? (repositoryName ? `/${repositoryName}/` : '/');

  return {
    base,
    plugins: [react(), spaFallbackPlugin(base)],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: {
      port: 5173,
      strictPort: false,
    },
    preview: {
      host: '127.0.0.1',
      port: 4173,
      strictPort: false,
    },
    build: {
      outDir: 'dist',
      sourcemap: true,
      target: 'es2022',
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: ['./src/test/setup.ts'],
      css: false,
      include: ['src/**/*.{test,spec}.{ts,tsx}'],
      exclude: ['e2e/**', 'node_modules/**'],
      coverage: {
        provider: 'v8',
        reporter: ['text', 'html'],
        include: ['src/lib/**', 'src/hooks/**'],
      },
    },
  };
});
