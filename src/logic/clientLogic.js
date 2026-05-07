import { sb } from '../lib/supabase.js'
window.sb = sb

// Wrap in IIFE to avoid duplicate identifier issues in module scope
try { ;(function() {

// ══ AUTH: Leer sesión desde index.html ══
;(function initFromSession() {
  const user = JSON.parse(sessionStorage.getItem('sc_user') || 'null')
  if (!user || user.rol !== 'cliente') { return }
  // Pre-set currentUser so the IIFE can use it
  window._SC_SESSION_USER = user
})()

;(async function() {
'use strict';

// ══ FUNCIONES EARLY (disponibles antes del DOM) ══
let currentRol = 'admin'  // inicializar aquí también
function selRole(rol, el) {
  currentRol = rol
  document.querySelectorAll('.role-card').forEach(c => c.classList.remove('selected'))
  if(el) el.classList.add('selected')
  const ROL_DESC = {
    macro:'🌐 Vista global — solo lectura. Dashboard consolidado de todos los clientes.',
    admin:'⚙️ Admin — Acceso completo al sistema: clientes, RRHH, documentos, reportes.',
    cliente:'👤 Cliente — Tu portal personal de finanzas y planner.'
  }
  const infoEl = document.getElementById('role-info-text')
  if (infoEl) infoEl.textContent = ROL_DESC[rol] || ''
}

// ══════════════════════════════════════════
// SUPABASE INIT
// ══════════════════════════════════════════
// SB_URL y SB_KEY ya definidos en script global
// SB compartido desde router
// sb is provided via window.sb = sb (set in clientLogic.js import)

// DATOS & ESTADO
// ══════════════════════════════════════════
const HOY = new Date().toISOString().split('T')[0]
const d = n => new Date(Date.now()+n*86400000).toISOString().split('T')[0]

let currentUser = null
let DB = {}  // cache local

const fmt = n => {
  const num = Number(n||0)
  if (Math.abs(num) >= 1000000) return '$' + (num/1000000).toFixed(1) + 'M'
  return '$' + num.toLocaleString('es-CL')
}
const fdate = s => { try { return new Date(s+'T12:00').toLocaleDateString('es-CL',{day:'2-digit',month:'short',year:'numeric'}) } catch(e){ return s } }
const uid = () => crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2)+Date.now().toString(36)
const vv = id => document.getElementById(id)?.value || ''
const getData = () => DB[currentUser?.email] || {ingresos:[],gastos:[],metas:[],recordatorios:[],eventos:[]}
const setData = (key, val) => { if(currentUser) DB[currentUser.email][key] = val }

let calYear = new Date().getFullYear()
let calMonth = new Date().getMonth()
let charts = {}
let curTab = 'dashboard'
let _sbLoading = false

// ══════════════════════════════════════════
// SUPABASE — Helpers
// ══════════════════════════════════════════
const SB_TABLES = {
  ingresos: 'portal_ingresos',
  gastos: 'portal_gastos',
  metas: 'portal_metas',
  recordatorios: 'portal_recordatorios',
  eventos: 'portal_eventos'
}

async function sbFetch(tabla, email) {
  if (!sb) return []
  try {
    const { data, error } = await sb.from(tabla).select('*').eq('cliente_email', email).order('created_at', {ascending: false})
    if (error) { console.warn('SB fetch error:', error.message); return [] }
    return data || []
  } catch(e) { console.warn('SB error:', e); return [] }
}

async function sbInsert(tabla, obj) {
  try {
    const { data, error } = await sb.from(tabla).insert([obj]).select()
    if (error) console.warn('SB insert error:', error.message)
    return data?.[0] || obj
  } catch(e) { console.warn('SB error:', e); return obj }
}

async function sbUpdate(tabla, id, obj) {
  try {
    const { error } = await sb.from(tabla).update(obj).eq('id', id)
    if (error) console.warn('SB update error:', error.message)
  } catch(e) { console.warn('SB error:', e) }
}

async function sbDelete(tabla, id) {
  try {
    const { error } = await sb.from(tabla).delete().eq('id', id)
    if (error) console.warn('SB delete error:', error.message)
  } catch(e) { console.warn('SB error:', e) }
}

function mapFromSB(tipo, row) {
  // Normalizar campos de Supabase al formato interno
  if (tipo === 'ingresos' || tipo === 'gastos') {
    return { id: row.id, desc: row.descripcion, cat: row.cat, monto: parseFloat(row.monto)||0, fecha: row.fecha, nota: row.nota||'' }
  }
  if (tipo === 'metas') {
    return { id: row.id, nombre: row.nombre, icono: row.icono||'🎯', objetivo: parseFloat(row.objetivo)||0, actual: parseFloat(row.actual)||0, fecha: row.fecha, color: row.color||'#E8909A' }
  }
  if (tipo === 'recordatorios') {
    return { id: row.id, desc: row.descripcion, fecha: row.fecha, tipo: 'recordatorio', icono: row.icono||'🔔' }
  }
  if (tipo === 'eventos') {
    return { id: row.id, tipo: row.tipo, desc: row.descripcion, fecha: row.fecha, fecha_fin: row.fecha_fin, icono: row.icono, color: row.color, nota: row.nota||'' }
  }
  return row
}

async function cargarDatosUsuario(email) {
  showLoading(true)
  DB[email] = { ingresos:[], gastos:[], metas:[], recordatorios:[], eventos:[], facturas:[], cotizaciones:[] }
  try {
    const [ing, gas, met, rec, ev, fac, cot] = await Promise.all([
      sbFetch('portal_ingresos', email),
      sbFetch('portal_gastos', email),
      sbFetch('portal_metas', email),
      sbFetch('portal_recordatorios', email),
      sbFetch('portal_eventos', email),
      sbFetch('portal_facturas', email),
      sbFetch('portal_cotizaciones', email),
    ])
    DB[email].ingresos = ing.map(r => mapFromSB('ingresos', r))
    DB[email].gastos = gas.map(r => mapFromSB('gastos', r))
    DB[email].facturas = fac
    DB[email].cotizaciones = cot
    DB[email].metas = met.map(r => mapFromSB('metas', r))
    DB[email].recordatorios = rec.map(r => mapFromSB('recordatorios', r))
    DB[email].eventos = ev.map(r => mapFromSB('eventos', r))
  } catch(e) { console.warn('Error cargando datos:', e) }
  showLoading(false)
}

function showLoading(show) {
  _sbLoading = show
  let el = document.getElementById('sb-loading')
  if (!el && show) {
    el = document.createElement('div')
    el.id = 'sb-loading'
    el.style.cssText = 'position:fixed;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,#E8909A,#F2B8C0,#E8909A);background-size:200% 100%;animation:shimmer 1.5s infinite linear;z-index:9999'
    document.body.appendChild(el)
  } else if (el && !show) {
    el.remove()
  }
}

// ══════════════════════════════════════════
// AUTH — Supabase + demo
// ══════════════════════════════════════════
// ══════════════════════════════════════════
// USUARIOS POR ROL
// ══════════════════════════════════════════
const USERS_DB = [
  // MACRO — solo lectura global
  { email:'macro@seguracontable.cl', pass:'macro2026', nombre:'Vista Global', rol:'macro', avatar:'🌐' },
  // ADMIN — acceso completo (tú)
  { email:'admin@seguracontable.cl', pass:'admin2026', nombre:'Administrador', rol:'admin', avatar:'⚙️' },
  { email:'demo@seguracontable.cl',  pass:'demo123',   nombre:'María González', rol:'admin', avatar:'😊' },
  // CLIENTES — solo su portal
  { email:'cliente@empresa.cl',      pass:'cliente2026', nombre:'Carlos Ruiz', rol:'cliente', avatar:'👤' },
]

const ROL_INFO = {
  macro:   { label:'Macro', badge:'macro',   desc:'🌐 Vista global — solo lectura. Dashboard consolidado de todos los clientes.' },
  admin:   { label:'Admin', badge:'admin',   desc:'⚙️ Admin — Acceso completo al sistema: clientes, RRHH, documentos, reportes.' },
  cliente: { label:'Cliente', badge:'cliente', desc:'👤 Cliente — Tu portal personal de finanzas y planner.' },
}

// currentRol ya declarado arriba

// Selector de rol en login
// selRole ya definida arriba — implementación principal:
function _selRoleMain(rol, el) {
  currentRol = rol
  document.querySelectorAll('.role-card').forEach(c => c.classList.remove('selected'))
  el.classList.add('selected')
  const info = ROL_INFO[rol]
  const infoEl = document.getElementById('role-info-text')
  if (infoEl) infoEl.textContent = info.desc
}

// Auto-login desde sesión (no se usa login aquí, viene de index.html)
window._doLogin = window.doLogin = async function doLogin() {
  const user = window._SC_SESSION_USER
  if (!user) { if (typeof window.__appLogout === 'function') window.__appLogout(); return }
  currentUser = { ...user, nombre: user.nombre, email: user.email, avatar: user.avatar || user.nombre[0], pass: user.pass || '' }
  currentRol = 'cliente'
  await cargarDatosUsuario(user.email)
  startApp()
}

window._doDemo = async function() {
  // Demo muestra Admin por defecto
  currentRol = document.querySelector('.role-card.selected')?.dataset?.rol || 'admin'
  const demoMap = { macro: USERS_DB[0], admin: USERS_DB[2], cliente: USERS_DB[3] }
  currentUser = { ...demoMap[currentRol] }
  if (currentRol === 'cliente') {
    try { await sb.from('clientes_portal').upsert({ email: currentUser.email, nombre: currentUser.nombre }, { onConflict: 'email' }) } catch(e) {}
    await cargarDatosUsuario(currentUser.email)
  }
  startApp()
}

window.startApp = function startApp() {
  document.getElementById('login-screen').style.display = 'none'
  document.getElementById('app').style.display = 'block'

  // Avatar y nombre
  const av = currentUser.avatar || currentUser.nombre[0]
  ;['user-av','sb-av'].forEach(id => { const el=document.getElementById(id); if(el) el.textContent=av })
  const sbName = document.getElementById('sb-user-name')
  if(sbName) sbName.textContent = currentUser.nombre
  const sbTag = document.getElementById('sb-user-tag')
  if(sbTag) sbTag.textContent = ROL_INFO[currentRol]?.label + ' · ' + currentUser.email

  // Badge de rol en topbar
  const rolInfo = ROL_INFO[currentRol]
  const topbarR = document.querySelector('.topbar-right')
  const existingBadge = document.getElementById('rol-badge')
  if (!existingBadge && topbarR) {
    const badge = document.createElement('span')
    badge.id = 'rol-badge'
    badge.className = `role-badge ${rolInfo.badge}`
    badge.textContent = rolInfo.label
    topbarR.insertBefore(badge, topbarR.firstChild)
  }

  // Sidebar: ocultar/mostrar según rol
  aplicarPermisosSidebar()

  // Period label
  const pL = document.getElementById('period-lbl')
  if(pL){ const mn=new Date().toLocaleDateString('es-CL',{month:'long',year:'numeric'}); pL.textContent=mn.charAt(0).toUpperCase()+mn.slice(1) }
  const mBtn = document.getElementById('topbar-menu-btn')
  if(mBtn) mBtn.style.display = window.innerWidth<=900?'flex':'none'
  window.addEventListener('resize',()=>{ if(mBtn) mBtn.style.display=window.innerWidth<=900?'flex':'none' })

  const h = new Date().getHours()
  const saludo = h<12?'Buenos días':h<19?'Buenas tardes':'Buenas noches'
  const bi = document.getElementById('dash-bienvenida')
  if(bi) bi.textContent = `${saludo}, ${currentUser.nombre.split(' ')[0]} 👋`
  const df = document.getElementById('dash-fecha')
  if(df) df.textContent = new Date().toLocaleDateString('es-CL',{weekday:'long',day:'numeric',month:'long',year:'numeric'})
  const mesN = new Date().toLocaleDateString('es-CL',{month:'long',year:'numeric'})
  const dt = document.getElementById('dash-mes-tag')
  if(dt) dt.textContent = mesN.charAt(0).toUpperCase()+mesN.slice(1)
  const dct = document.getElementById('db-chart-tag')
  if(dct) dct.textContent = new Date().getFullYear()

  // Asegurar datos en DB para admin/macro (datos demo)
  if (currentRol !== 'cliente' && !DB[currentUser.email]) {
    const dn = n => new Date(Date.now()+n*86400000).toISOString().split('T')[0]
    DB[currentUser.email] = {
      ingresos:[
        {id:'i1',desc:'Honorarios mayo',cat:'Sueldo',fecha:'2026-05-02',monto:3200000,nota:''},
        {id:'i2',desc:'Auditoría Q1',cat:'Freelance',fecha:'2026-04-25',monto:1800000,nota:''},
      ],
      gastos:[
        {id:'g1',desc:'Arriendo oficina',cat:'Vivienda',fecha:'2026-05-01',monto:550000,nota:''},
        {id:'g2',desc:'Servicios digitales',cat:'Servicios',fecha:'2026-05-03',monto:89000,nota:''},
      ],
      metas:[
        {id:'m1',nombre:'Reserva despacho',icono:'🏢',objetivo:10000000,actual:4200000,color:'#E8909A',fecha:'2026-12-31'},
      ],
      recordatorios:[
        {id:'r1',desc:'Declaración mensual SII',fecha:dn(5),tipo:'recordatorio',icono:'📋'},
      ],
      eventos:[]
    }
  }

  // Inicializar DB para admin/macro con datos demo
  if (currentRol !== 'cliente' && !DB[currentUser.email]) {
    const _d = n => new Date(Date.now()+n*86400000).toISOString().split('T')[0]
    DB[currentUser.email] = {
      ingresos:[
        {id:'i1',desc:'Honorarios mayo',cat:'Sueldo',fecha:'2026-05-02',monto:3200000,nota:''},
        {id:'i2',desc:'Auditoría Q1',cat:'Freelance',fecha:'2026-04-25',monto:1800000,nota:''},
        {id:'i3',desc:'Honorarios abril',cat:'Sueldo',fecha:'2026-04-01',monto:3200000,nota:''},
      ],
      gastos:[
        {id:'g1',desc:'Arriendo oficina',cat:'Vivienda',fecha:'2026-05-01',monto:550000,nota:''},
        {id:'g2',desc:'Servicios digitales',cat:'Servicios',fecha:'2026-05-03',monto:89000,nota:''},
        {id:'g3',desc:'Materiales oficina',cat:'Servicios',fecha:'2026-04-15',monto:45000,nota:''},
      ],
      metas:[
        {id:'m1',nombre:'Reserva despacho',icono:'🏢',objetivo:10000000,actual:4200000,color:'#E8909A',fecha:'2026-12-31'},
        {id:'m2',nombre:'Equipo tecnología',icono:'💻',objetivo:3000000,actual:800000,color:'#1D4ED8',fecha:'2026-08-01'},
      ],
      recordatorios:[
        {id:'r1',desc:'Declaración mensual SII',fecha:_d(5),tipo:'recordatorio',icono:'📋'},
        {id:'r2',desc:'Pago seguro oficina',fecha:_d(12),tipo:'recordatorio',icono:'🏢'},
      ],
      eventos:[]
    }
  }

  if (currentRol === 'macro') {
    renderMacroDashboard()
  } else {
    renderAll()
  }
  // Activar panel inicial según rol
  const tabInicial = currentRol === 'cliente' ? 'dashboard' : 'dashboard'
  goTab(tabInicial, document.querySelector('.sb-btn[onclick*="goTab(\'"+tabInicial+"\',this)"]'))
}

function aplicarPermisosSidebar() {
  // Cliente: ocultar tabs de admin
  if (currentRol === 'cliente') {
    document.querySelectorAll('.sb-btn').forEach(btn => {
      const oc = btn.getAttribute('onclick')||''
      const m = oc.match(/goTab\('([^']+)'/)
      const CLIENTE_TABS = ['dashboard','ingresos','gastos','planner','metas','perfil']
      if (m && !CLIENTE_TABS.includes(m[1])) {
        btn.style.display = 'none'
      }
    })
  }
  // Macro: sidebar en modo solo lectura + mensaje
  if (currentRol === 'macro') {
    // Bloquear nav items no permitidos
    document.querySelectorAll('.sb-btn').forEach(btn => {
      const oc = btn.getAttribute('onclick')||''
      const m = oc.match(/goTab\('([^']+)'/)
      if (m && !MACRO_ALLOWED.includes(m[1])) {
        btn.classList.add('nav-locked')
        btn.title = 'No disponible en Vista Global'
      }
    })
    // Deshabilitar botones de acción
    document.querySelectorAll('.btn-p, .btn-v, .btn-sm.v').forEach(b => {
      if (!b.classList.contains('sb-logout') && !b.id?.includes('logout')) {
        b.style.opacity='.4'; b.style.pointerEvents='none'
      }
    })
    // Mostrar banner de solo lectura en topbar
    const banner = document.createElement('div')
    banner.style.cssText = 'background:rgba(109,40,217,.15);color:#A78BFA;font-size:11px;font-weight:600;padding:6px 16px;text-align:center;border-bottom:1px solid rgba(109,40,217,.2);letter-spacing:.5px'
    banner.textContent = '🔍 Modo Vista Global — Solo lectura. No puedes editar ni crear registros.'
    document.querySelector('.app-main')?.insertBefore(banner, document.querySelector('.app-topbar'))
  }
}

function logout() {
  currentUser = null; currentRol = 'admin'
  document.getElementById('login-screen').style.display = 'flex'
  document.getElementById('app').style.display = 'none'
  document.getElementById('login-email').value = ''
  document.getElementById('login-pass').value = ''
  document.getElementById('login-error').style.display = 'none'
  const badge = document.getElementById('rol-badge')
  if(badge) badge.remove()
}

// ══════════════════════════════════════════
// MACRO DASHBOARD — Vista global consolidada
// ══════════════════════════════════════════
function renderMacroDashboard() {
  // Macro ve el dashboard normal pero con datos globales simulados
  // En producción, aquí se cargarían datos de TODOS los clientes
  const globalIng = 48250000  // suma todos los clientes
  const globalGas = 18730000
  const globalClientes = USERS_DB.filter(u=>u.rol==='cliente').length
  const globalFactPend = 3

  const bi = document.getElementById('db-ing')
  if(bi) bi.textContent = fmt(globalIng)
  const bg = document.getElementById('db-gas')
  if(bg) bg.textContent = fmt(globalGas)
  const bu = document.getElementById('db-util')
  if(bu) { bu.textContent = fmt(globalIng-globalGas); bu.style.color='var(--verde)' }
  const bc = document.getElementById('db-cob')
  if(bc) bc.textContent = globalClientes + ' clientes'

  goTab('dashboard', document.querySelector('.sb-btn'))
  renderAll()
}

// ══════════════════════════════════════════
// NAVEGACIÓN
// ══════════════════════════════════════════
const PAGE_TITLES = {dashboard:'Dashboard',ingresos:'Ingresos',gastos:'Gastos',planner:'Planner',metas:'Metas',reportes:'Reportes',perfil:'Mi Perfil'}
const MACRO_ALLOWED = ['dashboard','reportes']  // Macro solo puede ver estos

function goTab(id, btn) {
  const cliView = document.getElementById('vista-cliente') || document
  // Macro: solo puede navegar a tabs permitidos
  if (currentRol === 'macro' && !MACRO_ALLOWED.includes(id)) {
    const msg = document.createElement('div')
    msg.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:rgba(109,40,217,.9);color:#fff;padding:10px 20px;border-radius:10px;font-size:12px;font-weight:600;z-index:999;backdrop-filter:blur(10px)'
    msg.textContent = '🔒 Vista Global no tiene acceso a este módulo'
    document.body.appendChild(msg)
    setTimeout(() => msg.remove(), 2500)
    return
  }
  cliView.querySelectorAll('.panel').forEach(p => p.classList.remove('active'))
  document.querySelectorAll('.sb-btn,.nav-tab').forEach(b => b.classList.remove('active'))
  const p = cliView.querySelector('#p-' + id)
  if (p) p.classList.add('active')
  if (btn && btn.classList) btn.classList.add('active')
  const titleEl = document.getElementById('ptitle')
  if(titleEl) titleEl.textContent = PAGE_TITLES[id]||id
  curTab = id
  if (id === 'dashboard') renderDashboard()
  if (id === 'ingresos') renderIngresos()
  if (id === 'gastos') renderGastos()
  if (id === 'planner') renderPlanner()
  if (id === 'metas') renderMetas()
  if (id === 'reportes') renderReportes()
  if (id === 'perfil') initPerfil()
  if (id === 'facturas') renderFacturasCli()
  if (id === 'cotizaciones') renderCotizacionesCli()
}

function setABN(id) {
  document.querySelectorAll('.abn-item').forEach(b => b.classList.remove('active'))
  document.getElementById(id)?.classList.add('active')
}

// ══════════════════════════════════════════
// RENDERS
// ══════════════════════════════════════════
function renderAll() {
  renderDashboard()
  renderIngresos()
  renderGastos()
  renderMetas()
  renderReportes()
  renderPlanner()
}

function getMesData() {
  const d = getData()
  const now = new Date(), y = now.getFullYear(), m = now.getMonth()
  const f1 = new Date(y,m,1).toISOString().split('T')[0]
  const f2 = new Date(y,m+1,0).toISOString().split('T')[0]
  return {
    ing: d.ingresos.filter(r => r.fecha >= f1 && r.fecha <= f2),
    gas: d.gastos.filter(r => r.fecha >= f1 && r.fecha <= f2),
  }
}

function renderDashboard() {
  const d = getData()
  const {ing, gas} = getMesData()
  const tI = ing.reduce((s,r)=>s+r.monto,0)
  const tG = gas.reduce((s,r)=>s+r.monto,0)
  document.getElementById('db-ing').textContent = fmt(tI)
  document.getElementById('db-gas').textContent = fmt(tG)
  document.getElementById('db-bal').textContent = fmt(tI-tG)
  document.getElementById('db-metas').textContent = d.metas.filter(m=>m.actual<m.objetivo).length
  const balClass = (tI-tG) >= 0 ? 'pos' : 'neg'
  document.getElementById('db-bal').style.color = (tI-tG)>=0?'var(--verde)':'var(--rosa-d)'

  // Tabla últimos ingresos
  document.getElementById('db-ing-tabla').innerHTML = d.ingresos.slice(0,4).map(r=>`
    <tr><td style="font-weight:600">${r.desc}</td><td><span class="bdg bor">${r.cat}</span></td>
    <td style="font-size:11px;color:var(--gris-s)">${fdate(r.fecha)}</td>
    <td class="ap nbold">${fmt(r.monto)}</td></tr>`).join('')

  // Tabla últimos gastos
  document.getElementById('db-gas-tabla').innerHTML = d.gastos.slice(0,4).map(r=>`
    <tr><td style="font-weight:600">${r.desc}</td><td><span class="bdg bor">${r.cat}</span></td>
    <td class="an nbold">${fmt(r.monto)}</td></tr>`).join('')

  // Chart barras 6 meses
  const now = new Date(), meses = []
  const ingM = [], gasM = []
  for (let i=5;i>=0;i--) {
    const d2 = new Date(now.getFullYear(),now.getMonth()-i,1)
    meses.push(d2.toLocaleDateString('es-CL',{month:'short'}))
    const f1 = new Date(d2.getFullYear(),d2.getMonth(),1).toISOString().split('T')[0]
    const f2 = new Date(d2.getFullYear(),d2.getMonth()+1,0).toISOString().split('T')[0]
    ingM.push(d.ingresos.filter(r=>r.fecha>=f1&&r.fecha<=f2).reduce((s,r)=>s+r.monto,0))
    gasM.push(d.gastos.filter(r=>r.fecha>=f1&&r.fecha<=f2).reduce((s,r)=>s+r.monto,0))
  }
  if (charts.dash) charts.dash.destroy()
  charts.dash = new Chart(document.getElementById('ch-dash').getContext('2d'),{
    type:'bar',
    data:{labels:meses,datasets:[
      {label:'Ingresos',data:ingM,backgroundColor:'rgba(232,144,154,.85)',borderRadius:6,borderSkipped:false},
      {label:'Gastos',data:gasM,backgroundColor:'rgba(26,26,26,.2)',borderRadius:6,borderSkipped:false}
    ]},
    options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'bottom',labels:{boxWidth:10,font:{size:11}}}},
    scales:{x:{grid:{display:false}},y:{grid:{color:'rgba(0,0,0,.04)'},ticks:{callback:v=>fmt(v)}}}}
  })

  // Donut categorías gasto
  const cats={}; d.gastos.forEach(g=>{cats[g.cat]=(cats[g.cat]||0)+g.monto})
  const catE = Object.entries(cats).sort((a,b)=>b[1]-a[1]).slice(0,5)
  const cols = ['#E8909A','#1A1A1A','#15803D','#B45309','#1D4ED8']
  if (charts.dona) charts.dona.destroy()
  if (catE.length > 0) {
    charts.dona = new Chart(document.getElementById('ch-dona').getContext('2d'),{
      type:'doughnut',
      data:{labels:catE.map(c=>c[0]),datasets:[{data:catE.map(c=>c[1]),backgroundColor:cols,borderWidth:0,hoverOffset:4}]},
      options:{responsive:true,maintainAspectRatio:false,cutout:'65%',plugins:{legend:{display:false}}}
    })
    const tot = catE.reduce((s,c)=>s+c[1],0)
    const CAT_ICONS = {
      'Alimentación':'🛒','Transporte':'🚗','Vivienda':'🏠','Salud':'❤️‍🩹',
      'Educación':'📚','Entretenimiento':'🎬','Ropa':'👗','Servicios':'💡',
      'Ahorro':'🏦','Otro':'📦',
      'Nómina':'👥','Renta':'🏢','Tecnología':'💻','Marketing':'📣',
      'Impuestos':'📋','Operativos':'⚙️'
    }
    // Total del mes de gastos
    const {gas: gasMes2} = getMesData()
    const totMes2 = gasMes2.reduce((s,r)=>s+r.monto,0)
    document.getElementById('dona-leg').innerHTML =
      `<div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0 12px;border-bottom:1px solid rgba(0,0,0,.06);margin-bottom:12px">
        <span style="font-size:10px;letter-spacing:1.5px;text-transform:uppercase;color:var(--ink-xs);font-weight:700">Total del mes</span>
        <span style="font-size:20px;font-weight:800;letter-spacing:-1px;color:var(--ink)">${fmt(totMes2)}</span>
      </div>` +
      catE.map((c,i)=>`
      <div style="display:flex;align-items:center;gap:9px;margin-bottom:9px">
        <div style="width:32px;height:32px;border-radius:9px;background:${cols[i]}18;display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0;border:1px solid ${cols[i]}28;">${CAT_ICONS[c[0]]||'📦'}</div>
        <div style="flex:1;min-width:0">
          <div style="font-size:12px;color:var(--ink-m);font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${c[0]}</div>
          <div style="height:4px;background:rgba(0,0,0,.06);border-radius:4px;margin-top:4px;overflow:hidden">
            <div style="height:100%;width:${((c[1]/tot)*100).toFixed(0)}%;background:${cols[i]};border-radius:4px;transition:width .6s ease"></div>
          </div>
        </div>
        <div style="text-align:right;flex-shrink:0">
          <div style="font-size:13px;font-weight:800;letter-spacing:-.5px;color:var(--ink)">${fmt(c[1])}</div>
          <div style="font-size:10px;color:var(--ink-xs);font-weight:600">${((c[1]/tot)*100).toFixed(0)}%</div>
        </div>
      </div>`).join('')
  }
}

function renderIngresos() {
  const d = getData()
  const q = vv('ing-q').toLowerCase(), cat = vv('ing-cat')
  const rows = d.ingresos.filter(r=>(!q||r.desc.toLowerCase().includes(q))&&(!cat||r.cat===cat))
  const tot = rows.reduce((s,r)=>s+r.monto,0)
  const {ing} = getMesData()
  document.getElementById('ing-tot').textContent = fmt(tot)
  document.getElementById('ing-mes').textContent = fmt(ing.reduce((s,r)=>s+r.monto,0))
  document.getElementById('ing-cnt').textContent = rows.length
  document.getElementById('ing-tbody').innerHTML = rows.length===0
    ? `<tr><td colspan="6" class="empty"><span class="empty-ico">💰</span>Sin ingresos registrados</td></tr>`
    : rows.map(r=>`<tr>
        <td style="font-weight:600">${r.desc}</td>
        <td><span class="bdg bor">${r.cat}</span></td>
        <td style="font-size:11px;color:var(--gris-s)">${fdate(r.fecha)}</td>
        <td class="ap nbold">${fmt(r.monto)}</td>
        <td style="font-size:11px;color:var(--ink-s)">${r.nota||'—'}</td>
        <td><div style="display:flex;gap:5px">
          <button class="btn-sm" onclick="editarReg('ingreso','${r.id}')">✏</button>
          <button class="btn-sm r" onclick="eliminar('ingreso','${r.id}')">✕</button>
        </div></td>
      </tr>`).join('')
}

function renderGastos() {
  const d = getData()
  const q = vv('gas-q').toLowerCase(), cat = vv('gas-cat')
  const rows = d.gastos.filter(r=>(!q||r.desc.toLowerCase().includes(q))&&(!cat||r.cat===cat))
  const tot = rows.reduce((s,r)=>s+r.monto,0)
  const {gas} = getMesData()
  const cats={}; rows.forEach(r=>{cats[r.cat]=(cats[r.cat]||0)+r.monto})
  const top = Object.entries(cats).sort((a,b)=>b[1]-a[1])[0]
  document.getElementById('gas-tot').textContent = fmt(tot)
  document.getElementById('gas-mes').textContent = fmt(gas.reduce((s,r)=>s+r.monto,0))
  document.getElementById('gas-top').textContent = top?.[0]||'—'
  document.getElementById('gas-tbody').innerHTML = rows.length===0
    ? `<tr><td colspan="6" class="empty"><span class="empty-ico">📤</span>Sin gastos registrados</td></tr>`
    : rows.map(r=>`<tr>
        <td style="font-weight:600">${r.desc}</td>
        <td><span class="bdg bor">${r.cat}</span></td>
        <td style="font-size:11px;color:var(--gris-s)">${fdate(r.fecha)}</td>
        <td class="an nbold">${fmt(r.monto)}</td>
        <td style="font-size:11px;color:var(--ink-s)">${r.nota||'—'}</td>
        <td><div style="display:flex;gap:5px">
          <button class="btn-sm" onclick="editarReg('gasto','${r.id}')">✏</button>
          <button class="btn-sm r" onclick="eliminar('gasto','${r.id}')">✕</button>
        </div></td>
      </tr>`).join('')
}

function renderMetas() {
  const d = getData()
  const activas = d.metas.filter(m=>m.actual<m.objetivo)
  const comp = d.metas.filter(m=>m.actual>=m.objetivo)
  const totalAhor = d.metas.reduce((s,m)=>s+m.actual,0)
  document.getElementById('met-tot').textContent = activas.length
  document.getElementById('met-comp').textContent = comp.length
  document.getElementById('met-ahor').textContent = fmt(totalAhor)
  document.getElementById('metas-lista').innerHTML = d.metas.length===0
    ? `<div class="empty"><span class="empty-ico">🎯</span><p>Aún no tienes metas. ¡Crea tu primera meta!</p></div>`
    : d.metas.map(m=>{
      const pct = Math.min((m.actual/m.objetivo)*100,100)
      const resta = Math.max(m.objetivo-m.actual,0)
      return `<div class="meta-card">
        <div class="meta-header">
          <div style="display:flex;align-items:center;gap:10px">
            <span style="font-size:28px">${m.icono}</span>
            <div><div class="meta-name">${m.nombre}</div><div style="font-size:11px;color:var(--gris-s)">Meta para ${fdate(m.fecha)}</div></div>
          </div>
          <div style="text-align:right">
            <div style="font-size:20px;font-weight:800;letter-spacing:-.5px">${fmt(m.actual)}</div>
            <div style="font-size:11px;color:var(--gris-s)">de ${fmt(m.objetivo)}</div>
          </div>
        </div>
        <div class="meta-bar-track"><div class="meta-bar-fill" style="width:${pct}%;background:${m.color}"></div></div>
        <div class="meta-stats">
          <span>${pct.toFixed(1)}% completado</span>
          <span>Faltan ${fmt(resta)}</span>
        </div>
        <div style="display:flex;gap:8px;margin-top:12px">
          <button class="btn-sm" onclick="abonarMeta('${m.id}')">+ Abonar</button>
          <button class="btn-sm" onclick="editarMeta('${m.id}')">✏ Editar</button>
          <button class="btn-sm r" onclick="eliminarMeta('${m.id}')">Eliminar</button>
        </div>
      </div>`}).join('')
}


function renderReportes() {
  const d = getData()
  const tI=d.ingresos.reduce((s,r)=>s+r.monto,0)
  const tG=d.gastos.reduce((s,r)=>s+r.monto,0)
  const bal=tI-tG
  document.getElementById('rep-ing').textContent=fmt(tI)
  document.getElementById('rep-gas').textContent=fmt(tG)
  document.getElementById('rep-bal').textContent=fmt(bal)
  document.getElementById('rep-bal').style.color=bal>=0?'var(--verde)':'var(--rosa-d)'

  document.getElementById('rep-resumen').innerHTML=`
    <div style="display:flex;justify-content:space-between;margin-bottom:12px"><span style="font-size:13px;color:var(--gris-m)">Total Ingresos</span><span class="ap nbold">${fmt(tI)}</span></div>
    <div style="display:flex;justify-content:space-between;margin-bottom:12px"><span style="font-size:13px;color:var(--gris-m)">Total Gastos</span><span class="an nbold">(${fmt(tG)})</span></div>
    <div class="hr"></div>
    <div style="display:flex;justify-content:space-between;margin-bottom:12px">
      <span style="font-family:'Cormorant Garamond',serif;font-size:17px;font-weight:600">Balance</span>
      <span style="font-family:'Cormorant Garamond',serif;font-size:18px;font-weight:600;color:${bal>=0?'var(--verde)':'var(--rosa-d)'}">${fmt(bal)}</span>
    </div>
    <div style="display:flex;justify-content:space-between;margin-bottom:8px"><span style="font-size:13px;color:var(--gris-m)">Tasa de ahorro</span><span style="font-weight:700">${tI>0?((bal/tI)*100).toFixed(1):'0'}%</span></div>
    <div class="prog-t"><div class="prog-f" style="width:${tI>0?Math.max(bal/tI*100,0):0}%;background:${bal>=0?'var(--verde)':'var(--rosa)'}"></div></div>`

  const cats={}; d.gastos.forEach(g=>{cats[g.cat]=(cats[g.cat]||0)+g.monto})
  const catE=Object.entries(cats).sort((a,b)=>b[1]-a[1]).slice(0,6)
  const maxCat=catE[0]?.[1]||1
  document.getElementById('rep-cats').innerHTML=catE.map((c,i)=>`
    <div style="margin-bottom:12px">
      <div style="display:flex;justify-content:space-between;margin-bottom:4px">
        <span style="font-size:13px;font-weight:500">${c[0]}</span>
        <span class="an nbold">${fmt(c[1])}</span>
      </div>
      <div class="prog-t"><div class="prog-f" style="width:${(c[1]/maxCat*100)}%;background:var(--rosa)"></div></div>
    </div>`).join('')

  // Line chart tendencia
  const now=new Date(), meses=[], ingM=[], gasM=[], balM=[]
  for(let i=5;i>=0;i--){
    const d2=new Date(now.getFullYear(),now.getMonth()-i,1)
    meses.push(d2.toLocaleDateString('es-CL',{month:'short'}))
    const f1=new Date(d2.getFullYear(),d2.getMonth(),1).toISOString().split('T')[0]
    const f2=new Date(d2.getFullYear(),d2.getMonth()+1,0).toISOString().split('T')[0]
    const tIm=d.ingresos.filter(r=>r.fecha>=f1&&r.fecha<=f2).reduce((s,r)=>s+r.monto,0)
    const tGm=d.gastos.filter(r=>r.fecha>=f1&&r.fecha<=f2).reduce((s,r)=>s+r.monto,0)
    ingM.push(tIm); gasM.push(tGm); balM.push(tIm-tGm)
  }
  if(charts.line) charts.line.destroy()
  charts.line=new Chart(document.getElementById('ch-line').getContext('2d'),{
    type:'line',
    data:{labels:meses,datasets:[
      {label:'Ingresos',data:ingM,borderColor:'var(--rosa)',backgroundColor:'rgba(232,144,154,.08)',tension:.4,fill:true,pointBackgroundColor:'var(--rosa)',pointRadius:5},
      {label:'Gastos',data:gasM,borderColor:'#1A1A1A',backgroundColor:'rgba(26,26,26,.05)',tension:.4,fill:true,pointBackgroundColor:'#1A1A1A',pointRadius:5},
      {label:'Balance',data:balM,borderColor:'var(--verde)',backgroundColor:'rgba(21,128,61,.06)',tension:.4,fill:false,pointBackgroundColor:'var(--verde)',pointRadius:4,borderDash:[4,4]},
    ]},
    options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'bottom',labels:{boxWidth:10,font:{size:11}}}},
    scales:{x:{grid:{display:false}},y:{grid:{color:'rgba(0,0,0,.04)'},ticks:{callback:v=>fmt(v)}}}}
  })
}

// ══════════════════════════════════════════
// CRUD — EDITAR + ELIMINAR completo
// ══════════════════════════════════════════
let _editId = null, _editTipo = null

function editarReg(tipo, id) {
  const d = getData()
  let reg = null
  if (tipo==='ingreso') reg = d.ingresos.find(r=>r.id===id)
  else if (tipo==='gasto') reg = d.gastos.find(r=>r.id===id)
  else if (tipo==='recordatorio') reg = d.recordatorios.find(r=>r.id===id)
  else if (tipo==='meta') reg = d.metas.find(r=>r.id===id)
  if (!reg) return
  _editId = id; _editTipo = tipo
  openModal(tipo, reg, true)
}

async function eliminar(tipo, id) {
  if(!confirm('¿Eliminar este registro?')) return
  const d = getData()
  const tablMap = {ingreso:'portal_ingresos',gasto:'portal_gastos',recordatorio:'portal_recordatorios'}
  // Eliminar en Supabase
  if(tablMap[tipo]) await sbDelete(tablMap[tipo], id)
  // Actualizar local
  if(tipo==='ingreso') d.ingresos = d.ingresos.filter(r=>r.id!==id)
  else if(tipo==='gasto') d.gastos = d.gastos.filter(r=>r.id!==id)
  else if(tipo==='recordatorio') d.recordatorios = d.recordatorios.filter(r=>r.id!==id)
  renderAll()
}

async function eliminarMeta(id) {
  if(!confirm('¿Eliminar esta meta?')) return
  await sbDelete('portal_metas', id)
  getData().metas = getData().metas.filter(m=>m.id!==id)
  renderMetas()
}

function editarMeta(id) { editarReg('meta', id) }

async function abonarMeta(id) {
  const m = getData().metas.find(x=>x.id===id)
  if (!m) return
  _editId = id
  const html = `<div style="text-align:center;padding:8px 0 20px">
    <div style="font-size:40px;margin-bottom:8px">${m.icono}</div>
    <div style="font-family:'Cormorant Garamond',serif;font-size:20px;font-weight:600;margin-bottom:4px">${m.nombre}</div>
    <div style="font-size:13px;color:var(--ink-s);margin-bottom:20px">Progreso: ${fmt(m.actual)} / ${fmt(m.objetivo)}</div>
    <div class="meta-bar-track" style="margin-bottom:20px"><div class="meta-bar-fill" style="width:${Math.min(m.actual/m.objetivo*100,100)}%;background:${m.color}"></div></div>
  </div>
  <div class="fg-grp full">
    <label class="fg-lbl">Monto a abonar *</label>
    <input class="fi" id="f-abono" type="number" placeholder="$0" style="font-size:20px;font-weight:800;text-align:center">
  </div>`
  document.getElementById('m-title').textContent = '+ Abonar a Meta'
  document.getElementById('m-body').innerHTML = html
  document.getElementById('m-save').textContent = 'Abonar'
  document.getElementById('m-save').onclick = async () => {
    const monto = parseFloat(vv('f-abono'))||0
    if(!monto||monto<=0) return
    const m = getData().metas.find(x=>x.id===id)
    if(m){ const nuevoActual = Math.min(m.actual+monto,m.objetivo); await sbUpdate('portal_metas',id,{actual:nuevoActual}); getData().metas=getData().metas.map(x=>x.id===id?{...x,actual:nuevoActual}:x) }
    closeModal(); renderMetas()
    if (getData().metas.find(x=>x.id===id)?.actual >= getData().metas.find(x=>x.id===id)?.objetivo) {
      setTimeout(()=>alert('🎉 ¡Meta completada! ¡Felicitaciones!'), 200)
    }
  }
  document.getElementById('overlay').style.display = 'flex'
}

// ══════════════════════════════════════════
// PLANNER — Render mejorado con íconos
// ══════════════════════════════════════════
const TIPO_CONFIG = {
  ingreso:  {ico:'💰', label:'Ingreso',     cls:'ev-ingreso',     pill:'ok'},
  gasto:    {ico:'📤', label:'Gasto',       cls:'ev-gasto',       pill:'pend'},
  recordatorio:{ico:'🔔',label:'Recordatorio',cls:'ev-recordatorio',pill:'warn'},
  vacaciones:{ico:'🏖️',label:'Vacaciones',  cls:'ev-vacaciones',  pill:'azul-b'},
  cumple:   {ico:'🎂', label:'Cumpleaños',  cls:'ev-cumple',      pill:'warn'},
  viaje:    {ico:'✈️', label:'Viaje',       cls:'ev-viaje',       pill:'morado-b'},
  pago:     {ico:'💳', label:'Pago',        cls:'ev-pago',        pill:'pend'},
}

function renderPlanner() {
  const d = getData()
  const dias = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb']
  document.getElementById('cal-heads').innerHTML = dias.map(d=>`<div class="planner-head">${d}</div>`).join('')
  const titulo = new Date(calYear,calMonth,1).toLocaleDateString('es-CL',{month:'long',year:'numeric'})
  document.getElementById('cal-titulo').textContent = titulo.charAt(0).toUpperCase()+titulo.slice(1)
  const firstDay = new Date(calYear,calMonth,1).getDay()
  const daysInMonth = new Date(calYear,calMonth+1,0).getDate()
  const daysInPrev = new Date(calYear,calMonth,0).getDate()

  // Mapear eventos al día
  const evsByDay = {}
  const addEv = (fecha, tipo, desc, monto, id, icono) => {
    if (!fecha) return
    const [y,m2,day] = fecha.split('-').map(Number)
    if (y===calYear && m2-1===calMonth) {
      if (!evsByDay[day]) evsByDay[day] = []
      evsByDay[day].push({tipo, desc, monto: monto||0, id, icono})
    }
  }
  // Rellenar rango de fechas (vacaciones, viajes)
  const addRange = (fi, ff, tipo, desc, id, icono) => {
    if (!fi || !ff) return
    let cur = new Date(fi+'T12:00')
    const end = new Date(ff+'T12:00')
    while (cur <= end) {
      addEv(cur.toISOString().split('T')[0], tipo, desc, 0, id, icono)
      cur.setDate(cur.getDate()+1)
    }
  }

  d.ingresos.forEach(r => addEv(r.fecha,'ingreso',r.desc,r.monto,r.id,'💰'))
  d.gastos.forEach(r => addEv(r.fecha,'gasto',r.desc,r.monto,r.id,'📤'))
  d.recordatorios.forEach(r => addEv(r.fecha,'recordatorio',r.desc,0,r.id,r.icono||'🔔'))
  ;(d.eventos||[]).forEach(r => {
    if (r.fecha_fin) addRange(r.fecha, r.fecha_fin, r.tipo, r.desc, r.id, r.icono)
    else addEv(r.fecha, r.tipo, r.desc, 0, r.id, r.icono)
  })

  let html = ''
  for(let i=0;i<firstDay;i++) html+=`<div class="planner-day other"><div class="day-num">${daysInPrev-firstDay+i+1}</div></div>`
  for(let day=1;day<=daysInMonth;day++) {
    const ds = `${calYear}-${String(calMonth+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`
    const isT = ds===HOY
    const dayEvs = evsByDay[day]||[]
    html += `<div class="planner-day${isT?' today':''}" onclick="openDayModal('${ds}')">
      <div class="day-num">${day}</div>
      ${dayEvs.slice(0,2).map(e=>{
        const cfg = TIPO_CONFIG[e.tipo]||{ico:'📌',cls:'ev-recordatorio'}
        const ic = e.icono||cfg.ico
        return `<div class="planner-ev ${cfg.cls}" title="${e.desc}"><span class="planner-ev-ico">${ic}</span>${e.desc.slice(0,9)}</div>`
      }).join('')}
      ${dayEvs.length>2?`<div style="font-size:9px;color:var(--ink-xs);padding:0 4px">+${dayEvs.length-2} más</div>`:''}
    </div>`
  }
  const total = firstDay+daysInMonth
  for(let i=1;i<=(total%7===0?0:7-total%7);i++) html+=`<div class="planner-day other"><div class="day-num">${i}</div></div>`
  document.getElementById('cal-body').innerHTML = html

  // Tabla eventos del mes
  const f1=`${calYear}-${String(calMonth+1).padStart(2,'0')}-01`
  const f2=`${calYear}-${String(calMonth+1).padStart(2,'0')}-${String(daysInMonth).padStart(2,'0')}`
  const todosEvs = [
    ...d.ingresos.filter(r=>r.fecha>=f1&&r.fecha<=f2).map(r=>({fecha:r.fecha,tipo:'ingreso',desc:r.desc,monto:r.monto,id:r.id,icono:'💰'})),
    ...d.gastos.filter(r=>r.fecha>=f1&&r.fecha<=f2).map(r=>({fecha:r.fecha,tipo:'gasto',desc:r.desc,monto:r.monto,id:r.id,icono:'📤'})),
    ...d.recordatorios.filter(r=>r.fecha>=f1&&r.fecha<=f2).map(r=>({fecha:r.fecha,tipo:'recordatorio',desc:r.desc,monto:0,id:r.id,icono:r.icono||'🔔'})),
    ...(d.eventos||[]).filter(r=>r.fecha>=f1&&r.fecha<=f2).map(r=>({fecha:r.fecha,tipo:r.tipo,desc:r.desc,monto:0,id:r.id,icono:r.icono})),
  ].sort((a,b)=>new Date(a.fecha)-new Date(b.fecha))

  document.getElementById('planner-eventos').innerHTML = todosEvs.length===0
    ? `<tr><td colspan="5" style="text-align:center;padding:24px;color:var(--ink-xs)">✨ Sin eventos este mes</td></tr>`
    : todosEvs.map(e=>{
      const cfg = TIPO_CONFIG[e.tipo]||{ico:'📌',label:'Evento',pill:'bor'}
      const ico = e.icono||cfg.ico
      return `<tr>
        <td style="font-size:12px;color:var(--ink-s);font-weight:500">${fdate(e.fecha)}</td>
        <td><span class="ev-pill ${cfg.pill}" style="gap:4px">${ico} ${cfg.label}</span></td>
        <td style="font-weight:600">${e.desc}</td>
        <td style="font-weight:800;letter-spacing:-.5px;color:${e.tipo==='ingreso'?'var(--verde)':e.monto>0?'var(--rosa-d)':'var(--ink-xs)'}">${e.monto>0?fmt(e.monto):'—'}</td>
        <td><div class="ev-actions">
          ${(e.tipo==='recordatorio'||TIPO_CONFIG[e.tipo])?`<button class="btn-sm" onclick="editarEvento('${e.id}','${e.tipo}')">✏</button>`:''}
          <button class="btn-sm r" onclick="eliminarEvento('${e.id}','${e.tipo}')">✕</button>
        </div></td>
      </tr>`}).join('')
}

function calNav(dir) {
  calMonth+=dir
  if(calMonth>11){calMonth=0;calYear++}
  if(calMonth<0){calMonth=11;calYear--}
  renderPlanner()
}

function openDayModal(fecha) {
  // Abrir modal para agregar evento en ese día
  const fmtD = fdate(fecha)
  openModal('evento', {fecha}, false, `+ Evento del ${fmtD}`)
}

function editarEvento(id, tipo) {
  const d = getData()
  let reg = null
  if (tipo==='recordatorio') reg = d.recordatorios.find(r=>r.id===id)
  else reg = (d.eventos||[]).find(r=>r.id===id)
  if (!reg) return
  _editId = id; _editTipo = tipo
  openModal(tipo==='recordatorio'?'recordatorio':'evento', reg, true)
}

async function eliminarEvento(id, tipo) {
  if(!confirm('¿Eliminar este evento?')) return
  const d = getData()
  if (tipo==='recordatorio') { await sbDelete('portal_recordatorios',id); d.recordatorios = d.recordatorios.filter(r=>r.id!==id) }
  else { await sbDelete('portal_eventos',id); d.eventos = (d.eventos||[]).filter(r=>r.id!==id) }
  renderPlanner()
}

// ══════════════════════════════════════════
// MODALES — completo con edición
// ══════════════════════════════════════════
const CAT_ING=['Sueldo','Freelance','Arriendo','Inversión','Bono','Negocio','Otro']
const CAT_GAS=['Alimentación','Transporte','Vivienda','Salud','Educación','Entretenimiento','Ropa','Servicios','Ahorro','Otro']
const ICONOS_REC = ['🔔','💊','💳','🏦','📱','🚗','🏠','💡','📅','⚡','🛒','📞','🎓','🏥','✈️','🎂','🎁','📋','💰','🔑','🌟','⏰','📌','🎯']
const ICONOS_EV  = ['🏖️','✈️','🎂','🎉','🏋️','🎬','🍽️','🏕️','🚀','💑','🎵','⚽','🏔️','🎮','📸','🌊','🎪','🛕','🌴','🎭']
const COLORES_EV = ['#E8909A','#1D4ED8','#0A7A4B','#B45309','#6D28D9','#DC2626','#0891B2','#7C3AED','#D97706','#059669']

let _icoSel = '🔔'
let _colorSel = '#E8909A'

function mkIconPicker(icons, sel, onPick) {
  return `<div class="icon-picker" id="ico-picker">
    ${icons.map(ic=>`<button type="button" class="icon-opt${ic===sel?' selected':''}" onclick="pickIco('${ic}')">${ic}</button>`).join('')}
  </div>`
}
function pickIco(ico) {
  _icoSel = ico
  document.querySelectorAll('.icon-opt').forEach(b=>b.classList.toggle('selected', b.textContent===ico))
}
function mkColorPicker(sel) {
  return `<div class="color-picker" id="col-picker">
    ${COLORES_EV.map(col=>`<button type="button" class="color-opt${col===sel?' selected':''}" style="background:${col}" onclick="pickColor('${col}')" title="${col}"></button>`).join('')}
  </div>`
}
function pickColor(col) {
  _colorSel = col
  document.querySelectorAll('.color-opt').forEach(b=>b.classList.toggle('selected', b.style.background===col||b.style.backgroundColor===col))
}

const FORMS = {
  ingreso:(dat={},isEdit=false)=>({
    title: isEdit ? 'Editar Ingreso' : 'Nuevo Ingreso',
    html:`<div class="fg">
      <div class="fg-grp full"><label class="fg-lbl">Descripción *</label><input class="fi" id="f-desc" value="${dat.desc||''}" placeholder="Ej: Sueldo mayo"></div>
      <div class="fg-grp"><label class="fg-lbl">Categoría</label><select class="fi" id="f-cat">${CAT_ING.map(c=>`<option${dat.cat===c?' selected':''}>${c}</option>`).join('')}</select></div>
      <div class="fg-grp"><label class="fg-lbl">Monto *</label><input class="fi" id="f-monto" type="number" value="${dat.monto||''}" placeholder="0"></div>
      <div class="fg-grp"><label class="fg-lbl">Fecha</label><input class="fi" id="f-fecha" type="date" value="${dat.fecha||HOY}"></div>
      <div class="fg-grp full"><label class="fg-lbl">Nota (opcional)</label><input class="fi" id="f-nota" value="${dat.nota||''}" placeholder="Ej: Proyecto ABC"></div>
    </div>`,
    save: async ()=>{
      const p={id:dat.id||uid(),desc:vv('f-desc'),cat:vv('f-cat'),monto:parseFloat(vv('f-monto'))||0,fecha:vv('f-fecha'),nota:vv('f-nota')}
      if(!p.desc||!p.monto) return showMsg('ing-msg','err','Completa los campos requeridos')
      const d=getData()
      if(isEdit) { await sbUpdate('portal_ingresos', p.id, {descripcion:p.desc,cat:p.cat,monto:p.monto,fecha:p.fecha,nota:p.nota}); d.ingresos=d.ingresos.map(r=>r.id===p.id?p:r) }
      else { const saved = await sbInsert('portal_ingresos',{id:p.id,descripcion:p.desc,cat:p.cat,monto:p.monto,fecha:p.fecha,nota:p.nota,cliente_email:currentUser.email}); if(saved?.id) p.id=saved.id; d.ingresos.unshift(p) }
      closeModal(); _editId=null; renderAll()
    }
  }),
  gasto:(dat={},isEdit=false)=>({
    title: isEdit ? 'Editar Gasto' : 'Nuevo Gasto',
    html:`<div class="fg">
      <div class="fg-grp full"><label class="fg-lbl">Descripción *</label><input class="fi" id="f-desc" value="${dat.desc||''}" placeholder="Ej: Supermercado"></div>
      <div class="fg-grp"><label class="fg-lbl">Categoría</label><select class="fi" id="f-cat">${CAT_GAS.map(c=>`<option${dat.cat===c?' selected':''}>${c}</option>`).join('')}</select></div>
      <div class="fg-grp"><label class="fg-lbl">Monto *</label><input class="fi" id="f-monto" type="number" value="${dat.monto||''}" placeholder="0"></div>
      <div class="fg-grp"><label class="fg-lbl">Fecha</label><input class="fi" id="f-fecha" type="date" value="${dat.fecha||HOY}"></div>
      <div class="fg-grp full"><label class="fg-lbl">Nota (opcional)</label><input class="fi" id="f-nota" value="${dat.nota||''}" placeholder="Detalle adicional"></div>
    </div>`,
    save: async ()=>{
      const p={id:dat.id||uid(),desc:vv('f-desc'),cat:vv('f-cat'),monto:parseFloat(vv('f-monto'))||0,fecha:vv('f-fecha'),nota:vv('f-nota')}
      if(!p.desc||!p.monto) return showMsg('gas-msg','err','Completa los campos requeridos')
      const d=getData()
      if(isEdit) { await sbUpdate('portal_gastos', p.id, {descripcion:p.desc,cat:p.cat,monto:p.monto,fecha:p.fecha,nota:p.nota}); d.gastos=d.gastos.map(r=>r.id===p.id?p:r) }
      else { const saved = await sbInsert('portal_gastos',{id:p.id,descripcion:p.desc,cat:p.cat,monto:p.monto,fecha:p.fecha,nota:p.nota,cliente_email:currentUser.email}); if(saved?.id) p.id=saved.id; d.gastos.unshift(p) }
      closeModal(); _editId=null; renderAll()
    }
  }),
  meta:(dat={},isEdit=false)=>({
    title: isEdit ? 'Editar Meta' : 'Nueva Meta Financiera',
    html:`<div class="fg">
      <div class="fg-grp full"><label class="fg-lbl">Nombre de la Meta *</label><input class="fi" id="f-nombre" value="${dat.nombre||''}" placeholder="Ej: Fondo de emergencia"></div>
      <div class="fg-grp full"><label class="fg-lbl">Ícono</label>${mkIconPicker(['🛡️','✈️','🏠','🚗','💻','🎓','💰','🏋️','🌱','💎','🏖️','🎯','🎂','📱','🎁'],dat.icono||'🛡️')}</div>
      <div class="fg-grp"><label class="fg-lbl">Monto Objetivo *</label><input class="fi" id="f-objetivo" type="number" value="${dat.objetivo||''}" placeholder="0"></div>
      <div class="fg-grp"><label class="fg-lbl">Monto Ahorrado</label><input class="fi" id="f-actual" type="number" value="${dat.actual||0}"></div>
      <div class="fg-grp"><label class="fg-lbl">Fecha Límite</label><input class="fi" id="f-fecha" type="date" value="${dat.fecha||d(365)}"></div>
      <div class="fg-grp"><label class="fg-lbl">Color</label>${mkColorPicker(dat.color||'#E8909A')}</div>
    </div>`,
    save: async ()=>{
      const p={id:dat.id||uid(),nombre:vv('f-nombre'),icono:_icoSel,objetivo:parseFloat(vv('f-objetivo'))||0,actual:parseFloat(vv('f-actual'))||0,fecha:vv('f-fecha'),color:_colorSel}
      if(!p.nombre||!p.objetivo) return showMsg('metas-msg','err','Nombre y monto son requeridos')
      const d=getData()
      if(isEdit) { await sbUpdate('portal_metas', p.id, {nombre:p.nombre,icono:p.icono,objetivo:p.objetivo,actual:p.actual,fecha:p.fecha,color:p.color}); d.metas=d.metas.map(m=>m.id===p.id?p:m) }
      else { const saved = await sbInsert('portal_metas',{...p,cliente_email:currentUser.email}); if(saved?.id) p.id=saved.id; d.metas.push(p) }
      closeModal(); _editId=null; renderMetas()
    }
  }),
  recordatorio:(dat={},isEdit=false)=>({
    title: isEdit ? 'Editar Recordatorio' : 'Nuevo Recordatorio',
    html:`<div class="fg">
      <div class="fg-grp full"><label class="fg-lbl">Descripción *</label><input class="fi" id="f-desc" value="${dat.desc||''}" placeholder="Ej: Pagar dividendo hipoteca"></div>
      <div class="fg-grp full"><label class="fg-lbl">Fecha</label><input class="fi" id="f-fecha" type="date" value="${dat.fecha||HOY}"></div>
      <div class="fg-grp full"><label class="fg-lbl">Ícono del Recordatorio</label>${mkIconPicker(ICONOS_REC, dat.icono||'🔔')}</div>
    </div>`,
    save: async ()=>{
      const p={id:dat.id||uid(),desc:vv('f-desc'),fecha:vv('f-fecha'),tipo:'recordatorio',icono:_icoSel}
      if(!p.desc) return
      const d=getData()
      if(isEdit) { await sbUpdate('portal_recordatorios', p.id, {descripcion:p.desc,fecha:p.fecha,icono:p.icono}); d.recordatorios=d.recordatorios.map(r=>r.id===p.id?p:r) }
      else { const saved = await sbInsert('portal_recordatorios',{id:p.id,descripcion:p.desc,fecha:p.fecha,icono:p.icono,cliente_email:currentUser.email}); if(saved?.id) p.id=saved.id; d.recordatorios.push(p) }
      closeModal(); _editId=null; renderPlanner()
    }
  }),
  evento:(dat={},isEdit=false,customTitle)=>({
    title: customTitle||(isEdit?'Editar Evento':'Nuevo Evento en Planner'),
    html:`<div class="fg">
      <div class="fg-grp full"><label class="fg-lbl">Tipo de Evento</label>
        <select class="fi" id="f-tipo-ev">
          <option value="vacaciones"${dat.tipo==='vacaciones'?' selected':''}>🏖️ Vacaciones</option>
          <option value="viaje"${dat.tipo==='viaje'?' selected':''}>✈️ Viaje</option>
          <option value="cumple"${dat.tipo==='cumple'?' selected':''}>🎂 Cumpleaños</option>
          <option value="pago"${dat.tipo==='pago'?' selected':''}>💳 Pago pendiente</option>
          <option value="recordatorio"${dat.tipo==='recordatorio'?' selected':''}>🔔 Recordatorio</option>
        </select></div>
      <div class="fg-grp full"><label class="fg-lbl">Descripción *</label><input class="fi" id="f-desc" value="${dat.desc||''}" placeholder="Ej: Vacaciones en Cancún"></div>
      <div class="fg-grp"><label class="fg-lbl">Fecha Inicio</label><input class="fi" id="f-fecha" type="date" value="${dat.fecha||HOY}"></div>
      <div class="fg-grp"><label class="fg-lbl">Fecha Fin (opcional)</label><input class="fi" id="f-fecha-fin" type="date" value="${dat.fecha_fin||''}"></div>
      <div class="fg-grp full"><label class="fg-lbl">Ícono personalizado</label>${mkIconPicker(ICONOS_EV, dat.icono||'🏖️')}</div>
      <div class="fg-grp full"><label class="fg-lbl">Color del evento</label>${mkColorPicker(dat.color||'#1D4ED8')}</div>
      <div class="fg-grp full"><label class="fg-lbl">Nota (opcional)</label><input class="fi" id="f-nota" value="${dat.nota||''}" placeholder="Detalle adicional..."></div>
    </div>`,
    save: async ()=>{
      const tipo = document.getElementById('f-tipo-ev')?.value||'recordatorio'
      const p={id:dat.id||uid(),tipo,desc:vv('f-desc'),fecha:vv('f-fecha'),fecha_fin:vv('f-fecha-fin')||null,icono:_icoSel,color:_colorSel,nota:vv('f-nota')}
      if(!p.desc||!p.fecha) return
      const d=getData()
      if(!d.eventos) d.eventos=[]
      if(isEdit) { await sbUpdate('portal_eventos', p.id, {tipo:p.tipo,descripcion:p.desc,fecha:p.fecha,fecha_fin:p.fecha_fin||null,icono:p.icono,color:p.color,nota:p.nota||''}); d.eventos=d.eventos.map(r=>r.id===p.id?p:r) }
      else { const saved = await sbInsert('portal_eventos',{id:p.id,tipo:p.tipo,descripcion:p.desc,fecha:p.fecha,fecha_fin:p.fecha_fin||null,icono:p.icono,color:p.color,nota:p.nota||'',cliente_email:currentUser.email}); if(saved?.id) p.id=saved.id; d.eventos.push(p) }
      closeModal(); _editId=null; renderPlanner()
    }
  }),
}

function openModal(tipo, data={}, isEdit=false, customTitle) {
  _icoSel = data.icono||'🔔'
  _colorSel = data.color||'#E8909A'
  const cfg = FORMS[tipo]?.(data, isEdit, customTitle)
  if(!cfg) return
  document.getElementById('m-title').textContent = customTitle||cfg.title
  document.getElementById('m-body').innerHTML = cfg.html
  const saveBtn = document.getElementById('m-save')
  saveBtn.textContent = 'Guardar'
  saveBtn.onclick = async () => { const r = cfg.save(); if(r && r.then) { saveBtn.disabled=true; saveBtn.textContent="Guardando…"; r.finally(()=>{ saveBtn.disabled=false; saveBtn.textContent="Guardar" }) } }
  document.getElementById('overlay').style.display='flex'
}

// ══════════════════════════════════════════
// PERFIL — Editar información del usuario
// ══════════════════════════════════════════
const AVATARES = ['😊','👤','👩','👨','👩‍💼','👨‍💼','👩‍💻','👨‍💻','🦁','🐺','🦊','🐻','🌟','💎','🌸','🎯','🚀','🌈','🦋','🏔️','🌊','🎵']
let _avatarSel = '😊'

function initPerfil() {
  const u = currentUser
  const d = getData()
  // Stats
  document.getElementById('perf-s-ing').textContent = fmt(d.ingresos.reduce((s,r)=>s+r.monto,0))
  document.getElementById('perf-s-gas').textContent = fmt(d.gastos.reduce((s,r)=>s+r.monto,0))
  document.getElementById('perf-s-metas').textContent = d.metas.length
  // Form values
  document.getElementById('perf-nombre').value = u.nombre||''
  document.getElementById('perf-email').value = u.email||''
  document.getElementById('perf-tel').value = u.telefono||''
  document.getElementById('perf-ciudad').value = u.ciudad||''
  document.getElementById('perf-ocupacion').value = u.ocupacion||''
  // Avatar display
  _avatarSel = u.avatar||u.nombre[0]
  const avBig = document.getElementById('perf-av-big')
  if (avBig) avBig.textContent = _avatarSel
  document.getElementById('perf-nombre-display').textContent = u.nombre
  document.getElementById('perf-email-display').textContent = u.email
  // Avatar picker
  const picker = document.getElementById('emoji-av-picker')
  if (picker) {
    picker.innerHTML = AVATARES.map(av=>`
      <button type="button" class="emoji-av-opt${av===_avatarSel?' selected':''}" onclick="selAvatar('${av}')">${av}</button>
    `).join('')
  }
}

function selAvatar(av) {
  _avatarSel = av
  document.querySelectorAll('.emoji-av-opt').forEach(b => b.classList.toggle('selected', b.textContent.trim()===av))
  // Preview live
  const avBig = document.getElementById('perf-av-big')
  if (avBig) avBig.textContent = av
  const sbAv = document.getElementById('sb-av')
  if (sbAv) sbAv.textContent = av
  const topAv = document.getElementById('user-av')
  if (topAv) topAv.textContent = av
}

async function guardarPerfil() {
  const nombre = document.getElementById('perf-nombre')?.value?.trim()
  if (!nombre) return showMsg('perf-msg','err','El nombre es requerido')

  // Validar contraseña si se quiere cambiar
  const passActual = document.getElementById('perf-pass-actual')?.value
  const passNueva = document.getElementById('perf-pass-nueva')?.value
  const passConf = document.getElementById('perf-pass-conf')?.value
  if (passNueva) {
    if (passActual !== currentUser.pass) return showMsg('perf-msg','err','La contraseña actual no es correcta')
    if (passNueva.length < 6) return showMsg('perf-msg','err','La nueva contraseña debe tener al menos 6 caracteres')
    if (passNueva !== passConf) return showMsg('perf-msg','err','Las contraseñas no coinciden')
    currentUser.pass = passNueva
    document.getElementById('perf-pass-actual').value = ''
    document.getElementById('perf-pass-nueva').value = ''
    document.getElementById('perf-pass-conf').value = ''
  }

  // Guardar en Supabase
  try {
    await sbUpdate('clientes_portal', currentUser.id || undefined, {nombre, email:currentUser.email, telefono:document.getElementById('perf-tel')?.value||'', ciudad:document.getElementById('perf-ciudad')?.value||'', ocupacion:document.getElementById('perf-ocupacion')?.value||'', avatar:_avatarSel})
  } catch(e) { console.warn('SB perfil error:', e) }
  // Guardar en Supabase
  try {
    await sb.from('clientes_portal').upsert({email:currentUser.email,nombre,telefono:document.getElementById('perf-tel')?.value||'',ciudad:document.getElementById('perf-ciudad')?.value||'',ocupacion:document.getElementById('perf-ocupacion')?.value||'',avatar:_avatarSel},{onConflict:'email'})
  } catch(e){ console.warn('SB perfil:',e) }
  // Guardar datos
  currentUser.nombre = nombre
  currentUser.email = document.getElementById('perf-email')?.value || currentUser.email
  currentUser.telefono = document.getElementById('perf-tel')?.value || ''
  currentUser.ciudad = document.getElementById('perf-ciudad')?.value || ''
  currentUser.ocupacion = document.getElementById('perf-ocupacion')?.value || ''
  currentUser.avatar = _avatarSel

  // Actualizar UI
  const display = _avatarSel.length > 2 ? _avatarSel : nombre[0]
  ;['sb-av','user-av','perf-av-big'].forEach(id => {
    const el = document.getElementById(id)
    if (el) el.textContent = _avatarSel
  })
  const sbName = document.getElementById('sb-user-name')
  if (sbName) sbName.textContent = nombre
  document.getElementById('perf-nombre-display').textContent = nombre
  document.getElementById('perf-email-display').textContent = currentUser.email

  // Mostrar confirmación
  const saved = document.getElementById('perf-saved')
  if (saved) { saved.style.display='inline'; setTimeout(()=>saved.style.display='none',2500) }
  showMsg('perf-msg','ok','✓ Perfil actualizado correctamente')
}

function abrirCambioAvatar() {
  // Scroll al picker de avatar
  document.getElementById('emoji-av-picker')?.scrollIntoView({behavior:'smooth', block:'center'})
}

function closeModal(){document.getElementById('overlay').style.display='none'; _editId=null}

// Sidebar mobile
function openSB(){document.getElementById('sidebar-c').classList.add('open');document.getElementById('sb-overlay-c').classList.add('open')}
function closeSB(){document.getElementById('sidebar-c').classList.remove('open');document.getElementById('sb-overlay-c').classList.remove('open')}
window.addEventListener('load',()=>{
  document.querySelectorAll('.sb-btn').forEach(b=>{b.addEventListener('click',()=>{if(window.innerWidth<=900)closeSB()})})
})

function showMsg(id,type,txt) {
  const el=document.getElementById(id); if(!el) return
  el.innerHTML=`<div class="${type==='err'?'msg-err':'msg-ok'}">${txt}</div>`
  setTimeout(()=>{el.innerHTML=''},3000)
}

// ══ EXPONER FUNCIONES GLOBALES ══
window.goTab = goTab;
window.selRole = selRole;
window.doLogin = doLogin;
window.logout = logout;
window.openSB = openSB;
window.closeSB = closeSB;
window.setBN = setBN;
window.openModal = openModal;
window.closeModal = closeModal;
window.abonarMeta = abonarMeta;
window.eliminar = eliminar;
window.eliminarMeta = eliminarMeta;
window.editarReg = editarReg;
window.editarMeta = editarMeta;
window.eliminarEvento = eliminarEvento;
window.editarEvento = editarEvento;
window.calNav = calNav;
window.guardarPerfil = guardarPerfil;
window.initPerfil = initPerfil;
window.selAvatar = selAvatar;
window.pickIco = pickIco;
window.pickColor = pickColor;
window.openDayModal = openDayModal;
window.formatText = formatText;
window.insertVar = insertVar;
window.insertSeccion = insertSeccion;
window.insertFirmas = insertFirmas;
window.showDocTab = showDocTab;
window.selDocTipo = selDocTipo;
window.updateDocPreview = updateDocPreview;
window.generarDocPDF = generarDocPDF;
window.procesarWord = procesarWord;
window.guardarDesdeWord = guardarDesdeWord;
window.editarDesdeWord = editarDesdeWord;
window.nuevaPlantilla = nuevaPlantilla;
window.editarPlantilla = editarPlantilla;
window.usarPlantilla = usarPlantilla;
window.guardarPlantilla = guardarPlantilla;
window.eliminarPlantilla = eliminarPlantilla;
window.renderPlantillas = renderPlantillas;
window.abonarMeta = abonarMeta;
window.aprobar = aprobar;
window.cotToFactura = cotToFactura;
window.marcarPagada = marcarPagada;
window.logout = logout;
window.renderFacturasCli = renderFacturasCli;
window.renderCotizacionesCli = renderCotizacionesCli;

function logout() {
  sessionStorage.removeItem('sc_user')
  window.location.href = 'index.html'
}

// ══ FACTURAS Y COTIZACIONES — vista cliente ══
function renderFacturasCli() {
  const d = getData()
  const facs = d.facturas || []
  const total = facs.reduce((s,f) => s + (f.monto||0), 0)
  const pagadas = facs.filter(f => f.estado === 'pagada').length
  const pendientes = facs.filter(f => f.estado === 'pendiente').length
  const vencidas = facs.filter(f => f.estado === 'vencida').length

  const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v }
  set('fac-total-monto', fmt(total))
  set('fac-pagadas', pagadas)
  set('fac-pendientes', pendientes)
  set('fac-vencidas', vencidas)

  const tbody = document.getElementById('cli-fac-body')
  if (!tbody) return
  if (facs.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="empty">Sin facturas registradas. Tu asesor las cargará aquí.</td></tr>'
    return
  }
  tbody.innerHTML = facs.map(f => `
    <tr>
      <td style="font-size:11px;color:var(--ink-s)">${f.numero||'—'}</td>
      <td style="font-weight:600">${f.servicio||'—'}</td>
      <td style="font-size:11px;color:var(--ink-s)">${fdate(f.fecha_emision)}</td>
      <td style="font-size:11px;color:${f.estado==='vencida'?'var(--rosa-d)':'var(--ink-s)'}">${fdate(f.fecha_vencimiento)}</td>
      <td style="font-weight:700">${fmt(f.monto)}</td>
      <td><span style="display:inline-block;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:600;${
        f.estado==='pagada'?'background:rgba(10,122,75,.1);color:#0A7A4B':
        f.estado==='vencida'?'background:rgba(232,144,154,.15);color:var(--rosa-d)':
        'background:rgba(154,98,0,.08);color:#9A6200'
      }">${f.estado||'pendiente'}</span></td>
    </tr>`).join('')
}

function renderCotizacionesCli() {
  const d = getData()
  const cots = d.cotizaciones || []
  const grid = document.getElementById('cli-cot-grid')
  if (!grid) return
  if (cots.length === 0) {
    grid.innerHTML = '<div class="card" style="padding:40px;text-align:center;color:var(--ink-s)">Sin cotizaciones. Tu asesor las cargará aquí.</div>'
    return
  }
  grid.innerHTML = cots.map(c => `
    <div class="card" style="padding:20px">
      <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:16px">
        <div style="flex:1">
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:6px">
            <span style="font-size:11px;color:var(--ink-s)">${c.numero||''}</span>
            <span style="display:inline-block;padding:2px 10px;border-radius:20px;font-size:11px;font-weight:600;${
              c.estado==='aprobada'?'background:rgba(10,122,75,.1);color:#0A7A4B':
              c.estado==='rechazada'?'background:rgba(232,144,154,.15);color:var(--rosa-d)':
              'background:rgba(154,98,0,.08);color:#9A6200'
            }">${c.estado||'enviada'}</span>
          </div>
          <div style="font-family:'Cormorant Garamond',serif;font-size:18px;font-weight:600;margin-bottom:4px">${c.descripcion||'—'}</div>
          <div style="font-size:12px;color:var(--ink-s)">${fdate(c.fecha)}</div>
        </div>
        <div style="text-align:right;flex-shrink:0">
          <div style="font-size:22px;font-weight:800;letter-spacing:-1px">${fmt(c.monto)}</div>
          <div style="font-size:11px;color:var(--ink-s);margin-top:2px">Total cotizado</div>
        </div>
      </div>
    </div>`).join('')
}

window.abrirCambioAvatar = abrirCambioAvatar
window.renderGastos = renderGastos
window.renderIngresos = renderIngresos

})();

function initCliente() {
  window._SC_SESSION_USER = window._PORTAL_USER
  if (typeof window._doLogin === 'function') window._doLogin()
}
window._initCliente = initCliente

})() } catch(e) { console.error('[ClientLogic] Error en inicialización:', e) }

export function initCliente() {
  if (typeof window._initCliente === 'function') window._initCliente()
}
