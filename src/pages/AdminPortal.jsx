import { useRef, useEffect } from 'react'
import { initAdmin } from '../logic/adminLogic'

const ADMIN_HTML = `<div id="vista-admin" style="display:none">
<div class="sb-overlay" id="sb-overlay" onclick="closeSidebar()"></div>
<aside class="sidebar" id="sidebar">
  <div class="sb-logo">
    <div class="sb-logo-full">
      <img id="logo-img" src="" alt="Segura Contable">
    </div>
    <div class="sb-logo-mini"><span>SC.</span></div>
    <button class="sb-toggle" onclick="toggleSidebar()" title="Colapsar menú" id="sb-toggle-btn">◀</button>
  </div>
  <nav>
    <div class="nav-sec">
      <div class="nav-lbl">Principal</div>
      <button class="nav-btn active" onclick="go('dashboard',this)"><span class="ni-wrap"><svg class="ni" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg></span><span class="nav-btn-text">Dashboard</span></button>
    </div>
    <div class="nav-sec">
      <div class="nav-lbl">Finanzas</div>
      <button class="nav-btn" onclick="go('ingresos',this)"><span class="ni-wrap"><svg class="ni" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg></span><span class="nav-btn-text">Ingresos</span></button>
      <button class="nav-btn" onclick="go('gastos',this)"><span class="ni-wrap"><svg class="ni" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></svg></span><span class="nav-btn-text">Gastos</span></button>
      <button class="nav-btn" id="nav-fac" onclick="go('facturas',this)">
        <span class="ni-wrap"><svg class="ni" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg></span><span class="nav-btn-text">Facturas</span>
        <span class="nav-alert" id="nav-alrt" style="display:none">0</span>
      </button>
      <button class="nav-btn" onclick="go('cotizaciones',this)"><span class="ni-wrap"><svg class="ni" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg></span><span class="nav-btn-text">Cotizaciones</span></button>
    </div>
    <div class="nav-sec">
      <div class="nav-lbl">Gestión</div>
      <button class="nav-btn" onclick="go('clientes',this)"><span class="ni-wrap"><svg class="ni" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg></span><span class="nav-btn-text">Clientes</span></button>
      <button class="nav-btn" onclick="go('calendario',this)"><span class="ni-wrap"><svg class="ni" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></span><span class="nav-btn-text">Calendario</span></button>
      <button class="nav-btn" onclick="go('reportes',this)"><span class="ni-wrap"><svg class="ni" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg></span><span class="nav-btn-text">Reportes</span></button>
    </div>
    <div class="nav-sec">
      <div class="nav-lbl">Recursos Humanos</div>
      <button class="nav-btn" id="nav-rhe" onclick="go('rh-empresas',this)"><span class="ni-wrap"><svg class="ni" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg></span><span class="nav-btn-text">Empresas RH</span></button>
      <div id="rh-sub" style="display:none">
        <button class="nav-btn nav-sub" onclick="goRH('rh-empleados',this)"><span class="ni" style="font-size:10px;opacity:.35">└</span><span class="nav-btn-text">Empleados</span></button>
        <button class="nav-btn nav-sub" onclick="goRH('rh-nomina',this)"><span class="ni" style="font-size:10px;opacity:.35">└</span><span class="nav-btn-text">Nómina</span></button>
        <button class="nav-btn nav-sub" onclick="goRH('rh-asistencia',this)"><span class="ni" style="font-size:10px;opacity:.35">└</span><span class="nav-btn-text">Asistencia</span></button>
        <button class="nav-btn nav-sub" onclick="goRH('rh-vacaciones',this)"><span class="ni" style="font-size:10px;opacity:.35">└</span><span class="nav-btn-text">Vacaciones</span></button>
        <button class="nav-btn nav-sub" onclick="goRH('rh-dashboard',this)"><span class="ni" style="font-size:10px;opacity:.35">└</span><span class="nav-btn-text">Dashboard RH</span></button>
      </div>
    </div>
    <div class="nav-sec">
      <div class="nav-lbl">Documentos RRHH</div>
      <button class="nav-btn" onclick="go('docs-rrhh',this)"><span class="ni-wrap"><svg class="ni" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg></span><span class="nav-btn-text">Generar Documentos</span></button>
      <button class="nav-btn" onclick="go('plantillas',this)"><span class="ni-wrap"><svg class="ni" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg></span><span class="nav-btn-text">Mis Plantillas</span></button>
    </div>
    <div class="nav-sec">
      <div class="nav-lbl">Sistema</div>
      <button class="nav-btn" onclick="go('alertas',this)"><span class="ni-wrap"><svg class="ni" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg></span><span class="nav-btn-text">Alertas</span></button>
      <button class="nav-btn" onclick="go('config',this)"><span class="ni-wrap"><svg class="ni" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg></span><span class="nav-btn-text">Configuración</span></button>
    </div>
  </nav>
  <div class="sb-footer">
    <div class="sb-av">S</div>
    <div class="sb-footer-text"><div class="sb-user" id="cfg-nombre-display">Segura Contable</div><div class="sb-role">Administrador</div></div>
  </div>
</aside>


<nav class="bottom-nav">
  <div class="bottom-nav-inner">
    <button class="bn-item active" id="bn-dashboard" onclick="go('dashboard',null);setBN('bn-dashboard')">
      <div class="bn-ico-wrap"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg></div><span class="bn-label">Inicio</span></button>
    <button class="bn-item" id="bn-ingresos" onclick="go('ingresos',null);setBN('bn-ingresos')">
      <div class="bn-ico-wrap"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg></div><span class="bn-label">Ingresos</span></button>
    <button class="bn-item" id="bn-facturas" onclick="go('facturas',null);setBN('bn-facturas')">
      <div class="bn-ico-wrap"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg></div><span class="bn-label">Facturas</span></button>
    <button class="bn-item" id="bn-clientes" onclick="go('clientes',null);setBN('bn-clientes')">
      <div class="bn-ico-wrap"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></div><span class="bn-label">Clientes</span></button>
    <button class="bn-item" onclick="openSidebar()">
      <div class="bn-ico-wrap"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg></div><span class="bn-label">Más</span>
    </button>
  </div>
</nav>


<main class="main">
  <div class="topbar">
    <div class="topbar-l">
      <button class="topbar-icon-btn topbar-menu-btn" onclick="openSidebar()" title="Menú">☰</button>
      <div class="page-title" id="ptitle">Dashboard</div>
    </div>
    <div class="topbar-r">
      <span class="period-pill" id="period-lbl"></span>
      <button class="theme-toggle" onclick="toggleDark()" id="theme-btn" title="Modo oscuro">🌙</button>
      <button class="btn btn-o" onclick="logout()" style="font-size:11px;padding:6px 12px;border-radius:8px" title="Cerrar sesión">⏏ Salir</button>
      <button class="topbar-icon-btn" onclick="go('alertas',null)" title="Alertas">🔔<span class="bell-count" id="bell-n" style="display:none">0</span></button>
      <button class="btn btn-o" onclick="exportXL()" id="btn-xl" style="display:none;font-size:12px">📊 Excel</button>
      <button class="btn btn-p" id="btn-acc" onclick="accion()">+ Nuevo</button>
    </div>
  </div>
  <div class="content">

  
  <div class="panel active" id="p-dashboard">
    <div id="dash-alerts"></div>
    <div class="kpi-grid g4">
      <div class="kpi r"><span class="kpi-ico">💰</span><div class="kpi-lbl">Ingresos del Mes</div><div class="kpi-val" id="db-ing">—</div><div class="kpi-ch pos" id="db-ing-ch"></div></div>
      <div class="kpi g"><span class="kpi-ico">📤</span><div class="kpi-lbl">Gastos del Mes</div><div class="kpi-val" id="db-gas">—</div><div class="kpi-ch" id="db-gas-ch"></div></div>
      <div class="kpi v"><span class="kpi-ico">📈</span><div class="kpi-lbl">Utilidad Neta</div><div class="kpi-val" id="db-util">—</div><div class="kpi-ch" id="db-util-ch"></div></div>
      <div class="kpi a"><span class="kpi-ico">⏰</span><div class="kpi-lbl">Por Cobrar</div><div class="kpi-val" id="db-cob">—</div><div class="kpi-ch neg" id="db-cob-n"></div></div>
    </div>
    <div class="two-col">
      <div class="card">
        <div class="card-h"><span class="card-t">Ingresos vs Gastos 2026</span><span class="tag" id="db-tag"></span></div>
        <div class="card-b"><div class="chart-h"><canvas id="ch-bar"></canvas></div></div>
      </div>
      <div class="card">
        <div class="card-h"><span class="card-t">Distribución Gastos</span></div>
        <div class="card-b">
          <div class="chart-h" style="height:150px"><canvas id="ch-dona"></canvas></div>
          <div id="dona-leg" style="margin-top:10px"></div>
        </div>
      </div>
    </div>
    <div class="two-col">
      <div class="card">
        <div class="card-h"><span class="card-t">Últimas Facturas</span><button class="btn-sm" onclick="go('facturas',null)">Ver todas →</button></div>
        <div class="card-b np"><div class="tw"><table><thead><tr><th>Cliente</th><th>Monto</th><th>Vencimiento</th><th>Estado</th></tr></thead><tbody id="db-facs"></tbody></table></div></div>
      </div>
      <div class="card">
        <div class="card-h"><span class="card-t">Actividad Reciente</span></div>
        <div class="card-b" id="db-act"></div>
      </div>
    </div>
    <div class="two-col">
      <div class="card">
        <div class="card-h"><span class="card-t">Cotizaciones Recientes</span><button class="btn-sm" onclick="go('cotizaciones',null)">Ver todas →</button></div>
        <div class="card-b np"><div class="tw"><table><thead><tr><th>Cliente</th><th>Monto</th><th>Vigencia</th><th>Estado</th></tr></thead><tbody id="db-cots"></tbody></table></div></div>
      </div>
      <div class="card">
        <div class="card-h"><span class="card-t">Resumen RH Global</span></div>
        <div class="card-b" id="db-rh"></div>
      </div>
    </div>

    <!-- ══ PORTAL CLIENTE — Datos cargados desde admin ══ -->
    <div style="margin-top:24px">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">
        <div>
          <div style="font-family:'Cormorant Garamond',serif;font-size:20px;font-weight:600">Portal del Cliente</div>
          <div style="font-size:12px;color:var(--gris-s);margin-top:2px">Datos visibles en el portal del cliente. Se guardan en Supabase.</div>
        </div>
        <div id="pc-portal-status" style="font-size:12px;color:var(--gris-s)"></div>
      </div>

      <!-- Sub-tabs portal -->
      <div style="display:flex;gap:6px;margin-bottom:16px;border-bottom:1px solid var(--borde);padding-bottom:10px;flex-wrap:wrap">
        <button class="btn btn-p" id="pctab-ing-btn"   onclick="showPCTab('ingresos',this)"   style="font-size:11px;padding:5px 12px">💰 Ingresos</button>
        <button class="btn btn-o" id="pctab-gas-btn"   onclick="showPCTab('gastos',this)"     style="font-size:11px;padding:5px 12px">📤 Gastos</button>
        <button class="btn btn-o" id="pctab-fac-btn"   onclick="showPCTab('facturas',this)"   style="font-size:11px;padding:5px 12px">🧾 Facturas</button>
        <button class="btn btn-o" id="pctab-cot-btn"   onclick="showPCTab('cotizaciones',this)" style="font-size:11px;padding:5px 12px">📋 Cotizaciones</button>
      </div>

      <!-- Panel Ingresos cliente -->
      <div id="pctab-ingresos">
        <div style="display:flex;justify-content:flex-end;margin-bottom:10px">
          <button class="btn btn-p" onclick="abrirFormPC('ingreso')" style="font-size:12px">+ Agregar Ingreso</button>
        </div>
        <div class="tw"><table style="width:100%"><thead><tr>
          <th>Descripción</th><th>Categoría</th><th>Fecha</th><th>Monto</th><th></th>
        </tr></thead><tbody id="pc-ing-body"><tr><td colspan="5" class="empty">Cargando...</td></tr></tbody></table></div>
      </div>

      <!-- Panel Gastos cliente -->
      <div id="pctab-gastos" style="display:none">
        <div style="display:flex;justify-content:flex-end;margin-bottom:10px">
          <button class="btn btn-p" onclick="abrirFormPC('gasto')" style="font-size:12px">+ Agregar Gasto</button>
        </div>
        <div class="tw"><table style="width:100%"><thead><tr>
          <th>Descripción</th><th>Categoría</th><th>Fecha</th><th>Monto</th><th></th>
        </tr></thead><tbody id="pc-gas-body"><tr><td colspan="5" class="empty">Cargando...</td></tr></tbody></table></div>
      </div>

      <!-- Panel Facturas cliente -->
      <div id="pctab-facturas" style="display:none">
        <div style="display:flex;justify-content:flex-end;margin-bottom:10px">
          <button class="btn btn-p" onclick="abrirFormPC('factura')" style="font-size:12px">+ Agregar Factura</button>
        </div>
        <div class="tw"><table style="width:100%"><thead><tr>
          <th>N°</th><th>Servicio</th><th>Emisión</th><th>Vencimiento</th><th>Monto</th><th>Estado</th><th></th>
        </tr></thead><tbody id="pc-fac-body"><tr><td colspan="7" class="empty">Cargando...</td></tr></tbody></table></div>
      </div>

      <!-- Panel Cotizaciones cliente -->
      <div id="pctab-cotizaciones" style="display:none">
        <div style="display:flex;justify-content:flex-end;margin-bottom:10px">
          <button class="btn btn-p" onclick="abrirFormPC('cotizacion')" style="font-size:12px">+ Agregar Cotización</button>
        </div>
        <div class="tw"><table style="width:100%"><thead><tr>
          <th>N°</th><th>Descripción</th><th>Fecha</th><th>Monto</th><th>Estado</th><th></th>
        </tr></thead><tbody id="pc-cot-body"><tr><td colspan="6" class="empty">Cargando...</td></tr></tbody></table></div>
      </div>

    </div>
  </div>

  
  <div class="panel" id="p-alertas">
    <div class="kpi-grid g3">
      <div class="kpi r"><div class="kpi-lbl">Facturas Vencidas</div><div class="kpi-val" id="al-v">0</div></div>
      <div class="kpi a"><div class="kpi-lbl">Vencen esta semana</div><div class="kpi-val" id="al-p">0</div></div>
      <div class="kpi b"><div class="kpi-lbl">Monto sin Cobrar</div><div class="kpi-val" id="al-m">$0</div></div>
    </div>
    <div class="card"><div class="card-h"><span class="card-t">Todas las Alertas</span></div><div class="card-b" id="al-lista"></div></div>
  </div>

  
  <div class="panel" id="p-ingresos">
    <div id="ing-msg"></div>
    <div class="kpi-grid g3">
      <div class="kpi r"><div class="kpi-lbl">Total Registrado</div><div class="kpi-val" id="ing-tot">—</div></div>
      <div class="kpi v"><div class="kpi-lbl">Cobrado</div><div class="kpi-val" id="ing-cob">—</div></div>
      <div class="kpi a"><div class="kpi-lbl">Pendiente</div><div class="kpi-val" id="ing-pend">—</div></div>
    </div>
    <div class="sb-row">
      <input class="si" id="ing-q" placeholder="🔍 Buscar…" oninput="if(window.renderIngresos)window.renderIngresos()">
      <select class="fi" id="ing-cat" style="width:170px" onchange="renderIngresos()">
        <option value="">Todas las categorías</option>
        <option>Servicios Contables</option><option>Asesoría Fiscal</option><option>Auditoría</option><option>Nómina</option><option>Consultoría</option>
      </select>
      <button class="btn btn-v" onclick="exportTabla('ingresos')">📊 Excel</button>
    </div>
    <div class="card"><div class="card-b np"><div class="tw">
      <table><thead><tr><th>Descripción</th><th>Cliente</th><th>Categoría</th><th>Fecha</th><th>Monto</th><th>Estado</th><th>Acciones</th></tr></thead>
      <tbody id="ing-tbody"></tbody></table>
    </div></div></div>
  </div>

  
  <div class="panel" id="p-gastos">
    <div id="gas-msg"></div>
    <div class="kpi-grid g3">
      <div class="kpi g"><div class="kpi-lbl">Total Gastos</div><div class="kpi-val" id="gas-tot">—</div></div>
      <div class="kpi r"><div class="kpi-lbl">Transacciones</div><div class="kpi-val" id="gas-cnt">—</div></div>
      <div class="kpi a"><div class="kpi-lbl">Mayor Categoría</div><div class="kpi-val" id="gas-cat" style="font-size:17px">—</div></div>
    </div>
    <div class="sb-row">
      <input class="si" id="gas-q" placeholder="🔍 Buscar…" oninput="if(window.renderGastos)window.renderGastos()">
      <select class="fi" id="gas-cat2" style="width:170px" onchange="renderGastos()">
        <option value="">Todas las categorías</option>
        <option>Nómina</option><option>Renta</option><option>Servicios</option><option>Operativos</option><option>Tecnología</option><option>Marketing</option><option>Impuestos</option>
      </select>
      <button class="btn btn-v" onclick="exportTabla('gastos')">📊 Excel</button>
    </div>
    <div class="card"><div class="card-b np"><div class="tw">
      <table><thead><tr><th>Descripción</th><th>Proveedor</th><th>Categoría</th><th>Fecha</th><th>Monto</th><th>Acciones</th></tr></thead>
      <tbody id="gas-tbody"></tbody></table>
    </div></div></div>
  </div>

  
  <div class="panel" id="p-facturas">
    <div id="fac-msg"></div>
    <div class="kpi-grid g4">
      <div class="kpi r"><div class="kpi-lbl">Total Facturado</div><div class="kpi-val" id="fac-tot">—</div></div>
      <div class="kpi v"><div class="kpi-lbl">Pagadas</div><div class="kpi-val" id="fac-pag">—</div></div>
      <div class="kpi a"><div class="kpi-lbl">Pendientes</div><div class="kpi-val" id="fac-pend">—</div></div>
      <div class="kpi g"><div class="kpi-lbl">Vencidas</div><div class="kpi-val" id="fac-venc">—</div></div>
    </div>
    <div id="fac-alert-row" class="alert-row"></div>
    <div class="sb-row">
      <input class="si" id="fac-q" placeholder="🔍 Buscar…" oninput="renderFacturas()">
      <select class="fi" id="fac-fil" style="width:145px" onchange="renderFacturas()">
        <option value="">Todos</option><option value="pagado">Pagado</option><option value="pendiente">Pendiente</option><option value="vencida">Vencida</option><option value="borrador">Borrador</option>
      </select>
      <button class="btn btn-v" onclick="exportTabla('facturas')">📊 Excel</button>
    </div>
    <div class="card"><div class="card-b np"><div class="tw">
      <table><thead><tr><th>No.</th><th>Cliente</th><th>Servicio</th><th>Emisión</th><th>Vencimiento</th><th>Monto</th><th>Estado</th><th>Acciones</th></tr></thead>
      <tbody id="fac-tbody"></tbody></table>
    </div></div></div>
  </div>

  
  <div class="panel" id="p-cotizaciones">
    <div id="cot-msg"></div>
    <div class="kpi-grid g4">
      <div class="kpi m"><div class="kpi-lbl">Total Cotizaciones</div><div class="kpi-val" id="cot-tot">—</div></div>
      <div class="kpi v"><div class="kpi-lbl">Aprobadas</div><div class="kpi-val" id="cot-apr">—</div></div>
      <div class="kpi a"><div class="kpi-lbl">Enviadas / Pendientes</div><div class="kpi-val" id="cot-pend">—</div></div>
      <div class="kpi r"><div class="kpi-lbl">Monto Total</div><div class="kpi-val" id="cot-monto">—</div></div>
    </div>
    <div class="sb-row">
      <input class="si" id="cot-q" placeholder="🔍 Buscar cotización…" oninput="renderCotizaciones()">
      <select class="fi" id="cot-fil" style="width:145px" onchange="renderCotizaciones()">
        <option value="">Todos los estados</option>
        <option value="borrador">Borrador</option><option value="enviada">Enviada</option><option value="aprobada">Aprobada</option><option value="rechazada">Rechazada</option><option value="vencida">Vencida</option>
      </select>
      <button class="btn btn-v" onclick="exportTabla('cotizaciones')">📊 Excel</button>
    </div>
    <div class="card"><div class="card-b np"><div class="tw">
      <table><thead><tr><th>No.</th><th>Cliente</th><th>Descripción</th><th>Fecha</th><th>Vigencia</th><th>Monto</th><th>Estado</th><th>Acciones</th></tr></thead>
      <tbody id="cot-tbody"></tbody></table>
    </div></div></div>
  </div>

  
  <div class="panel" id="p-clientes">
    <!-- Sub-tabs -->
    <div style="display:flex;gap:8px;margin-bottom:20px;border-bottom:1px solid var(--borde);padding-bottom:12px">
      <button class="btn btn-p" id="tab-clientes-btn" onclick="showCliTab('clientes',this)" style="font-size:12px;padding:6px 14px">🏢 Clientes</button>
      <button class="btn btn-o" id="tab-usuarios-btn" onclick="showCliTab('usuarios',this)" style="font-size:12px;padding:6px 14px">👤 Usuarios del Portal</button>
    </div>

    <!-- Panel Clientes -->
    <div id="sub-clientes">
      <div id="cli-msg"></div>
      <div class="sb-row">
        <input class="si" id="cli-q" placeholder="🔍 Buscar cliente…" oninput="renderClientes()">
        <button class="btn btn-v" onclick="exportTabla('clientes')">📊 Excel</button>
      </div>
      <div class="three-col" id="cli-grid"></div>
    </div>

    <!-- Panel Usuarios del Portal -->
    <div id="sub-usuarios" style="display:none">
      <div id="usr-msg"></div>
      <div class="sb-row" style="margin-bottom:16px">
        <input class="si" id="usr-q" placeholder="🔍 Buscar usuario…" oninput="if(window.renderUsuarios)window.renderUsuarios()">
        <button class="btn btn-p" onclick="openModalUsuario()">+ Nuevo Usuario</button>
      </div>
      <div id="usr-grid"></div>
    </div>
  </div>

  
  <div class="panel" id="p-perfil-cliente">
    <button class="btn btn-o" style="margin-bottom:16px" onclick="go('clientes',null)">← Volver a Clientes</button>
    <div class="cli-header">
      <div class="cli-avatar" id="pc-av">—</div>
      <div style="flex:1">
        <div style="font-family:'Cormorant Garamond',serif;font-size:22px;font-weight:600;color:#fff" id="pc-nombre">—</div>
        <div style="font-size:12px;color:rgba(255,255,255,.6);margin-top:3px" id="pc-rfc">—</div>
        <div style="font-size:12px;color:rgba(255,255,255,.5);margin-top:2px" id="pc-giro">—</div>
      </div>
      <div style="text-align:right">
        <div style="font-size:10px;color:rgba(255,255,255,.4);letter-spacing:1px;text-transform:uppercase">Contacto</div>
        <div style="font-size:13px;color:#fff;margin-top:2px" id="pc-contacto">—</div>
        <div style="font-size:12px;color:var(--rosa-l);margin-top:2px" id="pc-email">—</div>
      </div>
    </div>
    <div class="cli-stats">
      <div class="cli-stat"><div class="cli-stat-val ap" id="pc-total-fac">—</div><div class="cli-stat-lbl">Total Facturado</div></div>
      <div class="cli-stat"><div class="cli-stat-val" id="pc-n-fac">—</div><div class="cli-stat-lbl">Facturas Emitidas</div></div>
      <div class="cli-stat"><div class="cli-stat-val an" id="pc-pendiente">—</div><div class="cli-stat-lbl">Saldo Pendiente</div></div>
    </div>
    <div class="card">
      <div class="card-h"><span class="card-t">Historial de Facturas</span><button class="btn btn-p" onclick="openModal('factura',{cliente:document.getElementById('pc-nombre').textContent})">+ Nueva Factura</button></div>
      <div class="card-b np"><div class="tw"><table><thead><tr><th>No.</th><th>Servicio</th><th>Emisión</th><th>Vencimiento</th><th>Monto</th><th>Estado</th></tr></thead><tbody id="pc-facs-body"></tbody></table></div></div>
    </div>
    <div class="card">
      <div class="card-h"><span class="card-t">Cotizaciones</span></div>
      <div class="card-b np"><div class="tw"><table><thead><tr><th>No.</th><th>Descripción</th><th>Fecha</th><th>Monto</th><th>Estado</th></tr></thead><tbody id="pc-cots-body"></tbody></table></div></div>
    </div>
  </div>

  
  <div class="panel" id="p-calendario">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:18px">
      <button class="btn btn-o" onclick="calNav(-1)">← Anterior</button>
      <div style="font-family:'Cormorant Garamond',serif;font-size:20px;font-weight:600" id="cal-titulo">—</div>
      <button class="btn btn-o" onclick="calNav(1)">Siguiente →</button>
    </div>
    <div class="card">
      <div class="card-h">
        <span class="card-t" id="cal-subtitulo">Vencimientos y eventos</span>
        <div style="display:flex;gap:8px;align-items:center;font-size:11px">
          <span style="background:var(--rosa-p);color:var(--rosa-d);padding:3px 8px;border-radius:4px;font-weight:600">● Vence</span>
          <span style="background:var(--verde-p);color:var(--verde);padding:3px 8px;border-radius:4px;font-weight:600">● Cobro</span>
          <span style="background:var(--amber-p);color:var(--amber);padding:3px 8px;border-radius:4px;font-weight:600">● Pago</span>
          <span style="background:var(--azul-p);color:var(--azul);padding:3px 8px;border-radius:4px;font-weight:600">● Vacaciones</span>
        </div>
      </div>
      <div class="card-b">
        <div class="cal-grid" id="cal-heads"></div>
        <div style="height:8px"></div>
        <div class="cal-grid" id="cal-body"></div>
      </div>
    </div>
  </div>

  
  <div class="panel" id="p-reportes">
    <div class="kpi-grid g4">
      <div class="kpi r"><div class="kpi-lbl">Ingresos Totales</div><div class="kpi-val" id="rep-ing">—</div></div>
      <div class="kpi g"><div class="kpi-lbl">Gastos Totales</div><div class="kpi-val" id="rep-gas">—</div></div>
      <div class="kpi v"><div class="kpi-lbl">Utilidad Neta</div><div class="kpi-val" id="rep-util">—</div></div>
      <div class="kpi a"><div class="kpi-lbl">Margen</div><div class="kpi-val" id="rep-mar">—</div></div>
    </div>
    <div class="two-col">
      <div class="card">
        <div class="card-h"><span class="card-t">Estado de Resultados</span><button class="btn btn-v" onclick="exportReporte()">📊 Excel Completo</button></div>
        <div class="card-b" id="rep-estado"></div>
      </div>
      <div class="card">
        <div class="card-h"><span class="card-t">Indicadores</span></div>
        <div class="card-b" id="rep-ind"></div>
      </div>
    </div>
    <div class="card">
      <div class="card-h"><span class="card-t">Tendencia Anual</span><span class="tag-v">2026</span></div>
      <div class="card-b"><div class="chart-h" style="height:210px"><canvas id="ch-line"></canvas></div></div>
    </div>
  </div>

  
  <div class="panel" id="p-rh-empresas">
    <div id="rhe-msg"></div>
    <div class="kpi-grid g3">
      <div class="kpi r"><div class="kpi-lbl">Empresas</div><div class="kpi-val" id="rhe-tot">—</div></div>
      <div class="kpi v"><div class="kpi-lbl">Total Empleados</div><div class="kpi-val" id="rhe-emp">—</div></div>
      <div class="kpi a"><div class="kpi-lbl">Nómina Global</div><div class="kpi-val" id="rhe-nom">—</div></div>
    </div>
    <div class="sb-row"><input class="si" id="rhe-q" placeholder="🔍 Buscar empresa…" oninput="renderEmpresasRH()"></div>
    <div class="three-col" id="rhe-grid"></div>
  </div>

  
  <div class="panel" id="p-rh-empleados">
    <div id="emp-msg"></div>
    <div class="banner"><div><div class="ban-lbl">Empresa activa</div><div class="ban-name" id="emp-eb">—</div></div>
      <div style="display:flex;gap:8px"><button class="btn btn-o" style="color:#fff;border-color:rgba(255,255,255,.3)" onclick="go('rh-empresas',document.getElementById('nav-rhe'))">Cambiar</button><button class="btn btn-v" onclick="exportTabla('empleados')">📊 Excel</button></div>
    </div>
    <div class="kpi-grid g4">
      <div class="kpi r"><div class="kpi-lbl">Total</div><div class="kpi-val" id="emp-tot">—</div></div>
      <div class="kpi v"><div class="kpi-lbl">Activos</div><div class="kpi-val" id="emp-act">—</div></div>
      <div class="kpi a"><div class="kpi-lbl">En Vacaciones</div><div class="kpi-val" id="emp-vac">—</div></div>
      <div class="kpi g"><div class="kpi-lbl">Nómina Mensual</div><div class="kpi-val" id="emp-nom">—</div></div>
    </div>
    <div class="sb-row">
      <input class="si" id="emp-q" placeholder="🔍 Buscar…" oninput="renderEmpleados()">
      <select class="fi" id="emp-dep" style="width:190px" onchange="renderEmpleados()"><option value="">Todos los departamentos</option></select>
    </div>
    <div class="card"><div class="card-b np"><div class="tw">
      <table><thead><tr><th>Nombre</th><th>Puesto</th><th>Departamento</th><th>Ingreso</th><th>Salario</th><th>Contrato</th><th>Estado</th><th>Acciones</th></tr></thead>
      <tbody id="emp-tbody"></tbody></table>
    </div></div></div>
  </div>

  
  <div class="panel" id="p-rh-nomina">
    <div id="nom-msg"></div>
    <div class="banner"><div><div class="ban-lbl">Empresa activa</div><div class="ban-name" id="nom-eb">—</div></div>
      <div style="display:flex;gap:8px"><button class="btn btn-o" style="color:#fff;border-color:rgba(255,255,255,.3)" onclick="go('rh-empresas',document.getElementById('nav-rhe'))">Cambiar</button><button class="btn btn-v" onclick="exportTabla('nomina')">📊 Excel</button></div>
    </div>
    <div class="kpi-grid g3">
      <div class="kpi r"><div class="kpi-lbl">Total Período</div><div class="kpi-val" id="nom-tot">—</div></div>
      <div class="kpi v"><div class="kpi-lbl">Pagados</div><div class="kpi-val" id="nom-pag">—</div></div>
      <div class="kpi a"><div class="kpi-lbl">Pendientes</div><div class="kpi-val" id="nom-pend">—</div></div>
    </div>
    <div class="sb-row">
      <input class="si" id="nom-q" placeholder="🔍 Buscar…" oninput="renderNomina()">
      <select class="fi" id="nom-mes" style="width:155px" onchange="renderNomina()">
        <option value="">Todos los períodos</option>
        <option value="2026-05">Mayo 2026</option><option value="2026-04">Abril 2026</option><option value="2026-03">Marzo 2026</option>
      </select>
    </div>
    <div class="card"><div class="card-b np"><div class="tw">
      <table><thead><tr><th>Empleado</th><th>Período</th><th>Salario Base</th><th>Bonos</th><th>Deducciones</th><th>Total Neto</th><th>Estado</th><th>Acciones</th></tr></thead>
      <tbody id="nom-tbody"></tbody></table>
    </div></div></div>
  </div>

  
  <div class="panel" id="p-rh-asistencia">
    <div id="asi-msg"></div>
    <div class="banner"><div><div class="ban-lbl">Empresa activa</div><div class="ban-name" id="asi-eb">—</div></div>
      <button class="btn btn-o" style="color:#fff;border-color:rgba(255,255,255,.3)" onclick="go('rh-empresas',document.getElementById('nav-rhe'))">Cambiar</button>
    </div>
    <div class="kpi-grid g4">
      <div class="kpi v"><div class="kpi-lbl">Presentes Hoy</div><div class="kpi-val" id="asi-pre">—</div></div>
      <div class="kpi r"><div class="kpi-lbl">Ausentes</div><div class="kpi-val" id="asi-aus">—</div></div>
      <div class="kpi a"><div class="kpi-lbl">Retardos</div><div class="kpi-val" id="asi-ret">—</div></div>
      <div class="kpi g"><div class="kpi-lbl">Registros Mes</div><div class="kpi-val" id="asi-mes">—</div></div>
    </div>
    <div class="sb-row">
      <input class="si" id="asi-q" placeholder="🔍 Buscar…" oninput="renderAsistencia()">
      <input class="fi" id="asi-fecha" type="date" style="width:160px" onchange="renderAsistencia()">
    </div>
    <div class="card"><div class="card-b np"><div class="tw">
      <table><thead><tr><th>Empleado</th><th>Fecha</th><th>Entrada</th><th>Salida</th><th>Horas</th><th>Estado</th><th>Notas</th><th>Acciones</th></tr></thead>
      <tbody id="asi-tbody"></tbody></table>
    </div></div></div>
  </div>

  
  <div class="panel" id="p-rh-vacaciones">
    <div id="vac-msg"></div>
    <div class="banner"><div><div class="ban-lbl">Empresa activa</div><div class="ban-name" id="vac-eb">—</div></div>
      <button class="btn btn-o" style="color:#fff;border-color:rgba(255,255,255,.3)" onclick="go('rh-empresas',document.getElementById('nav-rhe'))">Cambiar</button>
    </div>
    <div class="kpi-grid g4">
      <div class="kpi r"><div class="kpi-lbl">Solicitudes</div><div class="kpi-val" id="vac-tot">—</div></div>
      <div class="kpi v"><div class="kpi-lbl">Aprobadas</div><div class="kpi-val" id="vac-apr">—</div></div>
      <div class="kpi a"><div class="kpi-lbl">Pendientes</div><div class="kpi-val" id="vac-pend">—</div></div>
      <div class="kpi b"><div class="kpi-lbl">En Curso</div><div class="kpi-val" id="vac-cur">—</div></div>
    </div>
    <div class="sb-row">
      <input class="si" id="vac-q" placeholder="🔍 Buscar…" oninput="renderVacaciones()">
      <select class="fi" id="vac-fil" style="width:155px" onchange="renderVacaciones()">
        <option value="">Todos los estados</option><option value="aprobado">Aprobado</option><option value="pendiente">Pendiente</option><option value="rechazado">Rechazado</option>
      </select>
    </div>
    <div class="card"><div class="card-b np"><div class="tw">
      <table><thead><tr><th>Empleado</th><th>Tipo</th><th>Inicio</th><th>Fin</th><th>Días</th><th>Motivo</th><th>Estado</th><th>Acciones</th></tr></thead>
      <tbody id="vac-tbody"></tbody></table>
    </div></div></div>
  </div>

  
  <div class="panel" id="p-rh-dashboard">
    <div class="kpi-grid g4">
      <div class="kpi r"><div class="kpi-lbl">Empresas Activas</div><div class="kpi-val" id="rhd-emp">—</div></div>
      <div class="kpi v"><div class="kpi-lbl">Total Empleados</div><div class="kpi-val" id="rhd-tot">—</div></div>
      <div class="kpi a"><div class="kpi-lbl">Nómina Global</div><div class="kpi-val" id="rhd-nom">—</div></div>
      <div class="kpi b"><div class="kpi-lbl">En Vacaciones Hoy</div><div class="kpi-val" id="rhd-vac">—</div></div>
    </div>
    <div class="card">
      <div class="card-h"><span class="card-t">Resumen por Empresa</span></div>
      <div class="card-b np"><div class="tw">
        <table><thead><tr><th>Empresa</th><th>Empleados</th><th>Activos</th><th>Nómina Mensual</th><th>En Vacaciones</th><th>Solicitudes Pend.</th></tr></thead>
        <tbody id="rhd-tabla"></tbody></table>
      </div></div>
    </div>
    <div class="two-col">
      <div class="card">
        <div class="card-h"><span class="card-t">Distribución Empleados</span></div>
        <div class="card-b"><div class="chart-h" style="height:160px"><canvas id="ch-rh-emp"></canvas></div></div>
      </div>
      <div class="card">
        <div class="card-h"><span class="card-t">Nómina por Empresa</span></div>
        <div class="card-b"><div class="chart-h" style="height:160px"><canvas id="ch-rh-nom"></canvas></div></div>
      </div>
    </div>
  </div>

  
  <div class="panel" id="p-config">
    <div class="two-col">
      <div class="card"><div class="card-h"><span class="card-t">Perfil del Despacho</span></div><div class="card-b">
        <div class="fg">
          <div class="fg-grp full"><label class="fg-lbl">Nombre del Despacho</label><input class="fi" id="cfg-nombre" value="Segura Contable" oninput="document.getElementById('cfg-nombre-display').textContent=this.value"></div>
          <div class="fg-grp"><label class="fg-lbl">RFC</label><input class="fi" id="cfg-rfc" placeholder="RFC del despacho"></div>
          <div class="fg-grp"><label class="fg-lbl">Teléfono</label><input class="fi" id="cfg-tel" placeholder="(55) 0000-0000"></div>
          <div class="fg-grp full"><label class="fg-lbl">Correo</label><input class="fi" id="cfg-email" placeholder="contacto@seguracontable.mx"></div>
          <div class="fg-grp full"><label class="fg-lbl">Dirección Fiscal</label><input class="fi" id="cfg-dir" placeholder="Calle, Ciudad, Estado, CP"></div>
          <div class="fg-grp"><label class="fg-lbl">Régimen Fiscal</label><select class="fi" id="cfg-reg"><option>Servicios Profesionales</option><option>Actividad Empresarial</option><option>RESICO</option></select></div>
          <div class="fg-grp"><label class="fg-lbl">Moneda</label><select class="fi" id="cfg-mon"><option>CLP — Peso Chileno</option><option>MXN — Peso Mexicano</option><option>USD — Dólar</option></select></div>
        </div>
        <div style="margin-top:16px"><button class="btn btn-p" onclick="showMsg('cfg-msg','ok','✓ Configuración guardada')">Guardar cambios</button></div>
        <div id="cfg-msg"></div>
      </div></div>
      <div>
        <div class="card"><div class="card-h"><span class="card-t">PDF — Datos para Facturas</span></div><div class="card-b">
          <div class="fg-grp" style="margin-bottom:12px"><label class="fg-lbl">Leyenda al pie</label><input class="fi" id="cfg-leyenda" value="Gracias por su confianza. Pago en 15 días hábiles."></div>
          <div class="fg-grp"><label class="fg-lbl">Datos Bancarios</label><textarea class="fi" id="cfg-banco" rows="3" placeholder="Banco: Banco Estado&#10;Cuenta: 000000000&#10;RUT: 00.000.000-0"></textarea></div>
        </div></div>
        <div class="card"><div class="card-h"><span class="card-t">Acerca del Sistema</span></div><div class="card-b">
          <p style="font-size:13px;color:var(--gris-m);line-height:1.9"><strong style="color:var(--gris)">Segura Contable Pro v3.0</strong><br><br>
          ✅ Dashboard con gráficas<br>✅ Alertas de vencimiento<br>✅ PDF Facturas y Nómina con logo<br>✅ Exportar a Excel<br>✅ Cotizaciones → Factura<br>✅ Perfil de cliente<br>✅ Calendario de vencimientos<br>✅ RH Multi-empresa + Dashboard RH<br>✅ Aprobación de vacaciones</p>
          <div style="margin-top:12px"><span class="bdg azul-b">Maqueta — sin base de datos</span></div>
        </div></div>
      </div>
    </div>
  </div>

  
  <div class="panel" id="p-docs-rrhh">
    
    <div class="doc-empresa-sel" id="doc-emp-banner">
      <div class="doc-empresa-ico">🏢</div>
      <div class="doc-empresa-info">
        <div class="doc-empresa-name" id="doc-emp-name">Selecciona una empresa</div>
        <div class="doc-empresa-sub" id="doc-emp-sub">Los documentos se generarán con los datos de esta empresa y sus empleados</div>
      </div>
      <select class="fi" id="doc-emp-select" style="width:220px" onchange="cambiarEmpresaDoc()">
        <option value="">— Elegir empresa —</option>
      </select>
    </div>

    
    <div style="margin-bottom:6px">
      <div class="section-sep"><span>Selecciona el tipo de documento</span></div>
    </div>
    <div class="doc-tipos-grid" id="doc-tipos-grid">
      <div class="doc-tipo-card contrato selected" onclick="selDocTipo('contrato',this)">
        <span class="doc-tipo-ico">📄</span>
        <div class="doc-tipo-name">Contrato de Trabajo</div>
        <div class="doc-tipo-desc">Indefinido, plazo fijo o por obra</div>
      </div>
      <div class="doc-tipo-card anexo" onclick="selDocTipo('anexo',this)">
        <span class="doc-tipo-ico">📎</span>
        <div class="doc-tipo-name">Anexo de Sueldo</div>
        <div class="doc-tipo-desc">Modificación de remuneración</div>
      </div>
      <div class="doc-tipo-card finiquito" onclick="selDocTipo('finiquito',this)">
        <span class="doc-tipo-ico">🤝</span>
        <div class="doc-tipo-name">Finiquito</div>
        <div class="doc-tipo-desc">Término de contrato laboral</div>
      </div>
      <div class="doc-tipo-card amonestacion" onclick="selDocTipo('amonestacion',this)">
        <span class="doc-tipo-ico">⚠️</span>
        <div class="doc-tipo-name">Carta Amonestación</div>
        <div class="doc-tipo-desc">Amonestación verbal o escrita</div>
      </div>
      <div class="doc-tipo-card certificado" onclick="selDocTipo('certificado',this)">
        <span class="doc-tipo-ico">🏆</span>
        <div class="doc-tipo-name">Certificado de Trabajo</div>
        <div class="doc-tipo-desc">Acredita relación laboral vigente</div>
      </div>
      <div class="doc-tipo-card liquidacion" onclick="selDocTipo('liquidacion',this)">
        <span class="doc-tipo-ico">💵</span>
        <div class="doc-tipo-name">Liquidación de Sueldo</div>
        <div class="doc-tipo-desc">Detalle mensual de remuneración</div>
      </div>
    </div>

    
    <div class="doc-gen-wrap">
      
      <div class="card">
        <div class="card-h">
          <span class="card-t" id="doc-form-title">📄 Datos del Contrato</span>
        </div>
        <div class="card-b">
          
          <div class="fg-grp" style="margin-bottom:16px">
            <label class="fg-lbl">Empleado *</label>
            <select class="fi" id="doc-empleado" onchange="updateDocPreview()">
              <option value="">— Selecciona empresa primero —</option>
            </select>
          </div>
          
          <div id="doc-campos-dinamicos">
            
          </div>
          <div style="display:flex;gap:10px;margin-top:20px;padding-top:16px;border-top:1px solid var(--borde)">
            <button class="btn btn-p" style="flex:1" onclick="generarDocPDF()">📄 Generar PDF</button>
            <button class="btn btn-o" onclick="updateDocPreview()">👁 Actualizar Vista</button>
          </div>
        </div>
      </div>

      
      <div class="doc-preview-wrap">
        <div class="doc-preview-header">
          <span class="doc-preview-title">Vista previa</span>
          <button class="btn-sm" onclick="generarDocPDF()" style="font-size:10px;padding:4px 10px">📄 PDF</button>
        </div>
        <div class="doc-preview-body">
          <div class="doc-sheet" id="doc-preview-content">
            <div style="text-align:center;padding:40px;color:#aaa;font-size:12px">
              <div style="font-size:32px;margin-bottom:12px">📄</div>
              Selecciona una empresa y un empleado<br>para ver la vista previa del documento
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>


  
  <div class="panel" id="p-docs-rrhh">
    <div class="doc-empresa-sel">
      <div class="doc-empresa-ico">🏢</div>
      <div class="doc-empresa-info">
        <div class="doc-empresa-name" id="doc-emp-name">Selecciona una empresa</div>
        <div class="doc-empresa-sub">Los documentos usarán los datos de esta empresa</div>
      </div>
      <select class="fi" id="doc-emp-select" style="width:220px" onchange="cambiarEmpresaDoc()">
        <option value="">— Elegir empresa —</option>
      </select>
    </div>
    <div class="section-sep" style="margin-bottom:16px"><span>Tipo de documento</span></div>
    <div class="doc-tipos-grid">
      <div class="doc-tipo-card contrato selected" onclick="selDocTipo('contrato',this)"><span class="doc-tipo-ico">📄</span><div class="doc-tipo-name">Contrato de Trabajo</div><div class="doc-tipo-desc">Indefinido, plazo fijo o por obra</div></div>
      <div class="doc-tipo-card anexo" onclick="selDocTipo('anexo',this)"><span class="doc-tipo-ico">📎</span><div class="doc-tipo-name">Anexo de Sueldo</div><div class="doc-tipo-desc">Modificación de remuneración</div></div>
      <div class="doc-tipo-card finiquito" onclick="selDocTipo('finiquito',this)"><span class="doc-tipo-ico">🤝</span><div class="doc-tipo-name">Finiquito</div><div class="doc-tipo-desc">Término de contrato laboral</div></div>
      <div class="doc-tipo-card amonestacion" onclick="selDocTipo('amonestacion',this)"><span class="doc-tipo-ico">⚠️</span><div class="doc-tipo-name">Carta Amonestación</div><div class="doc-tipo-desc">Amonestación verbal o escrita</div></div>
      <div class="doc-tipo-card certificado" onclick="selDocTipo('certificado',this)"><span class="doc-tipo-ico">🏆</span><div class="doc-tipo-name">Certificado de Trabajo</div><div class="doc-tipo-desc">Acredita relación laboral</div></div>
      <div class="doc-tipo-card liquidacion" onclick="selDocTipo('liquidacion',this)"><span class="doc-tipo-ico">💵</span><div class="doc-tipo-name">Liquidación de Sueldo</div><div class="doc-tipo-desc">Detalle mensual de remuneración</div></div>
    </div>
    <div class="doc-gen-wrap">
      <div class="card">
        <div class="card-h"><span class="card-t" id="doc-form-title">📄 Datos del Contrato</span></div>
        <div class="card-b">
          <div class="fg-grp" style="margin-bottom:16px">
            <label class="fg-lbl">Empleado *</label>
            <select class="fi" id="doc-empleado" onchange="updateDocPreview()"><option value="">— Selecciona empresa primero —</option></select>
          </div>
          <div id="doc-campos"></div>
          <div style="display:flex;gap:10px;margin-top:20px;padding-top:16px;border-top:1px solid var(--borde)">
            <button class="btn btn-p" style="flex:1" onclick="generarDocPDF()">📄 Generar PDF</button>
            <button class="btn btn-o" onclick="updateDocPreview()">👁 Vista previa</button>
          </div>
        </div>
      </div>
      <div class="doc-preview-wrap">
        <div class="doc-preview-header">
          <span class="doc-preview-title">Vista previa</span>
          <button class="btn-sm" onclick="generarDocPDF()" style="color:#fff;border-color:rgba(255,255,255,.3);background:rgba(255,255,255,.1)">📄 PDF</button>
        </div>
        <div class="doc-preview-body"><div class="doc-sheet" id="doc-preview"></div></div>
      </div>
    </div>
  </div>


  
  <div class="panel" id="p-plantillas">

    
    <div class="doc-tabs">
      <button class="doc-tab active" onclick="showDocTab('tab-lista',this)">🗂 Mis Plantillas</button>
      <button class="doc-tab" onclick="showDocTab('tab-editor',this)">✏️ Editor de Plantilla</button>
      <button class="doc-tab" onclick="showDocTab('tab-word',this)">📤 Importar Word</button>
    </div>

    
    <div class="doc-subpanel active" id="tab-lista">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
        <div>
          <div style="font-family:'Cormorant Garamond',serif;font-size:18px;font-weight:600">Plantillas guardadas</div>
          <div style="font-size:12px;color:var(--gris-s);margin-top:2px">Selecciona una plantilla para usarla o editarla</div>
        </div>
        <button class="btn btn-p" onclick="showDocTab('tab-editor',document.querySelectorAll('.doc-tab')[1]);nuevaPlantilla()">+ Nueva Plantilla</button>
      </div>

      
      <div class="sb-row" style="margin-bottom:16px">
        <input class="si" id="plt-search" placeholder="🔍 Buscar plantilla..." oninput="renderPlantillas()">
        <select class="fi" style="width:180px" id="plt-filtro" onchange="renderPlantillas()">
          <option value="">Todos los tipos</option>
          <option value="contrato">Contrato</option>
          <option value="anexo">Anexo</option>
          <option value="finiquito">Finiquito</option>
          <option value="amonestacion">Amonestación</option>
          <option value="certificado">Certificado</option>
          <option value="liquidacion">Liquidación</option>
          <option value="custom">Personalizada</option>
        </select>
      </div>

      <div class="plantilla-list" id="plt-lista"></div>
    </div>

    
    <div class="doc-subpanel" id="tab-editor">
      <div class="two-col" style="align-items:start">
        
        <div>
          <div class="card">
            <div class="card-h">
              <span class="card-t" id="editor-title">✏️ Nueva Plantilla</span>
              <div style="display:flex;gap:8px">
                <button class="btn btn-v" onclick="guardarPlantilla()">💾 Guardar</button>
                <button class="btn btn-o" onclick="showDocTab('tab-lista',document.querySelectorAll('.doc-tab')[0])">← Volver</button>
              </div>
            </div>
            <div class="card-b">
              
              <div class="fg" style="margin-bottom:16px">
                <div class="fg-grp"><label class="fg-lbl">Nombre de la Plantilla *</label><input class="fi" id="plt-nombre" placeholder="Ej: Contrato Indefinido 2026"></div>
                <div class="fg-grp"><label class="fg-lbl">Tipo de Documento</label>
                  <select class="fi" id="plt-tipo">
                    <option value="contrato">Contrato</option><option value="anexo">Anexo</option>
                    <option value="finiquito">Finiquito</option><option value="amonestacion">Amonestación</option>
                    <option value="certificado">Certificado</option><option value="liquidacion">Liquidación</option>
                    <option value="custom">Personalizada</option>
                  </select></div>
              </div>
              
              <div class="editor-toolbar">
                <button class="editor-btn" onclick="formatText('bold')" title="Negrita"><b>B</b></button>
                <button class="editor-btn" onclick="formatText('italic')" title="Cursiva"><i>I</i></button>
                <button class="editor-btn" onclick="formatText('underline')" title="Subrayado"><u>U</u></button>
                <span style="width:1px;background:var(--borde);margin:0 4px"></span>
                <button class="editor-btn" onclick="insertVar('{{nombre_empleado}}')" class="var-btn">{{nombre}}</button>
                <button class="editor-btn" onclick="insertVar('{{rut_empleado}}')" class="var-btn">{{rut}}</button>
                <button class="editor-btn" onclick="insertVar('{{cargo}}')" class="var-btn">{{cargo}}</button>
                <button class="editor-btn" onclick="insertVar('{{sueldo}}')" class="var-btn">{{sueldo}}</button>
                <button class="editor-btn" onclick="insertVar('{{empresa}}')" class="var-btn">{{empresa}}</button>
                <button class="editor-btn" onclick="insertVar('{{fecha_hoy}}')" class="var-btn">{{fecha}}</button>
                <span style="width:1px;background:var(--borde);margin:0 4px"></span>
                <button class="editor-btn" onclick="insertSeccion()">+ Sección</button>
                <button class="editor-btn" onclick="insertFirmas()">✍️ Firmas</button>
              </div>
              <div class="editor-area" id="plt-editor" contenteditable="true"
                   oninput="updateEditorPreview()"
                   placeholder="Escribe el contenido de tu plantilla aquí...
                   
Usa las variables de arriba para insertar datos del empleado automáticamente.
Ejemplo: El trabajador {{nombre_empleado}}, RUT {{rut_empleado}}..."></div>
              
              <div style="margin-top:14px">
                <div style="font-size:10px;letter-spacing:1px;text-transform:uppercase;color:var(--gris-s);font-weight:600;margin-bottom:8px">Variables disponibles (clic para insertar)</div>
                <div class="vars-grid">
                  <div class="var-chip" onclick="insertVar('{{nombre_empleado}}')"><span class="var-chip-code">{{nombre_empleado}}</span><span class="var-chip-desc">Nombre completo</span></div>
                  <div class="var-chip" onclick="insertVar('{{rut_empleado}}')"><span class="var-chip-code">{{rut_empleado}}</span><span class="var-chip-desc">RUT trabajador</span></div>
                  <div class="var-chip" onclick="insertVar('{{cargo}}')"><span class="var-chip-code">{{cargo}}</span><span class="var-chip-desc">Puesto / cargo</span></div>
                  <div class="var-chip" onclick="insertVar('{{departamento}}')"><span class="var-chip-code">{{departamento}}</span><span class="var-chip-desc">Departamento</span></div>
                  <div class="var-chip" onclick="insertVar('{{sueldo}}')"><span class="var-chip-code">{{sueldo}}</span><span class="var-chip-desc">Sueldo bruto</span></div>
                  <div class="var-chip" onclick="insertVar('{{fecha_ingreso}}')"><span class="var-chip-code">{{fecha_ingreso}}</span><span class="var-chip-desc">Fecha de ingreso</span></div>
                  <div class="var-chip" onclick="insertVar('{{empresa}}')"><span class="var-chip-code">{{empresa}}</span><span class="var-chip-desc">Nombre empresa</span></div>
                  <div class="var-chip" onclick="insertVar('{{rut_empresa}}')"><span class="var-chip-code">{{rut_empresa}}</span><span class="var-chip-desc">RUT empresa</span></div>
                  <div class="var-chip" onclick="insertVar('{{contacto_empresa}}')"><span class="var-chip-code">{{contacto_empresa}}</span><span class="var-chip-desc">Representante</span></div>
                  <div class="var-chip" onclick="insertVar('{{fecha_hoy}}')"><span class="var-chip-code">{{fecha_hoy}}</span><span class="var-chip-desc">Fecha actual</span></div>
                  <div class="var-chip" onclick="insertVar('{{tipo_contrato}}')"><span class="var-chip-code">{{tipo_contrato}}</span><span class="var-chip-desc">Tipo contrato</span></div>
                  <div class="var-chip" onclick="insertVar('{{direccion_empleado}}')"><span class="var-chip-code">{{direccion_empleado}}</span><span class="var-chip-desc">Dirección</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        
        <div class="doc-preview-wrap" style="position:sticky;top:24px">
          <div class="doc-preview-header">
            <span class="doc-preview-title">Vista Previa con Datos de Ejemplo</span>
            <button class="btn-sm" onclick="exportarPlantillaPDF()" style="color:#fff;border-color:rgba(255,255,255,.3);background:rgba(255,255,255,.1)">📄 PDF</button>
          </div>
          <div class="doc-preview-body"><div class="doc-sheet" id="plt-preview"></div></div>
        </div>
      </div>
    </div>

    
    <div class="doc-subpanel" id="tab-word">
      <div class="two-col" style="align-items:start">
        <div>
          <div class="card">
            <div class="card-h"><span class="card-t">📤 Importar desde Word</span></div>
            <div class="card-b">
              <p style="font-size:13px;color:var(--gris-m);margin-bottom:16px;line-height:1.7">
                Sube tu documento Word (.docx) con el formato que ya tienes. El sistema leerá el contenido y lo convertirá en una plantilla editable. Luego podrás insertar variables donde quieras que aparezcan los datos del empleado.
              </p>

              <div class="upload-zone" id="word-dropzone">
                <input type="file" accept=".docx,.doc" onchange="procesarWord(this.files[0])">
                <span class="upload-ico">📄</span>
                <div class="upload-title">Arrastra tu archivo Word aquí</div>
                <div class="upload-sub">o haz clic para seleccionar · Formatos: .docx</div>
              </div>

              <div class="upload-result" id="word-result">
                <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px">
                  <span style="font-size:24px">✅</span>
                  <div>
                    <div style="font-weight:600;font-size:13px" id="word-filename">documento.docx</div>
                    <div style="font-size:11px;color:var(--gris-s)" id="word-info">Contenido extraído correctamente</div>
                  </div>
                </div>
                <div class="fg" style="margin-bottom:14px">
                  <div class="fg-grp"><label class="fg-lbl">Nombre de la Plantilla</label><input class="fi" id="word-plt-nombre" placeholder="Nombre para guardar esta plantilla"></div>
                  <div class="fg-grp"><label class="fg-lbl">Tipo de Documento</label>
                    <select class="fi" id="word-plt-tipo">
                      <option value="contrato">Contrato</option><option value="anexo">Anexo</option>
                      <option value="finiquito">Finiquito</option><option value="amonestacion">Amonestación</option>
                      <option value="certificado">Certificado</option><option value="liquidacion">Liquidación</option>
                      <option value="custom">Personalizada</option>
                    </select></div>
                </div>
                <p style="font-size:12px;color:var(--gris-s);margin-bottom:12px">
                  Revisa el contenido extraído y luego guarda como plantilla. Podrás editarla para agregar las variables automáticas.
                </p>
                <div style="display:flex;gap:10px">
                  <button class="btn btn-p" onclick="guardarDesdeWord()">💾 Guardar como Plantilla</button>
                  <button class="btn btn-o" onclick="editarDesdeWord()">✏️ Editar antes de Guardar</button>
                </div>
              </div>

              
              <div id="word-extracted-wrap" style="display:none;margin-top:16px">
                <div style="font-size:10px;letter-spacing:1px;text-transform:uppercase;color:var(--gris-s);font-weight:600;margin-bottom:8px">Contenido extraído (editable)</div>
                <div class="editor-area" id="word-extracted" contenteditable="true" style="min-height:200px"></div>
              </div>
            </div>
          </div>

          
          <div class="card">
            <div class="card-h"><span class="card-t">💡 Consejos para mejores resultados</span></div>
            <div class="card-b">
              <div style="display:flex;flex-direction:column;gap:10px;font-size:13px;color:var(--gris-m)">
                <div style="display:flex;gap:10px;align-items:flex-start"><span style="font-size:16px">📝</span><div>En tu Word, usa textos como <code style="background:var(--fondo);padding:1px 6px;border-radius:4px;font-size:11px">[NOMBRE]</code> o <code style="background:var(--fondo);padding:1px 6px;border-radius:4px;font-size:11px">[SUELDO]</code> donde quieras que aparezcan los datos. Después de importar los reemplazas por variables del sistema.</div></div>
                <div style="display:flex;gap:10px;align-items:flex-start"><span style="font-size:16px">🎨</span><div>El formato básico (negritas, párrafos, saltos de línea) se conserva al importar.</div></div>
                <div style="display:flex;gap:10px;align-items:flex-start"><span style="font-size:16px">💾</span><div>Después de importar, ve al Editor para agregar las variables automáticas y personalizar.</div></div>
                <div style="display:flex;gap:10px;align-items:flex-start"><span style="font-size:16px">📦</span><div>Puedes tener múltiples versiones del mismo tipo de documento (ej: contrato empresa A, contrato empresa B).</div></div>
              </div>
            </div>
          </div>
        </div>

        
        <div class="doc-preview-wrap" style="position:sticky;top:24px">
          <div class="doc-preview-header">
            <span class="doc-preview-title">Vista previa del documento</span>
          </div>
          <div class="doc-preview-body"><div class="doc-sheet" id="word-preview">
            <div style="text-align:center;padding:40px;color:#aaa;font-size:12px">
              <div style="font-size:40px;margin-bottom:12px">📤</div>
              Sube un archivo Word<br>para ver su contenido aquí
            </div>
          </div></div>
        </div>
      </div>
    </div>

  </div>

  </div>
</main>


<div id="overlay" style="display:none" class="overlay" onclick="if(event.target===this)cerrarModal()">
  <div class="modal">
    <div class="m-head"><span class="m-title" id="m-title">Registro</span><button class="m-x" onclick="cerrarModal()">✕</button></div>
    <div class="m-body" id="m-body"></div>
    <div class="m-foot"><button class="btn btn-o" onclick="cerrarModal()">Cancelar</button><button class="btn btn-p" id="m-save">Guardar</button></div>
  </div>
</div>
</div>
`

export default function AdminPortal({ user, onLogout }) {
  const ref = useRef(null)
  useEffect(() => {
    if (!ref.current) return
    window._PORTAL_USER = user
    window._PORTAL_ROL = user.rol
    window.__appLogout = onLogout
    ref.current.innerHTML = ADMIN_HTML
    initAdmin()
  }, [])
  return <div ref={ref} style={{minHeight:'100vh'}} />
}
