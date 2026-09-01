import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// jsPDF's built-in Helvetica does not include the Unicode Rupee glyph (U+20B9).
// We use the standard ASCII "Rs." prefix which renders cleanly on all platforms.
const INR = (amount: number) =>
  `Rs. ${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

/**
 * Generates and downloads a PDF payslip for a single employee.
 */
export const generatePayslipPdf = (employeeData: any, periodName: string, download = true): jsPDF => {
  const doc = new jsPDF();
  drawPayslip(doc, employeeData, periodName);

  if (download) {
    doc.save(`Stackly_Payslip_${employeeData.EmployeeID}_${periodName.replace(/\s+/g, '_')}.pdf`);
  }
  return doc;
};

/**
 * Generates and downloads a single combined PDF containing all employee payslips for the period.
 */
export const generateAllPayslipsPdf = (employeesData: any[], periodName: string): void => {
  const doc = new jsPDF();

  employeesData.forEach((emp, index) => {
    if (index > 0) {
      doc.addPage();
    }
    drawPayslip(doc, emp, periodName);
  });

  doc.save(`Stackly_Bulk_Payslips_${periodName.replace(/\s+/g, '_')}.pdf`);
};

function drawPayslip(doc: jsPDF, data: any, periodName: string) {
  // --- HEADER ---
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(37, 99, 235);
  doc.setFontSize(28);
  doc.text('STACKLY', 14, 25);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text('Workforce Intelligence Platform', 14, 31);
  doc.text('123 Tech Avenue, Innovation Park, Bengaluru, KA 560001, India', 14, 37);
  doc.text('hr@stackly.io  |  www.stackly.io  |  +91 80 4567 8900', 14, 42);

  // Right: PAYSLIP title
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 30, 30);
  doc.setFontSize(22);
  doc.text('PAYSLIP', 196, 22, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text('Pay Period:', 196, 30, { align: 'right' });
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 30, 30);
  doc.text(periodName, 196, 36, { align: 'right' });

  // Separator
  doc.setDrawColor(220, 220, 220);
  doc.setLineWidth(0.5);
  doc.line(14, 48, 196, 48);

  // --- EMPLOYEE DETAILS ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(37, 99, 235);
  doc.text('EMPLOYEE DETAILS', 14, 58);

  autoTable(doc, {
    startY: 62,
    theme: 'plain',
    styles: { fontSize: 9.5, cellPadding: 2.5, textColor: [40, 40, 40] },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 45, textColor: [80, 80, 80] },
      1: { cellWidth: 55 },
      2: { fontStyle: 'bold', cellWidth: 45, textColor: [80, 80, 80] },
      3: { cellWidth: 50 },
    },
    body: [
      ['Employee Name',  data.Name         || '-', 'Employee ID',   data.EmployeeID  || '-'],
      ['Designation',   data.Designation   || '-', 'Status',        data.Status      || '-'],
      ['Payable Days',  String(data.PayableDays  ?? 0), 'Regular Hours', String(data.RegularHours  ?? 0)],
      ['Overtime Hours', String(data.OvertimeHours ?? 0), '', ''],
    ],
  });

  // --- SALARY BREAKDOWN ---
  const afterDetails = (doc as any).lastAutoTable.finalY + 12;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(37, 99, 235);
  doc.text('SALARY BREAKDOWN', 14, afterDetails);

  const baseSalary    = Number(data.BaseSalary    ?? 0);
  const overtimePay   = Number(data.OvertimePay   ?? 0);
  const shiftAllow    = Number(data.ShiftAllowance ?? 0);
  const deductions    = Number(data.Deductions    ?? 0);
  const netSalary     = Number(data.NetSalary     ?? 0);
  const totalEarnings = baseSalary + overtimePay + shiftAllow;

  autoTable(doc, {
    startY: afterDetails + 4,
    theme: 'striped',
    headStyles: { fillColor: [37, 99, 235], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 10 },
    bodyStyles: { fontSize: 9.5, textColor: [40, 40, 40] },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 100 },
      1: { halign: 'right' },
    },
    head: [['Description', 'Amount (INR)']],
    body: [
      ['Base Salary',    INR(baseSalary)],
      ['Overtime Pay',   INR(overtimePay)],
      ['Shift Allowance', INR(shiftAllow)],
      ['Total Earnings', INR(totalEarnings)],
      ['Deductions',     `- ${INR(deductions)}`],
    ],
  });

  // --- NET PAY BOX ---
  const afterTable = (doc as any).lastAutoTable.finalY + 10;

  doc.setFillColor(239, 246, 255);
  doc.setDrawColor(147, 197, 253);
  doc.setLineWidth(0.8);
  doc.roundedRect(110, afterTable, 86, 22, 3, 3, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(30, 58, 138);
  doc.text('NET PAY', 116, afterTable + 14);

  doc.setFontSize(13);
  doc.text(INR(netSalary), 192, afterTable + 14, { align: 'right' });

  // --- FOOTER ---
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8);
  doc.setTextColor(160, 160, 160);
  doc.text('This is a computer-generated payslip and does not require a signature.', 105, 277, { align: 'center' });
  doc.text('Confidential — Stackly Workforce Intelligence Platform © 2025', 105, 282, { align: 'center' });
}
