# Gestor de Resguardos y Préstamos Patrimoniales

Monorepo: `backend/` (CodeIgniter 4 — API REST) + `frontend/` (React 19 SPA).

---

## Requisitos

| Herramienta | Versión mínima |
|-------------|---------------|
| PHP         | 8.1+          |
| Composer    | 2.x           |
| MySQL / MariaDB | 5.7+ / 10.4+ |
| Node.js     | 18+           |
| npm         | 9+            |

---

## 1. Configurar el backend

```bash
cd backend

# Copiar y editar variables de entorno
cp env .env
# Editar .env: ajustar DATABASE_*, app.baseURL, CORS_ALLOWED_ORIGINS

# Instalar dependencias (ya instaladas en desarrollo)
composer install

# Ejecutar migraciones de Shield + migraciones del proyecto
php spark migrate --all

# Sembrar catálogos iniciales (estados de bien, categorías, configuración)
php spark db:seed CatalogosSeeder

# Crear el primer usuario administrador
php spark shield:user create

# Iniciar servidor de desarrollo
php spark serve --port=8080
```

### Variables de entorno clave (`.env`)

```ini
CI_ENVIRONMENT = development
app.baseURL    = http://localhost:8080

database.default.hostname = localhost
database.default.database = gestor_resguardos
database.default.username = root
database.default.password = tu_password
database.default.DBDriver = MySQLi

CORS_ALLOWED_ORIGINS = http://localhost:5173
```

---

## 2. Configurar el frontend

```bash
cd frontend

npm install          # instalar dependencias
npm run dev          # servidor Vite en http://localhost:5173
```

Para producción:
```bash
npm run build        # genera dist/
# Copiar dist/ al servidor o servir con nginx
```

---

## 3. Estructura del proyecto

```
gestor-resguardos/
├── backend/                        # CodeIgniter 4.7 — API REST
│   ├── app/
│   │   ├── Controllers/Api/V1/
│   │   │   ├── Auth.php            # Login / logout / me
│   │   │   ├── Reports.php         # Dashboard / bitácora / exports
│   │   │   ├── Bienes.php          # CRUD bienes + adjuntos
│   │   │   ├── Empleados.php       # CRUD empleados
│   │   │   ├── Asignaciones.php    # Resguardos / préstamos + devolver / transferir
│   │   │   ├── Cartas.php          # HTML + registro de documentos
│   │   │   ├── Organizaciones.php  # CRUD organizaciones
│   │   │   ├── Departamentos.php   # CRUD departamentos
│   │   │   ├── Catalogs.php        # Endpoints de catálogos read-only
│   │   │   ├── Portal.php          # Portal empleado (anti-IDOR)
│   │   │   └── Usuarios.php        # Gestión de usuarios Shield
│   │   ├── Database/
│   │   │   ├── Migrations/         # 17 migraciones ordenadas
│   │   │   └── Seeds/
│   │   │       └── CatalogosSeeder.php
│   │   ├── Filters/Cors.php
│   │   ├── Models/                 # BienModel, EmpleadoModel, AsignacionModel…
│   │   └── Services/
│   │       ├── FolioService.php    # Folios únicos transaccionales
│   │       ├── CartaService.php    # Plantillas HTML resguardo / préstamo
│   │       ├── AuditoriaService.php
│   │       └── ExportService.php   # CSV/HTML exportable
│   └── .env                        # Configuración local (NO commitear)
│
├── frontend/                       # React 19 + Vite + Tailwind 4
│   └── src/
│       ├── lib/apiClient.ts        # Cliente HTTP + token Bearer
│       ├── context/AuthContext.tsx
│       ├── components/
│       │   ├── Layout.tsx          # Sidebar + topbar
│       │   └── ProtectedRoute.tsx
│       └── features/
│           ├── auth/Login.tsx
│           ├── dashboard/Dashboard.tsx
│           ├── bienes/{Bienes, BienForm}.tsx
│           ├── empleados/{Empleados, EmpleadoForm}.tsx
│           ├── asignaciones/{Asignaciones, AsignacionForm}.tsx
│           ├── cartas/CartaViewer.tsx
│           ├── organizaciones/Organizaciones.tsx
│           ├── reportes/Reportes.tsx
│           └── portal/PortalEmpleado.tsx
│
├── archivos proyecto resguardo/    # Prototipos originales (referencia)
└── PLAN_DESARROLLO_GESTOR_RESGUARDOS.md
```

---

## 4. API REST — Resumen de endpoints

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/v1/auth/login` | Login (pública) |
| GET | `/api/v1/auth/me` | Usuario autenticado |
| POST | `/api/v1/auth/logout` | Cerrar sesión |
| GET | `/api/v1/reports/dashboard` | KPIs |
| GET | `/api/v1/reports/bitacora` | Bitácora patrimonial |
| GET/POST/PUT/DELETE | `/api/v1/bienes` | CRUD bienes |
| GET/POST/PUT/DELETE | `/api/v1/empleados` | CRUD empleados |
| GET/POST/PUT/DELETE | `/api/v1/asignaciones` | Resguardos y préstamos |
| POST | `/api/v1/asignaciones/{id}/devolver` | Registrar devolución |
| POST | `/api/v1/asignaciones/{id}/transferir` | Transferir a otro empleado |
| GET | `/api/v1/cartas/{id}/html` | HTML de carta responsiva |
| POST | `/api/v1/cartas/{id}/generar` | Generar y registrar documento |
| GET | `/api/v1/portal/mis-asignaciones` | Portal empleado (anti-IDOR) |

---

## 5. Seguridad

- **Autenticación**: Shield Access Tokens (`Authorization: Bearer <token>`)
- **Portal empleado**: `empleado_id` resuelto desde el token — nunca desde la URL (prevención de IDOR)
- **Auditoría**: tabla `auditoria_cambios` registra insert/update/delete en tablas sensibles
- **Folios únicos**: transacción con `SELECT ... FOR UPDATE` para concurrencia
- **CORS**: whitelist configurable vía `CORS_ALLOWED_ORIGINS` en `.env`

---

## 6. Nota legal

El texto de las cartas responsivas es una **plantilla orientativa**. Debe ser revisado y aprobado por el área jurídico-administrativa antes de su uso oficial.
