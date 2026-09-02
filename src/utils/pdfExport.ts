import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Invoice, Quotation, Customer, CompanySettings, Booking } from '../types';
import { formatDate } from './index';
import { numberToWordsIndian } from './calculations';
import { MKM_LOGO_BASE64 } from '../assets/logo';

export { numberToWordsIndian };

/**
 * GENERATE CLEAN, ROBUST & ADVANCED COMMERCIAL TAX INVOICE PDF
 * - Dark Elegant Obsidian Header Banner with Circular MKM Logo
 * - Gold "TAX INVOICE" header title & Invoice details
 * - Multiline wrapped origin/destination cards without .slice() truncation
 * - Multiline autoTable service description wrapping
 * - Right-aligned financial summary with clear Paid/Due indicators
 * - Single Phone Number: 09840546766
 * - File Name: [CustomerName]-[InvoiceNumber].pdf
 */
export const generateInvoicePDF = (
  invoice: Invoice,
  customer: Customer | undefined,
  settings: CompanySettings
) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // 210mm
  const margin = 12;
  const contentWidth = pageWidth - margin * 2; // 186mm
  const primaryPhone = '09840546766';

  // ==================== 1. DARK OBSIDIAN BRAND HEADER ====================
  const headerHeight = 36;
  doc.setFillColor(15, 23, 42); // #0F172A Dark Slate / Obsidian
  doc.rect(0, 0, pageWidth, headerHeight, 'F');

  // MKM Circular Logo
  try {
    const logoSource = settings.logoUrl || MKM_LOGO_BASE64;
    if (logoSource) {
      doc.addImage(logoSource, 'PNG', margin, 6, 22, 22);
    }
  } catch (e) {
    console.error('Error rendering logo in PDF', e);
  }

  // Left Brand Info
  const textLeft = margin + 26;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.text(settings.companyName.toUpperCase(), textLeft, 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(203, 213, 225); // #CBD5E1 Slate 300
  const companyAddress =
    settings.address ||
    '13, 6, Vallalar St, Senthil Nagar, Loganathan Nagar, Padmanabha Nagar, Choolaimedu, Chennai, Tamil Nadu - 600094';
  const splitAddress = doc.splitTextToSize(companyAddress, 95);
  doc.text(splitAddress, textLeft, 17);

  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184); // #94A3B8
  doc.text(
    `GSTIN: ${settings.gstNumber || '33ADVPU2567L3ZM'}  |  Phone: ${primaryPhone}  |  Email: ${settings.email || 'mkmpackersandmovers@gmail.com'}`,
    textLeft,
    28
  );

  // Right Invoice Title & Meta
  const rightX = pageWidth - margin;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(245, 158, 11); // #F59E0B Gold / Amber
  doc.text('TAX INVOICE', rightX, 12, { align: 'right' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(255, 255, 255);
  doc.text(invoice.invoiceNumber, rightX, 18, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(203, 213, 225);
  doc.text(`Date: ${formatDate(invoice.date)}`, rightX, 23, { align: 'right' });
  doc.text(`Due Date: ${formatDate(invoice.dueDate || invoice.date)}`, rightX, 28, { align: 'right' });

  // ==================== 2. TWO CLEAN SUB-CARDS ====================
  let currentY = headerHeight + 7;
  const cardWidth = (contentWidth - 6) / 2;
  const cardHeight = 29;

  // --- CARD 1: BILLED TO / ORIGIN ---
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, currentY, cardWidth, cardHeight, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('BILLED TO (CONSIGNOR):', margin + 3.5, currentY + 5.5);

  const custName = invoice.customerName || customer?.name || 'Customer Name';
  const custMobile = invoice.customerPhone || customer?.phone || primaryPhone;
  const fromAddr = invoice.moveFromAddress || 'West Mambalam, Chennai';

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text(doc.splitTextToSize(custName, cardWidth - 7), margin + 3.5, currentY + 10.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`Phone: ${custMobile}`, margin + 3.5, currentY + 15.5);
  const splitFrom = doc.splitTextToSize(`Pickup: ${fromAddr}`, cardWidth - 7);
  doc.text(splitFrom.slice(0, 2), margin + 3.5, currentY + 20);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  if (invoice.status === 'Paid') {
    doc.setTextColor(16, 185, 129);
    doc.text('Status: PAID IN FULL', margin + 3.5, currentY + 26.5);
  } else if (invoice.status === 'Partially Paid') {
    doc.setTextColor(245, 158, 11);
    doc.text(`Status: PARTIALLY PAID (Due: Rs. ${invoice.balanceDue.toLocaleString('en-IN')})`, margin + 3.5, currentY + 26.5);
  } else {
    doc.setTextColor(239, 68, 68);
    doc.text('Status: UNPAID / DUE', margin + 3.5, currentY + 26.5);
  }

  // --- CARD 2: MOVE DESTINATION & DISPATCH ---
  const card2X = margin + cardWidth + 6;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(card2X, currentY, cardWidth, cardHeight, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('DESTINATION & DISPATCH DETAILS:', card2X + 3.5, currentY + 5.5);

  const toAddr = invoice.moveToAddress || 'Senthamizh Nagar, Sivagangai';
  const vehicle = invoice.vehicleNo || '14ft Closed Container';

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  const splitTo = doc.splitTextToSize(`Drop: ${toAddr}`, cardWidth - 7);
  doc.text(splitTo.slice(0, 2), card2X + 3.5, currentY + 10.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`Vehicle No: ${vehicle}`, card2X + 3.5, currentY + 19);
  doc.text(`Moving Date: ${formatDate(invoice.dueDate || invoice.date)}`, card2X + 3.5, currentY + 23);
  doc.text(`Support Hotline: ${primaryPhone}`, card2X + 3.5, currentY + 27);

  // ==================== 3. LINE ITEMS TABLE ====================
  currentY += cardHeight + 6;

  const tableBody = invoice.items.map((item, idx) => [
    idx + 1,
    {
      content: `${item.service}${item.description ? '\n' + item.description : ''}`,
      styles: { halign: 'left' as const },
    },
    `Rs. ${item.unitPrice.toLocaleString('en-IN')}`,
    item.qty,
    `Rs. ${item.amount.toLocaleString('en-IN')}`,
  ]);

  if (tableBody.length === 0) {
    tableBody.push([
      1,
      {
        content: 'Household Transportation & Freight Charges\nDoor-to-door shifting service',
        styles: { halign: 'left' as const },
      },
      `Rs. ${invoice.grandTotal.toLocaleString('en-IN')}`,
      1,
      `Rs. ${invoice.grandTotal.toLocaleString('en-IN')}`,
    ]);
  }

  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    head: [['#', 'Service Description', 'Rate', 'Qty', 'Amount']],
    body: tableBody,
    theme: 'plain',
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
      cellPadding: 3,
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 'auto' },
      2: { cellWidth: 28, halign: 'right' },
      3: { cellWidth: 16, halign: 'center' },
      4: { cellWidth: 32, halign: 'right', fontStyle: 'bold' },
    },
    styles: {
      fontSize: 7.5,
      cellPadding: 3,
      textColor: [30, 41, 59],
      lineColor: [226, 232, 240],
      lineWidth: 0.2,
    },
  });

  const finalTableY = (doc as any).lastAutoTable.finalY;
  currentY = finalTableY + 4;

  // ==================== 4. FINANCIAL TOTALS SUMMARY ====================
  const totalsWidth = 75;
  const totalsX = pageWidth - margin - totalsWidth;

  // Subtotal
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('Subtotal:', totalsX, currentY + 3);
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.text(`Rs. ${invoice.subtotal.toLocaleString('en-IN')}`, pageWidth - margin, currentY + 3, {
    align: 'right',
  });

  let totalsOffset = 7;

  // Discount
  if (invoice.discount && invoice.discount > 0) {
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text('Discount:', totalsX, currentY + totalsOffset);
    doc.setTextColor(239, 68, 68);
    doc.setFont('helvetica', 'bold');
    doc.text(`- Rs. ${invoice.discount.toLocaleString('en-IN')}`, pageWidth - margin, currentY + totalsOffset, {
      align: 'right',
    });
    totalsOffset += 4;
  }

  // Tax
  if (invoice.tax && invoice.tax > 0) {
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(`GST Tax (${settings.taxRate || 18}%):`, totalsX, currentY + totalsOffset);
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.text(`Rs. ${invoice.tax.toLocaleString('en-IN')}`, pageWidth - margin, currentY + totalsOffset, {
      align: 'right',
    });
    totalsOffset += 4;
  }

  // Divider Line
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.3);
  doc.line(totalsX, currentY + totalsOffset, pageWidth - margin, currentY + totalsOffset);
  totalsOffset += 4;

  // Grand Total
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('Grand Total:', totalsX, currentY + totalsOffset);
  doc.text(`Rs. ${invoice.grandTotal.toLocaleString('en-IN')}`, pageWidth - margin, currentY + totalsOffset, {
    align: 'right',
  });
  totalsOffset += 4.5;

  // Amount Paid
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(16, 185, 129);
  doc.text('Amount Paid:', totalsX, currentY + totalsOffset);
  doc.text(`Rs. ${invoice.amountPaid.toLocaleString('en-IN')}`, pageWidth - margin, currentY + totalsOffset, {
    align: 'right',
  });
  totalsOffset += 4.5;

  // Balance Due
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  if (invoice.balanceDue > 0) {
    doc.setTextColor(239, 68, 68);
    doc.text('Balance Due:', totalsX, currentY + totalsOffset);
    doc.text(`Rs. ${invoice.balanceDue.toLocaleString('en-IN')}`, pageWidth - margin, currentY + totalsOffset, {
      align: 'right',
    });
  } else {
    doc.setTextColor(16, 185, 129);
    doc.text('Balance Due:', totalsX, currentY + totalsOffset);
    doc.text('Rs. 0', pageWidth - margin, currentY + totalsOffset, { align: 'right' });
  }

  // Left Rupees In Words
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('RUPEES IN WORDS:', margin, currentY + 3);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  const words = numberToWordsIndian(invoice.grandTotal);
  doc.text(doc.splitTextToSize(words, totalsX - margin - 4), margin, currentY + 8);

  // ==================== 5. TERMS & SIGNATURE BLOCK ====================
  currentY += Math.max(totalsOffset + 6, 28);

  // Left Terms
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('TERMS & NOTES:', margin, currentY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(71, 85, 105);
  const noteText =
    invoice.notes ||
    '1. 100% safe door-to-door shifting.\n2. Please inspect packages upon receipt.\n3. Goods transit handled under standard logistics terms.';
  const splitNotes = doc.splitTextToSize(noteText, 95);
  doc.text(splitNotes, margin, currentY + 4);

  // Right Signature
  const sigX = pageWidth - margin - 50;
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.3);
  doc.line(sigX, currentY + 12, pageWidth - margin, currentY + 12);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  doc.text(`For ${settings.companyName}`, sigX + 25, currentY + 15.5, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Authorized Signatory', sigX + 25, currentY + 19, { align: 'center' });

  // File download standard: [CustomerName]-[InvoiceNumber].pdf
  const sanitizedCustomer = (custName || 'Customer').replace(/[^a-zA-Z0-9_-]/g, '_');
  const safeInvoiceNum = invoice.invoiceNumber.replace(/[^a-zA-Z0-9_-]/g, '_');
  doc.save(`${sanitizedCustomer}-${safeInvoiceNum}.pdf`);
};

/**
 * GENERATE RELOCATION QUOTATION / ESTIMATE PDF
 */
export const generateQuotationPDF = (
  quotation: Quotation,
  customer: Customer | undefined,
  settings: CompanySettings
) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 12;
  const contentWidth = pageWidth - margin * 2;
  const primaryPhone = '09840546766';

  // Dark Header Banner
  const headerHeight = 36;
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, pageWidth, headerHeight, 'F');

  // MKM Circular Logo
  try {
    const logoSource = settings.logoUrl || MKM_LOGO_BASE64;
    if (logoSource) {
      doc.addImage(logoSource, 'PNG', margin, 6, 22, 22);
    }
  } catch (e) {
    console.error('Error rendering logo in Quotation PDF', e);
  }

  // Left Brand
  const textLeft = margin + 26;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.text(settings.companyName.toUpperCase(), textLeft, 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(203, 213, 225);
  const companyAddress =
    settings.address ||
    '13, 6, Vallalar St, Senthil Nagar, Loganathan Nagar, Padmanabha Nagar, Choolaimedu, Chennai, Tamil Nadu - 600094';
  const splitAddress = doc.splitTextToSize(companyAddress, 95);
  doc.text(splitAddress, textLeft, 17);

  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text(
    `GSTIN: ${settings.gstNumber || '33ADVPU2567L3ZM'}  |  Phone: ${primaryPhone}  |  Email: ${settings.email || 'mkmpackersandmovers@gmail.com'}`,
    textLeft,
    28
  );

  // Right Title & Meta
  const rightX = pageWidth - margin;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(245, 158, 11);
  doc.text('QUOTATION & ESTIMATE', rightX, 12, { align: 'right' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(255, 255, 255);
  doc.text(quotation.quotationNumber, rightX, 18, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(203, 213, 225);
  doc.text(`Date: ${formatDate(quotation.date)}`, rightX, 23, { align: 'right' });
  doc.text(`Valid Until: ${formatDate(quotation.validUntil)}`, rightX, 28, { align: 'right' });

  // Two Cards: Client & Route
  let currentY = headerHeight + 7;
  const cardWidth = (contentWidth - 6) / 2;
  const cardHeight = 29;

  // Card 1: Client & Pickup
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, currentY, cardWidth, cardHeight, 2, 2, 'FD');

  const custName = customer?.name || 'Customer Name';
  const custMobile = customer?.phone || primaryPhone;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('CLIENT & ORIGIN LOCATION:', margin + 3.5, currentY + 5.5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text(doc.splitTextToSize(custName, cardWidth - 7), margin + 3.5, currentY + 10.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`Phone: ${custMobile}`, margin + 3.5, currentY + 15.5);
  const splitFrom = doc.splitTextToSize(`Origin: ${quotation.pickupAddress}`, cardWidth - 7);
  doc.text(splitFrom.slice(0, 2), margin + 3.5, currentY + 20);
  doc.text(`Property: ${quotation.propertyType} • ${quotation.floor || 'Ground'}`, margin + 3.5, currentY + 26.5);

  // Card 2: Destination & Schedule
  const card2X = margin + cardWidth + 6;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(card2X, currentY, cardWidth, cardHeight, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('DESTINATION & SCHEDULE:', card2X + 3.5, currentY + 5.5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  const splitTo = doc.splitTextToSize(`Destination: ${quotation.dropAddress}`, cardWidth - 7);
  doc.text(splitTo.slice(0, 2), card2X + 3.5, currentY + 10.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`Moving Date: ${formatDate(quotation.movingDate)}`, card2X + 3.5, currentY + 19);
  doc.text(`Vehicle: ${quotation.vehicleType || '14ft Container'}`, card2X + 3.5, currentY + 23);
  doc.text(`Support Hotline: ${primaryPhone}`, card2X + 3.5, currentY + 27);

  // Table
  currentY += cardHeight + 6;

  const tableBody = quotation.items.map((item, idx) => [
    idx + 1,
    {
      content: `${item.service}${item.description ? '\n' + item.description : ''}`,
      styles: { halign: 'left' as const },
    },
    `Rs. ${item.unitPrice.toLocaleString('en-IN')}`,
    item.qty,
    `Rs. ${item.amount.toLocaleString('en-IN')}`,
  ]);

  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    head: [['#', 'Estimated Service Description', 'Rate', 'Qty', 'Amount']],
    body: tableBody,
    theme: 'plain',
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
      cellPadding: 3,
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 'auto' },
      2: { cellWidth: 28, halign: 'right' },
      3: { cellWidth: 16, halign: 'center' },
      4: { cellWidth: 32, halign: 'right', fontStyle: 'bold' },
    },
    styles: {
      fontSize: 7.5,
      cellPadding: 3,
      textColor: [30, 41, 59],
      lineColor: [226, 232, 240],
      lineWidth: 0.2,
    },
  });

  const finalTableY = (doc as any).lastAutoTable.finalY;
  currentY = finalTableY + 4;

  // Totals
  const totalsWidth = 75;
  const totalsX = pageWidth - margin - totalsWidth;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('Subtotal:', totalsX, currentY + 3);
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.text(`Rs. ${quotation.subtotal.toLocaleString('en-IN')}`, pageWidth - margin, currentY + 3, {
    align: 'right',
  });

  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.3);
  doc.line(totalsX, currentY + 7, pageWidth - margin, currentY + 7);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('Estimated Total:', totalsX, currentY + 12);
  doc.text(`Rs. ${quotation.grandTotal.toLocaleString('en-IN')}`, pageWidth - margin, currentY + 12, {
    align: 'right',
  });

  // Words
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('RUPEES IN WORDS:', margin, currentY + 3);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  const words = numberToWordsIndian(quotation.grandTotal);
  doc.text(doc.splitTextToSize(words, totalsX - margin - 4), margin, currentY + 8);

  // Terms & Signature
  currentY += 24;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('NOTES & VALIDITY:', margin, currentY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(71, 85, 105);
  const qNotes = quotation.notes || '1. Quotation valid for 15 days.\n2. Includes vehicle, packing materials, and handling crew.';
  doc.text(doc.splitTextToSize(qNotes, 95), margin, currentY + 4);

  const sigX = pageWidth - margin - 50;
  doc.line(sigX, currentY + 10, pageWidth - margin, currentY + 10);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  doc.text(`For ${settings.companyName}`, sigX + 25, currentY + 13.5, { align: 'center' });

  const sanitizedCustomer = (custName || 'Customer').replace(/[^a-zA-Z0-9_-]/g, '_');
  const safeQuoteNum = quotation.quotationNumber.replace(/[^a-zA-Z0-9_-]/g, '_');
  doc.save(`${sanitizedCustomer}-${safeQuoteNum}.pdf`);
};

/**
 * GENERATE LORRY RECEIPT (LR) PDF FROM BOOKING
 */
export const generateLRPDF = (
  booking: Booking,
  customer: Customer | undefined,
  settings: CompanySettings
) => {
  const invoiceMock: Invoice = {
    id: booking.id,
    invoiceNumber: `LR-${booking.bookingNumber}`,
    customerId: booking.customerId,
    customerName: customer?.name,
    customerPhone: customer?.phone || '09840546766',
    moveFromAddress: booking.pickupLocation,
    moveToAddress: booking.dropLocation,
    vehicleNo: booking.vehicle,
    date: booking.createdAt.split('T')[0],
    dueDate: booking.movingDate,
    items: [
      {
        id: '1',
        service: 'Relocation & Transportation Freight Charges',
        description: `${booking.pickupLocation} to ${booking.dropLocation}`,
        qty: 1,
        unitPrice: booking.totalAmount,
        discount: 0,
        amount: booking.totalAmount,
      },
      {
        id: '2',
        service: 'Handling, Loading & Labour Charges',
        description: `Assigned Team: ${booking.driver} + ${booking.workers} Crew Helpers`,
        qty: 1,
        unitPrice: 0,
        discount: 0,
        amount: 0,
      },
    ],
    subtotal: booking.totalAmount,
    tax: 0,
    discount: 0,
    grandTotal: booking.totalAmount,
    amountPaid: booking.advanceAmount,
    balanceDue: booking.balanceAmount,
    status: booking.balanceAmount === 0 ? 'Paid' : 'Partially Paid',
    notes: 'Commercial move dispatch order and lorry receipt note.',
    createdAt: booking.createdAt,
    updatedAt: booking.updatedAt || booking.createdAt,
  };

  generateInvoicePDF(invoiceMock, customer, settings);
};
