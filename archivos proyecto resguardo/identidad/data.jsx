// Realistic Mexican-Spanish mock data for Gestor de Resguardos prototype.
// All data fictional. RFCs, folios, names invented for demo purposes.

const ORGS = [
  { id: 1, nombre: 'Secretaría de Innovación', siglas: 'SECINN', color: '#4ade80', empleados: 142, bienes: 384 },
  { id: 2, nombre: 'Dirección General de Tecnologías', siglas: 'DGTI', color: '#6ec1ff', empleados: 86, bienes: 612 },
  { id: 3, nombre: 'Coordinación Administrativa', siglas: 'COADM', color: '#f5b441', empleados: 64, bienes: 218 },
  { id: 4, nombre: 'Unidad de Comunicación Social', siglas: 'UCS', color: '#c084fc', empleados: 28, bienes: 96 },
  { id: 5, nombre: 'Auditoría Interna', siglas: 'AUDI', color: '#ef6f6f', empleados: 18, bienes: 42 },
];

const DEPTOS = [
  { id: 1, org: 1, nombre: 'Innovación Pública', responsable: 'María Elena Torres', empleados: 24 },
  { id: 2, org: 1, nombre: 'Gobierno Digital', responsable: 'Carlos Iván Reséndiz', empleados: 41 },
  { id: 3, org: 1, nombre: 'Datos Abiertos', responsable: 'Ximena Galván', empleados: 19 },
  { id: 4, org: 2, nombre: 'Infraestructura TI', responsable: 'Roberto Mendoza Ríos', empleados: 32 },
  { id: 5, org: 2, nombre: 'Desarrollo de Software', responsable: 'Patricia Solís Hernández', empleados: 28 },
  { id: 6, org: 2, nombre: 'Soporte y Mesa de Ayuda', responsable: 'Jorge Luis Vázquez', empleados: 16 },
  { id: 7, org: 3, nombre: 'Recursos Humanos', responsable: 'Ana Beatriz Cuevas', empleados: 22 },
  { id: 8, org: 3, nombre: 'Contabilidad', responsable: 'Manuel Aguirre Páez', empleados: 18 },
  { id: 9, org: 4, nombre: 'Prensa', responsable: 'Daniela Robles Cortés', empleados: 12 },
  { id: 10, org: 5, nombre: 'Auditoría Operativa', responsable: 'Fernando Chávez Mejía', empleados: 18 },
];

const EMPLEADOS = [
  { id: 'EMP-00428', nombre: 'María Elena', apellidos: 'Torres Aguilar', rfc: 'TOAM850412Q9A', curp: 'TOAM850412MDFRGL08', puesto: 'Directora de Innovación', org: 1, dep: 1, correo: 'maria.torres@gob.mx', telefono: '55 4128 9302', activos: 6, ingreso: '2018-03-12' },
  { id: 'EMP-00516', nombre: 'Carlos Iván', apellidos: 'Reséndiz Pacheco', rfc: 'REPC820815H7A', curp: 'REPC820815HDFSCR04', puesto: 'Subdirector de Gobierno Digital', org: 1, dep: 2, correo: 'carlos.resendiz@gob.mx', telefono: '55 6028 4419', activos: 4, ingreso: '2019-07-22' },
  { id: 'EMP-00721', nombre: 'Ximena', apellidos: 'Galván Ortiz', rfc: 'GAOX910205F2N', curp: 'GAOX910205MDFLRX02', puesto: 'Coordinadora de Datos Abiertos', org: 1, dep: 3, correo: 'ximena.galvan@gob.mx', telefono: '55 8743 1209', activos: 3, ingreso: '2020-11-04' },
  { id: 'EMP-00839', nombre: 'Roberto', apellidos: 'Mendoza Ríos', rfc: 'MERR780930P1B', curp: 'MERR780930HDFNRB01', puesto: 'Jefe de Infraestructura TI', org: 2, dep: 4, correo: 'roberto.mendoza@gob.mx', telefono: '55 5102 9881', activos: 8, ingreso: '2015-01-15' },
  { id: 'EMP-00942', nombre: 'Patricia', apellidos: 'Solís Hernández', rfc: 'SOHP890118D4K', curp: 'SOHP890118MDFLRT05', puesto: 'Líder de Desarrollo', org: 2, dep: 5, correo: 'patricia.solis@gob.mx', telefono: '55 9821 0044', activos: 5, ingreso: '2021-02-08' },
  { id: 'EMP-01057', nombre: 'Jorge Luis', apellidos: 'Vázquez Camacho', rfc: 'VACJ870606T2Z', curp: 'VACJ870606HDFZMR03', puesto: 'Coordinador de Soporte', org: 2, dep: 6, correo: 'jorge.vazquez@gob.mx', telefono: '55 4408 7716', activos: 2, ingreso: '2017-09-19' },
  { id: 'EMP-01188', nombre: 'Ana Beatriz', apellidos: 'Cuevas Linares', rfc: 'CULA830720R8L', curp: 'CULA830720MDFVNN09', puesto: 'Coordinadora de Recursos Humanos', org: 3, dep: 7, correo: 'ana.cuevas@gob.mx', telefono: '55 7129 0058', activos: 3, ingreso: '2016-05-30' },
  { id: 'EMP-01294', nombre: 'Manuel', apellidos: 'Aguirre Páez', rfc: 'AUPM760405S1J', curp: 'AUPM760405HDFGZN02', puesto: 'Contador General', org: 3, dep: 8, correo: 'manuel.aguirre@gob.mx', telefono: '55 6620 8473', activos: 2, ingreso: '2014-08-11' },
  { id: 'EMP-01355', nombre: 'Daniela', apellidos: 'Robles Cortés', rfc: 'ROCD920510M8N', curp: 'ROCD920510MDFBRN01', puesto: 'Encargada de Prensa', org: 4, dep: 9, correo: 'daniela.robles@gob.mx', telefono: '55 8801 4422', activos: 4, ingreso: '2022-01-17' },
  { id: 'EMP-01421', nombre: 'Fernando', apellidos: 'Chávez Mejía', rfc: 'CAMF810329W4P', curp: 'CAMF810329HDFHJR06', puesto: 'Auditor Senior', org: 5, dep: 10, correo: 'fernando.chavez@gob.mx', telefono: '55 5519 6688', activos: 1, ingreso: '2018-12-03' },
  { id: 'EMP-01508', nombre: 'Lucía', apellidos: 'Navarro Aldana', rfc: 'NAAL940825K5T', curp: 'NAAL940825MDFVLC04', puesto: 'Analista de Software', org: 2, dep: 5, correo: 'lucia.navarro@gob.mx', telefono: '55 7314 0091', activos: 2, ingreso: '2023-03-21' },
  { id: 'EMP-01612', nombre: 'Adrián', apellidos: 'Hinojosa Treviño', rfc: 'HITA880704V8R', curp: 'HITA880704HDFNRD05', puesto: 'Administrador de Redes', org: 2, dep: 4, correo: 'adrian.hinojosa@gob.mx', telefono: '55 8927 5510', activos: 3, ingreso: '2019-10-08' },
];

const CATEGORIAS = [
  { id: 1, nombre: 'Cómputo', count: 412 },
  { id: 2, nombre: 'Mobiliario', count: 286 },
  { id: 3, nombre: 'Telecomunicaciones', count: 134 },
  { id: 4, nombre: 'Vehículos', count: 28 },
  { id: 5, nombre: 'Audiovisual', count: 96 },
  { id: 6, nombre: 'Herramientas', count: 51 },
];

const UBICACIONES = [
  { id: 1, nombre: 'Edificio A — Piso 3', codigo: 'A-3' },
  { id: 2, nombre: 'Edificio A — Piso 4', codigo: 'A-4' },
  { id: 3, nombre: 'Edificio B — Bodega', codigo: 'B-BOD' },
  { id: 4, nombre: 'Edificio B — Sala TI', codigo: 'B-TI' },
  { id: 5, nombre: 'Edificio C — Auditorio', codigo: 'C-AUD' },
  { id: 6, nombre: 'Anexo Norte', codigo: 'AN' },
];

const BIENES = [
  { id: 'BN-2024-00481', desc: 'Laptop Dell Latitude 5450', categoria: 1, marca: 'Dell', modelo: 'Latitude 5450', serie: 'CN0WX48Z2024A', costo: 32480, fecha: '2024-02-14', estado: 'Asignado', ubicacion: 4, asignado: 'EMP-00942', condicion: 'Bueno' },
  { id: 'BN-2024-00482', desc: 'Laptop Dell Latitude 5450', categoria: 1, marca: 'Dell', modelo: 'Latitude 5450', serie: 'CN0WX48Z2024B', costo: 32480, fecha: '2024-02-14', estado: 'Asignado', ubicacion: 4, asignado: 'EMP-01508', condicion: 'Bueno' },
  { id: 'BN-2023-00214', desc: 'Monitor Dell P2422H 24"', categoria: 1, marca: 'Dell', modelo: 'P2422H', serie: 'CN0M24P2023K', costo: 5680, fecha: '2023-08-09', estado: 'Asignado', ubicacion: 1, asignado: 'EMP-00428', condicion: 'Bueno' },
  { id: 'BN-2024-00903', desc: 'Silla ergonómica Steelcase Series 1', categoria: 2, marca: 'Steelcase', modelo: 'Series 1', serie: 'SC1-2024-9302', costo: 12950, fecha: '2024-04-22', estado: 'Disponible', ubicacion: 3, asignado: null, condicion: 'Nuevo' },
  { id: 'BN-2022-00118', desc: 'Proyector Epson PowerLite 1288', categoria: 5, marca: 'Epson', modelo: 'PowerLite 1288', serie: 'EPL2022-0118', costo: 18420, fecha: '2022-11-30', estado: 'Asignado', ubicacion: 5, asignado: 'EMP-01355', condicion: 'Bueno' },
  { id: 'BN-2024-00608', desc: 'Switch Cisco Catalyst 9300 24p', categoria: 3, marca: 'Cisco', modelo: 'C9300-24P', serie: 'FOC2438Y0X1', costo: 89320, fecha: '2024-03-18', estado: 'Asignado', ubicacion: 4, asignado: 'EMP-00839', condicion: 'Bueno' },
  { id: 'BN-2025-00027', desc: 'iPad Pro 11" M4 256GB', categoria: 1, marca: 'Apple', modelo: 'iPad Pro M4', serie: 'F2LX9KM12025', costo: 28990, fecha: '2025-01-08', estado: 'Asignado', ubicacion: 2, asignado: 'EMP-00516', condicion: 'Nuevo' },
  { id: 'BN-2023-00766', desc: 'Impresora HP LaserJet M404dn', categoria: 1, marca: 'HP', modelo: 'M404dn', serie: 'CNB1234567', costo: 7280, fecha: '2023-05-12', estado: 'Mantenimiento', ubicacion: 3, asignado: null, condicion: 'Regular' },
  { id: 'BN-2024-01102', desc: 'Camioneta Nissan NP300 2024', categoria: 4, marca: 'Nissan', modelo: 'NP300', serie: '3N6CD33A8RK824519', costo: 425000, fecha: '2024-06-04', estado: 'Asignado', ubicacion: 6, asignado: 'EMP-01057', condicion: 'Bueno' },
  { id: 'BN-2024-00752', desc: 'Cámara Sony Alpha 7 IV', categoria: 5, marca: 'Sony', modelo: 'ILCE-7M4', serie: 'SNA7IV24752', costo: 58900, fecha: '2024-09-15', estado: 'Asignado', ubicacion: 1, asignado: 'EMP-01355', condicion: 'Bueno' },
  { id: 'BN-2023-00091', desc: 'Escritorio ejecutivo de madera', categoria: 2, marca: 'Herman Miller', modelo: 'Eames', serie: 'HM-EX-091', costo: 34200, fecha: '2023-02-01', estado: 'Asignado', ubicacion: 1, asignado: 'EMP-00428', condicion: 'Bueno' },
  { id: 'BN-2024-00819', desc: 'Laptop MacBook Pro 14" M3', categoria: 1, marca: 'Apple', modelo: 'MacBook Pro 14 M3', serie: 'C02ZK8KQMLVH', costo: 48990, fecha: '2024-07-30', estado: 'Asignado', ubicacion: 1, asignado: 'EMP-00721', condicion: 'Nuevo' },
  { id: 'BN-2025-00104', desc: 'Monitor LG UltraFine 27"', categoria: 1, marca: 'LG', modelo: '27UN880', serie: 'LG27UN2025104', costo: 14820, fecha: '2025-02-20', estado: 'Disponible', ubicacion: 3, asignado: null, condicion: 'Nuevo' },
  { id: 'BN-2024-00455', desc: 'Teléfono IP Cisco 8851', categoria: 3, marca: 'Cisco', modelo: 'CP-8851-K9', serie: 'FCH2402K1AA', costo: 6890, fecha: '2024-02-08', estado: 'Asignado', ubicacion: 1, asignado: 'EMP-01188', condicion: 'Bueno' },
  { id: 'BN-2022-00038', desc: 'Servidor Dell PowerEdge R650', categoria: 1, marca: 'Dell', modelo: 'PowerEdge R650', serie: 'DPER650-038', costo: 248000, fecha: '2022-04-18', estado: 'Asignado', ubicacion: 4, asignado: 'EMP-00839', condicion: 'Bueno' },
  { id: 'BN-2025-00198', desc: 'Lámpara de escritorio LED', categoria: 2, marca: 'BenQ', modelo: 'ScreenBar', serie: 'BQ-SB-198', costo: 2340, fecha: '2025-03-04', estado: 'Disponible', ubicacion: 3, asignado: null, condicion: 'Nuevo' },
  { id: 'BN-2024-00622', desc: 'Tablet Samsung Galaxy Tab S9', categoria: 1, marca: 'Samsung', modelo: 'SM-X710', serie: 'R52T80CMNPK', costo: 18420, fecha: '2024-08-11', estado: 'Asignado', ubicacion: 2, asignado: 'EMP-01612', condicion: 'Bueno' },
  { id: 'BN-2023-00581', desc: 'Audífonos Bose QC45', categoria: 1, marca: 'Bose', modelo: 'QC45', serie: 'BQC45-23-581', costo: 6580, fecha: '2023-10-22', estado: 'Asignado', ubicacion: 1, asignado: 'EMP-00942', condicion: 'Bueno' },
];

const ASIGNACIONES = [
  { id: 'ASG-2024-00482', folio: 'RG-2024-0482', empleado: 'EMP-00942', bienes: ['BN-2024-00482', 'BN-2023-00214'], fechaInicio: '2024-02-15', fechaFin: null, estado: 'Activa', tipo: 'Resguardo', firmada: true },
  { id: 'ASG-2024-00904', folio: 'RG-2024-0904', empleado: 'EMP-00839', bienes: ['BN-2024-00608', 'BN-2022-00038'], fechaInicio: '2024-03-19', fechaFin: null, estado: 'Activa', tipo: 'Resguardo', firmada: true },
  { id: 'ASG-2024-01055', folio: 'RG-2024-1055', empleado: 'EMP-00516', bienes: ['BN-2025-00027'], fechaInicio: '2025-01-10', fechaFin: null, estado: 'Activa', tipo: 'Resguardo', firmada: true },
  { id: 'ASG-2024-00118', folio: 'RG-2024-0118', empleado: 'EMP-01355', bienes: ['BN-2022-00118', 'BN-2024-00752'], fechaInicio: '2024-09-16', fechaFin: null, estado: 'Activa', tipo: 'Préstamo', firmada: true },
  { id: 'ASG-2024-01102', folio: 'RG-2024-1102', empleado: 'EMP-01057', bienes: ['BN-2024-01102'], fechaInicio: '2024-06-05', fechaFin: null, estado: 'Activa', tipo: 'Resguardo', firmada: true },
  { id: 'ASG-2025-00027', folio: 'RG-2025-0027', empleado: 'EMP-00428', bienes: ['BN-2023-00214', 'BN-2023-00091'], fechaInicio: '2023-02-02', fechaFin: null, estado: 'Activa', tipo: 'Resguardo', firmada: true },
  { id: 'ASG-2024-00819', folio: 'RG-2024-0819', empleado: 'EMP-00721', bienes: ['BN-2024-00819'], fechaInicio: '2024-08-01', fechaFin: null, estado: 'Activa', tipo: 'Resguardo', firmada: true },
  { id: 'ASG-2024-00455', folio: 'RG-2024-0455', empleado: 'EMP-01188', bienes: ['BN-2024-00455'], fechaInicio: '2024-02-09', fechaFin: null, estado: 'Activa', tipo: 'Resguardo', firmada: true },
  { id: 'ASG-2024-00622', folio: 'RG-2024-0622', empleado: 'EMP-01612', bienes: ['BN-2024-00622'], fechaInicio: '2024-08-12', fechaFin: null, estado: 'Activa', tipo: 'Préstamo', firmada: false },
  { id: 'ASG-2023-00908', folio: 'RG-2023-0908', empleado: 'EMP-01294', bienes: ['BN-2023-00766'], fechaInicio: '2023-05-13', fechaFin: '2025-04-22', estado: 'Devuelta', tipo: 'Resguardo', firmada: true },
  { id: 'ASG-2024-00713', folio: 'RG-2024-0713', empleado: 'EMP-01421', bienes: [], fechaInicio: '2024-11-03', fechaFin: '2025-02-12', estado: 'Cancelada', tipo: 'Resguardo', firmada: true },
];

const EVENTOS = [
  { fecha: '2026-05-04 11:32', tipo: 'creacion', titulo: 'Asignación creada', desc: 'Resguardo RG-2024-0482 generado desde el módulo de Asignaciones.', actor: 'Carlos Reséndiz', sev: 'accent' },
  { fecha: '2026-05-04 11:33', tipo: 'documento', titulo: 'Carta de resguardo emitida', desc: 'Documento PDF generado y enviado a firma electrónica.', actor: 'Sistema', sev: '' },
  { fecha: '2026-05-04 14:08', tipo: 'firma', titulo: 'Firma del empleado', desc: 'Patricia Solís firmó digitalmente la carta-responsiva.', actor: 'Patricia Solís', sev: 'accent' },
  { fecha: '2026-05-04 14:09', tipo: 'estado', titulo: 'Estado: Activa', desc: 'Resguardo activado. Bienes registrados como asignados.', actor: 'Sistema', sev: '' },
  { fecha: '2026-05-04 14:11', tipo: 'movimiento', titulo: 'Bien movido a Edificio B — Sala TI', desc: 'Cambio de ubicación de BN-2024-00482.', actor: 'Roberto Mendoza', sev: 'warn' },
];

const BITACORA = [
  { id: 18429, fecha: '2026-05-05 09:42:11', usuario: 'mtorres', rol: 'Administrador', accion: 'asignacion.crear', recurso: 'ASG-2026-00214', ip: '10.0.4.18', resultado: 'OK' },
  { id: 18428, fecha: '2026-05-05 09:38:55', usuario: 'mtorres', rol: 'Administrador', accion: 'bien.actualizar', recurso: 'BN-2024-00482', ip: '10.0.4.18', resultado: 'OK' },
  { id: 18427, fecha: '2026-05-05 09:31:02', usuario: 'cresendiz', rol: 'Operador', accion: 'asignacion.transferir', recurso: 'ASG-2024-00622', ip: '10.0.4.22', resultado: 'OK' },
  { id: 18426, fecha: '2026-05-05 09:18:47', usuario: 'jvazquez', rol: 'Soporte', accion: 'bien.adjuntar', recurso: 'BN-2023-00766', ip: '10.0.4.41', resultado: 'OK' },
  { id: 18425, fecha: '2026-05-05 08:56:33', usuario: 'rmendoza', rol: 'Operador', accion: 'bien.crear', recurso: 'BN-2025-00198', ip: '10.0.4.31', resultado: 'OK' },
  { id: 18424, fecha: '2026-05-05 08:42:08', usuario: 'sistema', rol: 'Sistema', accion: 'reporte.exportar', recurso: 'inventario.xlsx', ip: '127.0.0.1', resultado: 'OK' },
  { id: 18423, fecha: '2026-05-05 08:21:14', usuario: 'fchavez', rol: 'Auditor', accion: 'login.exitoso', recurso: '—', ip: '10.0.4.55', resultado: 'OK' },
  { id: 18422, fecha: '2026-05-05 08:04:29', usuario: 'desconocido', rol: '—', accion: 'login.fallido', recurso: '—', ip: '189.205.74.3', resultado: 'FALLO' },
  { id: 18421, fecha: '2026-05-04 18:55:01', usuario: 'psolis', rol: 'Operador', accion: 'asignacion.firmar', recurso: 'ASG-2024-00482', ip: '10.0.4.27', resultado: 'OK' },
  { id: 18420, fecha: '2026-05-04 17:32:48', usuario: 'aaguirre', rol: 'Contabilidad', accion: 'reporte.descargar', recurso: 'bitacora.pdf', ip: '10.0.4.19', resultado: 'OK' },
  { id: 18419, fecha: '2026-05-04 17:14:22', usuario: 'mtorres', rol: 'Administrador', accion: 'usuario.crear', recurso: 'lnavarro', ip: '10.0.4.18', resultado: 'OK' },
  { id: 18418, fecha: '2026-05-04 16:48:09', usuario: 'mtorres', rol: 'Administrador', accion: 'usuario.actualizar', recurso: 'jvazquez', ip: '10.0.4.18', resultado: 'OK' },
];

const USUARIOS = [
  { id: 1, username: 'mtorres', nombre: 'María Elena Torres', correo: 'maria.torres@gob.mx', grupos: ['admin'], estado: 'Activo', ultimoIngreso: '2026-05-05 09:42', creado: '2018-03-12', empleado: 'EMP-00428' },
  { id: 2, username: 'cresendiz', nombre: 'Carlos Iván Reséndiz', correo: 'carlos.resendiz@gob.mx', grupos: ['operador'], estado: 'Activo', ultimoIngreso: '2026-05-05 09:31', creado: '2019-07-22', empleado: 'EMP-00516' },
  { id: 3, username: 'rmendoza', nombre: 'Roberto Mendoza', correo: 'roberto.mendoza@gob.mx', grupos: ['operador'], estado: 'Activo', ultimoIngreso: '2026-05-05 08:56', creado: '2015-01-15', empleado: 'EMP-00839' },
  { id: 4, username: 'psolis', nombre: 'Patricia Solís', correo: 'patricia.solis@gob.mx', grupos: ['operador'], estado: 'Activo', ultimoIngreso: '2026-05-04 18:55', creado: '2021-02-08', empleado: 'EMP-00942' },
  { id: 5, username: 'jvazquez', nombre: 'Jorge Luis Vázquez', correo: 'jorge.vazquez@gob.mx', grupos: ['soporte'], estado: 'Activo', ultimoIngreso: '2026-05-05 09:18', creado: '2017-09-19', empleado: 'EMP-01057' },
  { id: 6, username: 'aaguirre', nombre: 'Manuel Aguirre', correo: 'manuel.aguirre@gob.mx', grupos: ['contabilidad'], estado: 'Activo', ultimoIngreso: '2026-05-04 17:32', creado: '2014-08-11', empleado: 'EMP-01294' },
  { id: 7, username: 'fchavez', nombre: 'Fernando Chávez', correo: 'fernando.chavez@gob.mx', grupos: ['auditor'], estado: 'Activo', ultimoIngreso: '2026-05-05 08:21', creado: '2018-12-03', empleado: 'EMP-01421' },
  { id: 8, username: 'lnavarro', nombre: 'Lucía Navarro', correo: 'lucia.navarro@gob.mx', grupos: ['operador'], estado: 'Pendiente', ultimoIngreso: '—', creado: '2026-05-04', empleado: 'EMP-01508' },
  { id: 9, username: 'drobles', nombre: 'Daniela Robles', correo: 'daniela.robles@gob.mx', grupos: ['operador'], estado: 'Bloqueado', ultimoIngreso: '2026-04-12 11:08', creado: '2022-01-17', empleado: 'EMP-01355' },
];

const GRUPOS = [
  { id: 'admin', nombre: 'Administrador', desc: 'Control total del sistema', usuarios: 2, color: 'danger' },
  { id: 'operador', nombre: 'Operador', desc: 'Gestiona bienes, asignaciones y empleados', usuarios: 5, color: 'accent' },
  { id: 'auditor', nombre: 'Auditor', desc: 'Solo lectura + bitácora completa', usuarios: 1, color: 'info' },
  { id: 'soporte', nombre: 'Soporte', desc: 'Movimientos, mantenimiento y adjuntos', usuarios: 1, color: 'warn' },
  { id: 'contabilidad', nombre: 'Contabilidad', desc: 'Reportes y exportaciones', usuarios: 1, color: 'info' },
  { id: 'empleado', nombre: 'Empleado (portal)', desc: 'Solo acceso al portal y consulta de propios bienes', usuarios: 12, color: 'neutral' },
];

const KPIS = [
  { label: 'Bienes registrados', value: 1207, delta: '+24', deltaDir: 'up', spark: [12,18,15,22,25,28,32,38,42,48], icon: 'Box' },
  { label: 'Asignaciones activas', value: 842, delta: '+12', deltaDir: 'up', spark: [60,58,62,65,64,66,68,70,72,72], icon: 'Clipboard' },
  { label: 'Empleados con resguardo', value: 318, delta: '+5', deltaDir: 'up', spark: [200,210,220,230,250,270,290,300,310,318], icon: 'Users' },
  { label: 'Devoluciones pendientes', value: 14, delta: '+2', deltaDir: 'down', spark: [8,9,7,10,11,9,12,11,13,14], icon: 'Refresh' },
];

// Helpers
const empleadoById = (id) => EMPLEADOS.find(e => e.id === id);
const orgById = (id) => ORGS.find(o => o.id === id);
const depById = (id) => DEPTOS.find(d => d.id === id);
const bienById = (id) => BIENES.find(b => b.id === id);
const ubiById = (id) => UBICACIONES.find(u => u.id === id);
const catById = (id) => CATEGORIAS.find(c => c.id === id);

const fmtMXN = (n) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(n);
const initialsOf = (nombre, apellidos = '') => {
  const a = (nombre || '').trim().split(/\s+/)[0]?.[0] || '';
  const b = (apellidos || '').trim().split(/\s+/)[0]?.[0] || '';
  return (a + b).toUpperCase();
};

Object.assign(window, {
  ORGS, DEPTOS, EMPLEADOS, CATEGORIAS, UBICACIONES, BIENES, ASIGNACIONES, EVENTOS, BITACORA, USUARIOS, GRUPOS, KPIS,
  empleadoById, orgById, depById, bienById, ubiById, catById, fmtMXN, initialsOf,
});
