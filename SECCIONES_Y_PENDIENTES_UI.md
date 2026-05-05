# Secciones del proyecto y pendientes de interfaz

Este documento resume **qué áreas cubre hoy la aplicación** (principalmente el frontend en `frontend/`) frente a lo que **ya existe en la API** (`backend/app/Controllers/Api/V1/`) y qué **secciones o pantallas convendría agregar** para alinear la experiencia de usuario con el backend y el plan de producto.

Última revisión: monorepo **Gestor de Resguardos** — React 19 (SPA) + CodeIgniter 4 (API REST bajo `/api/v1`).

---

## 1. Secciones implementadas en la SPA (navegación principal)

| Sección | Ruta(s) | Rol aproximado | Notas |
|---------|---------|----------------|--------|
| **Inicio de sesión** | `/login` | Todos (público con credenciales) | Autenticación con token Bearer (Shield). |
| **Dashboard** | `/dashboard` | Personal interno | KPIs vía `GET /api/v1/reports/dashboard`. |
| **Bienes** | `/bienes`, `/bienes/nuevo`, `/bienes/:id/editar` | Inventario / almacén | CRUD de bienes; incluye acciones de exportación de inventario (Excel/PDF) desde la lista. |
| **Asignaciones** | `/asignaciones`, `/asignaciones/nueva`, `/asignaciones/:id/carta` | Operación patrimonial | Listado, filtros, devolución, enlace a **vista de carta** (HTML/impresión). |
| **Empleados** | `/empleados`, `/empleados/nuevo`, `/empleados/:id/editar` | RH / inventario | CRUD de empleados. |
| **Organizaciones** | `/organizaciones` | Administración | CRUD de organizaciones (catálogo de pertenencia). |
| **Reportes** | `/reportes` | Auditoría / consulta | En la práctica está centrado en **bitácora**: listado paginado y exportación Excel/PDF. |
| **Portal empleado** | `/portal` | Empleado (portal) | Consulta de perfil y asignaciones activas; **no aparece en el menú lateral** — solo por URL directa. |

La barra lateral (`Layout.tsx`) enlaza explícitamente: Dashboard, Bienes, Asignaciones, Empleados, Organizaciones y Reportes.

---

## 2. API disponible sin sección dedicada equivalente (o solo parcial)

Estos recursos **existen en backend** pero **no tienen una “sección” propia** en la interfaz como Organizaciones o Empleados:

| Área API | Endpoints relevantes | Estado en UI |
|----------|----------------------|--------------|
| **Usuarios internos (Shield)** | `GET/POST/PUT/DELETE /api/v1/usuarios` | **Sin pantalla de administración de usuarios** — hoy se gestiona vía CLI (`php spark shield:user`). |
| **Departamentos** | CRUD `/api/v1/departamentos` | **Sin CRUD visual**; los departamentos suelen consumirse como datos relacionados o catálogos desde formularios si aplica. |
| **Reporte de inventario (listado)** | `GET /api/v1/reports/inventario` (+ export) | La **exportación** se usa desde bienes; **no hay una página “Inventario / consulta avanzada”** dedicada si se quisiera el listado paginado con filtros propios del endpoint. |
| **Reporte de asignaciones** | `GET /api/v1/reports/asignaciones` (+ export) | **Sin pantalla específica** aparte del listado genérico de asignaciones. |
| **Eventos / documentos de asignación** | `…/asignaciones/{id}/eventos`, `…/documentos`, acciones `cancelar`, `transferir` | **Transferencia, cancelación, historial de eventos y documentos** pueden estar poco o nada expuestos en UI según la pantalla actual. |
| **Adjuntos y movimientos de bien** | `…/bienes/{id}/adjuntos`, `…/movimientos` | Depende de si los formularios/listados ya muestran **adjuntos** y **historial de movimientos** por bien de forma completa. |
| **Cartas — descarga de documento** | `GET /api/v1/cartas/documento/{id}` | Posible hueco si solo se navega al HTML sin flujo claro de **descarga PDF/registro**. |
| **Portal — detalle y documentos** | `mis-asignaciones/{id}`, `mis-documentos`, `descargar/{id}` | El portal puede **no consumir todos** estos endpoints en la primera versión de la vista. |
| **Salud del servicio** | `GET /api/v1/health` | Típicamente **no** lleva UI; útil para operaciones/monitoring. |

Los **catálogos de solo lectura** (`/api/v1/catalogs/*`: categorías, estados de bien, ubicaciones, proveedores, etc.) están pensados para combos y datos de referencia; **no hay una “Sección administración de catálogos”** si en el futuro se editan desde aplicación en lugar de seeders/migraciones.

---

## 3. Secciones sugeridas por agregar (priorización orientativa)

| Sección propuesta | Objetivo | Relación con el proyecto |
|-------------------|----------|---------------------------|
| **Usuarios y acceso** | Alta/edición/baja de usuarios internos, reseteo de tokens, asignación a grupos Shield | Cubre el hueco más evidente respecto al controlador `Usuarios.php` y a los actores “Administrador” del plan de producto. |
| **Departamentos** | CRUD en línea con organización | Ya existe API completa; mejora mantenimiento sin tocar base de datos directamente. |
| **Roles y permisos (Shield)** | Gestión de grupos y políticas desde UI (si el producto lo permite) | Hoy suele ser configuración por código/CLI; opcional según nivel de madurez. |
| **Mi perfil / cuenta** | Cambiar contraseña o rotar token desde la app | Mejora UX frente a gestión solo por administrador o CLI. |
| **Portal visible en menú** | Enlace condicional al portal para usuarios con rol empleado | Evita depender de memorizar `/portal`. |
| **Asignaciones — edición y operaciones** | Ruta `…/asignaciones/:id/editar`, transferir, cancelar, timeline de eventos | Alineación con endpoints que ya existen. |
| **Bien — ficha detalle** | Movimientos, adjuntos en un solo lugar | Claridad operativa para inventario. |
| **Reportes ampliados** | Pestañas o subrutas: Bitácora / Inventario consultivo / Asignaciones agregadas | Centraliza exports y filtros ya disponibles en API. |
| **Configuración del sistema** | Folios, textos legales de cartas (si se editan desde UI), parámetros globales | Mencionado como evolutivo en documentación de negocio; depende de modelo de datos de configuración. |
| **Ayuda / manual corto** | Enlaces a políticas de préstamo y uso del sistema | Opcional; mejora adopción. |

---

## 4. Resumen rápido

- **Cubiertas como secciones de producto claras**: login, dashboard, bienes, asignaciones (creación + listado + carta), empleados, organizaciones, reportes (bitácora), portal por ruta.
- **Huecos típicos a cerrar primero**: **usuarios internos en UI**, **departamentos**, **exponer mejor transferencias/cancelaciones/historial de asignaciones**, **integración completa del portal en navegación y descargas**, y **reportes de inventario/asignaciones** si se quieren pantallas dedicadas además de exportaciones desde bienes.

Para detalle técnico de rutas API y comandos de arranque, ver `README.md` y `PLAN_DESARROLLO_GESTOR_RESGUARDOS.md`.
