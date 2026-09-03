import { defineConfig } from 'vite';

// `base: './'` makes all built asset paths relative, so the site works
// correctly whether it's hosted at the root of a domain (a
// `<username>.github.io` repo) or in a subpath (`<username>.github.io/<repo>`,
// the default for any other repo name on GitHub Pages).
export default defineConfig({
  base: './',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
  },
});
