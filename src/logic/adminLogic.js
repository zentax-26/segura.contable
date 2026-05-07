import { sb } from '../lib/supabase.js'
window.sb = sb

// Wrap in IIFE to avoid duplicate identifier issues in module scope
;(function() {

// ══ AUTH GUARD ══
// SB_URL, SB_KEY y sb ya definidos en el script global

;(function checkAuth() {
  const user = JSON.parse(sessionStorage.getItem('sc_user') || 'null')
  if (!user || (user.rol !== 'admin' && user.rol !== 'macro')) { return }
  window._SC_USER = user
})()

// ══════════════════════════════════════════════════════
// ══════════════════════════════════════════════════════
// LOGO - se setea en initAdmin()
// ══════════════════════════════════════════════════════
// LOGO_B64 ya está definido en el script global superior; se evita redeclararlo para Netlify/Chrome.


// ══════════════════════════════════════════════════════
// DATOS MOCK
// ══════════════════════════════════════════════════════
const HOY = new Date().toISOString().split('T')[0]
const d = n => new Date(Date.now()+n*86400000).toISOString().split('T')[0]

let DATA = {
  ingresos:[
    {id:'i1',descripcion:'Asesoría contable mensual',cliente:'Mueblería Torres',categoria:'Servicios Contables',fecha:'2026-05-02',monto:3200,estado:'cobrado'},
    {id:'i2',descripcion:'Declaración anual ISR',cliente:'Clínica Salud+',categoria:'Asesoría Fiscal',fecha:'2026-04-28',monto:5800,estado:'pendiente'},
    {id:'i3',descripcion:'Auditoría interna Q1',cliente:'Inversiones del Sur',categoria:'Auditoría',fecha:'2026-04-25',monto:12450,estado:'cobrado'},
    {id:'i4',descripcion:'Procesamiento nómina',cliente:'Tech Solutions MX',categoria:'Nómina',fecha:'2026-04-20',monto:4950,estado:'cobrado'},
    {id:'i5',descripcion:'Consultoría financiera',cliente:'Estudio Arquitectura',categoria:'Consultoría',fecha:'2026-04-15',monto:2100,estado:'cobrado'},
    {id:'i6',descripcion:'Contabilidad mensual marzo',cliente:'Mueblería Torres',categoria:'Servicios Contables',fecha:'2026-03-05',monto:3200,estado:'cobrado'},
    {id:'i7',descripcion:'Revisión estados financieros',cliente:'Clínica Salud+',categoria:'Auditoría',fecha:'2026-03-20',monto:6500,estado:'cobrado'},
    {id:'i8',descripcion:'Nómina quincenal',cliente:'Inversiones del Sur',categoria:'Nómina',fecha:'2026-02-15',monto:3800,estado:'cobrado'},
    {id:'i9',descripcion:'Dictamen fiscal anual',cliente:'Tech Solutions MX',categoria:'Asesoría Fiscal',fecha:'2026-02-28',monto:8900,estado:'cobrado'},
  ],
  gastos:[
    {id:'g1',descripcion:'Nómina equipo contable',proveedor:'Interno',categoria:'Nómina',fecha:'2026-05-01',monto:28400},
    {id:'g2',descripcion:'Renta oficina',proveedor:'Inmobiliaria Arco',categoria:'Renta',fecha:'2026-05-01',monto:8500},
    {id:'g3',descripcion:'Servicio eléctrico',proveedor:'Enel',categoria:'Servicios',fecha:'2026-04-30',monto:1240},
    {id:'g4',descripcion:'Software contable',proveedor:'ContaCloud',categoria:'Tecnología',fecha:'2026-04-15',monto:2890},
    {id:'g5',descripcion:'Material de oficina',proveedor:'Office Plus',categoria:'Operativos',fecha:'2026-04-10',monto:640},
    {id:'g6',descripcion:'Internet y telefonía',proveedor:'Movistar',categoria:'Servicios',fecha:'2026-04-05',monto:1200},
    {id:'g7',descripcion:'Publicidad digital',proveedor:'Meta Ads',categoria:'Marketing',fecha:'2026-04-01',monto:3000},
    {id:'g8',descripcion:'Nómina marzo',proveedor:'Interno',categoria:'Nómina',fecha:'2026-03-01',monto:28400},
  ],
  facturas:[
    {id:'f1',numero:'F-2026-024',cliente:'Mueblería Torres',servicio:'Asesoría Mensual Mayo',fecha_emision:'2026-05-02',fecha_vencimiento:d(25),monto:3200,estado:'pendiente'},
    {id:'f2',numero:'F-2026-023',cliente:'Clínica Salud+',servicio:'Declaración Anual ISR',fecha_emision:'2026-04-28',fecha_vencimiento:d(3),monto:5800,estado:'pendiente'},
    {id:'f3',numero:'F-2026-022',cliente:'Inversiones del Sur',servicio:'Auditoría Q1',fecha_emision:'2026-04-25',fecha_vencimiento:d(-7),monto:12450,estado:'pendiente'},
    {id:'f4',numero:'F-2026-021',cliente:'Tech Solutions MX',servicio:'Nómina Mensual',fecha_emision:'2026-04-20',fecha_vencimiento:d(-5),monto:4950,estado:'pendiente'},
    {id:'f5',numero:'F-2026-020',cliente:'Estudio Arquitectura',servicio:'Consultoría Financiera',fecha_emision:'2026-04-15',fecha_vencimiento:'2026-04-29',monto:2100,estado:'pagado'},
    {id:'f6',numero:'F-2026-019',cliente:'Ferretería López',servicio:'Asesoría IMSS',fecha_emision:'2026-04-10',fecha_vencimiento:'2026-04-24',monto:1800,estado:'pagado'},
    {id:'f7',numero:'F-2026-018',cliente:'Mueblería Torres',servicio:'Asesoría Mensual Abril',fecha_emision:'2026-04-02',fecha_vencimiento:'2026-04-16',monto:3200,estado:'pagado'},
    {id:'f8',numero:'F-2026-017',cliente:'Nuevo Cliente SA',servicio:'Diagnóstico inicial',fecha_emision:'2026-05-01',fecha_vencimiento:d(10),monto:3500,estado:'borrador'},
  ],
  cotizaciones:[
    {id:'c1',numero:'COT-2026-012',cliente:'Nuevo Cliente SA',descripcion:'Paquete contabilidad anual',fecha:'2026-05-01',vigencia:d(30),monto:42000,estado:'enviada',items:[{desc:'Contabilidad mensual x12',cant:12,precio:3200},{desc:'Declaración anual',cant:1,precio:3600}]},
    {id:'c2',numero:'COT-2026-011',cliente:'Mueblería Torres',descripcion:'Auditoría anual completa',fecha:'2026-04-20',vigencia:d(5),monto:18000,estado:'aprobada',items:[{desc:'Auditoría interna',cant:1,precio:12000},{desc:'Informe ejecutivo',cant:1,precio:6000}]},
    {id:'c3',numero:'COT-2026-010',cliente:'Constructora Méndez',descripcion:'Nómina y RH mensual',fecha:'2026-04-10',vigencia:d(-5),monto:8500,estado:'vencida',items:[{desc:'Procesamiento nómina',cant:1,precio:5500},{desc:'Asesoría laboral',cant:1,precio:3000}]},
    {id:'c4',numero:'COT-2026-009',cliente:'Clínica Salud+',descripcion:'Reestructura fiscal',fecha:'2026-03-15',vigencia:'2026-04-15',monto:25000,estado:'rechazada',items:[{desc:'Diagnóstico fiscal',cant:1,precio:10000},{desc:'Plan reestructura',cant:1,precio:15000}]},
    {id:'c5',numero:'COT-2026-008',cliente:'Ferretería López',descripcion:'Pack básico anual',fecha:'2026-05-03',vigencia:d(20),monto:14400,estado:'borrador',items:[{desc:'Contabilidad básica x12',cant:12,precio:1200}]},
  ],
  clientes:[
    {id:'cl1',nombre:'Mueblería Torres',rfc:'TOPM850312AB3',email:'admin@muebleriastorres.mx',telefono:'(55) 1234-5678',giro:'Comercio / Retail',contacto:'Ana Torres'},
    {id:'cl2',nombre:'Clínica Salud+',rfc:'SALM920617CD2',email:'admin@clinicasalud.mx',telefono:'(55) 2345-6789',giro:'Sector Salud',contacto:'Dr. Ramírez'},
    {id:'cl3',nombre:'Tech Solutions MX',rfc:'TSOL010203EF4',email:'finanzas@techsol.mx',telefono:'(55) 3456-7890',giro:'Tecnología',contacto:'Luis Hernández'},
    {id:'cl4',nombre:'Inversiones del Sur',rfc:'ISUR780901GH5',email:'contabilidad@invsur.mx',telefono:'(55) 4567-8901',giro:'Inversiones',contacto:'Lic. García'},
    {id:'cl5',nombre:'Estudio Arquitectura',rfc:'EARQ901124IJ6',email:'estudio@arq.mx',telefono:'(55) 5678-9012',giro:'Arquitectura',contacto:'Arq. Soto'},
    {id:'cl6',nombre:'Ferretería López',rfc:'FLOP760412KL7',email:'ferreterialopez@gmail.com',telefono:'(55) 6789-0123',giro:'Ferretería',contacto:'Sr. López'},
    {id:'cl7',nombre:'Nuevo Cliente SA',rfc:'NCSA010101XX1',email:'contacto@nuevocliente.mx',telefono:'(55) 9876-5432',giro:'Servicios',contacto:'Lic. Pérez'},
  ],
  empresasRH:[
    {id:'e1',nombre:'Mueblería Torres',rfc:'TOPM850312AB3',giro:'Comercio',contacto:'Ana Torres',telefono:'(55) 1234-5678'},
    {id:'e2',nombre:'Clínica Salud+',rfc:'SALM920617CD2',giro:'Salud',contacto:'Dr. Ramírez',telefono:'(55) 2345-6789'},
    {id:'e3',nombre:'Tech Solutions MX',rfc:'TSOL010203EF4',giro:'Tecnología',contacto:'Luis H.',telefono:'(55) 3456-7890'},
  ],
  empleados:{
    e1:[
      {id:'em1',nombre:'Carlos Martínez Ruiz',puesto:'Vendedor Senior',departamento:'Ventas',fecha_ingreso:'2020-03-15',salario:18000,tipo_contrato:'indefinido',estado:'activo',email:'carlos@torres.mx',curp:'MARC800101HDFRRR01',nss:'12345678901'},
      {id:'em2',nombre:'Laura Gómez Soto',puesto:'Cajera Principal',departamento:'Operaciones',fecha_ingreso:'2021-07-01',salario:12000,tipo_contrato:'indefinido',estado:'activo',email:'laura@torres.mx',curp:'GOSL900202MDFMMM02',nss:'23456789012'},
      {id:'em3',nombre:'Pedro Ruiz García',puesto:'Almacenista',departamento:'Logística',fecha_ingreso:'2022-01-10',salario:11000,tipo_contrato:'indefinido',estado:'activo',email:'pedro@torres.mx',curp:'RUGP950303HDFRRR03',nss:'34567890123'},
      {id:'em4',nombre:'María López Torres',puesto:'Gerente de Ventas',departamento:'Ventas',fecha_ingreso:'2019-05-20',salario:28000,tipo_contrato:'indefinido',estado:'activo',email:'maria@torres.mx',curp:'LOTM850404MDFPPP04',nss:'45678901234'},
      {id:'em5',nombre:'Sofía Torres Vega',puesto:'Directora General',departamento:'Dirección',fecha_ingreso:'2015-01-01',salario:55000,tipo_contrato:'indefinido',estado:'activo',email:'sofia@torres.mx',curp:'TOVS800808MDFRRR08',nss:'89012345678'},
    ],
    e2:[
      {id:'em6',nombre:'Dr. Roberto Ramírez Luna',puesto:'Médico General',departamento:'Consulta',fecha_ingreso:'2018-04-10',salario:45000,tipo_contrato:'indefinido',estado:'activo',email:'r@salud.mx',curp:'RALR750909HDFMMM09',nss:'90123456789'},
      {id:'em7',nombre:'Dra. Lupita Flores Cruz',puesto:'Pediatra',departamento:'Pediatría',fecha_ingreso:'2019-08-15',salario:48000,tipo_contrato:'indefinido',estado:'activo',email:'l@salud.mx',curp:'FOCL800101MDFRRR10',nss:'01234567890'},
      {id:'em8',nombre:'Enf. Carla Méndez Ríos',puesto:'Enfermera Jefe',departamento:'Enfermería',fecha_ingreso:'2017-03-01',salario:22000,tipo_contrato:'indefinido',estado:'activo',email:'c@salud.mx',curp:'MERC850202MDFNNN11',nss:'12345098765'},
    ],
    e3:[
      {id:'em9',nombre:'Luis Hernández Paz',puesto:'CEO',departamento:'Dirección',fecha_ingreso:'2016-06-01',salario:70000,tipo_contrato:'indefinido',estado:'activo',email:'luis@techsol.mx',curp:'HEPL800404HDFZZZ13',nss:'34567210987'},
      {id:'em10',nombre:'Ana Vargas Rueda',puesto:'Desarrolladora Senior',departamento:'Ingeniería',fecha_ingreso:'2021-03-15',salario:42000,tipo_contrato:'indefinido',estado:'activo',email:'ana@techsol.mx',curp:'VARA950505MDFRRR14',nss:'45678321098'},
      {id:'em11',nombre:'Omar Pérez Nava',puesto:'Desarrollador Junior',departamento:'Ingeniería',fecha_ingreso:'2023-09-01',salario:22000,tipo_contrato:'temporal',estado:'activo',email:'omar@techsol.mx',curp:'PENO000606HDFVVV15',nss:'56789432109'},
    ],
  },
  nomina:{
    e1:[
      {id:'n1',empleado_nombre:'Carlos Martínez Ruiz',periodo:'2026-05',fecha_pago:'2026-05-01',salario_base:18000,bonos:0,deducciones:2700,total_pago:15300,estado:'pagado'},
      {id:'n2',empleado_nombre:'Laura Gómez Soto',periodo:'2026-05',fecha_pago:'2026-05-01',salario_base:12000,bonos:500,deducciones:1800,total_pago:10700,estado:'pagado'},
      {id:'n3',empleado_nombre:'María López Torres',periodo:'2026-05',fecha_pago:'2026-05-01',salario_base:28000,bonos:2000,deducciones:4200,total_pago:25800,estado:'pendiente'},
      {id:'n4',empleado_nombre:'Sofía Torres Vega',periodo:'2026-05',fecha_pago:'2026-05-01',salario_base:55000,bonos:5000,deducciones:8250,total_pago:51750,estado:'pendiente'},
    ],
    e2:[
      {id:'n5',empleado_nombre:'Dr. Roberto Ramírez Luna',periodo:'2026-05',fecha_pago:'2026-05-01',salario_base:45000,bonos:5000,deducciones:6750,total_pago:43250,estado:'pagado'},
      {id:'n6',empleado_nombre:'Dra. Lupita Flores Cruz',periodo:'2026-05',fecha_pago:'2026-05-01',salario_base:48000,bonos:0,deducciones:7200,total_pago:40800,estado:'pendiente'},
    ],
    e3:[
      {id:'n7',empleado_nombre:'Luis Hernández Paz',periodo:'2026-05',fecha_pago:'2026-05-01',salario_base:70000,bonos:10000,deducciones:10500,total_pago:69500,estado:'pagado'},
      {id:'n8',empleado_nombre:'Ana Vargas Rueda',periodo:'2026-05',fecha_pago:'2026-05-01',salario_base:42000,bonos:0,deducciones:6300,total_pago:35700,estado:'pagado'},
    ],
  },
  asistencia:{
    e1:[
      {id:'a1',empleado_nombre:'Carlos Martínez Ruiz',fecha:HOY,hora_entrada:'09:02',hora_salida:'18:05',estado:'presente',notas:''},
      {id:'a2',empleado_nombre:'Laura Gómez Soto',fecha:HOY,hora_entrada:'09:18',hora_salida:'18:00',estado:'retardo',notas:'Tráfico'},
      {id:'a3',empleado_nombre:'María López Torres',fecha:HOY,hora_entrada:'08:50',hora_salida:'19:30',estado:'presente',notas:''},
      {id:'a4',empleado_nombre:'Pedro Ruiz García',fecha:HOY,hora_entrada:'—',hora_salida:'—',estado:'ausente',notas:'Incapacidad médica'},
    ],
    e2:[
      {id:'a5',empleado_nombre:'Dr. Roberto Ramírez Luna',fecha:HOY,hora_entrada:'08:00',hora_salida:'15:00',estado:'presente',notas:'Turno mañana'},
      {id:'a6',empleado_nombre:'Dra. Lupita Flores Cruz',fecha:HOY,hora_entrada:'14:00',hora_salida:'21:00',estado:'presente',notas:'Turno tarde'},
    ],
    e3:[
      {id:'a7',empleado_nombre:'Luis Hernández Paz',fecha:HOY,hora_entrada:'10:00',hora_salida:'19:00',estado:'presente',notas:'Home office'},
      {id:'a8',empleado_nombre:'Ana Vargas Rueda',fecha:HOY,hora_entrada:'—',hora_salida:'—',estado:'permiso',notas:'Día personal'},
    ],
  },
  vacaciones:{
    e1:[
      {id:'v1',empleado_nombre:'Carlos Martínez Ruiz',tipo:'vacaciones',fecha_inicio:d(14),fecha_fin:d(25),estado:'aprobado',motivo:'Vacaciones anuales'},
      {id:'v2',empleado_nombre:'Laura Gómez Soto',tipo:'permiso',fecha_inicio:d(3),fecha_fin:d(4),estado:'pendiente',motivo:'Trámite personal'},
      {id:'v3',empleado_nombre:'Pedro Ruiz García',tipo:'incapacidad',fecha_inicio:HOY,fecha_fin:d(3),estado:'aprobado',motivo:'Incapacidad IMSS'},
    ],
    e2:[
      {id:'v4',empleado_nombre:'Enf. Carla Méndez Ríos',tipo:'vacaciones',fecha_inicio:d(26),fecha_fin:d(40),estado:'pendiente',motivo:'Vacaciones anuales'},
    ],
    e3:[
      {id:'v5',empleado_nombre:'Ana Vargas Rueda',tipo:'permiso',fecha_inicio:HOY,fecha_fin:HOY,estado:'aprobado',motivo:'Día personal'},
    ],
  }
}

// ══════════════════════════════════════════════════════
// ESTADO & HELPERS
// ══════════════════════════════════════════════════════
const TITLES = {dashboard:'Dashboard',alertas:'Alertas',ingresos:'Ingresos',gastos:'Gastos',facturas:'Facturas',cotizaciones:'Cotizaciones',clientes:'Clientes','perfil-cliente':'Perfil de Cliente',calendario:'Calendario',reportes:'Reportes','rh-empresas':'Empresas RH','rh-empleados':'Empleados','rh-nomina':'Nómina','rh-asistencia':'Asistencia','rh-vacaciones':'Vacaciones','rh-dashboard':'Dashboard RH','docs-rrhh':'Documentos RRHH',plantillas:'Mis Plantillas',config:'Configuración'}
const ACCIONES = {dashboard:'+ Nuevo Ingreso',ingresos:'+ Ingreso',gastos:'+ Gasto',facturas:'+ Factura',cotizaciones:'+ Cotización',clientes:'+ Cliente','rh-empresas':'+ Empresa','rh-empleados':'+ Empleado','rh-nomina':'+ Pago','rh-asistencia':'+ Asistencia','rh-vacaciones':'+ Solicitud'}

let empresaActiva = null, editId = null, curPanel = 'dashboard', charts = {}
let calYear = new Date().getFullYear(), calMonth = new Date().getMonth()

document.getElementById('period-lbl').textContent = new Date().toLocaleDateString('es-MX',{month:'long',year:'numeric'})

const fmt = n => '$' + Number(n||0).toLocaleString('es-MX')
const fd = s => s && s !== '—' ? new Date(s+'T12:00').toLocaleDateString('es-MX',{day:'2-digit',month:'short',year:'numeric'}) : '—'
const uid = () => Math.random().toString(36).slice(2,8)
const vv = id => document.getElementById(id)?.value || ''
const isVenc = f => f.estado !== 'pagado' && f.fecha_vencimiento < HOY
const diasA = s => Math.ceil((new Date(s) - new Date()) / 86400000)

function showMsg(id, type, txt) {
  const el = document.getElementById(id)
  if (!el) return
  el.innerHTML = `<div class="${type==='err'?'msg-err':'msg-ok'}">${txt}</div>`
  setTimeout(() => { el.innerHTML = '' }, 3000)
}

function bdg(e) {
  const m = {pagado:'ok',cobrado:'ok',aprobado:'ok',presente:'ok',pendiente:'pend',vencida:'pend',ausente:'pend',rechazado:'pend',retardo:'warn',permiso:'warn',enviada:'azul-b',borrador:'bor',temporal:'warn',honorarios:'morado-b',indefinido:'ok',activo:'ok',inactivo:'bor',baja:'pend',incapacidad:'warn'}
  return m[e] || 'bor'
}

// ══════════════════════════════════════════════════════
// NAVEGACIÓN
// ══════════════════════════════════════════════════════
function go(id, btn) {
  const adminView = document.getElementById('vista-admin') || document
  adminView.querySelectorAll('.panel').forEach(p => p.classList.remove('active'))
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'))
  const p = adminView.querySelector('#p-' + id)
  if (p) p.classList.add('active')
  document.getElementById('ptitle').textContent = TITLES[id] || id
  if (btn && btn.classList) btn.classList.add('active')
  curPanel = id
  const rh = ['rh-empresas','rh-empleados','rh-nomina','rh-asistencia','rh-vacaciones','rh-dashboard']
  document.getElementById('rh-sub').style.display = rh.includes(id) ? 'block' : 'none'
  if (rh.includes(id)) document.getElementById('nav-rhe').classList.add('active')
  const acc = ACCIONES[id]
  document.getElementById('btn-acc').style.display = acc ? '' : 'none'
  document.getElementById('btn-acc').textContent = acc || ''
  document.getElementById('btn-xl').style.display = ['ingresos','gastos','facturas','clientes','cotizaciones','rh-empleados','rh-nomina'].includes(id) ? '' : 'none'
  // Render dinámico
  if (id==='dashboard') renderDashboard()
  if (id==='reportes') renderReportes()
  if (id==='alertas') renderAlertas()
  if (id==='calendario') renderCalendario()
  if (id==='rh-dashboard') renderRHDashboard()
  if (id==='docs-rrhh') initDocsRRHH()
  if (id==='plantillas') initPlantillas()
  if (id==='docs-rrhh') initDocsRRHH()
}

function goRH(id, btn) {
  if (!empresaActiva) { alert('Primero selecciona una empresa desde Empresas RH'); return }
  go(id, btn)
  document.getElementById('nav-rhe').classList.remove('active')
}

function accion() {
  const m = {dashboard:'ingreso',ingresos:'ingreso',gastos:'gasto',facturas:'factura',cotizaciones:'cotizacion',clientes:'cliente','rh-empresas':'empresaRH','rh-empleados':'empleado','rh-nomina':'nomina','rh-asistencia':'asistencia','rh-vacaciones':'vacacion'}
  if (m[curPanel]) openModal(m[curPanel])
}

function exportXL() {
  const m = {ingresos:'ingresos',gastos:'gastos',facturas:'facturas',clientes:'clientes',cotizaciones:'cotizaciones','rh-empleados':'empleados','rh-nomina':'nomina'}
  if (m[curPanel]) exportTabla(m[curPanel])
}

function selEmpresa(emp) {
  empresaActiva = emp
  ;['emp','nom','asi','vac'].forEach(p => {
    const el = document.getElementById(p + '-eb')
    if (el) el.textContent = emp.nombre + (emp.rfc ? '  ·  ' + emp.rfc : '')
  })
  renderEmpleados(); renderNomina(); renderAsistencia(); renderVacaciones()
  document.getElementById('rh-sub').style.display = 'block'
  go('rh-empleados', document.querySelector('#rh-sub .nav-btn'))
}

// ══════════════════════════════════════════════════════
// ALERTAS
// ══════════════════════════════════════════════════════
function calcAlerts() {
  return DATA.facturas.filter(f => f.estado !== 'pagado' && f.fecha_vencimiento).map(f => {
    const dias = diasA(f.fecha_vencimiento)
    const tipo = dias < 0 ? 'vencida' : dias <= 7 ? 'proxima' : null
    return tipo ? {...f, dias, tipo} : null
  }).filter(Boolean).sort((a,b) => a.dias - b.dias)
}

function updAlertBadge() {
  const n = calcAlerts().length
  document.getElementById('bell-n').textContent = n
  document.getElementById('bell-n').style.display = n ? 'flex' : 'none'
  document.getElementById('nav-alrt').textContent = n
  document.getElementById('nav-alrt').style.display = n ? 'inline-block' : 'none'
}

function renderAlertas() {
  const al = calcAlerts()
  const venc = al.filter(a => a.tipo === 'vencida')
  const prox = al.filter(a => a.tipo === 'proxima')
  document.getElementById('al-v').textContent = venc.length
  document.getElementById('al-p').textContent = prox.length
  document.getElementById('al-m').textContent = fmt(al.reduce((s,a)=>s+a.monto,0))
  document.getElementById('al-lista').innerHTML = al.length === 0
    ? '<div class="empty"><div class="ei">✅</div><p>Sin alertas. Todo al día.</p></div>'
    : al.map(a => `<div style="display:flex;align-items:center;gap:14px;padding:13px 0;border-bottom:1px solid var(--borde)">
        <div style="width:9px;height:9px;border-radius:50%;background:${a.tipo==='vencida'?'var(--rosa)':'#F0C95A'};flex-shrink:0"></div>
        <div style="flex:1"><div style="font-size:13px;font-weight:500">${a.numero} — ${a.cliente}</div><div style="font-size:11px;color:var(--gris-s)">${a.servicio}</div></div>
        <div style="text-align:right"><div class="nbold" style="font-size:14px">${fmt(a.monto)}</div>
          <div style="font-size:11px;color:${a.tipo==='vencida'?'var(--rosa-d)':'var(--amber)'}">
            ${a.tipo==='vencida'?`Venció hace ${Math.abs(a.dias)} días`:`Vence en ${a.dias} días`}</div></div>
        <button class="btn-sm v" onclick="marcarPagada('${a.id}')">✓ Cobrada</button>
      </div>`).join('')
}

function marcarPagada(id) {
  DATA.facturas = DATA.facturas.map(f => f.id === id ? {...f, estado:'pagado'} : f)
  updAlertBadge(); renderFacturas(); renderAlertas()
}

// ══════════════════════════════════════════════════════
// DASHBOARD
// ══════════════════════════════════════════════════════
function renderDashboard() {
  const now = new Date(), y = now.getFullYear(), m = now.getMonth()
  const f1 = new Date(y,m,1).toISOString().split('T')[0], f2 = new Date(y,m+1,0).toISOString().split('T')[0]
  const ingM = DATA.ingresos.filter(r => r.fecha >= f1 && r.fecha <= f2)
  const gasM = DATA.gastos.filter(r => r.fecha >= f1 && r.fecha <= f2)
  const tI = ingM.reduce((s,r)=>s+r.monto,0), tG = gasM.reduce((s,r)=>s+r.monto,0)
  const pC = DATA.facturas.filter(f=>f.estado==='pendiente').reduce((s,f)=>s+f.monto,0)
  document.getElementById('db-ing').textContent = fmt(tI)
  document.getElementById('db-gas').textContent = fmt(tG)
  document.getElementById('db-util').textContent = fmt(tI-tG)
  document.getElementById('db-cob').textContent = fmt(pC)
  document.getElementById('db-tag').textContent = now.toLocaleDateString('es-MX',{month:'long',year:'numeric'})

  // Alertas en dashboard
  const al = calcAlerts()
  const dashAl = document.getElementById('dash-alerts')
  dashAl.innerHTML = al.length > 0
    ? `<div class="alert-row">${al.slice(0,3).map(a=>`
        <div class="a-chip ${a.tipo==='vencida'?'venc':'prox'}" onclick="go('alertas',null)">
          <span>${a.tipo==='vencida'?'🚨':'⏰'}</span>
          <div><div style="font-size:11px;font-weight:600">${a.numero} · ${a.cliente}</div>
          <div style="font-size:10px">${a.tipo==='vencida'?`Venció hace ${Math.abs(a.dias)} días`:`Vence en ${a.dias} días`} · ${fmt(a.monto)}</div></div>
        </div>`).join('')}
      ${al.length>3?`<div class="a-chip prox" onclick="go('alertas',null)"><span>+${al.length-3}</span><div style="font-size:11px">más alertas</div></div>`:''}</div>` : ''

  // Tabla facturas
  document.getElementById('db-facs').innerHTML = DATA.facturas.slice(0,5).map(f => {
    const venc = isVenc(f)
    return `<tr onclick="go('facturas',null)">
      <td style="font-weight:500">${f.cliente}</td>
      <td class="nbold">${fmt(f.monto)}</td>
      <td style="font-size:11px;color:${venc?'var(--rosa-d)':'var(--gris-s)'}">${fd(f.fecha_vencimiento)}</td>
      <td><span class="bdg ${venc?'pend':bdg(f.estado)}">${venc?'vencida':f.estado}</span></td>
    </tr>`}).join('')

  // Actividad reciente
  const act = [...DATA.ingresos.slice(0,3).map(r=>({...r,tipo:'ing'})),...DATA.gastos.slice(0,2).map(r=>({...r,tipo:'gas'})),...DATA.cotizaciones.slice(0,1).map(r=>({...r,tipo:'cot'}))]
    .sort((a,b)=>new Date(b.fecha)-new Date(a.fecha)).slice(0,5)
  document.getElementById('db-act').innerHTML = act.map(a => `
    <div class="mini-item">
      <div class="mini-ic ${a.tipo}">${a.tipo==='ing'?'↑':a.tipo==='gas'?'↓':'📋'}</div>
      <div style="flex:1"><div style="font-size:13px;font-weight:500">${a.descripcion||a.descripcion}</div>
      <div style="font-size:11px;color:var(--gris-s)">${a.cliente||a.proveedor||''} · ${fd(a.fecha)}</div></div>
      <span style="font-size:13px" class="${a.tipo==='ing'?'ap':a.tipo==='gas'?'an':''}">${a.tipo==='ing'?'+':a.tipo==='gas'?'−':''}${fmt(a.monto)}</span>
    </div>`).join('')

  // Cotizaciones recientes
  document.getElementById('db-cots').innerHTML = DATA.cotizaciones.slice(0,4).map(c => `
    <tr onclick="go('cotizaciones',null)">
      <td style="font-weight:500">${c.cliente}</td>
      <td class="nbold">${fmt(c.monto)}</td>
      <td style="font-size:11px;color:var(--gris-s)">${fd(c.vigencia)}</td>
      <td><span class="bdg ${bdg(c.estado)}">${c.estado}</span></td>
    </tr>`).join('')

  // Resumen RH
  const totalEmp = Object.values(DATA.empleados).flat().length
  const nomGlobal = Object.values(DATA.nomina).flat().reduce((s,n)=>s+n.total_pago,0)
  const vacHoy = Object.values(DATA.vacaciones).flat().filter(v=>v.estado==='aprobado'&&v.fecha_inicio<=HOY&&v.fecha_fin>=HOY).length
  document.getElementById('db-rh').innerHTML = `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:14px">
      <div style="text-align:center;background:var(--fondo);padding:12px;border-radius:8px"><div class="nbold" style="font-size:26px">${DATA.empresasRH.length}</div><div style="font-size:10px;color:var(--gris-s);text-transform:uppercase;letter-spacing:1px">Empresas</div></div>
      <div style="text-align:center;background:var(--fondo);padding:12px;border-radius:8px"><div class="nbold" style="font-size:26px">${totalEmp}</div><div style="font-size:10px;color:var(--gris-s);text-transform:uppercase;letter-spacing:1px">Empleados</div></div>
    </div>
    <div style="display:flex;justify-content:space-between;margin-bottom:8px"><span style="font-size:13px;color:var(--gris-m)">Nómina global</span><span class="ap" style="font-weight:600">${fmt(nomGlobal)}</span></div>
    <div style="display:flex;justify-content:space-between"><span style="font-size:13px;color:var(--gris-m)">En vacaciones hoy</span><span style="font-weight:600">${vacHoy}</span></div>
    <div class="hr"></div>
    <button class="btn btn-o" style="width:100%" onclick="go('rh-dashboard',null)">Ver Dashboard RH →</button>`

  // Gráficas
  const meses = ['Ene','Feb','Mar','Abr','May','Jun']
  const ingD = [42000,38000,51000,46000,tI||48250,0]
  const gasD = [18000,22000,19000,21000,tG||18730,0]
  if (charts.bar) charts.bar.destroy()
  charts.bar = new Chart(document.getElementById('ch-bar').getContext('2d'), {
    type:'bar',
    data:{labels:meses,datasets:[
      {label:'Ingresos',data:ingD,backgroundColor:'rgba(232,144,154,.85)',borderRadius:5,borderSkipped:false},
      {label:'Gastos',data:gasD,backgroundColor:'rgba(58,58,58,.25)',borderRadius:5,borderSkipped:false}
    ]},
    options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'bottom',labels:{boxWidth:10,font:{size:11}}}},scales:{x:{grid:{display:false}},y:{grid:{color:'rgba(0,0,0,.04)'},ticks:{callback:v=>'$'+Number(v).toLocaleString('es-MX')}}}}
  })

  const cats = {}; DATA.gastos.forEach(g=>{cats[g.categoria]=(cats[g.categoria]||0)+g.monto})
  const catE = Object.entries(cats).sort((a,b)=>b[1]-a[1]).slice(0,5)
  const cols = ['#E8909A','#3A3A3A','#1A7A52','#C4791E','#2E6DB4']
  if (charts.dona) charts.dona.destroy()
  charts.dona = new Chart(document.getElementById('ch-dona').getContext('2d'), {
    type:'doughnut',
    data:{labels:catE.map(c=>c[0]),datasets:[{data:catE.map(c=>c[1]),backgroundColor:cols,borderWidth:0,hoverOffset:4}]},
    options:{responsive:true,maintainAspectRatio:false,cutout:'68%',plugins:{legend:{display:false}}}
  })
  const totD = catE.reduce((s,c)=>s+c[1],0)
  document.getElementById('dona-leg').innerHTML = catE.map((c,i)=>`
    <div style="display:flex;align-items:center;gap:7px;margin-bottom:6px">
      <div style="width:7px;height:7px;border-radius:50%;background:${cols[i]};flex-shrink:0"></div>
      <span style="font-size:11px;color:var(--gris-m);flex:1">${c[0]}</span>
      <span style="font-size:11px;font-weight:600">${((c[1]/totD)*100).toFixed(0)}%</span>
    </div>`).join('')
}

// ══════════════════════════════════════════════════════
// INGRESOS
// ══════════════════════════════════════════════════════
function renderIngresos() {
  const q = vv('ing-q').toLowerCase(), cat = vv('ing-cat')
  const rows = DATA.ingresos.filter(r=>(!q||r.descripcion.toLowerCase().includes(q)||r.cliente.toLowerCase().includes(q))&&(!cat||r.categoria===cat))
  const tot = rows.reduce((s,r)=>s+r.monto,0), cob = rows.filter(r=>r.estado==='cobrado').reduce((s,r)=>s+r.monto,0)
  document.getElementById('ing-tot').textContent = fmt(tot)
  document.getElementById('ing-cob').textContent = fmt(cob)
  document.getElementById('ing-pend').textContent = fmt(tot-cob)
  document.getElementById('ing-tbody').innerHTML = rows.length === 0
    ? `<tr><td colspan="7" class="empty">Sin ingresos</td></tr>`
    : rows.map(r=>`<tr onclick="editFila('ingreso','${r.id}')">
        <td style="font-weight:500">${r.descripcion}</td><td class="muted">${r.cliente}</td>
        <td><span class="bdg bor">${r.categoria}</span></td>
        <td style="font-size:11px;color:var(--gris-s)">${fd(r.fecha)}</td>
        <td class="ap nbold">${fmt(r.monto)}</td>
        <td><span class="bdg ${bdg(r.estado)}">${r.estado}</span></td>
        <td><div style="display:flex;gap:5px"><button class="btn-sm" onclick="event.stopPropagation();editFila('ingreso','${r.id}')">✏</button><button class="btn-sm" onclick="event.stopPropagation();del('ingreso','${r.id}')">✕</button></div></td>
      </tr>`).join('')
}

// ══════════════════════════════════════════════════════
// GASTOS
// ══════════════════════════════════════════════════════
function renderGastos() {
  const q = vv('gas-q').toLowerCase(), cat = vv('gas-cat2')
  const rows = DATA.gastos.filter(r=>(!q||r.descripcion.toLowerCase().includes(q)||r.proveedor.toLowerCase().includes(q))&&(!cat||r.categoria===cat))
  const tot = rows.reduce((s,r)=>s+r.monto,0)
  const cats={};rows.forEach(r=>{cats[r.categoria]=(cats[r.categoria]||0)+r.monto})
  const top = Object.entries(cats).sort((a,b)=>b[1]-a[1])[0]
  document.getElementById('gas-tot').textContent = fmt(tot)
  document.getElementById('gas-cnt').textContent = rows.length
  document.getElementById('gas-cat').textContent = top?.[0]||'—'
  document.getElementById('gas-tbody').innerHTML = rows.length===0
    ? `<tr><td colspan="6" class="empty">Sin gastos</td></tr>`
    : rows.map(r=>`<tr onclick="editFila('gasto','${r.id}')">
        <td style="font-weight:500">${r.descripcion}</td><td class="muted">${r.proveedor}</td>
        <td><span class="bdg bor">${r.categoria}</span></td>
        <td style="font-size:11px;color:var(--gris-s)">${fd(r.fecha)}</td>
        <td class="an nbold">${fmt(r.monto)}</td>
        <td><div style="display:flex;gap:5px"><button class="btn-sm" onclick="event.stopPropagation();editFila('gasto','${r.id}')">✏</button><button class="btn-sm" onclick="event.stopPropagation();del('gasto','${r.id}')">✕</button></div></td>
      </tr>`).join('')
}

// ══════════════════════════════════════════════════════
// FACTURAS
// ══════════════════════════════════════════════════════
function renderFacturas() {
  const q = vv('fac-q').toLowerCase(), fil = vv('fac-fil')
  const rows = DATA.facturas.filter(r=>{
    const venc = isVenc(r), est = venc?'vencida':r.estado
    return (!q||r.cliente.toLowerCase().includes(q)||r.numero.toLowerCase().includes(q))&&(!fil||est===fil)
  })
  document.getElementById('fac-tot').textContent = fmt(rows.reduce((s,r)=>s+r.monto,0))
  document.getElementById('fac-pag').textContent = rows.filter(r=>r.estado==='pagado').length
  document.getElementById('fac-pend').textContent = rows.filter(r=>r.estado==='pendiente').length
  document.getElementById('fac-venc').textContent = rows.filter(r=>isVenc(r)).length

  const al = calcAlerts()
  document.getElementById('fac-alert-row').innerHTML = al.slice(0,4).map(a=>`
    <div class="a-chip ${a.tipo==='vencida'?'venc':'prox'}">
      <span>${a.tipo==='vencida'?'🚨':'⏰'}</span>
      <div><div style="font-size:10px;font-weight:600">${a.numero}</div>
      <div style="font-size:9px">${a.tipo==='vencida'?'VENCIDA':'Vence pronto'} · ${fmt(a.monto)}</div></div>
      <button class="btn-sm v" onclick="marcarPagada('${a.id}')">✓</button>
    </div>`).join('')

  document.getElementById('fac-tbody').innerHTML = rows.length===0
    ? `<tr><td colspan="8" class="empty">Sin facturas</td></tr>`
    : rows.map(r=>{
      const venc = isVenc(r), est = venc?'vencida':r.estado
      return `<tr onclick="editFila('factura','${r.id}')">
        <td style="font-size:11px;color:var(--gris-s);font-weight:600">${r.numero}</td>
        <td style="font-weight:500">${r.cliente}</td>
        <td style="font-size:11px;color:var(--gris-m)">${r.servicio}</td>
        <td style="font-size:11px;color:var(--gris-s)">${fd(r.fecha_emision)}</td>
        <td style="font-size:11px;color:${venc?'var(--rosa-d)':'var(--gris-s)'};font-weight:${venc?600:400}">${fd(r.fecha_vencimiento)}</td>
        <td class="nbold">${fmt(r.monto)}</td>
        <td><span class="bdg ${bdg(est)}">${est}</span></td>
        <td><div style="display:flex;gap:4px">
          <button class="btn-sm" onclick="event.stopPropagation();pdfFactura('${r.id}')" title="PDF">📄</button>
          <button class="btn-sm" onclick="event.stopPropagation();editFila('factura','${r.id}')">✏</button>
          <button class="btn-sm" onclick="event.stopPropagation();del('factura','${r.id}')">✕</button>
        </div></td>
      </tr>`}).join('')
}

// ══════════════════════════════════════════════════════
// COTIZACIONES
// ══════════════════════════════════════════════════════
function renderCotizaciones() {
  const q = vv('cot-q').toLowerCase(), fil = vv('cot-fil')
  const rows = DATA.cotizaciones.filter(r=>{
    const venc = r.estado !== 'aprobada' && r.estado !== 'rechazada' && r.vigencia < HOY ? 'vencida' : r.estado
    return (!q||r.cliente.toLowerCase().includes(q)||r.numero.toLowerCase().includes(q))&&(!fil||venc===fil)
  })
  document.getElementById('cot-tot').textContent = DATA.cotizaciones.length
  document.getElementById('cot-apr').textContent = DATA.cotizaciones.filter(c=>c.estado==='aprobada').length
  document.getElementById('cot-pend').textContent = DATA.cotizaciones.filter(c=>c.estado==='enviada').length
  document.getElementById('cot-monto').textContent = fmt(DATA.cotizaciones.filter(c=>c.estado==='aprobada').reduce((s,c)=>s+c.monto,0))
  document.getElementById('cot-tbody').innerHTML = rows.length===0
    ? `<tr><td colspan="8" class="empty">Sin cotizaciones</td></tr>`
    : rows.map(c=>{
      const venc = c.estado !== 'aprobada' && c.estado !== 'rechazada' && c.vigencia < HOY
      const est = venc ? 'vencida' : c.estado
      return `<tr onclick="editFila('cotizacion','${c.id}')">
        <td style="font-size:11px;color:var(--gris-s);font-weight:600">${c.numero}</td>
        <td style="font-weight:500">${c.cliente}</td>
        <td style="font-size:12px;color:var(--gris-m)">${c.descripcion}</td>
        <td style="font-size:11px;color:var(--gris-s)">${fd(c.fecha)}</td>
        <td style="font-size:11px;color:${venc?'var(--rosa-d)':'var(--gris-s)'}">${fd(c.vigencia)}</td>
        <td class="nbold">${fmt(c.monto)}</td>
        <td><span class="bdg ${bdg(est)}">${est}</span></td>
        <td><div style="display:flex;gap:4px">
          ${c.estado==='aprobada'?`<button class="btn-sm v" onclick="event.stopPropagation();cotToFactura('${c.id}')" title="Convertir a factura">→ Factura</button>`:''}
          <button class="btn-sm" onclick="event.stopPropagation();pdfCotizacion('${c.id}')" title="PDF">📄</button>
          <button class="btn-sm" onclick="event.stopPropagation();editFila('cotizacion','${c.id}')">✏</button>
          <button class="btn-sm" onclick="event.stopPropagation();del('cotizacion','${c.id}')">✕</button>
        </div></td>
      </tr>`}).join('')
}

function cotToFactura(id) {
  const c = DATA.cotizaciones.find(x=>x.id===id)
  if (!c) return
  if (!confirm(`¿Convertir cotización "${c.numero}" a factura?`)) return
  const nNum = 'F-2026-' + String(DATA.facturas.length + 25).padStart(3,'0')
  DATA.facturas.unshift({id:uid(),numero:nNum,cliente:c.cliente,servicio:c.descripcion,fecha_emision:HOY,fecha_vencimiento:d(30),monto:c.monto,estado:'borrador'})
  DATA.cotizaciones = DATA.cotizaciones.map(x=>x.id===id?{...x,estado:'aprobada'}:x)
  renderCotizaciones(); renderFacturas(); updAlertBadge()
  alert(`✓ Factura ${nNum} creada en estado Borrador`)
}

// ══════════════════════════════════════════════════════
// CLIENTES
// ══════════════════════════════════════════════════════
function renderClientes() {
  const q = vv('cli-q').toLowerCase()
  const rows = DATA.clientes.filter(r=>!q||r.nombre.toLowerCase().includes(q)||r.rfc?.toLowerCase().includes(q))
  document.getElementById('cli-grid').innerHTML = rows.length===0
    ? '<p class="empty">Sin clientes</p>'
    : rows.map(r=>{
      const facsCli = DATA.facturas.filter(f=>f.cliente===r.nombre)
      const totalFac = facsCli.reduce((s,f)=>s+f.monto,0)
      return `
      <div style="background:#fff;border:1px solid var(--borde);border-radius:12px;padding:20px;box-shadow:var(--sombra);cursor:pointer;transition:all .2s"
           onclick="verPerfilCliente('${r.id}')" onmouseover="this.style.borderColor='var(--rosa)'" onmouseout="this.style.borderColor='var(--borde)'">
        <div style="width:46px;height:46px;background:var(--rosa-p);border:1px solid var(--rosa-l);border-radius:12px;display:flex;align-items:center;justify-content:center;font-family:'Cormorant Garamond',serif;font-size:22px;color:var(--rosa-d);font-weight:600;margin-bottom:12px">${r.nombre[0]}</div>
        <div style="font-family:'Cormorant Garamond',serif;font-size:17px;font-weight:600;margin-bottom:2px">${r.nombre}</div>
        <div style="font-size:10px;color:var(--gris-s);letter-spacing:.5px;margin-bottom:6px">${r.rfc||'Sin RFC'}</div>
        <div style="font-size:11px;color:var(--gris-m);margin-bottom:2px">📂 ${r.giro||'—'}</div>
        <div style="font-size:11px;color:var(--gris-m);margin-bottom:2px">👤 ${r.contacto||'—'}</div>
        <div style="font-size:11px;color:var(--gris-m)">${r.email||'—'}</div>
        <div class="hr"></div>
        <div style="display:flex;justify-content:space-between;margin-bottom:10px">
          <span style="font-size:11px;color:var(--gris-s)">${facsCli.length} facturas</span>
          <span class="ap" style="font-size:12px;font-weight:600">${fmt(totalFac)}</span>
        </div>
        <div style="display:flex;gap:6px">
          <button class="btn btn-p" style="flex:1;padding:6px 0;font-size:11px" onclick="event.stopPropagation();verPerfilCliente('${r.id}')">Ver Perfil →</button>
          <button class="btn-sm" onclick="event.stopPropagation();del('cliente','${r.id}')">✕</button>
        </div>
      </div>`}).join('')
}

function verPerfilCliente(id) {
  const c = DATA.clientes.find(x=>x.id===id)
  if (!c) return
  document.getElementById('pc-av').textContent = c.nombre[0]
  document.getElementById('pc-nombre').textContent = c.nombre
  document.getElementById('pc-rfc').textContent = c.rfc || 'Sin RFC'
  document.getElementById('pc-giro').textContent = c.giro || ''
  document.getElementById('pc-contacto').textContent = c.contacto || '—'
  document.getElementById('pc-email').textContent = c.email || '—'
  const facs = DATA.facturas.filter(f=>f.cliente===c.nombre)
  const cots = DATA.cotizaciones.filter(ct=>ct.cliente===c.nombre)
  const totFac = facs.reduce((s,f)=>s+f.monto,0)
  const pend = facs.filter(f=>f.estado!=='pagado').reduce((s,f)=>s+f.monto,0)
  document.getElementById('pc-total-fac').textContent = fmt(totFac)
  document.getElementById('pc-n-fac').textContent = facs.length
  document.getElementById('pc-pendiente').textContent = fmt(pend)
  document.getElementById('pc-facs-body').innerHTML = facs.length===0
    ? '<tr><td colspan="6" class="empty">Sin facturas</td></tr>'
    : facs.map(f=>`<tr><td style="font-size:11px;color:var(--gris-s)">${f.numero}</td><td>${f.servicio}</td><td style="font-size:11px;color:var(--gris-s)">${fd(f.fecha_emision)}</td><td style="font-size:11px;color:${isVenc(f)?'var(--rosa-d)':'var(--gris-s)'}">${fd(f.fecha_vencimiento)}</td><td class="nbold">${fmt(f.monto)}</td><td><span class="bdg ${isVenc(f)?'pend':bdg(f.estado)}">${isVenc(f)?'vencida':f.estado}</span></td></tr>`).join('')
  document.getElementById('pc-cots-body').innerHTML = cots.length===0
    ? '<tr><td colspan="5" class="empty">Sin cotizaciones</td></tr>'
    : cots.map(ct=>`<tr><td style="font-size:11px;color:var(--gris-s)">${ct.numero}</td><td>${ct.descripcion}</td><td style="font-size:11px;color:var(--gris-s)">${fd(ct.fecha)}</td><td class="nbold">${fmt(ct.monto)}</td><td><span class="bdg ${bdg(ct.estado)}">${ct.estado}</span></td></tr>`).join('')
  go('perfil-cliente', null)
  document.getElementById('btn-acc').style.display = 'none'
}

// ══════════════════════════════════════════════════════
// CALENDARIO
// ══════════════════════════════════════════════════════
function renderCalendario() {
  const dias = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb']
  document.getElementById('cal-heads').innerHTML = dias.map(d=>`<div class="cal-head">${d}</div>`).join('')
  const titulo = new Date(calYear,calMonth,1).toLocaleDateString('es-MX',{month:'long',year:'numeric'})
  document.getElementById('cal-titulo').textContent = titulo.charAt(0).toUpperCase()+titulo.slice(1)

  const firstDay = new Date(calYear,calMonth,1).getDay()
  const daysInMonth = new Date(calYear,calMonth+1,0).getDate()
  const daysInPrev = new Date(calYear,calMonth,0).getDate()

  // Mapear eventos por día
  const eventos = {}
  const addEv = (fecha, tipo, label) => {
    if (!fecha || fecha === '—') return
    const d = fecha.split('T')[0]
    const [y,m2,day] = d.split('-').map(Number)
    if (y===calYear && m2-1===calMonth) {
      if (!eventos[day]) eventos[day]=[]
      eventos[day].push({tipo,label})
    }
  }
  DATA.facturas.forEach(f=>{ if(f.estado!=='pagado') addEv(f.fecha_vencimiento,'vence',`${f.numero} ${f.cliente}`) })
  DATA.ingresos.filter(r=>r.estado==='cobrado').forEach(r=>addEv(r.fecha,'cobro',r.cliente))
  DATA.gastos.forEach(g=>addEv(g.fecha,'pago',g.proveedor))
  Object.values(DATA.vacaciones).flat().filter(v=>v.estado==='aprobado').forEach(v=>{
    // marcar inicio y fin
    addEv(v.fecha_inicio,'vacas',v.empleado_nombre.split(' ')[0])
    addEv(v.fecha_fin,'vacas',v.empleado_nombre.split(' ')[0]+' (fin)')
  })

  let html = ''
  // Prev month days
  for (let i=0; i<firstDay; i++) {
    const day = daysInPrev - firstDay + i + 1
    html += `<div class="cal-day other"><div class="day-num">${day}</div></div>`
  }
  // Current month
  for (let day=1; day<=daysInMonth; day++) {
    const dateStr = `${calYear}-${String(calMonth+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`
    const isToday = dateStr === HOY
    const evs = eventos[day] || []
    html += `<div class="cal-day${isToday?' today':''}">
      <div class="day-num">${day}</div>
      ${evs.slice(0,2).map(e=>`<div class="cal-event ev-${e.tipo}" title="${e.label}">${e.label.substring(0,12)}…</div>`).join('')}
      ${evs.length>2?`<div style="font-size:9px;color:var(--gris-s);padding:1px 4px">+${evs.length-2} más</div>`:''}
    </div>`
  }
  // Next month fill
  const total = firstDay + daysInMonth
  const nextDays = total % 7 === 0 ? 0 : 7 - (total % 7)
  for (let i=1; i<=nextDays; i++) html += `<div class="cal-day other"><div class="day-num">${i}</div></div>`

  document.getElementById('cal-body').innerHTML = html
}

function calNav(dir) {
  calMonth += dir
  if (calMonth > 11) { calMonth = 0; calYear++ }
  if (calMonth < 0) { calMonth = 11; calYear-- }
  renderCalendario()
}

// ══════════════════════════════════════════════════════
// REPORTES
// ══════════════════════════════════════════════════════
function renderReportes() {
  const tI=DATA.ingresos.reduce((s,r)=>s+r.monto,0),tG=DATA.gastos.reduce((s,r)=>s+r.monto,0)
  const util=tI-tG,mar=tI>0?((util/tI)*100).toFixed(1):0
  document.getElementById('rep-ing').textContent=fmt(tI)
  document.getElementById('rep-gas').textContent=fmt(tG)
  document.getElementById('rep-util').textContent=fmt(util)
  document.getElementById('rep-mar').textContent=mar+'%'
  const fT=DATA.facturas.reduce((s,r)=>s+r.monto,0)
  const fP=DATA.facturas.filter(r=>r.estado==='pagado').reduce((s,r)=>s+r.monto,0)
  document.getElementById('rep-estado').innerHTML=`
    <div style="display:flex;justify-content:space-between;margin-bottom:12px"><span style="font-size:13px;color:var(--gris-m)">Ingresos Totales</span><span class="ap nbold">${fmt(tI)}</span></div>
    <div style="display:flex;justify-content:space-between;margin-bottom:12px"><span style="font-size:13px;color:var(--gris-m)">Gastos Totales</span><span class="an nbold">(${fmt(tG)})</span></div>
    <div class="hr"></div>
    <div style="display:flex;justify-content:space-between;margin-bottom:12px"><span style="font-family:'Cormorant Garamond',serif;font-size:17px;font-weight:600">Utilidad Neta</span><span style="font-family:'Cormorant Garamond',serif;font-size:17px;font-weight:600;color:${util>=0?'var(--verde)':'var(--rosa-d)'}">${fmt(util)}</span></div>
    <div style="display:flex;justify-content:space-between"><span style="font-size:13px;color:var(--gris-m)">Margen</span><span style="font-weight:600">${mar}%</span></div>`
  document.getElementById('rep-ind').innerHTML=`
    <div style="margin-bottom:14px"><div style="display:flex;justify-content:space-between;margin-bottom:5px"><span style="font-size:12px;color:var(--gris-m)">Facturación Cobrada</span><span style="font-size:12px;font-weight:600">${fmt(fP)}/${fmt(fT)}</span></div>
    <div class="prog-t"><div class="prog-f" style="width:${fT>0?fP/fT*100:0}%;background:var(--verde)"></div></div></div>
    <div style="margin-bottom:14px"><div style="display:flex;justify-content:space-between;margin-bottom:5px"><span style="font-size:12px;color:var(--gris-m)">Ratio Gastos/Ingresos</span><span style="font-size:12px;font-weight:600">${mar}%</span></div>
    <div class="prog-t"><div class="prog-f" style="width:${tI>0?Math.min(tG/tI*100,100):0}%;background:var(--rosa)"></div></div></div>
    <div class="hr"></div>
    <div style="display:flex;justify-content:space-between;margin-bottom:6px"><span style="font-size:13px;color:var(--gris-m)">Clientes</span><strong>${DATA.clientes.length}</strong></div>
    <div style="display:flex;justify-content:space-between;margin-bottom:6px"><span style="font-size:13px;color:var(--gris-m)">Cotizaciones aprobadas</span><strong class="ap">${DATA.cotizaciones.filter(c=>c.estado==='aprobada').length}</strong></div>
    <div style="display:flex;justify-content:space-between"><span style="font-size:13px;color:var(--gris-m)">Facturas vencidas</span><strong class="an">${DATA.facturas.filter(f=>isVenc(f)).length}</strong></div>`
  if (charts.line) charts.line.destroy()
  charts.line = new Chart(document.getElementById('ch-line').getContext('2d'),{
    type:'line',data:{labels:['Ene','Feb','Mar','Abr','May','Jun'],datasets:[
      {label:'Ingresos',data:[42000,38000,51000,46000,48250,0],borderColor:'var(--rosa)',backgroundColor:'rgba(232,144,154,.08)',tension:.4,fill:true,pointBackgroundColor:'var(--rosa)',pointRadius:5},
      {label:'Gastos',data:[18000,22000,19000,21000,18730,0],borderColor:'#3A3A3A',backgroundColor:'rgba(58,58,58,.04)',tension:.4,fill:true,pointBackgroundColor:'#3A3A3A',pointRadius:5}
    ]},
    options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'bottom',labels:{boxWidth:10,font:{size:11}}}},scales:{x:{grid:{display:false}},y:{grid:{color:'rgba(0,0,0,.04)'},ticks:{callback:v=>'$'+Number(v).toLocaleString('es-MX')}}}}
  })
}

// ══════════════════════════════════════════════════════
// RH RENDERS
// ══════════════════════════════════════════════════════
function renderEmpresasRH() {
  const q = vv('rhe-q').toLowerCase()
  const rows = DATA.empresasRH.filter(r=>!q||r.nombre.toLowerCase().includes(q))
  const totEmp = Object.values(DATA.empleados).flat().length
  const nomGlob = Object.values(DATA.nomina).flat().reduce((s,n)=>s+n.total_pago,0)
  document.getElementById('rhe-tot').textContent = DATA.empresasRH.length
  document.getElementById('rhe-emp').textContent = totEmp
  document.getElementById('rhe-nom').textContent = fmt(nomGlob)
  document.getElementById('rhe-grid').innerHTML = rows.map(r=>{
    const emps = DATA.empleados[r.id]||[]
    const nom = (DATA.nomina[r.id]||[]).reduce((s,n)=>s+n.total_pago,0)
    return `<div class="emp-card" onclick="selEmpresa(${JSON.stringify(r).replace(/"/g,'&quot;')})">
      <div class="emp-ico">🏢</div>
      <div style="font-family:'Cormorant Garamond',serif;font-size:17px;font-weight:600;margin-bottom:2px">${r.nombre}</div>
      <div style="font-size:10px;color:var(--gris-s);letter-spacing:.5px;margin-bottom:4px">${r.rfc||'Sin RFC'}</div>
      <div style="font-size:11px;color:var(--gris-m);margin-bottom:3px">📂 ${r.giro||'—'}</div>
      <div style="font-size:11px;color:var(--gris-m);margin-bottom:12px">👤 ${r.contacto||'—'}</div>
      <div class="hr"></div>
      <div style="display:flex;justify-content:space-between;margin-bottom:12px">
        <div><div style="font-size:9px;text-transform:uppercase;letter-spacing:1px;color:var(--gris-s)">Empleados</div><div class="nbold" style="font-size:22px">${emps.length}</div></div>
        <div style="text-align:right"><div style="font-size:9px;text-transform:uppercase;letter-spacing:1px;color:var(--gris-s)">Nómina</div><div style="font-size:13px;font-weight:600;color:var(--verde)">${fmt(nom)}</div></div>
      </div>
      <div style="display:flex;gap:7px">
        <button class="btn btn-p" style="flex:1;padding:7px 0;font-size:11px" onclick="event.stopPropagation();selEmpresa(${JSON.stringify(r).replace(/"/g,'&quot;')})">Ver RH →</button>
        <button class="btn-sm" onclick="event.stopPropagation();editFila('empresaRH','${r.id}')">✏</button>
        <button class="btn-sm" onclick="event.stopPropagation();del('empresaRH','${r.id}')">✕</button>
      </div>
    </div>`}).join('')
}

function renderEmpleados() {
  if (!empresaActiva) return
  const emps = DATA.empleados[empresaActiva.id]||[]
  const q = vv('emp-q').toLowerCase(), dep = vv('emp-dep')
  const rows = emps.filter(r=>(!q||r.nombre.toLowerCase().includes(q)||r.puesto.toLowerCase().includes(q))&&(!dep||r.departamento===dep))
  const activos = rows.filter(r=>r.estado==='activo')
  const vacHoy = (DATA.vacaciones[empresaActiva.id]||[]).filter(v=>v.estado==='aprobado'&&v.fecha_inicio<=HOY&&v.fecha_fin>=HOY).length
  document.getElementById('emp-tot').textContent = rows.length
  document.getElementById('emp-act').textContent = activos.length
  document.getElementById('emp-vac').textContent = vacHoy
  document.getElementById('emp-nom').textContent = fmt(activos.reduce((s,r)=>s+r.salario,0))
  const deps = [...new Set(emps.map(e=>e.departamento))]
  const depS = document.getElementById('emp-dep')
  const cur = depS.value
  depS.innerHTML = '<option value="">Todos los departamentos</option>'+deps.map(d=>`<option${d===cur?' selected':''}>${d}</option>`).join('')
  depS.value = cur
  document.getElementById('emp-tbody').innerHTML = rows.length===0
    ? `<tr><td colspan="8" class="empty">Sin empleados</td></tr>`
    : rows.map(r=>`<tr onclick="editFila('empleado','${r.id}')">
        <td><div style="font-weight:500">${r.nombre}</div><div style="font-size:10px;color:var(--gris-s)">${r.email||''}</div></td>
        <td class="muted">${r.puesto}</td>
        <td><span class="bdg bor">${r.departamento}</span></td>
        <td style="font-size:11px;color:var(--gris-s)">${fd(r.fecha_ingreso)}</td>
        <td class="ap nbold">${fmt(r.salario)}</td>
        <td><span class="bdg ${bdg(r.tipo_contrato)}">${r.tipo_contrato}</span></td>
        <td><span class="bdg ${bdg(r.estado)}">${r.estado}</span></td>
        <td><div style="display:flex;gap:4px">
          <button class="btn-sm" onclick="event.stopPropagation();pdfNominaEmp('${r.id}')" title="Recibo">📄</button>
          <button class="btn-sm" onclick="event.stopPropagation();editFila('empleado','${r.id}')">✏</button>
          <button class="btn-sm" onclick="event.stopPropagation();del('empleado','${r.id}')">✕</button>
        </div></td>
      </tr>`).join('')
}

function renderNomina() {
  if (!empresaActiva) return
  const noms = DATA.nomina[empresaActiva.id]||[]
  const q = vv('nom-q').toLowerCase(), mes = vv('nom-mes')
  const rows = noms.filter(r=>(!q||r.empleado_nombre.toLowerCase().includes(q))&&(!mes||r.periodo===mes))
  const tot = rows.reduce((s,r)=>s+r.total_pago,0)
  document.getElementById('nom-tot').textContent = fmt(tot)
  document.getElementById('nom-pag').textContent = rows.filter(r=>r.estado==='pagado').length
  document.getElementById('nom-pend').textContent = rows.filter(r=>r.estado==='pendiente').length
  document.getElementById('nom-tbody').innerHTML = rows.length===0
    ? `<tr><td colspan="8" class="empty">Sin nómina</td></tr>`
    : rows.map(r=>`<tr onclick="editFila('nomina','${r.id}')">
        <td style="font-weight:500">${r.empleado_nombre}</td>
        <td class="muted">${r.periodo}</td>
        <td>${fmt(r.salario_base)}</td>
        <td class="ap">+${fmt(r.bonos)}</td>
        <td class="an">-${fmt(r.deducciones)}</td>
        <td class="nbold" style="font-size:15px">${fmt(r.total_pago)}</td>
        <td><span class="bdg ${bdg(r.estado)}">${r.estado}</span></td>
        <td><div style="display:flex;gap:4px">
          <button class="btn-sm" onclick="event.stopPropagation();pdfNomina2('${r.id}')" title="PDF">📄</button>
          <button class="btn-sm" onclick="event.stopPropagation();editFila('nomina','${r.id}')">✏</button>
          <button class="btn-sm" onclick="event.stopPropagation();del('nomina','${r.id}')">✕</button>
        </div></td>
      </tr>`).join('')
}

function renderAsistencia() {
  if (!empresaActiva) return
  const asis = DATA.asistencia[empresaActiva.id]||[]
  const q = vv('asi-q').toLowerCase(), fecha = vv('asi-fecha')
  const rows = asis.filter(r=>(!q||r.empleado_nombre.toLowerCase().includes(q))&&(!fecha||r.fecha===fecha))
  const hoyR = asis.filter(r=>r.fecha===HOY)
  document.getElementById('asi-pre').textContent = hoyR.filter(r=>r.estado==='presente').length
  document.getElementById('asi-aus').textContent = hoyR.filter(r=>r.estado==='ausente').length
  document.getElementById('asi-ret').textContent = hoyR.filter(r=>r.estado==='retardo').length
  document.getElementById('asi-mes').textContent = asis.length
  document.getElementById('asi-tbody').innerHTML = rows.length===0
    ? `<tr><td colspan="8" class="empty">Sin asistencias</td></tr>`
    : rows.map(r=>{
      const horas = r.hora_entrada&&r.hora_salida&&r.hora_entrada!=='—'&&r.hora_salida!=='—'?
        (()=>{const[h1,m1]=r.hora_entrada.split(':').map(Number),[h2,m2]=r.hora_salida.split(':').map(Number);const diff=(h2*60+m2)-(h1*60+m1);return diff>0?`${Math.floor(diff/60)}h ${diff%60}m`:'—'})():'—'
      return `<tr onclick="editFila('asistencia','${r.id}')">
        <td style="font-weight:500">${r.empleado_nombre}</td>
        <td style="font-size:11px;color:var(--gris-s)">${fd(r.fecha)}</td>
        <td class="muted">${r.hora_entrada||'—'}</td><td class="muted">${r.hora_salida||'—'}</td>
        <td style="font-weight:600">${horas}</td>
        <td><span class="bdg ${bdg(r.estado)}">${r.estado}</span></td>
        <td style="font-size:11px;color:var(--gris-s)">${r.notas||''}</td>
        <td><div style="display:flex;gap:4px">
          <button class="btn-sm" onclick="event.stopPropagation();editFila('asistencia','${r.id}')">✏</button>
          <button class="btn-sm" onclick="event.stopPropagation();del('asistencia','${r.id}')">✕</button>
        </div></td>
      </tr>`}).join('')
}

function renderVacaciones() {
  if (!empresaActiva) return
  const vacs = DATA.vacaciones[empresaActiva.id]||[]
  const q = vv('vac-q').toLowerCase(), fil = vv('vac-fil')
  const rows = vacs.filter(r=>(!q||r.empleado_nombre.toLowerCase().includes(q))&&(!fil||r.estado===fil))
  document.getElementById('vac-tot').textContent = rows.length
  document.getElementById('vac-apr').textContent = rows.filter(r=>r.estado==='aprobado').length
  document.getElementById('vac-pend').textContent = rows.filter(r=>r.estado==='pendiente').length
  document.getElementById('vac-cur').textContent = rows.filter(r=>r.estado==='aprobado'&&r.fecha_inicio<=HOY&&r.fecha_fin>=HOY).length
  document.getElementById('vac-tbody').innerHTML = rows.length===0
    ? `<tr><td colspan="8" class="empty">Sin solicitudes</td></tr>`
    : rows.map(r=>{
      const dias = r.fecha_inicio&&r.fecha_fin?Math.round((new Date(r.fecha_fin)-new Date(r.fecha_inicio))/86400000)+1:'—'
      return `<tr onclick="editFila('vacacion','${r.id}')">
        <td style="font-weight:500">${r.empleado_nombre}</td>
        <td><span class="bdg bor">${r.tipo}</span></td>
        <td style="font-size:11px;color:var(--gris-s)">${fd(r.fecha_inicio)}</td>
        <td style="font-size:11px;color:var(--gris-s)">${fd(r.fecha_fin)}</td>
        <td class="nbold" style="text-align:center;font-size:18px">${dias}</td>
        <td style="font-size:11px;color:var(--gris-m)">${r.motivo||'—'}</td>
        <td><span class="bdg ${bdg(r.estado)}">${r.estado}</span></td>
        <td><div style="display:flex;gap:4px">
          ${r.estado==='pendiente'?`<button class="btn-sm v" onclick="event.stopPropagation();aprobar('${r.id}')">✓</button>`:''}
          <button class="btn-sm" onclick="event.stopPropagation();editFila('vacacion','${r.id}')">✏</button>
          <button class="btn-sm" onclick="event.stopPropagation();del('vacacion','${r.id}')">✕</button>
        </div></td>
      </tr>`}).join('')
}

function aprobar(id) {
  if (!empresaActiva) return
  DATA.vacaciones[empresaActiva.id] = DATA.vacaciones[empresaActiva.id].map(v=>v.id===id?{...v,estado:'aprobado'}:v)
  renderVacaciones()
}

function renderRHDashboard() {
  const emps = Object.values(DATA.empleados).flat()
  const noms = Object.values(DATA.nomina).flat()
  const vacs = Object.values(DATA.vacaciones).flat()
  const nomG = noms.reduce((s,n)=>s+n.total_pago,0)
  const vacHoy = vacs.filter(v=>v.estado==='aprobado'&&v.fecha_inicio<=HOY&&v.fecha_fin>=HOY).length
  document.getElementById('rhd-emp').textContent = DATA.empresasRH.length
  document.getElementById('rhd-tot').textContent = emps.length
  document.getElementById('rhd-nom').textContent = fmt(nomG)
  document.getElementById('rhd-vac').textContent = vacHoy
  document.getElementById('rhd-tabla').innerHTML = DATA.empresasRH.map(e=>{
    const ee = DATA.empleados[e.id]||[], nn = (DATA.nomina[e.id]||[]).reduce((s,n)=>s+n.total_pago,0)
    const vv2 = (DATA.vacaciones[e.id]||[]).filter(v=>v.estado==='aprobado'&&v.fecha_inicio<=HOY&&v.fecha_fin>=HOY).length
    const pend = (DATA.vacaciones[e.id]||[]).filter(v=>v.estado==='pendiente').length
    return `<tr onclick="selEmpresa(${JSON.stringify(e).replace(/"/g,'&quot;')})">
      <td style="font-weight:500">${e.nombre}</td>
      <td class="nbold" style="font-size:16px">${ee.length}</td>
      <td>${ee.filter(x=>x.estado==='activo').length}</td>
      <td class="ap">${fmt(nn)}</td>
      <td>${vv2}</td>
      <td>${pend>0?`<span class="bdg pend">${pend} pend.</span>`:'—'}</td>
    </tr>`}).join('')

  const empNombres = DATA.empresasRH.map(e=>e.nombre)
  const empCounts = DATA.empresasRH.map(e=>(DATA.empleados[e.id]||[]).length)
  const nomCounts = DATA.empresasRH.map(e=>(DATA.nomina[e.id]||[]).reduce((s,n)=>s+n.total_pago,0))
  const cols = ['#E8909A','#3A3A3A','#1A7A52']
  if (charts.rhEmp) charts.rhEmp.destroy()
  charts.rhEmp = new Chart(document.getElementById('ch-rh-emp').getContext('2d'),{
    type:'doughnut',data:{labels:empNombres,datasets:[{data:empCounts,backgroundColor:cols,borderWidth:0,hoverOffset:4}]},
    options:{responsive:true,maintainAspectRatio:false,cutout:'60%',plugins:{legend:{position:'bottom',labels:{boxWidth:8,font:{size:10}}}}}
  })
  if (charts.rhNom) charts.rhNom.destroy()
  charts.rhNom = new Chart(document.getElementById('ch-rh-nom').getContext('2d'),{
    type:'bar',data:{labels:empNombres,datasets:[{label:'Nómina',data:nomCounts,backgroundColor:cols,borderRadius:5,borderSkipped:false}]},
    options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{x:{grid:{display:false}},y:{ticks:{callback:v=>'$'+Number(v).toLocaleString('es-MX')}}}}
  })
}

// ══════════════════════════════════════════════════════
// CRUD
// ══════════════════════════════════════════════════════
function editFila(tipo, id) {
  const src={ingreso:'ingresos',gasto:'gastos',factura:'facturas',cotizacion:'cotizaciones',cliente:'clientes',empresaRH:'empresasRH'}
  const rh={empleado:'empleados',nomina:'nomina',asistencia:'asistencia',vacacion:'vacaciones'}
  let data = {}
  if (src[tipo]) data = DATA[src[tipo]].find(r=>r.id===id)||{}
  else if (rh[tipo]&&empresaActiva) data = (DATA[rh[tipo]][empresaActiva.id]||[]).find(r=>r.id===id)||{}
  openModal(tipo, data)
}

function del(tipo, id) {
  if (!confirm('¿Eliminar este registro?')) return
  const src={ingreso:'ingresos',gasto:'gastos',factura:'facturas',cotizacion:'cotizaciones',cliente:'clientes',empresaRH:'empresasRH'}
  const rh={empleado:'empleados',nomina:'nomina',asistencia:'asistencia',vacacion:'vacaciones'}
  if (src[tipo]) DATA[src[tipo]] = DATA[src[tipo]].filter(r=>r.id!==id)
  else if (rh[tipo]&&empresaActiva) DATA[rh[tipo]][empresaActiva.id] = DATA[rh[tipo]][empresaActiva.id].filter(r=>r.id!==id)
  updAlertBadge(); refresh()
}

function refresh() {
  const m={dashboard:renderDashboard,ingresos:renderIngresos,gastos:renderGastos,facturas:renderFacturas,cotizaciones:renderCotizaciones,clientes:renderClientes,reportes:renderReportes,alertas:renderAlertas,calendario:renderCalendario,'rh-empresas':renderEmpresasRH,'rh-empleados':renderEmpleados,'rh-nomina':renderNomina,'rh-asistencia':renderAsistencia,'rh-vacaciones':renderVacaciones,'rh-dashboard':renderRHDashboard,'docs-rrhh':initDocsRRHH}
  m[curPanel]?.()
}

// ══════════════════════════════════════════════════════
// PDF FACTURAS
// ══════════════════════════════════════════════════════
function pdfBase(doc) {
  // Logo en PDF
  try { doc.addImage('data:image/png;base64,'+LOGO_B64,'PNG',14,8,28,28) } catch(e){}
  return doc
}

function pdfFactura(id) {
  const f = DATA.facturas.find(r=>r.id===id); if(!f) return
  const cfg = {nombre:vv('cfg-nombre')||'Segura Contable',rfc:vv('cfg-rfc'),email:vv('cfg-email'),tel:vv('cfg-tel'),leyenda:vv('cfg-leyenda')||'Gracias por su confianza.',banco:vv('cfg-banco')}
  const {jsPDF} = window.jspdf; const doc = new jsPDF(); const W = doc.internal.pageSize.getWidth()
  // Header
  doc.setFillColor(58,58,58); doc.rect(0,0,W,40,'F')
  try { doc.addImage('data:image/png;base64,'+LOGO_B64,'PNG',14,6,28,28) } catch(e){}
  doc.setTextColor(255,255,255); doc.setFont('helvetica','bold'); doc.setFontSize(18); doc.text(cfg.nombre,48,18)
  doc.setFontSize(9); doc.setFont('helvetica','normal'); doc.setTextColor(242,184,192); doc.text('FACTURA DE SERVICIOS',48,27)
  doc.setTextColor(200,200,200); if(cfg.rfc) doc.text('RFC: '+cfg.rfc,W-14,18,{align:'right'}); if(cfg.email) doc.text(cfg.email,W-14,26,{align:'right'}); if(cfg.tel) doc.text(cfg.tel,W-14,33,{align:'right'})
  // Número
  doc.setFillColor(254,245,246); doc.rect(0,44,W,16,'F')
  doc.setTextColor(58,58,58); doc.setFont('helvetica','bold'); doc.setFontSize(13); doc.text(f.numero,14,55)
  doc.setFont('helvetica','normal'); doc.setFontSize(10); doc.setTextColor(130,130,130); doc.text(`Emisión: ${fd(f.fecha_emision)}   Vencimiento: ${fd(f.fecha_vencimiento)}`,W-14,55,{align:'right'})
  // Cliente
  doc.setTextColor(58,58,58); doc.setFont('helvetica','bold'); doc.setFontSize(10); doc.text('CLIENTE',14,74)
  doc.setFont('helvetica','normal'); doc.setFontSize(13); doc.text(f.cliente,14,83)
  const cli = DATA.clientes.find(c=>c.nombre===f.cliente)
  if(cli){doc.setFontSize(10);doc.setTextColor(130,130,130);if(cli.rfc)doc.text('RFC: '+cli.rfc,14,91);if(cli.email)doc.text(cli.email,14,98)}
  // Tabla
  doc.setFillColor(58,58,58); doc.rect(14,108,W-28,10,'F')
  doc.setTextColor(255,255,255); doc.setFont('helvetica','bold'); doc.setFontSize(9); doc.text('DESCRIPCIÓN DEL SERVICIO',18,115); doc.text('IMPORTE',W-18,115,{align:'right'})
  doc.setFillColor(250,250,253); doc.rect(14,118,W-28,22,'F')
  doc.setTextColor(58,58,58); doc.setFont('helvetica','normal'); doc.setFontSize(12); doc.text(f.servicio||'Servicios profesionales',18,131)
  doc.setFont('helvetica','bold'); doc.setFontSize(13); doc.text(fmt(f.monto),W-18,131,{align:'right'})
  // Total
  doc.setFillColor(58,58,58); doc.rect(W-82,145,68,20,'F')
  doc.setTextColor(255,255,255); doc.setFont('helvetica','bold'); doc.setFontSize(9); doc.text('TOTAL A PAGAR',W-48,153,{align:'center'}); doc.setFontSize(14); doc.text(fmt(f.monto),W-48,162,{align:'center'})
  // Estado
  const sc = f.estado==='pagado'?[26,122,82]:[201,104,120]
  doc.setFillColor(...sc); doc.roundedRect(14,145,52,20,3,3,'F')
  doc.setTextColor(255,255,255); doc.setFont('helvetica','bold'); doc.setFontSize(11); doc.text(f.estado.toUpperCase(),40,158,{align:'center'})
  // Banco
  if(cfg.banco){doc.setTextColor(130,130,130);doc.setFont('helvetica','bold');doc.setFontSize(8);doc.text('DATOS PARA PAGO',14,178);doc.setFont('helvetica','normal');cfg.banco.split('\n').forEach((l,i)=>doc.text(l,14,185+i*6))}
  // Pie
  doc.setFillColor(58,58,58); doc.rect(0,275,W,22,'F')
  doc.setTextColor(200,200,200); doc.setFont('helvetica','italic'); doc.setFontSize(9); doc.text(cfg.leyenda,W/2,284,{align:'center'}); doc.setTextColor(242,184,192); doc.text(cfg.nombre,W/2,291,{align:'center'})
  doc.save(`${f.numero}-${f.cliente.replace(/\s/g,'_')}.pdf`)
}

function pdfCotizacion(id) {
  const c = DATA.cotizaciones.find(x=>x.id===id); if(!c) return
  const cfg = {nombre:vv('cfg-nombre')||'Segura Contable',rfc:vv('cfg-rfc'),email:vv('cfg-email'),leyenda:vv('cfg-leyenda')||'Gracias por su confianza.'}
  const {jsPDF} = window.jspdf; const doc = new jsPDF(); const W = doc.internal.pageSize.getWidth()
  doc.setFillColor(58,58,58); doc.rect(0,0,W,40,'F')
  try { doc.addImage('data:image/png;base64,'+LOGO_B64,'PNG',14,6,28,28) } catch(e){}
  doc.setTextColor(255,255,255); doc.setFont('helvetica','bold'); doc.setFontSize(18); doc.text(cfg.nombre,48,18)
  doc.setFontSize(9); doc.setFont('helvetica','normal'); doc.setTextColor(242,184,192); doc.text('COTIZACIÓN DE SERVICIOS',48,27)
  doc.setTextColor(200,200,200); if(cfg.rfc) doc.text('RFC: '+cfg.rfc,W-14,18,{align:'right'}); if(cfg.email) doc.text(cfg.email,W-14,26,{align:'right'})
  doc.setFillColor(254,245,246); doc.rect(0,44,W,16,'F')
  doc.setTextColor(58,58,58); doc.setFont('helvetica','bold'); doc.setFontSize(13); doc.text(c.numero,14,55)
  doc.setFont('helvetica','normal'); doc.setFontSize(10); doc.setTextColor(130,130,130); doc.text(`Fecha: ${fd(c.fecha)}   Vigente hasta: ${fd(c.vigencia)}`,W-14,55,{align:'right'})
  doc.setTextColor(58,58,58); doc.setFont('helvetica','bold'); doc.setFontSize(10); doc.text('DIRIGIDO A',14,74); doc.setFont('helvetica','normal'); doc.setFontSize(13); doc.text(c.cliente,14,83)
  doc.setFont('helvetica','bold'); doc.setFontSize(11); doc.text(c.descripcion,14,93)
  // Items
  doc.setFillColor(58,58,58); doc.rect(14,102,W-28,10,'F')
  doc.setTextColor(255,255,255); doc.setFont('helvetica','bold'); doc.setFontSize(9); doc.text('SERVICIO',18,109); doc.text('CANT.',130,109); doc.text('P.UNIT.',160,109); doc.text('TOTAL',W-18,109,{align:'right'})
  let y = 118; let subtotal = 0
  ;(c.items||[]).forEach((item,i)=>{
    if(i%2===0){doc.setFillColor(250,250,253);doc.rect(14,y-6,W-28,13,'F')}
    doc.setTextColor(58,58,58); doc.setFont('helvetica','normal'); doc.setFontSize(10)
    doc.text(item.desc,18,y+1); doc.text(String(item.cant||1),130,y+1); doc.text(fmt(item.precio),160,y+1); doc.text(fmt((item.cant||1)*item.precio),W-18,y+1,{align:'right'})
    subtotal += (item.cant||1)*item.precio; y+=14
  })
  y+=4; doc.setFillColor(201,104,120); doc.rect(W-82,y,68,20,'F')
  doc.setTextColor(255,255,255); doc.setFont('helvetica','bold'); doc.setFontSize(9); doc.text('TOTAL COTIZACIÓN',W-48,y+8,{align:'center'}); doc.setFontSize(15); doc.text(fmt(c.monto),W-48,y+17,{align:'center'})
  doc.setFillColor(58,58,58); doc.rect(0,275,W,22,'F')
  doc.setTextColor(200,200,200); doc.setFont('helvetica','italic'); doc.setFontSize(9); doc.text('Esta cotización es válida hasta: '+fd(c.vigencia),W/2,284,{align:'center'}); doc.setTextColor(242,184,192); doc.text(cfg.nombre,W/2,291,{align:'center'})
  doc.save(`${c.numero}-${c.cliente.replace(/\s/g,'_')}.pdf`)
}

function pdfNominaEmp(empId) {
  if(!empresaActiva) return
  const emp = (DATA.empleados[empresaActiva.id]||[]).find(e=>e.id===empId); if(!emp) return
  const nom = (DATA.nomina[empresaActiva.id]||[]).find(n=>n.empleado_nombre===emp.nombre)
  if(!nom){alert('Sin nómina registrada para este empleado.'); return}
  pdfReciboNomina(emp,nom)
}
function pdfNomina2(nomId) {
  if(!empresaActiva) return
  const nom = (DATA.nomina[empresaActiva.id]||[]).find(n=>n.id===nomId); if(!nom) return
  const emp = (DATA.empleados[empresaActiva.id]||[]).find(e=>e.nombre===nom.empleado_nombre)||{nombre:nom.empleado_nombre,puesto:'',departamento:'',curp:'',nss:''}
  pdfReciboNomina(emp,nom)
}

function pdfReciboNomina(emp,nom) {
  const cfg = {nombre:vv('cfg-nombre')||'Segura Contable',rfc:vv('cfg-rfc')}
  const {jsPDF} = window.jspdf; const doc = new jsPDF(); const W = doc.internal.pageSize.getWidth()
  doc.setFillColor(58,58,58); doc.rect(0,0,W,38,'F')
  try { doc.addImage('data:image/png;base64,'+LOGO_B64,'PNG',14,5,28,28) } catch(e){}
  doc.setTextColor(255,255,255); doc.setFont('helvetica','bold'); doc.setFontSize(17); doc.text('RECIBO DE NÓMINA',48,17)
  doc.setFont('helvetica','normal'); doc.setFontSize(10); doc.setTextColor(242,184,192); doc.text(cfg.nombre,48,26)
  doc.setTextColor(200,200,200); doc.text(`Período: ${nom.periodo}   Pago: ${fd(nom.fecha_pago)}`,W-14,26,{align:'right'})
  // Empleado
  doc.setFillColor(254,245,246); doc.rect(14,44,W-28,32,'F')
  doc.setTextColor(130,130,130); doc.setFontSize(8); doc.setFont('helvetica','bold'); doc.text('EMPLEADO',18,52)
  doc.setTextColor(58,58,58); doc.setFont('helvetica','normal'); doc.setFontSize(13); doc.text(emp.nombre,18,61)
  doc.setFontSize(10); doc.setTextColor(130,130,130); doc.text(`${emp.puesto||'—'}  ·  ${emp.departamento||'—'}`,18,69)
  if(emp.curp) doc.text('CURP: '+emp.curp,18,76)
  if(emp.nss) doc.text('NSS: '+emp.nss,W/2,76)
  // Conceptos
  doc.setFillColor(58,58,58); doc.rect(14,82,W-28,10,'F')
  doc.setTextColor(255,255,255); doc.setFont('helvetica','bold'); doc.setFontSize(9); doc.text('CONCEPTO',18,89); doc.text('IMPORTE',W-18,89,{align:'right'})
  const conc=[['Salario Base',nom.salario_base,'pos'],['Bonos / Horas extra',nom.bonos,'pos'],['IMSS cuota obrera',-(nom.deducciones*.55),'neg'],['ISR retenido',-(nom.deducciones*.45),'neg']]
  let y=99; conc.forEach((c,i)=>{
    if(i%2===0){doc.setFillColor(250,250,253);doc.rect(14,y-6,W-28,13,'F')}
    doc.setTextColor(58,58,58); doc.setFont('helvetica','normal'); doc.setFontSize(10); doc.text(c[0],18,y+1)
    doc.setTextColor(c[2]==='pos'?26:201,c[2]==='pos'?122:104,c[2]==='pos'?82:120); doc.setFont('helvetica','bold')
    doc.text(`${c[1]>=0?'+':'-'}${fmt(Math.abs(c[1]))}`,W-18,y+1,{align:'right'}); y+=14
  })
  y+=6; doc.setFillColor(26,122,82); doc.rect(14,y,W-28,22,'F')
  doc.setTextColor(255,255,255); doc.setFont('helvetica','bold'); doc.setFontSize(11); doc.text('TOTAL NETO A PAGAR',18,y+9); doc.setFontSize(18); doc.text(fmt(nom.total_pago),W-18,y+15,{align:'right'})
  y+=35; doc.setDrawColor(200,200,220); doc.line(14,y+25,90,y+25); doc.line(W-90,y+25,W-14,y+25)
  doc.setTextColor(160,160,180); doc.setFont('helvetica','normal'); doc.setFontSize(9); doc.text('Firma del Empleado',52,y+32,{align:'center'}); doc.text('Firma del Empleador',W-52,y+32,{align:'center'})
  doc.setFillColor(58,58,58); doc.rect(0,280,W,17,'F')
  doc.setTextColor(200,200,200); doc.setFontSize(8); doc.text(`${cfg.nombre}  ·  Emitido el ${fd(HOY)}`,W/2,290,{align:'center'})
  doc.save(`Nomina_${emp.nombre.replace(/\s/g,'_')}_${nom.periodo}.pdf`)
}

// ══════════════════════════════════════════════════════
// EXCEL
// ══════════════════════════════════════════════════════
function exportTabla(tipo) {
  let headers, data, nombre
  if(tipo==='ingresos'){headers=['Descripción','Cliente','Categoría','Fecha','Monto','Estado'];data=DATA.ingresos.map(r=>[r.descripcion,r.cliente,r.categoria,r.fecha,r.monto,r.estado]);nombre='Ingresos'}
  else if(tipo==='gastos'){headers=['Descripción','Proveedor','Categoría','Fecha','Monto'];data=DATA.gastos.map(r=>[r.descripcion,r.proveedor,r.categoria,r.fecha,r.monto]);nombre='Gastos'}
  else if(tipo==='facturas'){headers=['No.','Cliente','Servicio','Emisión','Vencimiento','Monto','Estado'];data=DATA.facturas.map(r=>[r.numero,r.cliente,r.servicio,r.fecha_emision,r.fecha_vencimiento,r.monto,r.estado]);nombre='Facturas'}
  else if(tipo==='cotizaciones'){headers=['No.','Cliente','Descripción','Fecha','Vigencia','Monto','Estado'];data=DATA.cotizaciones.map(r=>[r.numero,r.cliente,r.descripcion,r.fecha,r.vigencia,r.monto,r.estado]);nombre='Cotizaciones'}
  else if(tipo==='clientes'){headers=['Nombre','RFC','Correo','Teléfono','Giro','Contacto'];data=DATA.clientes.map(r=>[r.nombre,r.rfc,r.email,r.telefono,r.giro,r.contacto]);nombre='Clientes'}
  else if(tipo==='empleados'&&empresaActiva){headers=['Nombre','Puesto','Depto','Ingreso','Salario','Contrato','CURP','NSS','Estado'];data=(DATA.empleados[empresaActiva.id]||[]).map(r=>[r.nombre,r.puesto,r.departamento,r.fecha_ingreso,r.salario,r.tipo_contrato,r.curp,r.nss,r.estado]);nombre='Empleados_'+empresaActiva.nombre}
  else if(tipo==='nomina'&&empresaActiva){headers=['Empleado','Período','Fecha Pago','Salario Base','Bonos','Deducciones','Total Neto','Estado'];data=(DATA.nomina[empresaActiva.id]||[]).map(r=>[r.empleado_nombre,r.periodo,r.fecha_pago,r.salario_base,r.bonos,r.deducciones,r.total_pago,r.estado]);nombre='Nomina_'+empresaActiva.nombre}
  else{alert('Sin datos para exportar');return}
  const wb=XLSX.utils.book_new(),ws=XLSX.utils.aoa_to_sheet([headers,...data])
  XLSX.utils.book_append_sheet(wb,ws,nombre.slice(0,31))
  XLSX.writeFile(wb,`${nombre}_${HOY}.xlsx`)
}

function exportReporte() {
  const tI=DATA.ingresos.reduce((s,r)=>s+r.monto,0),tG=DATA.gastos.reduce((s,r)=>s+r.monto,0)
  const wb=XLSX.utils.book_new()
  const wsR=XLSX.utils.aoa_to_sheet([[vv('cfg-nombre')||'Segura Contable'],['Reporte al '+fd(HOY)],[],['ESTADO DE RESULTADOS'],['Ingresos',tI],['Gastos',tG],['Utilidad',tI-tG],['Margen',((tI>0?(tI-tG)/tI:0)*100).toFixed(1)+'%']])
  XLSX.utils.book_append_sheet(wb,wsR,'Resumen')
  XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet([['Descripción','Cliente','Categoría','Fecha','Monto','Estado'],...DATA.ingresos.map(r=>[r.descripcion,r.cliente,r.categoria,r.fecha,r.monto,r.estado])]),'Ingresos')
  XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet([['Descripción','Proveedor','Categoría','Fecha','Monto'],...DATA.gastos.map(r=>[r.descripcion,r.proveedor,r.categoria,r.fecha,r.monto])]),'Gastos')
  XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet([['No.','Cliente','Servicio','Emisión','Vencimiento','Monto','Estado'],...DATA.facturas.map(r=>[r.numero,r.cliente,r.servicio,r.fecha_emision,r.fecha_vencimiento,r.monto,r.estado])]),'Facturas')
  XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet([['No.','Cliente','Descripción','Fecha','Vigencia','Monto','Estado'],...DATA.cotizaciones.map(r=>[r.numero,r.cliente,r.descripcion,r.fecha,r.vigencia,r.monto,r.estado])]),'Cotizaciones')
  XLSX.writeFile(wb,`Reporte_Completo_${HOY}.xlsx`)
}

// ══════════════════════════════════════════════════════
// MODALES — FORMS
// ══════════════════════════════════════════════════════
const CAT_I=['Servicios Contables','Asesoría Fiscal','Auditoría','Nómina','Consultoría','Otro']
const CAT_G=['Nómina','Renta','Servicios','Operativos','Tecnología','Marketing','Impuestos','Otro']
const cliList = () => `<datalist id="dlist-cli">${DATA.clientes.map(c=>`<option value="${c.nombre}">`).join('')}</datalist>`

const FORMS = {
  ingreso:(d={})=>({title:d.id?'Editar Ingreso':'Nuevo Ingreso',
    html:`<div class="fg">${cliList()}
      <div class="fg-grp full"><label class="fg-lbl">Descripción *</label><input class="fi" id="f-desc" value="${d.descripcion||''}" placeholder="Ej. Asesoría contable mensual"></div>
      <div class="fg-grp"><label class="fg-lbl">Cliente</label><input class="fi" id="f-cli" value="${d.cliente||''}" list="dlist-cli"></div>
      <div class="fg-grp"><label class="fg-lbl">Monto</label><input class="fi" id="f-monto" type="number" value="${d.monto||''}"></div>
      <div class="fg-grp"><label class="fg-lbl">Fecha</label><input class="fi" id="f-fecha" type="date" value="${d.fecha||HOY}"></div>
      <div class="fg-grp"><label class="fg-lbl">Categoría</label><select class="fi" id="f-cat">${CAT_I.map(c=>`<option${d.categoria===c?' selected':''}>${c}</option>`).join('')}</select></div>
      <div class="fg-grp"><label class="fg-lbl">Estado</label><select class="fi" id="f-est"><option value="cobrado"${d.estado==='cobrado'?' selected':''}>Cobrado</option><option value="pendiente"${d.estado==='pendiente'?' selected':''}>Pendiente</option><option value="borrador">Borrador</option></select></div>
    </div>`,
    save:()=>{const p={id:d.id||uid(),descripcion:vv('f-desc'),cliente:vv('f-cli'),monto:parseFloat(vv('f-monto'))||0,fecha:vv('f-fecha'),categoria:vv('f-cat'),estado:vv('f-est')};if(!p.descripcion)return showMsg('ing-msg','err','Descripción requerida');if(d.id)DATA.ingresos=DATA.ingresos.map(r=>r.id===d.id?p:r);else DATA.ingresos.unshift(p);cerrarModal();renderIngresos()}
  }),
  gasto:(d={})=>({title:d.id?'Editar Gasto':'Nuevo Gasto',
    html:`<div class="fg">
      <div class="fg-grp full"><label class="fg-lbl">Descripción *</label><input class="fi" id="f-desc" value="${d.descripcion||''}"></div>
      <div class="fg-grp"><label class="fg-lbl">Proveedor</label><input class="fi" id="f-prov" value="${d.proveedor||''}"></div>
      <div class="fg-grp"><label class="fg-lbl">Monto</label><input class="fi" id="f-monto" type="number" value="${d.monto||''}"></div>
      <div class="fg-grp"><label class="fg-lbl">Fecha</label><input class="fi" id="f-fecha" type="date" value="${d.fecha||HOY}"></div>
      <div class="fg-grp full"><label class="fg-lbl">Categoría</label><select class="fi" id="f-cat">${CAT_G.map(c=>`<option${d.categoria===c?' selected':''}>${c}</option>`).join('')}</select></div>
    </div>`,
    save:()=>{const p={id:d.id||uid(),descripcion:vv('f-desc'),proveedor:vv('f-prov'),monto:parseFloat(vv('f-monto'))||0,fecha:vv('f-fecha'),categoria:vv('f-cat')};if(!p.descripcion)return showMsg('gas-msg','err','Descripción requerida');if(d.id)DATA.gastos=DATA.gastos.map(r=>r.id===d.id?p:r);else DATA.gastos.unshift(p);cerrarModal();renderGastos()}
  }),
  factura:(d={})=>({title:d.id?'Editar Factura':'Nueva Factura',
    html:`<div class="fg">${cliList()}
      <div class="fg-grp"><label class="fg-lbl">No. Factura</label><input class="fi" id="f-num" value="${d.numero||''}" placeholder="F-2026-025"></div>
      <div class="fg-grp"><label class="fg-lbl">Cliente *</label><input class="fi" id="f-cli" value="${d.cliente||''}" list="dlist-cli"></div>
      <div class="fg-grp full"><label class="fg-lbl">Servicio</label><input class="fi" id="f-srv" value="${d.servicio||''}"></div>
      <div class="fg-grp"><label class="fg-lbl">Monto</label><input class="fi" id="f-monto" type="number" value="${d.monto||''}"></div>
      <div class="fg-grp"><label class="fg-lbl">Estado</label><select class="fi" id="f-est"><option value="borrador"${d.estado==='borrador'?' selected':''}>Borrador</option><option value="pendiente"${d.estado==='pendiente'?' selected':''}>Pendiente</option><option value="pagado"${d.estado==='pagado'?' selected':''}>Pagado</option></select></div>
      <div class="fg-grp"><label class="fg-lbl">Fecha Emisión</label><input class="fi" id="f-fem" type="date" value="${d.fecha_emision||HOY}"></div>
      <div class="fg-grp"><label class="fg-lbl">Fecha Vencimiento</label><input class="fi" id="f-fven" type="date" value="${d.fecha_vencimiento||''}"></div>
    </div>`,
    save:()=>{const p={id:d.id||uid(),numero:vv('f-num'),cliente:vv('f-cli'),servicio:vv('f-srv'),monto:parseFloat(vv('f-monto'))||0,estado:vv('f-est'),fecha_emision:vv('f-fem'),fecha_vencimiento:vv('f-fven')};if(!p.cliente)return showMsg('fac-msg','err','Cliente requerido');if(d.id)DATA.facturas=DATA.facturas.map(r=>r.id===d.id?p:r);else DATA.facturas.unshift(p);cerrarModal();renderFacturas();updAlertBadge()}
  }),
  cotizacion:(d={})=>({title:d.id?'Editar Cotización':'Nueva Cotización',
    html:`<div class="fg">${cliList()}
      <div class="fg-grp"><label class="fg-lbl">No. Cotización</label><input class="fi" id="f-num" value="${d.numero||''}" placeholder="COT-2026-013"></div>
      <div class="fg-grp"><label class="fg-lbl">Cliente *</label><input class="fi" id="f-cli" value="${d.cliente||''}" list="dlist-cli"></div>
      <div class="fg-grp full"><label class="fg-lbl">Descripción del servicio</label><input class="fi" id="f-desc" value="${d.descripcion||''}"></div>
      <div class="fg-grp"><label class="fg-lbl">Monto Total</label><input class="fi" id="f-monto" type="number" value="${d.monto||''}"></div>
      <div class="fg-grp"><label class="fg-lbl">Estado</label><select class="fi" id="f-est"><option value="borrador"${d.estado==='borrador'||!d.estado?' selected':''}>Borrador</option><option value="enviada"${d.estado==='enviada'?' selected':''}>Enviada</option><option value="aprobada"${d.estado==='aprobada'?' selected':''}>Aprobada</option><option value="rechazada"${d.estado==='rechazada'?' selected':''}>Rechazada</option></select></div>
      <div class="fg-grp"><label class="fg-lbl">Fecha</label><input class="fi" id="f-fecha" type="date" value="${d.fecha||HOY}"></div>
      <div class="fg-grp"><label class="fg-lbl">Vigencia hasta</label><input class="fi" id="f-vig" type="date" value="${d.vigencia||d(30)}"></div>
    </div>`,
    save:()=>{const p={id:d.id||uid(),numero:vv('f-num'),cliente:vv('f-cli'),descripcion:vv('f-desc'),monto:parseFloat(vv('f-monto'))||0,estado:vv('f-est'),fecha:vv('f-fecha'),vigencia:vv('f-vig'),items:d.items||[]};if(!p.cliente)return showMsg('cot-msg','err','Cliente requerido');if(d.id)DATA.cotizaciones=DATA.cotizaciones.map(r=>r.id===d.id?p:r);else DATA.cotizaciones.unshift(p);cerrarModal();renderCotizaciones()}
  }),
  cliente:(d={})=>({title:d.id?'Editar Cliente':'Nuevo Cliente',
    html:`<div class="fg">
      <div class="fg-grp full"><label class="fg-lbl">Nombre / Razón Social *</label><input class="fi" id="f-nom" value="${d.nombre||''}"></div>
      <div class="fg-grp"><label class="fg-lbl">RFC</label><input class="fi" id="f-rfc" value="${d.rfc||''}"></div>
      <div class="fg-grp"><label class="fg-lbl">Teléfono</label><input class="fi" id="f-tel" value="${d.telefono||''}"></div>
      <div class="fg-grp full"><label class="fg-lbl">Correo</label><input class="fi" id="f-email" type="email" value="${d.email||''}"></div>
      <div class="fg-grp"><label class="fg-lbl">Giro</label><input class="fi" id="f-giro" value="${d.giro||''}"></div>
      <div class="fg-grp"><label class="fg-lbl">Contacto</label><input class="fi" id="f-contacto" value="${d.contacto||''}"></div>
    </div>`,
    save:()=>{const p={id:d.id||uid(),nombre:vv('f-nom'),rfc:vv('f-rfc'),telefono:vv('f-tel'),email:vv('f-email'),giro:vv('f-giro'),contacto:vv('f-contacto')};if(!p.nombre)return showMsg('cli-msg','err','Nombre requerido');if(d.id)DATA.clientes=DATA.clientes.map(r=>r.id===d.id?p:r);else DATA.clientes.unshift(p);cerrarModal();renderClientes()}
  }),
  empresaRH:(d={})=>({title:d.id?'Editar Empresa':'Nueva Empresa RH',
    html:`<div class="fg">
      <div class="fg-grp full"><label class="fg-lbl">Nombre *</label><input class="fi" id="f-nom" value="${d.nombre||''}"></div>
      <div class="fg-grp"><label class="fg-lbl">RFC</label><input class="fi" id="f-rfc" value="${d.rfc||''}"></div>
      <div class="fg-grp"><label class="fg-lbl">Giro</label><input class="fi" id="f-giro" value="${d.giro||''}"></div>
      <div class="fg-grp"><label class="fg-lbl">Teléfono</label><input class="fi" id="f-tel" value="${d.telefono||''}"></div>
      <div class="fg-grp full"><label class="fg-lbl">Contacto RH</label><input class="fi" id="f-contacto" value="${d.contacto||''}"></div>
    </div>`,
    save:()=>{const p={id:d.id||uid(),nombre:vv('f-nom'),rfc:vv('f-rfc'),giro:vv('f-giro'),telefono:vv('f-tel'),contacto:vv('f-contacto')};if(!p.nombre)return showMsg('rhe-msg','err','Nombre requerido');if(d.id){DATA.empresasRH=DATA.empresasRH.map(r=>r.id===d.id?p:r)}else{DATA.empresasRH.unshift(p);DATA.empleados[p.id]=[];DATA.nomina[p.id]=[];DATA.asistencia[p.id]=[];DATA.vacaciones[p.id]=[]};cerrarModal();renderEmpresasRH()}
  }),
  empleado:(d={})=>({title:d.id?'Editar Empleado':'Nuevo Empleado',
    html:`<div class="fg">
      <div class="fg-grp full"><label class="fg-lbl">Nombre Completo *</label><input class="fi" id="f-nom" value="${d.nombre||''}"></div>
      <div class="fg-grp"><label class="fg-lbl">Puesto</label><input class="fi" id="f-puesto" value="${d.puesto||''}"></div>
      <div class="fg-grp"><label class="fg-lbl">Departamento</label><input class="fi" id="f-dep" value="${d.departamento||''}"></div>
      <div class="fg-grp"><label class="fg-lbl">Salario Mensual</label><input class="fi" id="f-sal" type="number" value="${d.salario||''}"></div>
      <div class="fg-grp"><label class="fg-lbl">Fecha Ingreso</label><input class="fi" id="f-ing" type="date" value="${d.fecha_ingreso||HOY}"></div>
      <div class="fg-grp"><label class="fg-lbl">Tipo Contrato</label><select class="fi" id="f-cont"><option${d.tipo_contrato==='indefinido'?' selected':''}>indefinido</option><option${d.tipo_contrato==='temporal'?' selected':''}>temporal</option><option${d.tipo_contrato==='honorarios'?' selected':''}>honorarios</option></select></div>
      <div class="fg-grp"><label class="fg-lbl">CURP</label><input class="fi" id="f-curp" value="${d.curp||''}"></div>
      <div class="fg-grp"><label class="fg-lbl">NSS</label><input class="fi" id="f-nss" value="${d.nss||''}"></div>
      <div class="fg-grp"><label class="fg-lbl">Correo</label><input class="fi" id="f-email" value="${d.email||''}"></div>
      <div class="fg-grp"><label class="fg-lbl">Estado</label><select class="fi" id="f-est"><option value="activo"${d.estado!=='inactivo'&&d.estado!=='baja'?' selected':''}>Activo</option><option value="inactivo"${d.estado==='inactivo'?' selected':''}>Inactivo</option><option value="baja"${d.estado==='baja'?' selected':''}>Baja</option></select></div>
    </div>`,
    save:()=>{const p={id:d.id||uid(),nombre:vv('f-nom'),puesto:vv('f-puesto'),departamento:vv('f-dep'),salario:parseFloat(vv('f-sal'))||0,fecha_ingreso:vv('f-ing'),tipo_contrato:vv('f-cont'),curp:vv('f-curp'),nss:vv('f-nss'),email:vv('f-email'),estado:vv('f-est')};if(!p.nombre)return showMsg('emp-msg','err','Nombre requerido');if(!DATA.empleados[empresaActiva.id])DATA.empleados[empresaActiva.id]=[];if(d.id)DATA.empleados[empresaActiva.id]=DATA.empleados[empresaActiva.id].map(r=>r.id===d.id?p:r);else DATA.empleados[empresaActiva.id].unshift(p);cerrarModal();renderEmpleados()}
  }),
  nomina:(d={})=>({title:d.id?'Editar Nómina':'Registrar Pago',
    html:`<div class="fg">
      <div class="fg-grp full"><label class="fg-lbl">Empleado *</label><select class="fi" id="f-emp">${(DATA.empleados[empresaActiva?.id]||[]).map(e=>`<option value="${e.nombre}"${d.empleado_nombre===e.nombre?' selected':''}>${e.nombre}</option>`).join('')}</select></div>
      <div class="fg-grp"><label class="fg-lbl">Período (AAAA-MM)</label><input class="fi" id="f-periodo" value="${d.periodo||new Date().toISOString().slice(0,7)}"></div>
      <div class="fg-grp"><label class="fg-lbl">Fecha Pago</label><input class="fi" id="f-fecha" type="date" value="${d.fecha_pago||HOY}"></div>
      <div class="fg-grp"><label class="fg-lbl">Salario Base</label><input class="fi" id="f-sal" type="number" value="${d.salario_base||''}" oninput="calcN()"></div>
      <div class="fg-grp"><label class="fg-lbl">Bonos</label><input class="fi" id="f-bonos" type="number" value="${d.bonos||0}" oninput="calcN()"></div>
      <div class="fg-grp"><label class="fg-lbl">Deducciones</label><input class="fi" id="f-deduc" type="number" value="${d.deducciones||0}" oninput="calcN()"></div>
      <div class="fg-grp full"><label class="fg-lbl">Total Neto</label><input class="fi" id="f-total" type="number" value="${d.total_pago||''}" style="font-weight:700;color:var(--verde)"></div>
      <div class="fg-grp full"><label class="fg-lbl">Estado</label><select class="fi" id="f-est"><option value="pendiente"${d.estado!=='pagado'?' selected':''}>Pendiente</option><option value="pagado"${d.estado==='pagado'?' selected':''}>Pagado</option></select></div>
    </div>`,
    save:()=>{const eN=document.getElementById('f-emp')?.options[document.getElementById('f-emp').selectedIndex]?.value||'';const p={id:d.id||uid(),empleado_nombre:eN,periodo:vv('f-periodo'),fecha_pago:vv('f-fecha'),salario_base:parseFloat(vv('f-sal'))||0,bonos:parseFloat(vv('f-bonos'))||0,deducciones:parseFloat(vv('f-deduc'))||0,total_pago:parseFloat(vv('f-total'))||0,estado:vv('f-est')};if(!p.empleado_nombre)return showMsg('nom-msg','err','Selecciona empleado');if(!DATA.nomina[empresaActiva.id])DATA.nomina[empresaActiva.id]=[];if(d.id)DATA.nomina[empresaActiva.id]=DATA.nomina[empresaActiva.id].map(r=>r.id===d.id?p:r);else DATA.nomina[empresaActiva.id].unshift(p);cerrarModal();renderNomina()}
  }),
  asistencia:(d={})=>({title:d.id?'Editar Asistencia':'Registrar Asistencia',
    html:`<div class="fg">
      <div class="fg-grp full"><label class="fg-lbl">Empleado *</label><select class="fi" id="f-emp">${(DATA.empleados[empresaActiva?.id]||[]).map(e=>`<option value="${e.nombre}"${d.empleado_nombre===e.nombre?' selected':''}>${e.nombre}</option>`).join('')}</select></div>
      <div class="fg-grp"><label class="fg-lbl">Fecha</label><input class="fi" id="f-fecha" type="date" value="${d.fecha||HOY}"></div>
      <div class="fg-grp"><label class="fg-lbl">Estado</label><select class="fi" id="f-est"><option value="presente"${d.estado==='presente'||!d.estado?' selected':''}>Presente</option><option value="ausente"${d.estado==='ausente'?' selected':''}>Ausente</option><option value="retardo"${d.estado==='retardo'?' selected':''}>Retardo</option><option value="permiso"${d.estado==='permiso'?' selected':''}>Permiso</option></select></div>
      <div class="fg-grp"><label class="fg-lbl">Hora Entrada</label><input class="fi" id="f-ent" type="time" value="${d.hora_entrada!=='—'?d.hora_entrada||'09:00':'09:00'}"></div>
      <div class="fg-grp"><label class="fg-lbl">Hora Salida</label><input class="fi" id="f-sal" type="time" value="${d.hora_salida!=='—'?d.hora_salida||'18:00':'18:00'}"></div>
      <div class="fg-grp full"><label class="fg-lbl">Notas</label><input class="fi" id="f-notas" value="${d.notas||''}"></div>
    </div>`,
    save:()=>{const eN=document.getElementById('f-emp')?.options[document.getElementById('f-emp').selectedIndex]?.value||'';const p={id:d.id||uid(),empleado_nombre:eN,fecha:vv('f-fecha'),estado:vv('f-est'),hora_entrada:vv('f-ent'),hora_salida:vv('f-sal'),notas:vv('f-notas')};if(!DATA.asistencia[empresaActiva.id])DATA.asistencia[empresaActiva.id]=[];if(d.id)DATA.asistencia[empresaActiva.id]=DATA.asistencia[empresaActiva.id].map(r=>r.id===d.id?p:r);else DATA.asistencia[empresaActiva.id].unshift(p);cerrarModal();renderAsistencia()}
  }),
  vacacion:(d={})=>({title:d.id?'Editar Solicitud':'Nueva Solicitud de Vacaciones',
    html:`<div class="fg">
      <div class="fg-grp full"><label class="fg-lbl">Empleado *</label><select class="fi" id="f-emp">${(DATA.empleados[empresaActiva?.id]||[]).map(e=>`<option value="${e.nombre}"${d.empleado_nombre===e.nombre?' selected':''}>${e.nombre}</option>`).join('')}</select></div>
      <div class="fg-grp"><label class="fg-lbl">Fecha Inicio</label><input class="fi" id="f-ini" type="date" value="${d.fecha_inicio||HOY}"></div>
      <div class="fg-grp"><label class="fg-lbl">Fecha Fin</label><input class="fi" id="f-fin" type="date" value="${d.fecha_fin||HOY}"></div>
      <div class="fg-grp"><label class="fg-lbl">Tipo</label><select class="fi" id="f-tipo"><option${d.tipo==='vacaciones'||!d.tipo?' selected':''}>vacaciones</option><option${d.tipo==='permiso'?' selected':''}>permiso</option><option${d.tipo==='incapacidad'?' selected':''}>incapacidad</option></select></div>
      <div class="fg-grp"><label class="fg-lbl">Estado</label><select class="fi" id="f-est"><option value="pendiente"${!d.estado||d.estado==='pendiente'?' selected':''}>Pendiente</option><option value="aprobado"${d.estado==='aprobado'?' selected':''}>Aprobado</option><option value="rechazado"${d.estado==='rechazado'?' selected':''}>Rechazado</option></select></div>
      <div class="fg-grp full"><label class="fg-lbl">Motivo</label><input class="fi" id="f-mot" value="${d.motivo||''}"></div>
    </div>`,
    save:()=>{const eN=document.getElementById('f-emp')?.options[document.getElementById('f-emp').selectedIndex]?.value||'';const p={id:d.id||uid(),empleado_nombre:eN,fecha_inicio:vv('f-ini'),fecha_fin:vv('f-fin'),tipo:vv('f-tipo'),estado:vv('f-est'),motivo:vv('f-mot')};if(!DATA.vacaciones[empresaActiva.id])DATA.vacaciones[empresaActiva.id]=[];if(d.id)DATA.vacaciones[empresaActiva.id]=DATA.vacaciones[empresaActiva.id].map(r=>r.id===d.id?p:r);else DATA.vacaciones[empresaActiva.id].unshift(p);cerrarModal();renderVacaciones()}
  }),
}

function calcN(){const b=parseFloat(document.getElementById('f-sal')?.value)||0,bn=parseFloat(document.getElementById('f-bonos')?.value)||0,dc=parseFloat(document.getElementById('f-deduc')?.value)||0,t=document.getElementById('f-total');if(t)t.value=(b+bn-dc).toFixed(2)}

function openModal(tipo, data={}) {
  editId=data.id||null
  const cfg = FORMS[tipo]?.(data); if(!cfg) return
  document.getElementById('m-title').textContent = cfg.title
  document.getElementById('m-body').innerHTML = cfg.html
  document.getElementById('m-save').onclick = cfg.save
  document.getElementById('overlay').style.display = 'flex'
}
function cerrarModal(){document.getElementById('overlay').style.display='none';editId=null}

// ══════════════════════════════════════════════════════
// SIDEBAR TOGGLE
// ══════════════════════════════════════════════════════
// ══════════════════════════════════════════════════════
// INIT
// ══════════════════════════════════════════════════════
renderIngresos(); renderGastos(); renderFacturas(); renderCotizaciones(); renderClientes(); renderEmpresasRH()
renderDashboard(); updAlertBadge()
document.getElementById('btn-acc').textContent = '+ Nuevo Ingreso'

// ══════════════════════════════════════════════════════
// DARK MODE
// ══════════════════════════════════════════════════════
let isDark = false
function toggleDark() {
  isDark = !isDark
  document.documentElement.setAttribute('data-theme', isDark ? 'dark' : '')
  document.getElementById('theme-btn').textContent = isDark ? '☀️' : '🌙'
  try { localStorage.setItem('theme', isDark ? 'dark' : 'light') } catch(e){}
  setTimeout(() => { try { Object.values(charts).forEach(ch => ch?.update?.()) } catch(e){} }, 100)
}
;(function(){
  try {
    if (localStorage.getItem('theme') === 'dark') {
      isDark = true
      document.documentElement.setAttribute('data-theme','dark')
      const btn = document.getElementById('theme-btn')
      if (btn) btn.textContent = '☀️'
    }
  } catch(e){}
})()

// ══════════════════════════════════════════════════════
// MÓDULO DOCUMENTOS RRHH
// ══════════════════════════════════════════════════════
let docTipoActual = 'contrato'
let docEmpresaActual = null

function initDocsRRHH() {
  const sel = document.getElementById('doc-emp-select')
  if (!sel) return
  sel.innerHTML = '<option value="">— Elegir empresa —</option>' +
    DATA.empresasRH.map(e => `<option value="${e.id}">${e.nombre}</option>`).join('')
  renderCamposDoc()
  updateDocPreview()
}

function cambiarEmpresaDoc() {
  const sel = document.getElementById('doc-emp-select')
  const id = sel?.value
  docEmpresaActual = DATA.empresasRH.find(e => e.id === id) || null
  const nameEl = document.getElementById('doc-emp-name')
  if (nameEl) nameEl.textContent = docEmpresaActual ? docEmpresaActual.nombre + ' — ' + (docEmpresaActual.rfc||'Sin RFC') : 'Selecciona una empresa'
  const empSel = document.getElementById('doc-empleado')
  if (!empSel) return
  const emps = docEmpresaActual ? (DATA.empleados[id] || []) : []
  empSel.innerHTML = emps.length
    ? emps.filter(e=>e.estado==='activo').map(e => `<option value="${e.id}">${e.nombre} — ${e.puesto}</option>`).join('')
    : '<option value="">Sin empleados activos</option>'
  renderCamposDoc()
  updateDocPreview()
}

function selDocTipo(tipo, el) {
  docTipoActual = tipo
  document.querySelectorAll('.doc-tipo-card').forEach(c => c.classList.remove('selected'))
  el.classList.add('selected')
  const titles = {contrato:'📄 Datos del Contrato',anexo:'📎 Modificación de Sueldo',finiquito:'🤝 Datos del Finiquito',amonestacion:'⚠️ Datos de la Amonestación',certificado:'🏆 Certificado de Trabajo',liquidacion:'💵 Liquidación de Sueldo'}
  const t = document.getElementById('doc-form-title')
  if (t) t.textContent = titles[tipo] || tipo
  renderCamposDoc()
  updateDocPreview()
}

function renderCamposDoc() {
  const el = document.getElementById('doc-campos')
  if (!el) return
  const hoy = new Date().toISOString().split('T')[0]
  const campos = {
    contrato: `<div class="fg">
      <div class="fg-grp"><label class="fg-lbl">Tipo de Contrato</label><select class="fi" id="dc-tipo-contrato" onchange="updateDocPreview()"><option>Indefinido</option><option>Plazo Fijo</option><option>Por Obra o Faena</option></select></div>
      <div class="fg-grp"><label class="fg-lbl">Fecha de Inicio</label><input class="fi" id="dc-fecha-inicio" type="date" value="${hoy}" onchange="updateDocPreview()"></div>
      <div class="fg-grp"><label class="fg-lbl">Fecha Término</label><input class="fi" id="dc-fecha-fin" type="date" placeholder="Solo si es plazo fijo" onchange="updateDocPreview()"></div>
      <div class="fg-grp"><label class="fg-lbl">Jornada</label><select class="fi" id="dc-jornada" onchange="updateDocPreview()"><option>45 horas semanales</option><option>40 horas semanales</option><option>Media jornada</option><option>Jornada parcial</option></select></div>
      <div class="fg-grp"><label class="fg-lbl">Horario</label><input class="fi" id="dc-horario" value="Lunes a Viernes 09:00 – 18:00 hrs." onchange="updateDocPreview()"></div>
      <div class="fg-grp"><label class="fg-lbl">Ciudad / Lugar Trabajo</label><input class="fi" id="dc-lugar" placeholder="Ej: Santiago, Región Metropolitana" onchange="updateDocPreview()"></div>
      <div class="fg-grp full"><label class="fg-lbl">Funciones Principales</label><textarea class="fi" id="dc-funciones" rows="3" onchange="updateDocPreview()" placeholder="Describa las funciones del cargo..."></textarea></div>
    </div>`,
    anexo: `<div class="fg">
      <div class="fg-grp"><label class="fg-lbl">Nuevo Sueldo Base</label><input class="fi" id="dc-nuevo-sueldo" type="number" placeholder="0" onchange="updateDocPreview()"></div>
      <div class="fg-grp"><label class="fg-lbl">Sueldo Anterior</label><input class="fi" id="dc-sueldo-anterior" type="number" placeholder="0" onchange="updateDocPreview()"></div>
      <div class="fg-grp"><label class="fg-lbl">Fecha Vigencia</label><input class="fi" id="dc-fecha-vigencia" type="date" value="${hoy}" onchange="updateDocPreview()"></div>
      <div class="fg-grp"><label class="fg-lbl">Motivo del Ajuste</label><select class="fi" id="dc-motivo-anexo" onchange="updateDocPreview()"><option>Mérito y desempeño</option><option>Reajuste por IPC</option><option>Acuerdo mutuo</option><option>Cambio de funciones</option></select></div>
      <div class="fg-grp full"><label class="fg-lbl">Observaciones</label><textarea class="fi" id="dc-obs" rows="2" onchange="updateDocPreview()"></textarea></div>
    </div>`,
    finiquito: `<div class="fg">
      <div class="fg-grp"><label class="fg-lbl">Fecha de Término</label><input class="fi" id="dc-fecha-termino" type="date" value="${hoy}" onchange="updateDocPreview()"></div>
      <div class="fg-grp"><label class="fg-lbl">Causal de Término</label><select class="fi" id="dc-causal" onchange="updateDocPreview()"><option>Art. 159 N°1 — Mutuo acuerdo</option><option>Art. 159 N°2 — Renuncia voluntaria</option><option>Art. 159 N°4 — Vencimiento del plazo</option><option>Art. 161 — Necesidades de la empresa</option><option>Art. 160 — Falta de probidad</option></select></div>
      <div class="fg-grp"><label class="fg-lbl">Días Vacaciones Pendientes</label><input class="fi" id="dc-vacas-pend" type="number" value="0" onchange="updateDocPreview()"></div>
      <div class="fg-grp"><label class="fg-lbl">Monto Indemnización</label><input class="fi" id="dc-indemnizacion" type="number" value="0" onchange="updateDocPreview()"></div>
      <div class="fg-grp"><label class="fg-lbl">Total Finiquito</label><input class="fi" id="dc-total-finiquito" type="number" value="0" onchange="updateDocPreview()"></div>
      <div class="fg-grp"><label class="fg-lbl">Fecha Pago</label><input class="fi" id="dc-fecha-pago-fin" type="date" value="${hoy}" onchange="updateDocPreview()"></div>
    </div>`,
    amonestacion: `<div class="fg">
      <div class="fg-grp"><label class="fg-lbl">Tipo de Amonestación</label><select class="fi" id="dc-tipo-amon" onchange="updateDocPreview()"><option>Verbal con registro</option><option>Escrita</option><option>Segunda amonestación</option></select></div>
      <div class="fg-grp"><label class="fg-lbl">Fecha de la Falta</label><input class="fi" id="dc-fecha-falta" type="date" value="${hoy}" onchange="updateDocPreview()"></div>
      <div class="fg-grp full"><label class="fg-lbl">Descripción de la Falta</label><textarea class="fi" id="dc-falta-desc" rows="3" onchange="updateDocPreview()" placeholder="Describa la conducta o hecho que motiva la amonestación..."></textarea></div>
      <div class="fg-grp full"><label class="fg-lbl">Advertencia / Consecuencias</label><textarea class="fi" id="dc-advert" rows="2" onchange="updateDocPreview()" placeholder="Ej: De reiterarse esta conducta..."></textarea></div>
    </div>`,
    certificado: `<div class="fg">
      <div class="fg-grp"><label class="fg-lbl">Fecha del Certificado</label><input class="fi" id="dc-fecha-cert" type="date" value="${hoy}" onchange="updateDocPreview()"></div>
      <div class="fg-grp"><label class="fg-lbl">Dirigido a</label><input class="fi" id="dc-dirigido" value="A quien corresponda" onchange="updateDocPreview()"></div>
      <div class="fg-grp"><label class="fg-lbl">Propósito</label><select class="fi" id="dc-proposito" onchange="updateDocPreview()"><option>Fines que el interesado estime convenientes</option><option>Obtención de crédito bancario</option><option>Trámites legales</option><option>Arrendamiento de vivienda</option></select></div>
      <div class="fg-grp"><label class="fg-lbl">¿Incluir monto de sueldo?</label><select class="fi" id="dc-inc-sueldo" onchange="updateDocPreview()"><option value="si">Sí, incluir</option><option value="no">No incluir</option></select></div>
    </div>`,
    liquidacion: `<div class="fg">
      <div class="fg-grp"><label class="fg-lbl">Período</label><input class="fi" id="dc-periodo-liq" type="month" value="${new Date().toISOString().slice(0,7)}" onchange="updateDocPreview()"></div>
      <div class="fg-grp"><label class="fg-lbl">Días Trabajados</label><input class="fi" id="dc-dias-trab" type="number" value="30" onchange="updateDocPreview()"></div>
      <div class="fg-grp"><label class="fg-lbl">Bono / Gratificación</label><input class="fi" id="dc-bono-liq" type="number" value="0" onchange="updateDocPreview()"></div>
      <div class="fg-grp"><label class="fg-lbl">Horas Extra</label><input class="fi" id="dc-horas-extra" type="number" value="0" onchange="updateDocPreview()"></div>
      <div class="fg-grp"><label class="fg-lbl">% AFP</label><input class="fi" id="dc-afp" type="number" value="11.5" step="0.1" onchange="updateDocPreview()"></div>
      <div class="fg-grp"><label class="fg-lbl">% Salud</label><input class="fi" id="dc-salud" type="number" value="7" step="0.1" onchange="updateDocPreview()"></div>
      <div class="fg-grp"><label class="fg-lbl">AFP</label><select class="fi" id="dc-afp-nombre" onchange="updateDocPreview()"><option>AFP Habitat</option><option>AFP Capital</option><option>AFP Cuprum</option><option>AFP Modelo</option><option>AFP PlanVital</option><option>AFP ProVida</option><option>AFP Uno</option></select></div>
      <div class="fg-grp"><label class="fg-lbl">Isapre / Fonasa</label><select class="fi" id="dc-salud-nombre" onchange="updateDocPreview()"><option>FONASA</option><option>Banmédica</option><option>Colmena</option><option>Cruz Blanca</option><option>Consalud</option><option>Más Vida</option></select></div>
    </div>`
  }
  el.innerHTML = campos[docTipoActual] || ''
}

function getEmpData() {
  if (!docEmpresaActual) return null
  const empId = document.getElementById('doc-empleado')?.value
  return (DATA.empleados[docEmpresaActual.id] || []).find(e => e.id === empId) || null
}

function vd(id) { return document.getElementById(id)?.value || '' }
function fmt2(n) { return '$' + Number(n||0).toLocaleString('es-CL') }
function fd2(s) {
  if (!s) return '___'
  try { return new Date(s+'T12:00').toLocaleDateString('es-CL',{day:'2-digit',month:'long',year:'numeric'}) } catch(e){ return s }
}

function updateDocPreview() {
  const emp = getEmpData(), emp2 = docEmpresaActual
  const preview = document.getElementById('doc-preview')
  if (!preview) return
  if (!emp || !emp2) {
    preview.innerHTML = '<div style="text-align:center;padding:40px;color:#aaa;font-size:12px"><div style="font-size:36px;margin-bottom:12px">📄</div>Selecciona empresa y empleado<br>para ver la vista previa</div>'
    return
  }
  const renders = {
    contrato: () => `
      <h1>CONTRATO INDIVIDUAL DE TRABAJO</h1>
      <p style="text-align:center;font-size:10px;color:#888;margin-bottom:16px">${vd('dc-tipo-contrato').toUpperCase()}</p>
      <h2>I. PARTES</h2>
      <p>En <strong>${vd('dc-lugar')||'___'}</strong>, a ${fd2(vd('dc-fecha-inicio'))}, comparecen:</p>
      <p><strong>EMPLEADOR:</strong> ${emp2.nombre}${emp2.rfc?', RUT '+emp2.rfc:''}, representada por ${emp2.contacto||'___'}.</p>
      <p><strong>TRABAJADOR:</strong> ${emp.nombre}${emp.curp?', RUT '+emp.curp:''}${emp.direccion?', domiciliado en '+emp.direccion:''}.</p>
      <h2>II. CARGO Y FUNCIONES</h2>
      <p>Cargo: <strong>${emp.puesto}</strong>, Departamento: <strong>${emp.departamento}</strong>.</p>
      <p>${vd('dc-funciones')||'Las funciones serán las propias del cargo antes indicado.'}</p>
      <h2>III. JORNADA Y HORARIO</h2>
      <p>Jornada: <strong>${vd('dc-jornada')}</strong> | Horario: <strong>${vd('dc-horario')}</strong>.</p>
      <h2>IV. REMUNERACIÓN</h2>
      <div class="doc-highlight">Sueldo base mensual bruto: <strong>${fmt2(emp.salario)}</strong></div>
      <h2>V. VIGENCIA</h2>
      <p>El contrato rige desde el ${fd2(vd('dc-fecha-inicio'))}${vd('dc-fecha-fin')?' hasta el '+fd2(vd('dc-fecha-fin'))+', pudiendo renovarse por acuerdo de las partes.':' con carácter indefinido.'}</p>
      <div class="doc-firma">
        <div class="firma-line"><div>${emp2.nombre}<br><small>EMPLEADOR</small></div></div>
        <div class="firma-line"><div>${emp.nombre}<br><small>TRABAJADOR</small></div></div>
      </div>`,
    anexo: () => {
      const nS = parseFloat(vd('dc-nuevo-sueldo'))||0, aS = parseFloat(vd('dc-sueldo-anterior'))||0, diff = nS-aS
      return `<h1>ANEXO DE CONTRATO DE TRABAJO</h1>
      <p style="text-align:center;font-size:10px;color:#888">MODIFICACIÓN DE REMUNERACIÓN</p>
      <p>En ${fd2(new Date().toISOString().split('T')[0])}, las partes acuerdan modificar el contrato de trabajo:</p>
      <h2>MODIFICACIÓN</h2>
      <table><tr><th>Concepto</th><th>Anterior</th><th>Nuevo</th><th>Diferencia</th></tr>
      <tr><td>Sueldo Base</td><td>${fmt2(aS)}</td><td><strong>${fmt2(nS)}</strong></td><td style="color:${diff>=0?'green':'red'}">${diff>=0?'+':''}${fmt2(diff)}</td></tr></table>
      <p>Motivo: <strong>${vd('dc-motivo-anexo')}</strong>. Vigencia: <strong>${fd2(vd('dc-fecha-vigencia'))}</strong>.</p>
      ${vd('dc-obs')?`<div class="doc-highlight">${vd('dc-obs')}</div>`:''}
      <div class="doc-firma"><div class="firma-line"><div>${emp2.nombre}<br><small>EMPLEADOR</small></div></div><div class="firma-line"><div>${emp.nombre}<br><small>TRABAJADOR</small></div></div></div>`
    },
    finiquito: () => `<h1>FINIQUITO DE CONTRATO DE TRABAJO</h1>
      <h2>DATOS RELACIÓN LABORAL</h2>
      <table><tr><th>Cargo</th><td>${emp.puesto}</td></tr><tr><th>Ingreso</th><td>${fd2(emp.fecha_ingreso)}</td></tr>
      <tr><th>Término</th><td>${fd2(vd('dc-fecha-termino'))}</td></tr><tr><th>Causal</th><td>${vd('dc-causal')}</td></tr></table>
      <h2>LIQUIDACIÓN</h2>
      <table><tr><th>Concepto</th><th>Monto</th></tr>
      <tr><td>Vacaciones proporcionales (${vd('dc-vacas-pend')} días)</td><td>${fmt2((parseFloat(vd('dc-vacas-pend'))||0)*(emp.salario/30))}</td></tr>
      <tr><td>Indemnización</td><td>${fmt2(vd('dc-indemnizacion'))}</td></tr>
      <tr><td><strong>TOTAL</strong></td><td><strong>${fmt2(vd('dc-total-finiquito'))}</strong></td></tr></table>
      <p>Pago el ${fd2(vd('dc-fecha-pago-fin'))}. El trabajador declara que con este pago queda saldada toda deuda de la relación laboral.</p>
      <div class="doc-firma"><div class="firma-line"><div>${emp2.nombre}<br><small>EMPLEADOR</small></div></div><div class="firma-line"><div>${emp.nombre}<br><small>TRABAJADOR</small></div></div></div>`,
    amonestacion: () => `<h1>CARTA DE AMONESTACIÓN</h1>
      <p style="text-align:center;font-size:10px;color:#888">${vd('dc-tipo-amon').toUpperCase()}</p>
      <p>${fd2(new Date().toISOString().split('T')[0])}</p>
      <p><strong>Señor/a ${emp.nombre}</strong><br>${emp.puesto} — ${emp.departamento}</p>
      <h2>ANTECEDENTES</h2>
      <p>Con fecha ${fd2(vd('dc-fecha-falta'))} se constató la siguiente situación:</p>
      <div class="doc-highlight">${vd('dc-falta-desc')||'[Descripción de la falta]'}</div>
      <h2>ADVERTENCIA</h2>
      <p>${vd('dc-advert')||'De reiterarse esta conducta, la empresa se reserva el derecho de adoptar medidas disciplinarias más severas.'}</p>
      <p>El trabajador ha tomado conocimiento de la presente amonestación.</p>
      <div class="doc-firma"><div class="firma-line"><div>${emp2.contacto||emp2.nombre}<br><small>EMPLEADOR / RRHH</small></div></div><div class="firma-line"><div>${emp.nombre}<br><small>TRABAJADOR — Firma y fecha</small></div></div></div>`,
    certificado: () => `<h1>CERTIFICADO DE TRABAJO</h1>
      <p style="text-align:right;font-size:10px;color:#888">${fd2(vd('dc-fecha-cert'))}</p>
      <p>${vd('dc-dirigido')||'A quien corresponda'}:</p>
      <p><strong>${emp2.nombre}</strong>${emp2.rfc?', RUT '+emp2.rfc:''}, certifica que:</p>
      <div class="doc-highlight"><strong>${emp.nombre}</strong>${emp.curp?', RUT '+emp.curp:''}, se desempeña como <strong>${emp.puesto}</strong>, departamento <strong>${emp.departamento}</strong>, desde el ${fd2(emp.fecha_ingreso)}, bajo contrato ${emp.tipo_contrato||'indefinido'}.${vd('dc-inc-sueldo')==='si'?` Su remuneración bruta mensual es de <strong>${fmt2(emp.salario)}</strong>.`:''}</div>
      <p>Se extiende para <strong>${vd('dc-proposito')}</strong>.</p>
      <div class="doc-firma"><div class="firma-line"><div>${emp2.contacto||emp2.nombre}<br><small>REPRESENTANTE LEGAL</small></div></div></div>`,
    liquidacion: () => {
      const sal = emp.salario||0, dias = parseInt(vd('dc-dias-trab'))||30
      const bono = parseFloat(vd('dc-bono-liq'))||0
      const afp = parseFloat(vd('dc-afp'))||11.5, salud = parseFloat(vd('dc-salud'))||7
      const salD = (sal/30)*dias, totH = salD+bono
      const dAfp = totH*(afp/100), dSalud = totH*(salud/100), totD = dAfp+dSalud, liq = totH-totD
      const per = vd('dc-periodo-liq')||new Date().toISOString().slice(0,7)
      const [py,pm] = per.split('-')
      const mesN = new Date(parseInt(py),parseInt(pm)-1,1).toLocaleDateString('es-CL',{month:'long',year:'numeric'})
      return `<h1>LIQUIDACIÓN DE SUELDO</h1>
      <p style="text-align:center;font-size:11px;color:#888">Período: ${mesN.toUpperCase()}</p>
      <table><tr><th colspan="2" style="background:#f5f5f5">DATOS DEL TRABAJADOR</th></tr>
      <tr><td>Nombre</td><td><strong>${emp.nombre}</strong></td></tr>
      <tr><td>RUT</td><td>${emp.curp||'___'}</td></tr>
      <tr><td>Cargo</td><td>${emp.puesto}</td></tr>
      <tr><td>Días trabajados</td><td>${dias}</td></tr>
      <tr><td>AFP</td><td>${vd('dc-afp-nombre')}</td></tr>
      <tr><td>Salud</td><td>${vd('dc-salud-nombre')}</td></tr></table>
      <table style="margin-top:8px">
      <tr><th colspan="2" style="background:#EBF7F2;color:#15803D">HABERES</th></tr>
      <tr><td>Sueldo base (${dias} días)</td><td>${fmt2(salD)}</td></tr>
      ${bono?`<tr><td>Bono / Gratificación</td><td>${fmt2(bono)}</td></tr>`:''}
      <tr><td><strong>Total Haberes</strong></td><td><strong>${fmt2(totH)}</strong></td></tr>
      <tr><th colspan="2" style="background:#FEF5F6;color:#C96878">DESCUENTOS</th></tr>
      <tr><td>${vd('dc-afp-nombre')} (${afp}%)</td><td>-${fmt2(dAfp)}</td></tr>
      <tr><td>${vd('dc-salud-nombre')} (${salud}%)</td><td>-${fmt2(dSalud)}</td></tr>
      <tr><td><strong>Total Descuentos</strong></td><td><strong>-${fmt2(totD)}</strong></td></tr>
      <tr style="background:#F0FDF4"><td style="font-weight:700">LÍQUIDO A PAGAR</td><td style="font-weight:800;color:#15803D;font-size:14px">${fmt2(liq)}</td></tr></table>
      <div class="doc-firma"><div class="firma-line"><div>${emp2.nombre}<br><small>Empleador</small></div></div><div class="firma-line"><div>${emp.nombre}<br><small>Trabajador</small></div></div></div>`
    }
  }
  preview.innerHTML = renders[docTipoActual]?.() || '<p>Selecciona tipo de documento</p>'
}

function generarDocPDF() {
  const emp = getEmpData(), emp2 = docEmpresaActual
  if (!emp || !emp2) { alert('Selecciona empresa y empleado primero'); return }
  const {jsPDF} = window.jspdf
  const doc = new jsPDF(), W = doc.internal.pageSize.getWidth()
  const cfg = document.getElementById('cfg-nombre')?.value || 'Segura Contable'
  const docTitles = {contrato:'CONTRATO INDIVIDUAL DE TRABAJO',anexo:'ANEXO DE CONTRATO',finiquito:'FINIQUITO DE CONTRATO',amonestacion:'CARTA DE AMONESTACIÓN',certificado:'CERTIFICADO DE TRABAJO',liquidacion:'LIQUIDACIÓN DE SUELDO'}
  // Header
  doc.setFillColor(47,47,47); doc.rect(0,0,W,36,'F')
  try { doc.addImage('data:image/png;base64,'+LOGO_B64,'PNG',12,5,26,26) } catch(e){}
  doc.setTextColor(255,255,255); doc.setFont('helvetica','bold'); doc.setFontSize(16); doc.text(cfg,44,16)
  doc.setFont('helvetica','normal'); doc.setFontSize(9); doc.setTextColor(242,184,192); doc.text(docTitles[docTipoActual]||'DOCUMENTO',44,26)
  doc.setTextColor(180,180,180); doc.text(emp2.nombre,W-12,16,{align:'right'}); doc.text(new Date().toLocaleDateString('es-CL'),W-12,24,{align:'right'})
  doc.setDrawColor(232,144,154); doc.setLineWidth(.5); doc.line(0,36,W,36)
  let y = 48
  const addT = (t) => { doc.setFillColor(245,244,242); doc.rect(12,y-5,W-24,11,'F'); doc.setFont('helvetica','bold'); doc.setFontSize(9); doc.setTextColor(47,47,47); doc.text(t,16,y+2); y+=14 }
  const addP = (t,ind=0) => { doc.setFont('helvetica','normal'); doc.setFontSize(10); doc.setTextColor(55,55,55); doc.splitTextToSize(t,W-28-ind).forEach(l=>{ if(y>265){doc.addPage();y=20}; doc.text(l,14+ind,y); y+=6 }); y+=2 }
  const addR = (l,v,bg=false) => { if(bg){doc.setFillColor(250,249,248);doc.rect(12,y-4,W-24,9,'F')} doc.setFont('helvetica','bold');doc.setFontSize(9);doc.setTextColor(100,100,100);doc.text(l,16,y);doc.setFont('helvetica','normal');doc.setTextColor(40,40,40);doc.text(String(v),W/2,y);y+=10 }
  addT('PARTES')
  addP(`EMPLEADOR: ${emp2.nombre}${emp2.rfc?', RUT '+emp2.rfc:''}`)
  addP(`TRABAJADOR: ${emp.nombre}${emp.curp?', RUT '+emp.curp:''}`)
  if (docTipoActual==='contrato') {
    addT('CARGO'); addP(`${emp.puesto} — ${emp.departamento}`); addP(vd('dc-funciones')||'Funciones propias del cargo.')
    addT('JORNADA'); addP(`${vd('dc-jornada')} | ${vd('dc-horario')}`)
    addT('REMUNERACIÓN')
    doc.setFillColor(254,245,246);doc.rect(12,y-4,W-24,13,'F');doc.setDrawColor(232,144,154);doc.rect(12,y-4,4,13,'F')
    doc.setFont('helvetica','bold');doc.setFontSize(12);doc.setTextColor(47,47,47);doc.text('Sueldo Bruto: '+fmt2(emp.salario),18,y+5);y+=17
    addT('VIGENCIA'); addP(`Desde ${fd2(vd('dc-fecha-inicio'))}${vd('dc-fecha-fin')?' hasta '+fd2(vd('dc-fecha-fin')):', con carácter indefinido'}.`)
  } else if (docTipoActual==='liquidacion') {
    const sal=emp.salario||0,dias=parseInt(vd('dc-dias-trab'))||30,bono=parseFloat(vd('dc-bono-liq'))||0
    const afp=parseFloat(vd('dc-afp'))||11.5,salud=parseFloat(vd('dc-salud'))||7
    const salD=(sal/30)*dias,totH=salD+bono,dAfp=totH*(afp/100),dSalud=totH*(salud/100),liq=totH-dAfp-dSalud
    addR(`Período`,vd('dc-periodo-liq'),true);addR(`Días trabajados`,dias)
    addT('HABERES');addR('Sueldo base',fmt2(salD),true);if(bono)addR('Bono',fmt2(bono));addR('Total Haberes',fmt2(totH),true)
    addT('DESCUENTOS');addR(`AFP ${vd('dc-afp-nombre')} (${afp}%)`,'-'+fmt2(dAfp),true);addR(`Salud (${salud}%)`,'-'+fmt2(dSalud))
    y+=6;doc.setFillColor(240,253,244);doc.rect(12,y-6,W-24,18,'F');doc.setDrawColor(21,128,61);doc.rect(12,y-6,5,18,'F')
    doc.setFont('helvetica','bold');doc.setFontSize(14);doc.setTextColor(21,128,61);doc.text('LÍQUIDO: '+fmt2(liq),20,y+5);y+=22
  } else if (docTipoActual==='finiquito') {
    addT('TÉRMINO');addR('Causal',vd('dc-causal'),true);addR('Fecha término',fd2(vd('dc-fecha-termino')))
    addT('LIQUIDACIÓN');addR('Vacaciones',fmt2((parseInt(vd('dc-vacas-pend'))||0)*(emp.salario/30)),true);addR('Indemnización',fmt2(vd('dc-indemnizacion')));addR('TOTAL',fmt2(vd('dc-total-finiquito')),true)
  } else if (docTipoActual==='amonestacion') {
    addT('FALTA');addP(vd('dc-falta-desc')||'[Descripción]')
    addT('ADVERTENCIA');addP(vd('dc-advert')||'Se adoptarán medidas disciplinarias.')
  } else if (docTipoActual==='certificado') {
    addT('CERTIFICACIÓN');addP(`${emp.nombre} se desempeña como ${emp.puesto} desde ${fd2(emp.fecha_ingreso)}.`)
    if(vd('dc-inc-sueldo')==='si')addP(`Remuneración bruta: ${fmt2(emp.salario)}.`)
    addP(`Propósito: ${vd('dc-proposito')}.`)
  } else if (docTipoActual==='anexo') {
    addT('MODIFICACIÓN');addR('Sueldo anterior',fmt2(vd('dc-sueldo-anterior')),true);addR('Nuevo sueldo',fmt2(vd('dc-nuevo-sueldo')));addR('Vigencia',fd2(vd('dc-fecha-vigencia')),true);addR('Motivo',vd('dc-motivo-anexo'))
  }
  y=Math.max(y+10,230)
  doc.setDrawColor(180,180,180);doc.setLineWidth(.4);doc.line(20,y,90,y);doc.line(W-90,y,W-20,y)
  doc.setFont('helvetica','normal');doc.setFontSize(9);doc.setTextColor(120,120,120)
  doc.text(emp2.nombre,55,y+8,{align:'center'});doc.text('EMPLEADOR',55,y+14,{align:'center'})
  doc.text(emp.nombre,W-55,y+8,{align:'center'});doc.text('TRABAJADOR',W-55,y+14,{align:'center'})
  doc.setFillColor(47,47,47);doc.rect(0,275,W,22,'F')
  doc.setTextColor(180,180,180);doc.setFontSize(8);doc.text(`${cfg} · ${new Date().toLocaleDateString('es-CL')}`,W/2,284,{align:'center'})
  doc.setTextColor(242,184,192);doc.text('Documento confidencial — uso interno RRHH',W/2,291,{align:'center'})
  doc.save(`${(docTitles[docTipoActual]||'Documento').replace(/\s+/g,'_')}_${emp.nombre.split(' ')[0]}_${new Date().toISOString().split('T')[0]}.pdf`)
}

// ══════════════════════════════════════════════════════

// ══════════════════════════════════════════════════════
// PLANTILLAS — Sistema completo
// ══════════════════════════════════════════════════════

// Estado global de plantillas (en memoria, simulando localStorage)
let PLANTILLAS = []
let plantillaEditandoId = null
let wordContenido = ''

// Plantillas del sistema (predeterminadas)
const PLANTILLAS_SISTEMA = [
  {id:'sys-1',nombre:'Contrato Indefinido Estándar',tipo:'contrato',origen:'sistema',fecha:'2026-01-01',
   contenido:`<h1>CONTRATO INDIVIDUAL DE TRABAJO</h1><h2>I. PARTES</h2><p>En {{ciudad}}, a {{fecha_hoy}}, entre <strong>{{empresa}}</strong>, RUT {{rut_empresa}}, representada por {{contacto_empresa}} (en adelante el "Empleador"), y don/doña <strong>{{nombre_empleado}}</strong>, RUT {{rut_empleado}}, domiciliado en {{direccion_empleado}} (en adelante el "Trabajador").</p><h2>II. CARGO Y FUNCIONES</h2><p>El Trabajador se desempeñará en el cargo de <strong>{{cargo}}</strong>, Departamento de <strong>{{departamento}}</strong>.</p><h2>III. JORNADA LABORAL</h2><p>La jornada laboral será de 45 horas semanales, de lunes a viernes de 09:00 a 18:00 horas.</p><h2>IV. REMUNERACIÓN</h2><p>El Empleador pagará al Trabajador una remuneración bruta mensual de <strong>{{sueldo}}</strong>, pagadera el último día hábil de cada mes.</p><h2>V. VIGENCIA</h2><p>El presente contrato tendrá carácter indefinido a partir del {{fecha_ingreso}}.</p><div class="doc-firma"><div class="firma-line"><div>{{empresa}}<br><small>EMPLEADOR</small></div></div><div class="firma-line"><div>{{nombre_empleado}}<br><small>TRABAJADOR</small></div></div></div>`},
  {id:'sys-2',nombre:'Carta Amonestación Escrita',tipo:'amonestacion',origen:'sistema',fecha:'2026-01-01',
   contenido:`<h1>CARTA DE AMONESTACIÓN ESCRITA</h1><p>{{fecha_hoy}}</p><p>Señor/a <strong>{{nombre_empleado}}</strong><br>{{cargo}} — {{departamento}}</p><h2>ESTIMADO/A TRABAJADOR/A:</h2><p>Por medio de la presente, y de acuerdo a las facultades establecidas en el Reglamento Interno de Orden, Higiene y Seguridad de <strong>{{empresa}}</strong>, se le hace llegar la presente carta de amonestación escrita, debido a la siguiente falta cometida:</p><div class="doc-highlight">[DESCRIPCIÓN DE LA FALTA]</div><p>Lo anterior constituye una infracción a las normas de conducta establecidas en nuestra empresa. Le instamos a que corrija de inmediato esta conducta.</p><p>De reiterarse hechos de esta naturaleza, la empresa se reserva el derecho de adoptar las medidas disciplinarias que estime conveniente, pudiendo llegar incluso al término del contrato de trabajo.</p><div class="doc-firma"><div class="firma-line"><div>{{contacto_empresa}}<br>{{empresa}}<br><small>EMPLEADOR</small></div></div><div class="firma-line"><div>{{nombre_empleado}}<br><small>Firma y fecha trabajador</small></div></div></div>`},
  {id:'sys-3',nombre:'Certificado de Trabajo Simple',tipo:'certificado',origen:'sistema',fecha:'2026-01-01',
   contenido:`<h1>CERTIFICADO DE TRABAJO</h1><p style="text-align:right">{{fecha_hoy}}</p><p>A quien corresponda:</p><p><strong>{{empresa}}</strong>, RUT {{rut_empresa}}, certifica que:</p><div class="doc-highlight">Don/Doña <strong>{{nombre_empleado}}</strong>, RUT {{rut_empleado}}, se encuentra actualmente trabajando en esta empresa, desempeñándose en el cargo de <strong>{{cargo}}</strong>, Departamento de <strong>{{departamento}}</strong>, desde el día {{fecha_ingreso}}, bajo contrato de trabajo de tipo {{tipo_contrato}}.</div><p>Se extiende el presente certificado a petición del interesado para los fines que estime convenientes.</p><div class="doc-firma"><div class="firma-line"><div>{{contacto_empresa}}<br>{{empresa}}<br><small>REPRESENTANTE LEGAL</small></div></div></div>`}
]

function initPlantillas() {
  // Cargar plantillas del sistema + las guardadas en memoria
  renderPlantillas()
}

function renderPlantillas() {
  const q = (document.getElementById('plt-search')?.value || '').toLowerCase()
  const fil = document.getElementById('plt-filtro')?.value || ''
  const todas = [...PLANTILLAS_SISTEMA, ...PLANTILLAS]
  const rows = todas.filter(p =>
    (!q || p.nombre.toLowerCase().includes(q) || p.tipo.toLowerCase().includes(q)) &&
    (!fil || p.tipo === fil)
  )
  const tipoIcos = {contrato:'📄',anexo:'📎',finiquito:'🤝',amonestacion:'⚠️',certificado:'🏆',liquidacion:'💵',custom:'📋'}
  const tipoCols = {contrato:'azul-b',anexo:'morado-b',finiquito:'warn',amonestacion:'pend',certificado:'ok',liquidacion:'ok',custom:'bor'}
  const lista = document.getElementById('plt-lista')
  if (!lista) return
  lista.innerHTML = rows.length === 0
    ? `<div class="empty"><div class="ei">🗂</div><p>No hay plantillas que coincidan</p></div>`
    : rows.map(p => `
      <div class="plantilla-item">
        <div class="plantilla-item-ico" style="background:var(--${p.tipo==='contrato'?'azul':p.tipo==='finiquito'?'amber':p.tipo==='certificado'?'verde':p.tipo==='amonestacion'?'rosa':p.tipo==='liquidacion'?'verde':'morado'}-p)">${tipoIcos[p.tipo]||'📋'}</div>
        <div class="plantilla-item-info">
          <div class="plantilla-item-name">${p.nombre}</div>
          <div class="plantilla-item-meta">
            ${p.tipo.charAt(0).toUpperCase()+p.tipo.slice(1)} ·
            ${p.origen==='sistema'?'Plantilla del sistema':p.origen==='word'?'Importada desde Word':'Personalizada'} ·
            Guardada el ${fd2(p.fecha)}
          </div>
        </div>
        <span class="plantilla-badge ${p.origen==='sistema'?'pb-sistema':p.origen==='word'?'pb-word':'pb-custom'}">${p.origen==='sistema'?'Sistema':p.origen==='word'?'Word':'Custom'}</span>
        <div style="display:flex;gap:6px;margin-left:8px">
          <button class="btn-sm" onclick="usarPlantilla('${p.id}')" title="Usar esta plantilla">▶ Usar</button>
          <button class="btn-sm" onclick="editarPlantilla('${p.id}')" title="Editar"${p.origen==='sistema'?' style="opacity:.5" title="Crea una copia para editar"':''}>✏</button>
          ${p.origen!=='sistema'?`<button class="btn-sm r" onclick="eliminarPlantilla('${p.id}')">✕</button>`:''}
        </div>
      </div>`).join('')
}

function nuevaPlantilla() {
  plantillaEditandoId = null
  document.getElementById('plt-nombre').value = ''
  document.getElementById('plt-tipo').value = 'contrato'
  document.getElementById('plt-editor').innerHTML = ''
  document.getElementById('editor-title').textContent = '✏️ Nueva Plantilla'
  document.getElementById('plt-preview').innerHTML = '<div style="text-align:center;padding:40px;color:#aaa;font-size:12px"><div style="font-size:36px;margin-bottom:12px">📝</div>Comienza a escribir para ver la vista previa</div>'
}

function editarPlantilla(id) {
  const todas = [...PLANTILLAS_SISTEMA, ...PLANTILLAS]
  const p = todas.find(x => x.id === id)
  if (!p) return
  // Si es del sistema, crear copia
  if (p.origen === 'sistema') {
    plantillaEditandoId = null
    document.getElementById('plt-nombre').value = p.nombre + ' (copia)'
    document.getElementById('plt-tipo').value = p.tipo
    document.getElementById('plt-editor').innerHTML = p.contenido
    document.getElementById('editor-title').textContent = '✏️ Copia de: ' + p.nombre
  } else {
    plantillaEditandoId = id
    document.getElementById('plt-nombre').value = p.nombre
    document.getElementById('plt-tipo').value = p.tipo
    document.getElementById('plt-editor').innerHTML = p.contenido
    document.getElementById('editor-title').textContent = '✏️ Editando: ' + p.nombre
  }
  showDocTab('tab-editor', document.querySelectorAll('.doc-tab')[1])
  updateEditorPreview()
}

function usarPlantilla(id) {
  const todas = [...PLANTILLAS_SISTEMA, ...PLANTILLAS]
  const p = todas.find(x => x.id === id)
  if (!p) return
  // Guardar contenido en sessionStorage para usarlo en generar doc
  sessionStorage.setItem('plt-activa-contenido', p.contenido)
  sessionStorage.setItem('plt-activa-nombre', p.nombre)
  sessionStorage.setItem('plt-activa-tipo', p.tipo)
  // Ir al módulo de documentos
  go('docs-rrhh', document.querySelector('[onclick*="docs-rrhh"]'))
  showMsg('', 'ok', '')
  setTimeout(() => alert(`✓ Plantilla "${p.nombre}" activada. Selecciona empresa y empleado para generar el documento.`), 100)
}

function guardarPlantilla() {
  const nombre = document.getElementById('plt-nombre')?.value?.trim()
  const tipo = document.getElementById('plt-tipo')?.value
  const contenido = document.getElementById('plt-editor')?.innerHTML?.trim()
  if (!nombre) { alert('Ingresa un nombre para la plantilla'); return }
  if (!contenido || contenido.length < 10) { alert('El contenido de la plantilla está vacío'); return }
  if (plantillaEditandoId) {
    // Actualizar existente
    PLANTILLAS = PLANTILLAS.map(p => p.id === plantillaEditandoId ? {...p, nombre, tipo, contenido, fecha: new Date().toISOString().split('T')[0]} : p)
    alert(`✓ Plantilla "${nombre}" actualizada correctamente`)
  } else {
    // Nueva
    PLANTILLAS.push({id: 'plt-' + uid(), nombre, tipo, contenido, origen: 'custom', fecha: new Date().toISOString().split('T')[0]})
    alert(`✓ Plantilla "${nombre}" guardada correctamente`)
  }
  plantillaEditandoId = null
  showDocTab('tab-lista', document.querySelectorAll('.doc-tab')[0])
  renderPlantillas()
}

function eliminarPlantilla(id) {
  if (!confirm('¿Eliminar esta plantilla? Esta acción no se puede deshacer.')) return
  PLANTILLAS = PLANTILLAS.filter(p => p.id !== id)
  renderPlantillas()
}

function updateEditorPreview() {
  const contenido = document.getElementById('plt-editor')?.innerHTML || ''
  const preview = document.getElementById('plt-preview')
  if (!preview) return
  // Reemplazar variables con datos de ejemplo
  const ejemplos = {
    '{{nombre_empleado}}': '<span class="var-highlight">María López Torres</span>',
    '{{rut_empleado}}': '<span class="var-highlight">12.345.678-9</span>',
    '{{cargo}}': '<span class="var-highlight">Contadora Senior</span>',
    '{{departamento}}': '<span class="var-highlight">Contabilidad</span>',
    '{{sueldo}}': '<span class="var-highlight">$1.800.000</span>',
    '{{fecha_ingreso}}': '<span class="var-highlight">01 de marzo de 2024</span>',
    '{{empresa}}': '<span class="var-highlight">Mueblería Torres SpA</span>',
    '{{rut_empresa}}': '<span class="var-highlight">76.543.210-K</span>',
    '{{contacto_empresa}}': '<span class="var-highlight">Ana Torres</span>',
    '{{fecha_hoy}}': '<span class="var-highlight">' + fd2(new Date().toISOString().split('T')[0]) + '</span>',
    '{{tipo_contrato}}': '<span class="var-highlight">indefinido</span>',
    '{{direccion_empleado}}': '<span class="var-highlight">Av. Providencia 1234, Santiago</span>',
    '{{ciudad}}': '<span class="var-highlight">Santiago</span>',
  }
  let html = contenido
  Object.entries(ejemplos).forEach(([k, v]) => { html = html.replaceAll(k, v) })
  preview.innerHTML = html || '<div style="text-align:center;padding:40px;color:#aaa;font-size:12px">Escribe el contenido de la plantilla...</div>'
}

function exportarPlantillaPDF() {
  const nombre = document.getElementById('plt-nombre')?.value || 'Plantilla'
  const contenido = document.getElementById('plt-editor')?.innerHTML || ''
  if (!contenido.trim()) { alert('La plantilla está vacía'); return }
  // Reemplazar variables con datos de ejemplo para el PDF
  let html = contenido
  const ejemplos = {'{{nombre_empleado}}':'[NOMBRE EMPLEADO]','{{rut_empleado}}':'[RUT]','{{cargo}}':'[CARGO]','{{departamento}}':'[DEPARTAMENTO]','{{sueldo}}':'[SUELDO]','{{fecha_ingreso}}':'[FECHA INGRESO]','{{empresa}}':'[EMPRESA]','{{rut_empresa}}':'[RUT EMPRESA]','{{contacto_empresa}}':'[REPRESENTANTE]','{{fecha_hoy}}':fd2(new Date().toISOString().split('T')[0]),'{{tipo_contrato}}':'[TIPO]','{{ciudad}}':'[CIUDAD]','{{direccion_empleado}}':'[DIRECCIÓN]'}
  Object.entries(ejemplos).forEach(([k,v]) => { html = html.replaceAll(k,v) })
  // Limpiar HTML para texto
  const texto = html.replace(/<h1>/g,'\n\n').replace(/<\/h1>/g,'\n').replace(/<h2>/g,'\n').replace(/<\/h2>/g,'\n').replace(/<strong>/g,'').replace(/<\/strong>/g,'').replace(/<p>/g,'').replace(/<\/p>/g,'\n').replace(/<[^>]+>/g,'').replace(/&nbsp;/g,' ')
  const {jsPDF} = window.jspdf, doc = new jsPDF(), W = doc.internal.pageSize.getWidth()
  const cfg = document.getElementById('cfg-nombre')?.value || 'Segura Contable'
  doc.setFillColor(47,47,47); doc.rect(0,0,W,36,'F')
  try { doc.addImage('data:image/png;base64,'+LOGO_B64,'PNG',12,5,26,26) } catch(e){}
  doc.setTextColor(255,255,255); doc.setFont('helvetica','bold'); doc.setFontSize(15); doc.text(cfg,44,16)
  doc.setFont('helvetica','normal'); doc.setFontSize(9); doc.setTextColor(242,184,192); doc.text(nombre.toUpperCase(),44,26)
  doc.setTextColor(180,180,180); doc.text('PLANTILLA — VISTA PREVIA',W-12,20,{align:'right'})
  let y = 48
  texto.split('\n').forEach(line => {
    if (!line.trim()) { y+=3; return }
    if (y > 265) { doc.addPage(); y = 20 }
    doc.setFont('helvetica','normal'); doc.setFontSize(10); doc.setTextColor(55,55,55)
    doc.splitTextToSize(line, W-28).forEach(l => { doc.text(l, 14, y); y+=6 })
  })
  doc.setFillColor(47,47,47); doc.rect(0,275,W,22,'F')
  doc.setTextColor(180,180,180); doc.setFontSize(8); doc.text(`${cfg} · Plantilla: ${nombre}`,W/2,284,{align:'center'})
  doc.save(`Plantilla_${nombre.replace(/\s+/g,'_')}.pdf`)
}

// ── Editor toolbar functions ──
function formatText(cmd) {
  document.getElementById('plt-editor')?.focus()
  document.execCommand(cmd, false, null)
  updateEditorPreview()
}

function insertVar(variable) {
  const editor = document.getElementById('plt-editor')
  if (!editor) return
  editor.focus()
  const sel = window.getSelection()
  if (sel.rangeCount) {
    const range = sel.getRangeAt(0)
    range.deleteContents()
    const span = document.createElement('span')
    span.className = 'var-highlight'
    span.textContent = variable
    span.style.cursor = 'default'
    range.insertNode(span)
    range.setStartAfter(span); range.setEndAfter(span)
    sel.removeAllRanges(); sel.addRange(range)
  } else {
    editor.innerHTML += `<span class="var-highlight">${variable}</span>`
  }
  updateEditorPreview()
}

function insertSeccion() {
  const editor = document.getElementById('plt-editor')
  if (!editor) return
  editor.focus()
  document.execCommand('insertHTML', false, '<h2>Nueva Sección</h2><p>Contenido de la sección...</p>')
  updateEditorPreview()
}

function insertFirmas() {
  const editor = document.getElementById('plt-editor')
  if (!editor) return
  const html = `<div class="doc-firma"><div class="firma-line"><div><span class="var-highlight">{{empresa}}</span><br><small>EMPLEADOR</small></div></div><div class="firma-line"><div><span class="var-highlight">{{nombre_empleado}}</span><br><small>TRABAJADOR</small></div></div></div>`
  document.execCommand('insertHTML', false, html)
  updateEditorPreview()
}

// ── Tabs ──
function showDocTab(tabId, btn) {
  document.querySelectorAll('.doc-subpanel').forEach(p => p.classList.remove('active'))
  document.querySelectorAll('.doc-tab').forEach(b => b.classList.remove('active'))
  const panel = document.getElementById(tabId)
  if (panel) panel.classList.add('active')
  if (btn && btn.classList) btn.classList.add('active')
}

// ── Word import ──
function procesarWord(file) {
  if (!file) return
  const dropzone = document.getElementById('word-dropzone')
  const result = document.getElementById('word-result')
  const preview = document.getElementById('word-preview')
  const extractedWrap = document.getElementById('word-extracted-wrap')
  const extracted = document.getElementById('word-extracted')
  if (!file.name.match(/\.docx?$/i)) { alert('Por favor sube un archivo .docx'); return }
  document.getElementById('word-filename').textContent = file.name
  // Usar mammoth si está disponible, o simular
  const reader = new FileReader()
  reader.onload = async function(e) {
    try {
      // Intentar con mammoth (si está cargado)
      if (typeof mammoth !== 'undefined') {
        const result2 = await mammoth.convertToHtml({arrayBuffer: e.target.result})
        wordContenido = result2.value
      } else {
        // Simulación: generar contenido placeholder
        wordContenido = `<h1>${file.name.replace('.docx','').replace('.doc','')}</h1>
          <p>Contenido extraído del documento Word. El sistema ha procesado el archivo y extraído el texto.</p>
          <h2>SECCIÓN IMPORTADA</h2>
          <p>Aquí aparecería el contenido real de tu archivo Word. Para usar variables automáticas, reemplaza los campos como [NOMBRE], [SUELDO], [EMPRESA] por las variables del sistema como <span class="var-highlight">{{nombre_empleado}}</span>, <span class="var-highlight">{{sueldo}}</span>, <span class="var-highlight">{{empresa}}</span>.</p>
          <p>Nota: Para extraer el contenido real de Word, el sistema necesita estar conectado a internet (requiere la librería Mammoth.js).</p>`
      }
      document.getElementById('word-info').textContent = `Contenido extraído · ${wordContenido.length} caracteres`
      extracted.innerHTML = wordContenido
      preview.innerHTML = `<div class="doc-sheet">${wordContenido}</div>`
      result.classList.add('show')
      extractedWrap.style.display = 'block'
      document.getElementById('word-plt-nombre').value = file.name.replace(/\.docx?/i,'')
    } catch(err) {
      console.error(err)
      alert('Error procesando el archivo. Verifica que sea un .docx válido.')
    }
  }
  reader.readAsArrayBuffer(file)
}

function guardarDesdeWord() {
  const nombre = document.getElementById('word-plt-nombre')?.value?.trim()
  const tipo = document.getElementById('word-plt-tipo')?.value
  const contenido = document.getElementById('word-extracted')?.innerHTML || wordContenido
  if (!nombre) { alert('Ingresa un nombre para la plantilla'); return }
  PLANTILLAS.push({id:'plt-'+uid(), nombre, tipo, contenido, origen:'word', fecha: new Date().toISOString().split('T')[0]})
  alert(`✓ Plantilla "${nombre}" guardada desde Word`)
  showDocTab('tab-lista', document.querySelectorAll('.doc-tab')[0])
  renderPlantillas()
}

function editarDesdeWord() {
  const nombre = document.getElementById('word-plt-nombre')?.value?.trim() || 'Plantilla Word'
  const tipo = document.getElementById('word-plt-tipo')?.value || 'custom'
  const contenido = document.getElementById('word-extracted')?.innerHTML || wordContenido
  document.getElementById('plt-nombre').value = nombre
  document.getElementById('plt-tipo').value = tipo
  document.getElementById('plt-editor').innerHTML = contenido
  document.getElementById('editor-title').textContent = '✏️ Editando: ' + nombre
  plantillaEditandoId = null
  showDocTab('tab-editor', document.querySelectorAll('.doc-tab')[1])
  updateEditorPreview()
}

// Drag & drop
;(function(){
  document.addEventListener('DOMContentLoaded', () => {
    const dz = document.getElementById('word-dropzone')
    if (!dz) return
    dz.addEventListener('dragover', e => { e.preventDefault(); dz.classList.add('dragover') })
    dz.addEventListener('dragleave', () => dz.classList.remove('dragover'))
    dz.addEventListener('drop', e => { e.preventDefault(); dz.classList.remove('dragover'); if(e.dataTransfer.files[0]) procesarWord(e.dataTransfer.files[0]) })
  })
})()

// SIDEBAR — Toggle colapsable + Mobile
// ══════════════════════════════════════════════════════
let sbCollapsed = false

function toggleSidebar() {
  const sb = document.getElementById('sidebar')
  const main = document.querySelector('.main')
  const btn = document.getElementById('sb-toggle-btn')
  if (!sb || !main) return
  sbCollapsed = !sbCollapsed
  if (sbCollapsed) {
    sb.classList.add('collapsed')
    main.classList.add('sb-collapsed')
    if (btn) { btn.textContent = '▶'; btn.title = 'Expandir menú' }
    try { localStorage.setItem('sb-collapsed','1') } catch(e){}
  } else {
    sb.classList.remove('collapsed')
    main.classList.remove('sb-collapsed')
    if (btn) { btn.textContent = '◀'; btn.title = 'Colapsar menú' }
    try { localStorage.removeItem('sb-collapsed') } catch(e){}
  }
  setTimeout(() => { try { Object.values(charts).forEach(ch => ch?.resize?.()) } catch(e){} }, 320)
}

function openSidebar() {
  const sb = document.getElementById('sidebar')
  const overlay = document.getElementById('sb-overlay')
  if (!sb) return
  if (window.innerWidth <= 900) {
    sb.classList.add('open')
    if (overlay) overlay.classList.add('open')
  } else {
    if (sbCollapsed) toggleSidebar()
  }
}

function closeSidebar() {
  const sb = document.getElementById('sidebar')
  const overlay = document.getElementById('sb-overlay')
  if (sb) sb.classList.remove('open')
  if (overlay) overlay.classList.remove('open')
}

function setBN(activeId) {
  document.querySelectorAll('.bn-item').forEach(b => b.classList.remove('active'))
  const el = document.getElementById(activeId)
  if (el) el.classList.add('active')
  closeSidebar()
}

// Restore collapsed state
;(function() {
  try {
    if (localStorage.getItem('sb-collapsed') && window.innerWidth > 768) {
      const sb = document.getElementById('sidebar')
      const main = document.querySelector('.main')
      const btn = document.getElementById('sb-toggle-btn')
      if (sb && main) {
        sb.classList.add('collapsed')
        main.classList.add('sb-collapsed')
        if (btn) btn.textContent = '▶'
        sbCollapsed = true
      }
    }
  } catch(e){}
})()

// Auto-close on mobile nav click
document.querySelectorAll('.nav-btn').forEach(b => {
  b.addEventListener('click', () => { if (window.innerWidth <= 768) closeSidebar() })
})

window.addEventListener('resize', () => {
  if (window.innerWidth > 768) {
    closeSidebar()
    // Fix main margin if not collapsed
    const main = document.querySelector('.main')
    if (main && !sbCollapsed) main.classList.remove('sb-collapsed')
  }
})

// ══════════════════════════════════════════════════════
// USUARIOS DEL PORTAL — Gestión desde admin
// ══════════════════════════════════════════════════════

function showCliTab(tab, btn) {
  document.getElementById('sub-clientes').style.display = tab === 'clientes' ? '' : 'none'
  document.getElementById('sub-usuarios').style.display = tab === 'usuarios' ? '' : 'none'
  document.getElementById('tab-clientes-btn').className = tab === 'clientes' ? 'btn btn-p' : 'btn btn-o'
  document.getElementById('tab-usuarios-btn').className = tab === 'usuarios' ? 'btn btn-p' : 'btn btn-o'
  document.getElementById('tab-clientes-btn').style.cssText = 'font-size:12px;padding:6px 14px'
  document.getElementById('tab-usuarios-btn').style.cssText = 'font-size:12px;padding:6px 14px'
  if (tab === 'usuarios') renderUsuarios()
}

let _usuarios = []

async function cargarUsuarios() {
  try {
    const { data, error } = await sb.from('sc_usuarios').select('*').order('created_at', { ascending: false })
    if (error) throw error
    _usuarios = data || []
  } catch(e) {
    console.warn('Error cargando usuarios:', e)
    _usuarios = []
  }
}

function renderUsuarios() {
  const q = (document.getElementById('usr-q')?.value || '').toLowerCase()
  const rows = _usuarios.filter(u =>
    !q || u.nombre?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q)
  )
  const grid = document.getElementById('usr-grid')
  if (!grid) return

  if (rows.length === 0) {
    grid.innerHTML = '<p class="empty">Sin usuarios. Crea el primero con "+ Nuevo Usuario".</p>'
    return
  }

  grid.innerHTML = `
    <table style="width:100%;border-collapse:collapse;font-size:13px">
      <thead>
        <tr style="border-bottom:2px solid var(--borde)">
          <th style="text-align:left;padding:8px 12px;color:var(--gris-s);font-weight:600;font-size:11px;text-transform:uppercase;letter-spacing:.5px">Nombre</th>
          <th style="text-align:left;padding:8px 12px;color:var(--gris-s);font-weight:600;font-size:11px;text-transform:uppercase;letter-spacing:.5px">Email</th>
          <th style="text-align:left;padding:8px 12px;color:var(--gris-s);font-weight:600;font-size:11px;text-transform:uppercase;letter-spacing:.5px">Cliente asociado</th>
          <th style="text-align:center;padding:8px 12px;color:var(--gris-s);font-weight:600;font-size:11px;text-transform:uppercase;letter-spacing:.5px">Estado</th>
          <th style="text-align:right;padding:8px 12px;color:var(--gris-s);font-weight:600;font-size:11px;text-transform:uppercase;letter-spacing:.5px">Acciones</th>
        </tr>
      </thead>
      <tbody>
        ${rows.map(u => `
          <tr style="border-bottom:1px solid var(--borde);transition:background .15s" onmouseover="this.style.background='var(--rosa-p)'" onmouseout="this.style.background=''">
            <td style="padding:12px">
              <div style="display:flex;align-items:center;gap:10px">
                <div style="width:32px;height:32px;background:var(--rosa-p);border:1px solid var(--rosa-l);border-radius:50%;display:flex;align-items:center;justify-content:center;font-family:'Cormorant Garamond',serif;font-size:15px;color:var(--rosa-d);font-weight:600;flex-shrink:0">${(u.nombre||'?')[0].toUpperCase()}</div>
                <span style="font-weight:600">${u.nombre||'—'}</span>
              </div>
            </td>
            <td style="padding:12px;color:var(--gris-m)">${u.email}</td>
            <td style="padding:12px;color:var(--gris-m)">${u.cliente_nombre || '<span style="color:var(--gris-s);font-style:italic">Sin asociar</span>'}</td>
            <td style="padding:12px;text-align:center">
              <span style="display:inline-block;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:600;${u.activo ? 'background:var(--verde-p);color:var(--verde-b)' : 'background:#fee2e2;color:#dc2626'}">${u.activo ? '✓ Activo' : '✗ Inactivo'}</span>
            </td>
            <td style="padding:12px;text-align:right">
              <div style="display:flex;gap:6px;justify-content:flex-end">
                <button class="btn btn-o" onclick="editarUsuario('${u.id}')" style="font-size:11px;padding:5px 10px">✏ Editar</button>
                <button class="btn ${u.activo ? 'btn-o' : 'btn-v'}" onclick="toggleUsuario('${u.id}',${!u.activo})" style="font-size:11px;padding:5px 10px">${u.activo ? '⏸ Desactivar' : '▶ Activar'}</button>
                <button class="btn" onclick="eliminarUsuario('${u.id}')" style="font-size:11px;padding:5px 10px;border-color:#fca5a5;color:#dc2626">🗑</button>
              </div>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `
}

function openModalUsuario(id) {
  const u = id ? _usuarios.find(x => x.id === id) : null
  const clienteOpts = DATA.clientes.map(c =>
    `<option value="${c.nombre}" ${u?.cliente_nombre === c.nombre ? 'selected' : ''}>${c.nombre}</option>`
  ).join('')

  const html = `
    <div style="display:flex;flex-direction:column;gap:14px">
      <div>
        <label style="font-size:11px;font-weight:600;color:var(--gris-s);letter-spacing:.5px;text-transform:uppercase;display:block;margin-bottom:5px">Nombre completo *</label>
        <input class="si" id="u-nombre" value="${u?.nombre||''}" placeholder="Nombre del cliente">
      </div>
      <div>
        <label style="font-size:11px;font-weight:600;color:var(--gris-s);letter-spacing:.5px;text-transform:uppercase;display:block;margin-bottom:5px">Correo electrónico *</label>
        <input class="si" id="u-email" type="email" value="${u?.email||''}" placeholder="cliente@empresa.cl" ${u ? 'readonly style="opacity:.6"' : ''}>
      </div>
      <div>
        <label style="font-size:11px;font-weight:600;color:var(--gris-s);letter-spacing:.5px;text-transform:uppercase;display:block;margin-bottom:5px">Contraseña ${u ? '(dejar vacío para no cambiar)' : '*'}</label>
        <input class="si" id="u-pass" type="text" value="" placeholder="${u ? 'Nueva contraseña...' : 'Contraseña inicial'}">
      </div>
      <div>
        <label style="font-size:11px;font-weight:600;color:var(--gris-s);letter-spacing:.5px;text-transform:uppercase;display:block;margin-bottom:5px">Cliente asociado</label>
        <select class="si" id="u-cliente" style="background:#fff">
          <option value="">— Sin asociar —</option>
          ${clienteOpts}
        </select>
      </div>
      <div>
        <label style="font-size:11px;font-weight:600;color:var(--gris-s);letter-spacing:.5px;text-transform:uppercase;display:block;margin-bottom:5px">Estado</label>
        <select class="si" id="u-activo" style="background:#fff">
          <option value="true" ${u?.activo !== false ? 'selected' : ''}>✓ Activo</option>
          <option value="false" ${u?.activo === false ? 'selected' : ''}>✗ Inactivo</option>
        </select>
      </div>
      <div id="usr-modal-msg" style="display:none;padding:10px;border-radius:8px;font-size:13px"></div>
    </div>
  `

  document.getElementById('m-title').textContent = u ? 'Editar Usuario' : 'Nuevo Usuario del Portal'
  document.getElementById('m-body').innerHTML = html
  const saveBtn = document.getElementById('m-save')
  saveBtn.style.display = 'block'
  saveBtn.textContent = 'Guardar'
  saveBtn.onclick = () => guardarUsuario(u?.id || null)
  document.getElementById('overlay').style.display = 'flex'
}

function editarUsuario(id) { openModalUsuario(id) }

async function guardarUsuario(id) {
  const nombre = document.getElementById('u-nombre')?.value?.trim()
  const email  = document.getElementById('u-email')?.value?.trim().toLowerCase()
  const pass   = document.getElementById('u-pass')?.value?.trim()
  const cliente_nombre = document.getElementById('u-cliente')?.value || null
  const activo = document.getElementById('u-activo')?.value === 'true'
  const msgEl  = document.getElementById('usr-modal-msg')

  const showM = (txt, ok) => {
    msgEl.textContent = txt
    msgEl.style.cssText = `display:block;padding:10px;border-radius:8px;font-size:13px;background:${ok?'var(--verde-p)':'#fee2e2'};color:${ok?'var(--verde-b)':'#dc2626'}`
  }

  if (!nombre || !email) return showM('Nombre y correo son obligatorios.', false)
  if (!id && !pass) return showM('La contraseña es obligatoria para nuevos usuarios.', false)

  const saveBtn = document.getElementById('m-save')
  saveBtn.disabled = true; saveBtn.textContent = 'Guardando…'

  try {
    if (id) {
      // Actualizar
      const upd = { nombre, cliente_nombre, activo }
      if (pass) upd.pass = pass
      const { error } = await sb.from('sc_usuarios').update(upd).eq('id', id)
      if (error) throw error
      const idx = _usuarios.findIndex(u => u.id === id)
      if (idx >= 0) _usuarios[idx] = { ..._usuarios[idx], ...upd }
    } else {
      // Crear nuevo
      const { data, error } = await sb.from('sc_usuarios').insert([{
        nombre, email, pass, cliente_nombre, activo, rol: 'cliente'
      }]).select().single()
      if (error) throw error
      _usuarios.unshift(data)
    }
    showM('✓ Guardado correctamente', true)
    renderUsuarios()
    setTimeout(() => cerrarModal(), 1200)
  } catch(e) {
    showM('Error: ' + (e.message || 'No se pudo guardar'), false)
  } finally {
    saveBtn.disabled = false; saveBtn.textContent = 'Guardar'
  }
}

async function toggleUsuario(id, nuevoEstado) {
  try {
    const { error } = await sb.from('sc_usuarios').update({ activo: nuevoEstado }).eq('id', id)
    if (error) throw error
    const u = _usuarios.find(x => x.id === id)
    if (u) u.activo = nuevoEstado
    renderUsuarios()
  } catch(e) { alert('Error al cambiar estado: ' + e.message) }
}

async function eliminarUsuario(id) {
  const u = _usuarios.find(x => x.id === id)
  if (!u) return
  if (!confirm(`¿Eliminar al usuario ${u.nombre}? Esta acción no se puede deshacer.`)) return
  try {
    const { error } = await sb.from('sc_usuarios').delete().eq('id', id)
    if (error) throw error
    _usuarios = _usuarios.filter(x => x.id !== id)
    renderUsuarios()
  } catch(e) { alert('Error al eliminar: ' + e.message) }
}

function logout() {
  sessionStorage.removeItem('sc_user')
  window.location.href = 'index.html'
}

// Cargar usuarios al abrir pestaña clientes
const _origGo = go
window.go = function(id, btn) {
  _origGo(id, btn)
  if (id === 'clientes') {
    cargarUsuarios().then(() => {
      // solo renderizar si ya está en sub-tab usuarios
      if (document.getElementById('sub-usuarios')?.style.display !== 'none') renderUsuarios()
    })
  }
}

// ══════════════════════════════════════════════════════
// PORTAL CLIENTE — Gestión de datos desde admin
// ══════════════════════════════════════════════════════

let _pcEmail = null   // email del cliente activo en perfil
let _pcData  = {ingresos:[], gastos:[], facturas:[], cotizaciones:[]}
let _pcTab   = 'ingresos'

// Override verPerfilCliente to also load portal data
const _origVerPerfil = verPerfilCliente
window.verPerfilCliente = async function(id) {
  _origVerPerfil(id)
  const c = DATA.clientes.find(x => x.id === id)
  if (!c) return
  // Find associated usuario email
  const usuarioMatch = _usuarios.find(u => u.cliente_nombre === c.nombre)
  _pcEmail = usuarioMatch?.email || c.email || null
  if (_pcEmail) {
    setStatus('Cargando datos del portal...')
    await cargarDatosPortal()
    setStatus(_pcEmail)
  } else {
    setStatus('⚠ Sin usuario de portal asociado')
    ['ing','gas','fac','cot'].forEach(t => {
      const el = document.getElementById('pc-' + t + '-body')
      if (el) el.innerHTML = '<tr><td colspan="7" class="empty">Asocia un usuario del portal para gestionar sus datos.</td></tr>'
    })
  }
}

function setStatus(msg) {
  const el = document.getElementById('pc-portal-status')
  if (el) el.textContent = msg
}

async function cargarDatosPortal() {
  if (!_pcEmail) return
  try {
    const [ing, gas, fac, cot] = await Promise.all([
      sb.from('portal_ingresos').select('*').eq('cliente_email',_pcEmail).order('fecha',{ascending:false}),
      sb.from('portal_gastos').select('*').eq('cliente_email',_pcEmail).order('fecha',{ascending:false}),
      sb.from('portal_facturas').select('*').eq('cliente_email',_pcEmail).order('fecha_emision',{ascending:false}),
      sb.from('portal_cotizaciones').select('*').eq('cliente_email',_pcEmail).order('fecha',{ascending:false})
    ])
    _pcData.ingresos    = ing.data  || []
    _pcData.gastos      = gas.data  || []
    _pcData.facturas    = fac.data  || []
    _pcData.cotizaciones = cot.data || []
    renderPCTab(_pcTab)
  } catch(e) {
    setStatus('Error cargando datos: ' + e.message)
  }
}

function showPCTab(tab, btn) {
  _pcTab = tab
  const tabs = ['ingresos','gastos','facturas','cotizaciones']
  const btnIds = {ingresos:'ing',gastos:'gas',facturas:'fac',cotizaciones:'cot'}
  tabs.forEach(t => {
    document.getElementById('pctab-' + t).style.display = t === tab ? '' : 'none'
    const b = document.getElementById('pctab-' + btnIds[t] + '-btn')
    if (b) { b.className = t === tab ? 'btn btn-p' : 'btn btn-o'; b.style.cssText = 'font-size:11px;padding:5px 12px' }
  })
  renderPCTab(tab)
}

function fmt2(n) { return '$' + (n||0).toLocaleString('es-CL') }
function fd2(f) { return f ? new Date(f+'T00:00:00').toLocaleDateString('es-CL',{day:'2-digit',month:'short',year:'numeric'}) : '—' }

function renderPCTab(tab) {
  if (tab === 'ingresos') {
    document.getElementById('pc-ing-body').innerHTML = _pcData.ingresos.length === 0
      ? '<tr><td colspan="5" class="empty">Sin ingresos registrados</td></tr>'
      : _pcData.ingresos.map(r => `<tr>
          <td style="font-weight:600">${r.descripcion||'—'}</td>
          <td><span class="bdg ok">${r.cat||'—'}</span></td>
          <td style="font-size:11px;color:var(--gris-s)">${fd2(r.fecha)}</td>
          <td class="nbold ap">${fmt2(r.monto)}</td>
          <td><button class="btn" onclick="eliminarPC('portal_ingresos','${r.id}','ingresos')" style="font-size:10px;padding:3px 8px;border-color:#fca5a5;color:#dc2626">🗑</button></td>
        </tr>`).join('')
  }
  if (tab === 'gastos') {
    document.getElementById('pc-gas-body').innerHTML = _pcData.gastos.length === 0
      ? '<tr><td colspan="5" class="empty">Sin gastos registrados</td></tr>'
      : _pcData.gastos.map(r => `<tr>
          <td style="font-weight:600">${r.descripcion||'—'}</td>
          <td><span class="bdg pend">${r.cat||'—'}</span></td>
          <td style="font-size:11px;color:var(--gris-s)">${fd2(r.fecha)}</td>
          <td class="nbold an">${fmt2(r.monto)}</td>
          <td><button class="btn" onclick="eliminarPC('portal_gastos','${r.id}','gastos')" style="font-size:10px;padding:3px 8px;border-color:#fca5a5;color:#dc2626">🗑</button></td>
        </tr>`).join('')
  }
  if (tab === 'facturas') {
    document.getElementById('pc-fac-body').innerHTML = _pcData.facturas.length === 0
      ? '<tr><td colspan="7" class="empty">Sin facturas registradas</td></tr>'
      : _pcData.facturas.map(r => `<tr>
          <td style="font-size:11px;color:var(--gris-s)">${r.numero||'—'}</td>
          <td style="font-weight:600">${r.servicio||'—'}</td>
          <td style="font-size:11px;color:var(--gris-s)">${fd2(r.fecha_emision)}</td>
          <td style="font-size:11px;color:var(--gris-s)">${fd2(r.fecha_vencimiento)}</td>
          <td class="nbold">${fmt2(r.monto)}</td>
          <td><span class="bdg ${r.estado==='pagada'?'ok':r.estado==='vencida'?'ven':'pend'}">${r.estado||'pendiente'}</span></td>
          <td><button class="btn" onclick="eliminarPC('portal_facturas','${r.id}','facturas')" style="font-size:10px;padding:3px 8px;border-color:#fca5a5;color:#dc2626">🗑</button></td>
        </tr>`).join('')
  }
  if (tab === 'cotizaciones') {
    document.getElementById('pc-cot-body').innerHTML = _pcData.cotizaciones.length === 0
      ? '<tr><td colspan="6" class="empty">Sin cotizaciones registradas</td></tr>'
      : _pcData.cotizaciones.map(r => `<tr>
          <td style="font-size:11px;color:var(--gris-s)">${r.numero||'—'}</td>
          <td style="font-weight:600">${r.descripcion||'—'}</td>
          <td style="font-size:11px;color:var(--gris-s)">${fd2(r.fecha)}</td>
          <td class="nbold">${fmt2(r.monto)}</td>
          <td><span class="bdg ${r.estado==='aprobada'?'ok':r.estado==='rechazada'?'ven':'pend'}">${r.estado||'enviada'}</span></td>
          <td><button class="btn" onclick="eliminarPC('portal_cotizaciones','${r.id}','cotizaciones')" style="font-size:10px;padding:3px 8px;border-color:#fca5a5;color:#dc2626">🗑</button></td>
        </tr>`).join('')
  }
}

function abrirFormPC(tipo) {
  if (!_pcEmail) return alert('Este cliente no tiene usuario de portal asociado.')
  const HOY = new Date().toISOString().split('T')[0]

  const forms = {
    ingreso: {
      title: 'Agregar Ingreso al Portal',
      html: `<div style="display:flex;flex-direction:column;gap:12px">
        <div><label style="font-size:11px;font-weight:600;color:var(--gris-s);text-transform:uppercase;letter-spacing:.5px;display:block;margin-bottom:4px">Descripción *</label>
          <input class="si" id="pf-desc" placeholder="Ej. Honorarios mayo"></div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
          <div><label style="font-size:11px;font-weight:600;color:var(--gris-s);text-transform:uppercase;letter-spacing:.5px;display:block;margin-bottom:4px">Categoría</label>
            <select class="si" id="pf-cat" style="background:#fff">
              <option>Sueldo</option><option>Freelance</option><option>Servicios</option><option>Arriendo</option><option>Otro</option>
            </select></div>
          <div><label style="font-size:11px;font-weight:600;color:var(--gris-s);text-transform:uppercase;letter-spacing:.5px;display:block;margin-bottom:4px">Monto *</label>
            <input class="si" id="pf-monto" type="number" placeholder="0"></div>
        </div>
        <div><label style="font-size:11px;font-weight:600;color:var(--gris-s);text-transform:uppercase;letter-spacing:.5px;display:block;margin-bottom:4px">Fecha</label>
          <input class="si" id="pf-fecha" type="date" value="${HOY}"></div>
        <div><label style="font-size:11px;font-weight:600;color:var(--gris-s);text-transform:uppercase;letter-spacing:.5px;display:block;margin-bottom:4px">Nota</label>
          <input class="si" id="pf-nota" placeholder="Opcional"></div>
        <div id="pf-msg"></div>
      </div>`,
      save: async () => {
        const desc = document.getElementById('pf-desc')?.value?.trim()
        const monto = parseFloat(document.getElementById('pf-monto')?.value)
        if (!desc || !monto) { showPFMsg('Descripción y monto son obligatorios','err'); return }
        await guardarPC('portal_ingresos', {
          cliente_email: _pcEmail, descripcion: desc,
          cat: document.getElementById('pf-cat')?.value,
          monto, fecha: document.getElementById('pf-fecha')?.value,
          nota: document.getElementById('pf-nota')?.value||''
        }, 'ingresos')
      }
    },
    gasto: {
      title: 'Agregar Gasto al Portal',
      html: `<div style="display:flex;flex-direction:column;gap:12px">
        <div><label style="font-size:11px;font-weight:600;color:var(--gris-s);text-transform:uppercase;letter-spacing:.5px;display:block;margin-bottom:4px">Descripción *</label>
          <input class="si" id="pf-desc" placeholder="Ej. Arriendo oficina"></div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
          <div><label style="font-size:11px;font-weight:600;color:var(--gris-s);text-transform:uppercase;letter-spacing:.5px;display:block;margin-bottom:4px">Categoría</label>
            <select class="si" id="pf-cat" style="background:#fff">
              <option>Vivienda</option><option>Alimentación</option><option>Transporte</option><option>Servicios</option><option>Salud</option><option>Tecnología</option><option>Otro</option>
            </select></div>
          <div><label style="font-size:11px;font-weight:600;color:var(--gris-s);text-transform:uppercase;letter-spacing:.5px;display:block;margin-bottom:4px">Monto *</label>
            <input class="si" id="pf-monto" type="number" placeholder="0"></div>
        </div>
        <div><label style="font-size:11px;font-weight:600;color:var(--gris-s);text-transform:uppercase;letter-spacing:.5px;display:block;margin-bottom:4px">Fecha</label>
          <input class="si" id="pf-fecha" type="date" value="${HOY}"></div>
        <div id="pf-msg"></div>
      </div>`,
      save: async () => {
        const desc = document.getElementById('pf-desc')?.value?.trim()
        const monto = parseFloat(document.getElementById('pf-monto')?.value)
        if (!desc || !monto) { showPFMsg('Descripción y monto son obligatorios','err'); return }
        await guardarPC('portal_gastos', {
          cliente_email: _pcEmail, descripcion: desc,
          cat: document.getElementById('pf-cat')?.value,
          monto, fecha: document.getElementById('pf-fecha')?.value
        }, 'gastos')
      }
    },
    factura: {
      title: 'Agregar Factura al Portal',
      html: `<div style="display:flex;flex-direction:column;gap:12px">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
          <div><label style="font-size:11px;font-weight:600;color:var(--gris-s);text-transform:uppercase;letter-spacing:.5px;display:block;margin-bottom:4px">N° Factura</label>
            <input class="si" id="pf-num" placeholder="F-2026-001"></div>
          <div><label style="font-size:11px;font-weight:600;color:var(--gris-s);text-transform:uppercase;letter-spacing:.5px;display:block;margin-bottom:4px">Monto *</label>
            <input class="si" id="pf-monto" type="number" placeholder="0"></div>
        </div>
        <div><label style="font-size:11px;font-weight:600;color:var(--gris-s);text-transform:uppercase;letter-spacing:.5px;display:block;margin-bottom:4px">Servicio *</label>
          <input class="si" id="pf-desc" placeholder="Ej. Asesoría contable mensual"></div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
          <div><label style="font-size:11px;font-weight:600;color:var(--gris-s);text-transform:uppercase;letter-spacing:.5px;display:block;margin-bottom:4px">Fecha emisión</label>
            <input class="si" id="pf-fecha" type="date" value="${HOY}"></div>
          <div><label style="font-size:11px;font-weight:600;color:var(--gris-s);text-transform:uppercase;letter-spacing:.5px;display:block;margin-bottom:4px">Fecha vencimiento</label>
            <input class="si" id="pf-fecha2" type="date"></div>
        </div>
        <div><label style="font-size:11px;font-weight:600;color:var(--gris-s);text-transform:uppercase;letter-spacing:.5px;display:block;margin-bottom:4px">Estado</label>
          <select class="si" id="pf-estado" style="background:#fff">
            <option value="pendiente">Pendiente</option><option value="pagada">Pagada</option><option value="vencida">Vencida</option>
          </select></div>
        <div id="pf-msg"></div>
      </div>`,
      save: async () => {
        const desc = document.getElementById('pf-desc')?.value?.trim()
        const monto = parseFloat(document.getElementById('pf-monto')?.value)
        if (!desc || !monto) { showPFMsg('Servicio y monto son obligatorios','err'); return }
        await guardarPC('portal_facturas', {
          cliente_email: _pcEmail,
          numero: document.getElementById('pf-num')?.value||'',
          servicio: desc, monto,
          fecha_emision: document.getElementById('pf-fecha')?.value,
          fecha_vencimiento: document.getElementById('pf-fecha2')?.value||null,
          estado: document.getElementById('pf-estado')?.value||'pendiente'
        }, 'facturas')
      }
    },
    cotizacion: {
      title: 'Agregar Cotización al Portal',
      html: `<div style="display:flex;flex-direction:column;gap:12px">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
          <div><label style="font-size:11px;font-weight:600;color:var(--gris-s);text-transform:uppercase;letter-spacing:.5px;display:block;margin-bottom:4px">N° Cotización</label>
            <input class="si" id="pf-num" placeholder="COT-2026-001"></div>
          <div><label style="font-size:11px;font-weight:600;color:var(--gris-s);text-transform:uppercase;letter-spacing:.5px;display:block;margin-bottom:4px">Monto *</label>
            <input class="si" id="pf-monto" type="number" placeholder="0"></div>
        </div>
        <div><label style="font-size:11px;font-weight:600;color:var(--gris-s);text-transform:uppercase;letter-spacing:.5px;display:block;margin-bottom:4px">Descripción *</label>
          <input class="si" id="pf-desc" placeholder="Ej. Paquete contabilidad anual"></div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
          <div><label style="font-size:11px;font-weight:600;color:var(--gris-s);text-transform:uppercase;letter-spacing:.5px;display:block;margin-bottom:4px">Fecha</label>
            <input class="si" id="pf-fecha" type="date" value="${HOY}"></div>
          <div><label style="font-size:11px;font-weight:600;color:var(--gris-s);text-transform:uppercase;letter-spacing:.5px;display:block;margin-bottom:4px">Estado</label>
            <select class="si" id="pf-estado" style="background:#fff">
              <option value="enviada">Enviada</option><option value="aprobada">Aprobada</option><option value="rechazada">Rechazada</option>
            </select></div>
        </div>
        <div id="pf-msg"></div>
      </div>`,
      save: async () => {
        const desc = document.getElementById('pf-desc')?.value?.trim()
        const monto = parseFloat(document.getElementById('pf-monto')?.value)
        if (!desc || !monto) { showPFMsg('Descripción y monto son obligatorios','err'); return }
        await guardarPC('portal_cotizaciones', {
          cliente_email: _pcEmail,
          numero: document.getElementById('pf-num')?.value||'',
          descripcion: desc, monto,
          fecha: document.getElementById('pf-fecha')?.value,
          estado: document.getElementById('pf-estado')?.value||'enviada'
        }, 'cotizaciones')
      }
    }
  }

  const cfg = forms[tipo]
  if (!cfg) return
  document.getElementById('m-title').textContent = cfg.title
  document.getElementById('m-body').innerHTML = cfg.html
  const saveBtn = document.getElementById('m-save')
  saveBtn.onclick = cfg.save
  saveBtn.style.display = 'block'
  document.getElementById('overlay').style.display = 'flex'
}

function showPFMsg(txt, type) {
  const el = document.getElementById('pf-msg')
  if (!el) return
  el.innerHTML = `<div style="padding:8px 12px;border-radius:7px;font-size:12px;${type==='err'?'background:#fee2e2;color:#dc2626':'background:var(--verde-p);color:var(--verde-b)'}">` + txt + '</div>'
}

async function guardarPC(tabla, data, tipo) {
  const saveBtn = document.getElementById('m-save')
  if (saveBtn) { saveBtn.disabled = true; saveBtn.textContent = 'Guardando…' }
  try {
    const { data: row, error } = await sb.from(tabla).insert([data]).select().single()
    if (error) throw error
    _pcData[tipo].unshift(row)
    renderPCTab(tipo)
    cerrarModal()
    showMsg('pc-portal-status', 'ok', '✓ Guardado')
  } catch(e) {
    showPFMsg('Error: ' + (e.message || 'No se pudo guardar'), 'err')
  } finally {
    if (saveBtn) { saveBtn.disabled = false; saveBtn.textContent = 'Guardar' }
  }
}

async function eliminarPC(tabla, id, tipo) {
  if (!confirm('¿Eliminar este registro del portal del cliente?')) return
  try {
    const { error } = await sb.from(tabla).delete().eq('id', id)
    if (error) throw error
    _pcData[tipo] = _pcData[tipo].filter(r => r.id !== id)
    renderPCTab(tipo)
  } catch(e) { alert('Error al eliminar: ' + e.message) }
}

// ── Global exports ──
window.abrirFormPC = abrirFormPC
window.accion = accion
window.aprobar = aprobar
window.calNav = calNav
window.cambiarEmpresaDoc = cambiarEmpresaDoc
window.cerrarModal = cerrarModal
window.closeSidebar = closeSidebar
window.cotToFactura = cotToFactura
window.del = del
window.editFila = editFila
window.editarDesdeWord = editarDesdeWord
window.editarUsuario = editarUsuario
window.eliminarPC = eliminarPC
window.eliminarUsuario = eliminarUsuario
window.exportReporte = exportReporte
window.exportTabla = exportTabla
window.exportXL = exportXL
window.exportarPlantillaPDF = exportarPlantillaPDF
window.formatText = formatText
window.generarDocPDF = generarDocPDF
window.goRH = goRH
window.guardarDesdeWord = guardarDesdeWord
window.guardarPlantilla = guardarPlantilla
window.insertFirmas = insertFirmas
window.insertSeccion = insertSeccion
window.insertVar = insertVar
window.logout = () => window.__appLogout?.()
window.marcarPagada = marcarPagada
window.openModal = openModal
window.openModalUsuario = openModalUsuario
window.openSidebar = openSidebar
window.procesarWord = procesarWord
window.refresh = refresh
window.renderAsistencia = renderAsistencia
window.renderClientes = renderClientes
window.renderCotizaciones = renderCotizaciones
window.renderEmpleados = renderEmpleados
window.renderEmpresasRH = renderEmpresasRH
window.renderFacturas = renderFacturas
window.renderGastos = renderGastos
window.renderIngresos = renderIngresos
window.renderNomina = renderNomina
window.renderPlantillas = renderPlantillas
window.renderUsuarios = renderUsuarios
window.renderVacaciones = renderVacaciones
window.selDocTipo = selDocTipo
window.setBN = setBN
window.setStatus = setStatus
window.showCliTab = showCliTab
window.showDocTab = showDocTab
window.showMsg = showMsg
window.showPCTab = showPCTab
window.toggleDark = toggleDark
window.toggleSidebar = toggleSidebar
window.toggleUsuario = toggleUsuario
window.updateDocPreview = updateDocPreview
window.updateEditorPreview = updateEditorPreview
window.verPerfilCliente = verPerfilCliente

function initAdmin() {
  window._SC_USER = window._PORTAL_USER
  const logoImgs = document.querySelectorAll('#logo-img')
  logoImgs.forEach(img => img.src = 'data:image/jpeg;base64,' + LOGO_B64)
  const cfgEl = document.getElementById('cfg-nombre-display')
  if (cfgEl) cfgEl.textContent = window._PORTAL_USER.nombre || 'Admin'
  if (typeof go === 'function') go('dashboard', null)
  if (typeof renderDashboard === 'function') renderDashboard()
  if (typeof calcAlerts === 'function') calcAlerts()
}
window._initAdmin = initAdmin

})()

export function initAdmin() {
  if (typeof window._initAdmin === 'function') window._initAdmin()
}
