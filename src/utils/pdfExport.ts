import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Invoice, Quotation, Customer, CompanySettings, Booking } from '../types';
import { numberToWordsIndian } from './calculations';
import { MKM_LOGO_BASE64 } from '../assets/logo';

export { numberToWordsIndian };

// Helper to format currency like "14,000/-"
export const formatRupeeDoc = (amount: number | string | undefined | null): string => {
  const num = Number(amount) || 0;
  return `${num.toLocaleString('en-IN')}/-`;
};

// Helper to format date like "20.12.2025" or "17-DEC-2025"
export const formatInvoiceDate = (dateStr?: string): string => {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}.${month}.${year}`;
  } catch {
    return dateStr || '';
  }
};

export const formatQuotationDate = (dateStr?: string): string => {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const day = String(d.getDate()).padStart(2, '0');
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    const month = months[d.getMonth()];
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  } catch {
    return dateStr || '';
  }
};

/**
 * GENERATE EXACT TAX INVOICE PDF MATCHING PHYSICAL PAPER FORMAT (IMAGE 1)
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
  const margin = 14;
  const contentWidth = pageWidth - margin * 2; // 182mm

  // Colors based on the printed template
  const primaryTeal = [43, 122, 155]; // #2B7A9B Brand Teal / Slate Blue
  const invoiceBlue = [91, 155, 213]; // #5B9BD5 Soft Sky Blue for "INVOICE" Title
  const lightRowBlue = [240, 246, 252]; // Light striped rows
  const highlightBlue = [197, 224, 245]; // Highlight strip for total

  // ==================== 1. HEADER SECTION ====================
  let currentY = 14;

  // Left: Circular MKM Logo with guaranteed base64 fallback
  try {
    const logoSource =
      settings.logoUrl && settings.logoUrl.startsWith('data:')
        ? settings.logoUrl
        : MKM_LOGO_BASE64;
    if (logoSource) {
      doc.addImage(logoSource, 'PNG', margin, currentY - 2, 16, 16);
    }
  } catch (e) {
    console.error('Error rendering logo in Invoice PDF', e);
  }

  // Right: INVOICE Title & Metadata Table Dimensions
  const rightTableWidth = 62;
  const rightTableX = pageWidth - margin - rightTableWidth;

  // Left: Brand Name & Address Block (Constrained to maxLeftWidth)
  const textLeft = margin + 19;
  const maxLeftWidth = rightTableX - textLeft - 5; // Guaranteed safety margin preventing any overlap with DATE/INVOICE #

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(primaryTeal[0], primaryTeal[1], primaryTeal[2]);
  const splitCompanyName = doc.splitTextToSize(
    (settings.companyName || 'MKM PACKERS AND MOVERS').toUpperCase(),
    maxLeftWidth
  );
  doc.text(splitCompanyName, textLeft, currentY + 3);

  let addrY = currentY + 3 + splitCompanyName.length * 4.4;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(30, 30, 30);
  const rawAddr =
    settings.address ||
    'NEW NO 13 OLD NO 6, VALLALAR STREET,\nPADMANABA NAGAR, CHOOLAIMEDU, CHENNAI 600 094.';
  const splitAddr = doc.splitTextToSize(rawAddr.toUpperCase(), maxLeftWidth);
  doc.text(splitAddr, textLeft, addrY);
  addrY += splitAddr.length * 3.2 + 0.8;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.2);
  doc.setTextColor(40, 40, 40);

  const phoneLines = doc.splitTextToSize(`Phone: ${settings.phone || '98405 46766, 93423 06048.'}`, maxLeftWidth);
  doc.text(phoneLines, textLeft, addrY);
  addrY += phoneLines.length * 3.2;

  const webLines = doc.splitTextToSize(`Website: ${settings.website || 'www.mkmpackersandmovers.com'}`, maxLeftWidth);
  doc.text(webLines, textLeft, addrY);
  addrY += webLines.length * 3.2;

  const mailLines = doc.splitTextToSize(`Mail: ${settings.email || 'mkmpackersandmovers@gmail.com'}`, maxLeftWidth);
  doc.text(mailLines, textLeft, addrY);
  addrY += mailLines.length * 3.2;

  // Right: INVOICE Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(invoiceBlue[0], invoiceBlue[1], invoiceBlue[2]);
  doc.text('INVOICE', pageWidth - margin, currentY + 3, { align: 'right' });

  // Right Meta Table (DATE, INVOICE #, GST, PO NO:)
  const metaStartY = currentY + 7;
  const rowHeight = 5.2;
  const metaLabelWidth = 24;

  const metaData = [
    { label: 'DATE', val: formatInvoiceDate(invoice.date) },
    { label: 'INVOICE #', val: invoice.invoiceNumber },
    { label: 'GST', val: invoice.gstType || invoice.customerGst || 'NILL' },
    { label: 'PO NO:', val: invoice.poNumber || '' },
  ];

  metaData.forEach((row, idx) => {
    const y = metaStartY + idx * rowHeight;
    // Row background
    if (idx % 2 === 1) {
      doc.setFillColor(lightRowBlue[0], lightRowBlue[1], lightRowBlue[2]);
    } else {
      doc.setFillColor(255, 255, 255);
    }
    doc.rect(rightTableX, y, rightTableWidth, rowHeight, 'F');
    doc.setDrawColor(200, 215, 230);
    doc.setLineWidth(0.2);
    doc.rect(rightTableX, y, rightTableWidth, rowHeight, 'D');

    // Divider between label and val
    doc.line(rightTableX + metaLabelWidth, y, rightTableX + metaLabelWidth, y + rowHeight);

    // Label
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(40, 40, 40);
    doc.text(row.label, rightTableX + 2, y + 3.8);

    // Value
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.text(row.val, rightTableX + metaLabelWidth + 3, y + 3.8);
  });

  // ==================== 2. BILL TO SECTION ====================
  const metaTableBottom = metaStartY + metaData.length * rowHeight;
  currentY = Math.max(addrY + 6, metaTableBottom + 6);

  // Solid Blue Bar "BILL TO"
  const billToBarWidth = 72;
  doc.setFillColor(primaryTeal[0], primaryTeal[1], primaryTeal[2]);
  doc.rect(margin, currentY, billToBarWidth, 5.5, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(255, 255, 255);
  doc.text('BILL TO', margin + 3, currentY + 4);

  currentY += 8.5;

  // Bill To Content (Customer email omitted)
  const billToText =
    invoice.billToDetails ||
    [
      invoice.customerName || customer?.name || 'The Executive Engineer',
      'AOBM',
      invoice.moveToAddress || customer?.address || 'Chennai Metropolitan Water Supply\nChennai 600028.',
    ].join('\n');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(20, 20, 20);

  const splitBillTo = doc.splitTextToSize(billToText, 100);
  doc.text(splitBillTo, margin + 10, currentY);

  currentY += splitBillTo.length * 4.5 + 4;

  // ==================== 3. MAIN PARTICULARS / DESCRIPTION TABLE ====================
  const tableStartY = currentY;

  // Build items array or single consolidated description
  const tableRows: any[] = [];
  if (invoice.items && invoice.items.length > 0) {
    invoice.items.forEach((item) => {
      const desc = `${item.service}${item.description ? '\n' + item.description : ''}`;
      tableRows.push([desc, '', formatRupeeDoc(item.amount)]);
    });
  } else {
    tableRows.push([
      "Transportation charges for Office Furniture's\nAmma Maaligai Chennai Central to CMWSSB Head Office Chintadripet\nThe rate inclusive of packing material, loading and un-loading charges",
      '',
      formatRupeeDoc(invoice.grandTotal || 14000),
    ]);
  }

  // Minimum visual rows to create the aesthetic ruled lines of the printed document
  while (tableRows.length < 5) {
    tableRows.push(['', '', '']);
  }

  autoTable(doc, {
    startY: tableStartY,
    margin: { left: margin, right: margin },
    head: [['DESCRIPTION', 'TAXED', 'AMOUNT']],
    body: tableRows,
    theme: 'grid',
    headStyles: {
      fillColor: [primaryTeal[0], primaryTeal[1], primaryTeal[2]],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5,
      halign: 'left',
      cellPadding: 2.5,
    },
    columnStyles: {
      0: { cellWidth: 120, halign: 'left' },
      1: { cellWidth: 20, halign: 'center' },
      2: { cellWidth: 42, halign: 'right' },
    },
    styles: {
      fontSize: 8,
      cellPadding: 3,
      textColor: [20, 20, 20],
      lineColor: [100, 150, 190],
      lineWidth: 0.3,
      minCellHeight: 8,
    },
    alternateRowStyles: {
      fillColor: [248, 251, 255],
    },
  });

  const finalTableY = (doc as any).lastAutoTable.finalY;
  currentY = finalTableY;

  // ==================== 4. TOTALS SUMMARY BLOCK ====================
  const summaryWidth = 82;
  const summaryX = pageWidth - margin - summaryWidth;
  const summaryRowHeight = 5.2;
  const labelColWidth = 40;

  const isGstApplicable = Boolean(invoice.tax && invoice.tax > 0);
  const centralTaxVal = isGstApplicable ? formatRupeeDoc(invoice.tax / 2) : 'Nill';
  const stateTaxVal = isGstApplicable ? formatRupeeDoc(invoice.tax / 2) : '';
  const otherVal = invoice.otherCharges ? formatRupeeDoc(invoice.otherCharges) : 'Nill';

  const summaryData = [
    { label: 'Subtotal', val: formatRupeeDoc(invoice.subtotal || invoice.grandTotal), isBold: true },
    { label: 'Taxable', val: '', isBold: false },
    { label: 'Central Tax 9%', val: centralTaxVal, isBold: false },
    { label: 'State Tax 9%', val: stateTaxVal, isBold: false },
    { label: 'Other', val: otherVal, isBold: false },
    { label: 'TOTAL', val: formatRupeeDoc(invoice.grandTotal), isBold: true, isTotal: true },
  ];

  summaryData.forEach((row, idx) => {
    const y = currentY + idx * summaryRowHeight;

    if (row.isTotal) {
      // Highlighted Total Bar
      doc.setFillColor(highlightBlue[0], highlightBlue[1], highlightBlue[2]);
      doc.rect(summaryX, y, summaryWidth, summaryRowHeight, 'F');
      doc.setDrawColor(primaryTeal[0], primaryTeal[1], primaryTeal[2]);
      doc.setLineWidth(0.4);
      doc.rect(summaryX, y, summaryWidth, summaryRowHeight, 'D');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(20, 20, 20);
      doc.text(row.label, summaryX + labelColWidth - 2, y + 3.8, { align: 'right' });
      doc.text(row.val, pageWidth - margin - 3, y + 3.8, { align: 'right' });
    } else {
      doc.setDrawColor(200, 215, 230);
      doc.setLineWidth(0.2);

      // Light border for values box
      doc.rect(summaryX + labelColWidth, y, summaryWidth - labelColWidth, summaryRowHeight, 'D');

      doc.setFont('helvetica', row.isBold ? 'bold' : 'normal');
      doc.setFontSize(8);
      doc.setTextColor(30, 30, 30);
      doc.text(row.label, summaryX + labelColWidth - 3, y + 3.8, { align: 'right' });

      if (row.val) {
        doc.text(row.val, summaryX + labelColWidth + 3, y + 3.8);
      }
    }
  });

  currentY += summaryData.length * summaryRowHeight + 14;

  // ==================== 5. SIGN-OFF BLOCK ====================
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(30, 30, 30);
  doc.text('For ', pageWidth - margin - 65, currentY);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryTeal[0], primaryTeal[1], primaryTeal[2]);
  doc.text((settings.companyName || 'MKM PACKERS AND MOVERS').toUpperCase(), pageWidth - margin - 57, currentY);

  // Save PDF
  const sanitizedCustomer = (invoice.customerName || customer?.name || 'Customer').replace(/[^a-zA-Z0-9_-]/g, '_');
  const safeInvoiceNum = invoice.invoiceNumber.replace(/[^a-zA-Z0-9_-]/g, '_');
  doc.save(`${sanitizedCustomer}-${safeInvoiceNum}.pdf`);
};

/**
 * GENERATE EXACT QUOTATION PDF MATCHING PHYSICAL PAPER FORMAT (IMAGE 2)
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

  const pageWidth = doc.internal.pageSize.getWidth(); // 210mm
  const margin = 16;
  const contentWidth = pageWidth - margin * 2; // 178mm

  let currentY = 16;

  // ==================== 1. HEADER SECTION ====================
  // Left: Circular Logo + Brand Name with guaranteed base64 fallback
  try {
    const logoSource =
      settings.logoUrl && settings.logoUrl.startsWith('data:')
        ? settings.logoUrl
        : MKM_LOGO_BASE64;
    if (logoSource) {
      doc.addImage(logoSource, 'PNG', margin, currentY - 2, 16, 16);
    }
  } catch (e) {
    console.error('Error rendering logo in Quotation PDF', e);
  }

  // Brand Name
  const brandX = margin + 18;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(200, 30, 30); // Red "MKM"
  doc.text('MKM', brandX, currentY + 4);

  doc.setTextColor(40, 40, 40); // Dark "PACKERS AND MOVERS"
  doc.text(' PACKERS AND MOVERS', brandX + 13, currentY + 4);

  // Right Address
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(50, 50, 50);
  const quoteAddress =
    settings.address ||
    'NO. 13/6, VALLALAR STREET, PADMANABA NAGAR,\nCHOOLAIMEDU, CHENNAI- 600 094.';
  const splitQuoteAddr = doc.splitTextToSize(quoteAddress, 75);
  doc.text(splitQuoteAddr, pageWidth - margin, currentY + 1, { align: 'right' });

  currentY += 18;

  // ==================== 2. RECIPIENT & DATE ====================
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(20, 20, 20);
  doc.text('To', margin, currentY);
  currentY += 4.5;

  const toText =
    quotation.toDetails ||
    [
      quotation.customerName || customer?.name || 'The Executive Engineer',
      'AOBM',
      quotation.dropAddress || customer?.address || 'Chennai Metropolitan Water Supply\nChennai 600028.',
    ].join('\n');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  const splitTo = doc.splitTextToSize(toText, 100);
  doc.text(splitTo, margin, currentY);

  // Right DATE
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(30, 30, 30);
  doc.text(`DATE: ${formatQuotationDate(quotation.date)}`, pageWidth - margin, currentY, { align: 'right' });

  currentY += Math.max(splitTo.length * 4.5 + 4, 16);

  // ==================== 3. UNDERLINED SUBJECT LINE ====================
  const subjectText =
    quotation.subject ||
    `Sub: Shifting of OFFICE FURNITURE'S FROM ${
      quotation.pickupAddress || 'AMMA MALIGAI CHENNAI CENTRAL'
    } TO ${quotation.dropAddress || 'CMWSSB HEAD OFFICE, CHINTADRIPET, Chennai.'}`;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(20, 20, 20);

  const splitSubject = doc.splitTextToSize(subjectText, contentWidth);
  doc.text(splitSubject, margin, currentY);

  // Underline Subject
  const subjHeight = splitSubject.length * 4.2;
  doc.setDrawColor(50, 50, 50);
  doc.setLineWidth(0.2);
  doc.line(margin, currentY + subjHeight - 2.5, margin + contentWidth, currentY + subjHeight - 2.5);

  currentY += subjHeight + 4;

  // ==================== 4. INTRODUCTORY BODY PARAGRAPH ====================
  const introText =
    quotation.introParagraph ||
    'Kindly refer to our discussion regarding the above subject. We are giving below here with our quotation and other terms and conditions. Hope you will find our quotation competitive and we assure for the best service. The scope of work would be packing and moving goods';

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(30, 30, 30);
  const splitIntro = doc.splitTextToSize(introText, contentWidth);
  doc.text(splitIntro, margin, currentY);

  currentY += splitIntro.length * 4.4 + 6;

  // ==================== 5. PARTICULARS TABLE ====================
  const quoteRows: any[] = [];
  if (quotation.items && quotation.items.length > 0) {
    quotation.items.forEach((it, idx) => {
      const partic = `${it.service.toUpperCase()}${it.description ? ', ' + it.description.toUpperCase() : ''}`;
      quoteRows.push([String(idx + 1), partic, formatRupeeDoc(it.amount || it.unitPrice)]);
    });
  } else {
    quoteRows.push([
      '1',
      'PACKING CHARGES, PACKING MATERIALS, TRANSPORT, LOADING CHARGES AND UNLOADING CHARGES.',
      formatRupeeDoc(quotation.grandTotal || 14000),
    ]);
  }

  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    head: [['s.\nno', 'PARTICULARS', 'RATE']],
    body: quoteRows,
    theme: 'grid',
    headStyles: {
      fillColor: [255, 255, 255],
      textColor: [20, 20, 20],
      fontStyle: 'normal',
      fontSize: 8.5,
      cellPadding: 2.5,
      lineColor: [40, 40, 40],
      lineWidth: 0.3,
    },
    columnStyles: {
      0: { cellWidth: 14, halign: 'center' },
      1: { cellWidth: 124, halign: 'left' },
      2: { cellWidth: 40, halign: 'center', fontStyle: 'bold' },
    },
    styles: {
      fontSize: 8,
      cellPadding: 3.5,
      textColor: [20, 20, 20],
      lineColor: [40, 40, 40],
      lineWidth: 0.3,
    },
  });

  const finalQuoteTableY = (doc as any).lastAutoTable.finalY;
  currentY = finalQuoteTableY + 8;

  // ==================== 6. TERMS & CONDITIONS ====================
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(20, 20, 20);
  doc.text('TERMS & CONDITIONS', margin, currentY);

  // Underline heading
  doc.setLineWidth(0.2);
  doc.line(margin, currentY + 1, margin + 42, currentY + 1);

  currentY += 5.5;

  const defaultTerms = [
    'Payment: 100% to be paid at the time of loading.',
    'This quote is valid for 14 days from this day',
    'Rate will be varied if packing material or load exceed at the time of packing and movement.',
    'Insurance 2% of declared value.',
    'Maximum load 1 tons to 1.5 tons only will be loaded',
  ];

  const termsToPrint = quotation.termsList && quotation.termsList.length > 0 ? quotation.termsList : defaultTerms;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(40, 40, 40);

  termsToPrint.forEach((term) => {
    doc.text('➤', margin + 4, currentY);
    const splitTerm = doc.splitTextToSize(term, contentWidth - 14);
    doc.text(splitTerm, margin + 10, currentY);
    currentY += splitTerm.length * 4.2 + 1;
  });

  currentY += 10;

  // ==================== 7. SIGN-OFF BLOCK ====================
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(20, 20, 20);
  doc.text('For MKM PACKERS AND MOVERS', margin, currentY);
  currentY += 12;
  doc.text('Authorized signature', margin, currentY);

  // ==================== 8. FOOTER ====================
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(30, 30, 30);
  const footerText = `EMAIL: ${settings.email || 'mkmpackersandmovers@gmail.com'}, CONACT: ${
    settings.phone || '9840546766, 9342306048.'
  }`;
  doc.text(footerText, pageWidth / 2, 282, { align: 'center' });

  // Save PDF
  const sanitizedCustomer = (quotation.customerName || customer?.name || 'Customer').replace(/[^a-zA-Z0-9_-]/g, '_');
  const safeQuoteNum = quotation.quotationNumber.replace(/[^a-zA-Z0-9_-]/g, '_');
  doc.save(`${sanitizedCustomer}-${safeQuoteNum}.pdf`);
};

/**
 * GENERATE LORRY RECEIPT (LR) PDF
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
    customerPhone: customer?.phone || '98405 46766',
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
    ],
    subtotal: booking.totalAmount,
    tax: 0,
    discount: 0,
    grandTotal: booking.totalAmount,
    amountPaid: booking.advanceAmount,
    balanceDue: booking.balanceAmount,
    status: 'Paid',
    notes: 'Commercial move dispatch order and lorry receipt note.',
    createdAt: booking.createdAt,
    updatedAt: booking.updatedAt || booking.createdAt,
  };

  generateInvoicePDF(invoiceMock, customer, settings);
};
