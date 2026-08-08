import { PDFDocument, rgb, StandardFonts, PageSizes } from "pdf-lib";
import { formatCurrency, formatDate } from "@/lib/utils";

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.substring(0, 2), 16) / 255;
  const g = parseInt(clean.substring(2, 4), 16) / 255;
  const b = parseInt(clean.substring(4, 6), 16) / 255;
  return [r, g, b];
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, "\n")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function wrapText(text: string, font: any, fontSize: number, maxWidth: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const width = font.widthOfTextAtSize(testLine, fontSize);
    if (width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines;
}

export async function generateContractPDF(contract: {
  title: string;
  contractNumber: string;
  content: string;
  value: number | string;
  currency: string;
  startDate?: Date | null;
  endDate?: Date | null;
  signedAt?: Date | null;
  signatureData?: string | null;
  signerIp?: string | null;
}, organization: {
  companyName: string;
  logo?: string | null;
  primaryColor?: string | null;
}, client: {
  companyName: string;
  contactName: string;
  email: string;
  address?: string | null;
}): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const primaryColor = hexToRgb(organization.primaryColor || "#6366f1");
  const pageWidth = PageSizes.A4[0];
  const pageHeight = PageSizes.A4[1];
  const margin = 60;
  const contentWidth = pageWidth - margin * 2;

  let page = pdfDoc.addPage(PageSizes.A4);
  let y = pageHeight - margin;

  function checkNewPage(requiredSpace: number) {
    if (y - requiredSpace < margin + 60) {
      page = pdfDoc.addPage(PageSizes.A4);
      y = pageHeight - margin;
      addPageNumber();
    }
  }

  function addPageNumber() {
    const pageCount = pdfDoc.getPageCount();
    page.drawText(`Page ${pageCount}`, {
      x: pageWidth - margin - 40,
      y: 30,
      size: 9,
      font,
      color: rgb(0.6, 0.6, 0.6),
    });
  }

  // Header
  page.drawRectangle({
    x: 0,
    y: pageHeight - 80,
    width: pageWidth,
    height: 80,
    color: rgb(...primaryColor),
  });

  page.drawText(organization.companyName, {
    x: margin,
    y: pageHeight - 40,
    size: 18,
    font: fontBold,
    color: rgb(1, 1, 1),
  });

  page.drawText("ContractFlow", {
    x: pageWidth - margin - 80,
    y: pageHeight - 40,
    size: 10,
    font,
    color: rgb(1, 1, 1, 0.7),
  });

  y = pageHeight - 100;

  // Contract title
  page.drawText(contract.title, {
    x: margin,
    y,
    size: 20,
    font: fontBold,
    color: rgb(0.1, 0.1, 0.1),
  });
  y -= 28;

  page.drawText(contract.contractNumber, {
    x: margin,
    y,
    size: 11,
    font,
    color: rgb(0.5, 0.5, 0.5),
  });
  y -= 24;

  // Divider
  page.drawLine({
    start: { x: margin, y },
    end: { x: pageWidth - margin, y },
    thickness: 1,
    color: rgb(0.9, 0.9, 0.9),
  });
  y -= 20;

  // Parties
  const col2x = margin + contentWidth / 2 + 10;

  page.drawText("FROM", { x: margin, y, size: 9, font, color: rgb(0.5, 0.5, 0.5) });
  page.drawText("TO", { x: col2x, y, size: 9, font, color: rgb(0.5, 0.5, 0.5) });
  y -= 16;

  page.drawText(organization.companyName, { x: margin, y, size: 12, font: fontBold, color: rgb(0.1, 0.1, 0.1) });
  page.drawText(client.companyName, { x: col2x, y, size: 12, font: fontBold, color: rgb(0.1, 0.1, 0.1) });
  y -= 16;

  page.drawText(client.contactName, { x: col2x, y, size: 10, font, color: rgb(0.4, 0.4, 0.4) });
  y -= 14;
  page.drawText(client.email, { x: col2x, y, size: 10, font, color: rgb(0.4, 0.4, 0.4) });
  y -= 30;

  // Contract details row
  const details = [
    { label: "Value", value: formatCurrency(Number(contract.value), contract.currency) },
    ...(contract.startDate ? [{ label: "Start Date", value: formatDate(contract.startDate) }] : []),
    ...(contract.endDate ? [{ label: "End Date", value: formatDate(contract.endDate) }] : []),
  ];

  const detailWidth = contentWidth / details.length;
  details.forEach((detail, i) => {
    const dx = margin + i * detailWidth;
    page.drawText(detail.label.toUpperCase(), { x: dx, y, size: 8, font, color: rgb(0.5, 0.5, 0.5) });
    page.drawText(detail.value, { x: dx, y: y - 16, size: 12, font: fontBold, color: rgb(...primaryColor) });
  });
  y -= 50;

  // Divider
  page.drawLine({ start: { x: margin, y }, end: { x: pageWidth - margin, y }, thickness: 1, color: rgb(0.9, 0.9, 0.9) });
  y -= 20;

  // Content
  page.drawText("CONTRACT TERMS", { x: margin, y, size: 10, font: fontBold, color: rgb(0.2, 0.2, 0.2) });
  y -= 20;

  const contentText = stripHtml(contract.content);
  const paragraphs = contentText.split("\n").filter((p) => p.trim());

  for (const para of paragraphs) {
    checkNewPage(30);
    const isBold = /^#+\s/.test(para) || para.length < 50 && para.endsWith(":");
    const cleanPara = para.replace(/^#+\s+/, "").trim();
    if (!cleanPara) continue;

    const lines = wrapText(cleanPara, isBold ? fontBold : font, 10, contentWidth);
    for (const line of lines) {
      checkNewPage(16);
      page.drawText(line, {
        x: margin,
        y,
        size: isBold ? 11 : 10,
        font: isBold ? fontBold : font,
        color: rgb(0.15, 0.15, 0.15),
      });
      y -= 14;
    }
    y -= 6;
  }

  // Signature section
  checkNewPage(120);
  y -= 10;

  page.drawLine({ start: { x: margin, y }, end: { x: pageWidth - margin, y }, thickness: 1, color: rgb(0.9, 0.9, 0.9) });
  y -= 20;

  page.drawText("SIGNATURES", { x: margin, y, size: 10, font: fontBold, color: rgb(0.2, 0.2, 0.2) });
  y -= 24;

  if (contract.signedAt && contract.signatureData) {
    page.drawText("Signed by client", { x: margin, y, size: 9, font, color: rgb(0.5, 0.5, 0.5) });
    y -= 16;
    page.drawText(`${client.contactName} — ${formatDate(contract.signedAt)}`, {
      x: margin,
      y,
      size: 12,
      font: fontBold,
      color: rgb(0.1, 0.1, 0.1),
    });
    y -= 14;
    if (contract.signerIp) {
      page.drawText(`IP: ${contract.signerIp}`, { x: margin, y, size: 8, font, color: rgb(0.6, 0.6, 0.6) });
    }
  } else {
    const sigBoxY = y - 60;
    page.drawRectangle({ x: margin, y: sigBoxY, width: contentWidth / 2 - 20, height: 60, borderWidth: 1, borderColor: rgb(0.8, 0.8, 0.8) });
    page.drawText("Client Signature", { x: margin + 8, y: sigBoxY + 8, size: 9, font, color: rgb(0.6, 0.6, 0.6) });
    page.drawLine({ start: { x: margin + 8, y: sigBoxY + 20 }, end: { x: margin + contentWidth / 2 - 28, y: sigBoxY + 20 }, thickness: 0.5, color: rgb(0.8, 0.8, 0.8), dashArray: [3, 3] });
    page.drawText("Date: _____________", { x: margin + 8, y: sigBoxY + 40, size: 9, font, color: rgb(0.6, 0.6, 0.6) });
    y = sigBoxY - 20;
  }

  // Footer
  const totalPages = pdfDoc.getPageCount();
  for (let i = 0; i < totalPages; i++) {
    const p = pdfDoc.getPage(i);
    p.drawText(`Page ${i + 1} of ${totalPages}`, {
      x: pageWidth - margin - 60,
      y: 30,
      size: 9,
      font,
      color: rgb(0.6, 0.6, 0.6),
    });
    p.drawText(`Generated by ContractFlow · ${new Date().toISOString().split("T")[0]}`, {
      x: margin,
      y: 30,
      size: 9,
      font,
      color: rgb(0.6, 0.6, 0.6),
    });
  }

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}

export async function generateInvoicePDF(invoice: {
  invoiceNumber: string;
  issueDate: Date;
  dueDate: Date;
  amount: number | string;
  tax: number | string;
  total: number | string;
  currency: string;
  notes?: string | null;
  lineItems: Array<{ description: string; quantity: number; unitPrice: number; amount: number }>;
  status: string;
}, organization: {
  companyName: string;
  primaryColor?: string | null;
}, client: {
  companyName: string;
  contactName: string;
  email: string;
  address?: string | null;
}): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const primaryColor = hexToRgb(organization.primaryColor || "#6366f1");
  const pageWidth = PageSizes.A4[0];
  const pageHeight = PageSizes.A4[1];
  const margin = 60;
  const contentWidth = pageWidth - margin * 2;

  const page = pdfDoc.addPage(PageSizes.A4);
  let y = pageHeight - margin;

  // Header band
  page.drawRectangle({ x: 0, y: pageHeight - 80, width: pageWidth, height: 80, color: rgb(...primaryColor) });
  page.drawText(organization.companyName, { x: margin, y: pageHeight - 40, size: 18, font: fontBold, color: rgb(1, 1, 1) });
  page.drawText("INVOICE", { x: pageWidth - margin - 60, y: pageHeight - 40, size: 14, font: fontBold, color: rgb(1, 1, 1) });

  y = pageHeight - 100;

  // Invoice meta
  page.drawText(invoice.invoiceNumber, { x: margin, y, size: 16, font: fontBold, color: rgb(0.1, 0.1, 0.1) });
  y -= 20;

  const metaItems = [
    { label: "Issue Date:", value: formatDate(invoice.issueDate) },
    { label: "Due Date:", value: formatDate(invoice.dueDate) },
    { label: "Status:", value: invoice.status },
  ];
  metaItems.forEach(({ label, value }) => {
    page.drawText(label, { x: margin, y, size: 10, font: fontBold, color: rgb(0.4, 0.4, 0.4) });
    page.drawText(value, { x: margin + 80, y, size: 10, font, color: rgb(0.2, 0.2, 0.2) });
    y -= 16;
  });
  y -= 10;

  // Bill To
  page.drawText("BILL TO", { x: margin, y, size: 9, font, color: rgb(0.5, 0.5, 0.5) });
  y -= 16;
  page.drawText(client.companyName, { x: margin, y, size: 12, font: fontBold, color: rgb(0.1, 0.1, 0.1) });
  y -= 16;
  page.drawText(client.contactName, { x: margin, y, size: 10, font, color: rgb(0.4, 0.4, 0.4) });
  y -= 14;
  page.drawText(client.email, { x: margin, y, size: 10, font, color: rgb(0.4, 0.4, 0.4) });
  y -= 30;

  // Line items table
  page.drawRectangle({ x: margin, y: y - 20, width: contentWidth, height: 20, color: rgb(...primaryColor) });
  page.drawText("Description", { x: margin + 8, y: y - 15, size: 9, font: fontBold, color: rgb(1, 1, 1) });
  page.drawText("Qty", { x: margin + contentWidth - 180, y: y - 15, size: 9, font: fontBold, color: rgb(1, 1, 1) });
  page.drawText("Unit Price", { x: margin + contentWidth - 130, y: y - 15, size: 9, font: fontBold, color: rgb(1, 1, 1) });
  page.drawText("Amount", { x: margin + contentWidth - 60, y: y - 15, size: 9, font: fontBold, color: rgb(1, 1, 1) });
  y -= 28;

  const lineItems = Array.isArray(invoice.lineItems) ? invoice.lineItems : [];
  lineItems.forEach((item, idx) => {
    if (idx % 2 === 1) {
      page.drawRectangle({ x: margin, y: y - 16, width: contentWidth, height: 20, color: rgb(0.97, 0.97, 0.99) });
    }
    page.drawText(item.description, { x: margin + 8, y: y - 11, size: 9, font, color: rgb(0.2, 0.2, 0.2) });
    page.drawText(String(item.quantity), { x: margin + contentWidth - 180, y: y - 11, size: 9, font, color: rgb(0.2, 0.2, 0.2) });
    page.drawText(formatCurrency(item.unitPrice, invoice.currency), { x: margin + contentWidth - 130, y: y - 11, size: 9, font, color: rgb(0.2, 0.2, 0.2) });
    page.drawText(formatCurrency(item.amount, invoice.currency), { x: margin + contentWidth - 60, y: y - 11, size: 9, font: fontBold, color: rgb(0.1, 0.1, 0.1) });
    y -= 20;
  });

  y -= 10;
  page.drawLine({ start: { x: margin, y }, end: { x: pageWidth - margin, y }, thickness: 1, color: rgb(0.9, 0.9, 0.9) });
  y -= 16;

  // Totals
  const totalsX = pageWidth - margin - 160;
  [
    { label: "Subtotal", value: formatCurrency(Number(invoice.amount), invoice.currency) },
    { label: "Tax", value: formatCurrency(Number(invoice.tax), invoice.currency) },
  ].forEach(({ label, value }) => {
    page.drawText(label, { x: totalsX, y, size: 10, font, color: rgb(0.4, 0.4, 0.4) });
    page.drawText(value, { x: pageWidth - margin - 10 - font.widthOfTextAtSize(value, 10), y, size: 10, font, color: rgb(0.2, 0.2, 0.2) });
    y -= 16;
  });

  page.drawRectangle({ x: totalsX - 8, y: y - 8, width: pageWidth - margin - totalsX + 8, height: 24, color: rgb(...primaryColor) });
  const totalStr = formatCurrency(Number(invoice.total), invoice.currency);
  page.drawText("TOTAL DUE", { x: totalsX, y: y - 2, size: 11, font: fontBold, color: rgb(1, 1, 1) });
  page.drawText(totalStr, { x: pageWidth - margin - 10 - fontBold.widthOfTextAtSize(totalStr, 12), y: y - 2, size: 12, font: fontBold, color: rgb(1, 1, 1) });
  y -= 40;

  if (invoice.notes) {
    y -= 10;
    page.drawText("Notes:", { x: margin, y, size: 9, font: fontBold, color: rgb(0.4, 0.4, 0.4) });
    y -= 14;
    const noteLines = wrapText(invoice.notes, font, 9, contentWidth);
    noteLines.forEach((line) => {
      page.drawText(line, { x: margin, y, size: 9, font, color: rgb(0.4, 0.4, 0.4) });
      y -= 13;
    });
  }

  // Footer
  page.drawText("Page 1 of 1", { x: pageWidth - margin - 50, y: 30, size: 9, font, color: rgb(0.6, 0.6, 0.6) });
  page.drawText(`Generated by ContractFlow · ${new Date().toISOString().split("T")[0]}`, { x: margin, y: 30, size: 9, font, color: rgb(0.6, 0.6, 0.6) });

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}
