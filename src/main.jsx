import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
// Make Chart.js, XLSX, jsPDF available globally for vanilla JS logic
import Chart from 'chart.js/auto'
import * as XLSX from 'xlsx'
import { jsPDF } from 'jspdf'
window.Chart = Chart
window.XLSX = XLSX
window.jspdf = { jsPDF }

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js')
    .then(() => console.log('[PWA] Service Worker registrado'))
    .catch(err => console.warn('[PWA] SW error:', err))
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />)
