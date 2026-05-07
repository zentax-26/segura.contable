export const months = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']
export const monthly = months.map((m, i) => ({ month: m, ingresos: [1850000,2200000,1950000,2600000,3100000,2850000,0,0,0,0,0,0][i], gastos: [620000,710000,680000,920000,1100000,990000,0,0,0,0,0,0][i] }))
export const expenses = [
  { name:'Honorarios', value: 420000 },
  { name:'Software', value: 155000 },
  { name:'Oficina', value: 210000 },
  { name:'Marketing', value: 125000 }
]
export const invoices = [
  { cliente:'La Cocina Restobar', monto: 450000, vencimiento:'2026-05-15', estado:'Pendiente' },
  { cliente:'RicoFit75', monto: 320000, vencimiento:'2026-05-20', estado:'Pagada' },
  { cliente:'Servicios SpA', monto: 180000, vencimiento:'2026-05-28', estado:'Pendiente' }
]
export const activity = [
  'Factura registrada en contabilidad',
  'Nuevo cliente creado',
  'Reporte mensual actualizado',
  'Cotización generada'
]
