# Segura Contable Profesional

Proyecto convertido a estructura profesional React + Vite.

## Ejecutar local

```bash
npm install
npm run dev
```

## Deploy en Netlify

Build command:

```bash
npm run build
```

Publish directory:

```bash
dist
```

## Variables de entorno

En Netlify > Site configuration > Environment variables:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu_anon_key
```

Luego usar **Clear cache and deploy site**.

## Estructura

- `src/components`: componentes reutilizables.
- `src/pages`: páginas o módulos.
- `src/lib/supabase.js`: conexión segura vía variables de entorno.
- `src/data/mockData.js`: datos temporales para que el dashboard funcione sin Supabase.
