import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { formatPrice } from './formatter.js';

export const exportReportPDF = (stats, title = 'Reporte de Ventas - La 33') => {
  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text(title, 14, 16);
  autoTable(doc, {
    startY: 22,
    head: [['Métrica', 'Valor']],
    body: [
      ['Ingresos Totales', formatPrice(stats.totalRevenue)],
      ['Total Pedidos', String(stats.totalOrders ?? '—')],
      ['Ticket Promedio', formatPrice(stats.avgTicket)],
      ['Total Reservaciones', String(stats.totalReservations ?? '—')],
    ],
  });
  doc.save('reporte-la33.pdf');
};

export const exportReportExcel = (stats) => {
  const ws = XLSX.utils.json_to_sheet([
    { Métrica: 'Ingresos Totales', Valor: stats.totalRevenue ?? 0 },
    { Métrica: 'Total Pedidos', Valor: stats.totalOrders ?? 0 },
    { Métrica: 'Ticket Promedio', Valor: stats.avgTicket ?? 0 },
    { Métrica: 'Total Reservaciones', Valor: stats.totalReservations ?? 0 },
  ]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Reporte');
  XLSX.writeFile(wb, 'reporte-la33.xlsx');
};
