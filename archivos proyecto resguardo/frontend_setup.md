# Frontend setup — todos los archivos de configuración

Estructura: estos archivos van en `frontend/` (carpeta separada del backend CI4).

---

## `frontend/package.json`

```json
{
  "name": "inventario-frontend",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "lint": "eslint src --ext ts,tsx",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "react": "^19.1.0",
    "react-dom": "^19.1.0",
    "react-router-dom": "^7.1.0",
    "recharts": "^2.15.0",
    "lucide-react": "^0.469.0",
    "clsx": "^2.1.1"
  },
  "devDependencies": {
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "@vitejs/plugin-react": "^4.3.4",
    "typescript": "^5.7.2",
    "vite": "^6.0.5",
    "tailwindcss": "^4.0.0",
    "@tailwindcss/vite": "^4.0.0",
    "eslint": "^9.17.0",
    "@typescript-eslint/eslint-plugin": "^8.18.0",
    "@typescript-eslint/parser": "^8.18.0",
    "eslint-plugin-react-hooks": "^5.1.0"
  }
}
```

Instalación:
```bash
cd frontend
npm install
```

---

## `frontend/vite.config.ts`

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path';

export default defineConfig({
  plugins: [react(), tailwindcss()],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  server: {
    port: 5173,
    // Proxy para que /api/v1/* en dev vaya al backend CI4 sin tocar CORS.
    // En producción, nginx/apache hace este enrutamiento.
    proxy: {
      '/api': {
        target: 'http://localhost:8080', // CI4 spark serve
        changeOrigin: true,
        secure: false,
      },
    },
  },

  build: {
    outDir: 'dist',
    sourcemap: true,
    // Chunks separados para librerías pesadas → mejor caching del navegador
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'charts':       ['recharts'],
        },
      },
    },
  },
});
```

---

## `frontend/tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "useDefineForClassFields": true,
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "skipLibCheck": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

## `frontend/tsconfig.node.json`

```json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true,
    "strict": true
  },
  "include": ["vite.config.ts"]
}
```

---

## `frontend/index.html`

```html
<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Inventario · Plan Juárez</title>
  </head>
  <body class="bg-slate-50 text-slate-900 antialiased">
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

---

## `frontend/src/index.css`

> Tailwind v4 ya no necesita `tailwind.config.js` ni `postcss.config.js`.
> Toda la config va en CSS con `@theme`.

```css
@import "tailwindcss";

@theme {
  /* Tokens del proyecto — paleta institucional Plan Juárez */
  --color-brand-50:  oklch(0.97 0.02 240);
  --color-brand-100: oklch(0.93 0.05 240);
  --color-brand-500: oklch(0.55 0.18 240);
  --color-brand-600: oklch(0.48 0.18 240);
  --color-brand-700: oklch(0.40 0.16 240);

  --font-sans: 'Inter', system-ui, sans-serif;
  --radius-card: 0.75rem;
}

@layer base {
  body {
    font-family: var(--font-sans);
  }

  /* Scroll-bars discretos en la app */
  ::-webkit-scrollbar       { width: 8px; height: 8px; }
  ::-webkit-scrollbar-thumb { background: rgb(148 163 184 / 0.5); border-radius: 4px; }
}

@layer components {
  .btn-primary {
    @apply inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white
           transition hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500/40
           disabled:cursor-not-allowed disabled:opacity-60;
  }
  .btn-secondary {
    @apply inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm
           font-medium text-slate-700 transition hover:bg-slate-50;
  }
  .input {
    @apply block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm
           focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30;
  }
  .card {
    @apply rounded-xl border border-slate-200 bg-white p-5 shadow-sm;
  }
}
```

---

## `frontend/src/main.tsx`

```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import './index.css';

const rootEl = document.getElementById('root');
if (!rootEl) throw new Error('No se encontró el elemento #root');

createRoot(rootEl).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
```

---

## Estructura final de carpetas

```
frontend/
├── public/
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tsconfig.node.json
└── src/
    ├── main.tsx
    ├── App.tsx
    ├── index.css
    ├── components/
    │   ├── Layout.tsx
    │   ├── DataTable.tsx
    │   └── ProtectedRoute.tsx
    ├── context/
    │   └── AuthContext.tsx
    ├── lib/
    │   └── apiClient.ts
    ├── features/
    │   ├── auth/
    │   │   └── Login.tsx
    │   ├── dashboard/
    │   │   └── Dashboard.tsx
    │   ├── inventario/
    │   │   └── Inventario.tsx
    │   └── bitacora/
    │       └── Bitacora.tsx
    └── types/
        └── api.ts
```

---

## Comandos de desarrollo

```bash
# Terminal 1 — backend
cd backend && php spark serve     # http://localhost:8080

# Terminal 2 — frontend
cd frontend && npm run dev        # http://localhost:5173

# El proxy de Vite redirige /api/* al backend automáticamente.
```

## Build de producción

```bash
cd frontend
npm run build
# Genera frontend/dist/ — copiar contenido a backend/public/
# Y servir con CI4 o nginx (config en README_FRONTEND.md)
```
