import PDFDocument from 'pdfkit';
import { Order, CourseRecord } from './types';
import { OHB_WHATSAPP_DISPLAY } from './types';
import path from 'path';
import fs from 'fs';

export async function generateInvoice(
  order: Order,
  courses: CourseRecord[],
  userName: string,
  userEmail: string,
  userPhone: string
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'letter',
        margin: 50,
      });

      const buffers: Buffer[] = [];
      doc.on('data', (chunk: Buffer) => buffers.push(chunk));
      doc.on('end', () => {
        resolve(Buffer.concat(buffers));
      });
      doc.on('error', (err) => reject(err));

      // Header with company info
      doc.fontSize(24).font('Helvetica-Bold').text('OHB', 50, 50);
      doc.fontSize(10)
        .font('Helvetica')
        .text('Asesorías y Consultorías', 50, 75);
      doc.fontSize(9)
        .text(`Tel: ${OHB_WHATSAPP_DISPLAY}`)
        .text('Tomás Fernández #7818, Col. Buscari');

      // Invoice title
      doc.fontSize(18).font('Helvetica-Bold').text('FACTURA', 350, 50);

      // Invoice number and date
      doc.fontSize(10).font('Helvetica');
      const invoiceDate = new Date();
      const formattedDate = invoiceDate
        .toLocaleDateString('es-MX', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        })
        .replace(/\//g, '/');

      doc
        .text(`Folio: ${order.invoiceNumber}`, 350, 75)
        .text(`Fecha: ${formattedDate}`, 350, 95);

      // Customer info section
      doc.fontSize(11).font('Helvetica-Bold').text('CLIENTE', 50, 150);
      doc.fontSize(10).font('Helvetica');
      doc
        .text(`Nombre: ${userName}`, 50, 170)
        .text(`Email: ${userEmail}`, 50, 190)
        .text(`Teléfono: ${userPhone}`, 50, 210);

      // Items table header
      const tableTop = 270;
      const itemHeight = 20;
      const col1 = 50;
      const col2 = 250;
      const col3 = 380;
      const col4 = 480;

      doc.fontSize(10).font('Helvetica-Bold');
      doc
        .text('Descripción', col1, tableTop)
        .text('Cantidad', col2, tableTop)
        .text('Precio Unitario', col3, tableTop)
        .text('Subtotal', col4, tableTop);

      // Draw line
      doc.moveTo(col1, tableTop + 15).lineTo(550, tableTop + 15).stroke();

      // Items
      let rowPosition = tableTop + 25;
      let subtotal = 0;

      courses.forEach((course) => {
        const coursePrice = course.price || 0;
        subtotal += coursePrice;

        doc.fontSize(9).font('Helvetica');
        doc
          .text(course.title.substring(0, 30), col1, rowPosition)
          .text('1', col2, rowPosition)
          .text(`$${coursePrice.toLocaleString('es-MX')}`, col3, rowPosition)
          .text(`$${coursePrice.toLocaleString('es-MX')}`, col4, rowPosition);

        rowPosition += itemHeight + 5;
      });

      // Totals section
      const totalsTop = rowPosition + 20;
      const iva = Math.round(subtotal * 0.16);
      const total = subtotal + iva;

      doc.fontSize(10).font('Helvetica-Bold');
      doc.text('Subtotal:', col3, totalsTop);
      doc.font('Helvetica').text(`$${subtotal.toLocaleString('es-MX')}`, col4, totalsTop);

      doc.font('Helvetica-Bold').text('IVA (16%):', col3, totalsTop + 20);
      doc.font('Helvetica').text(`$${iva.toLocaleString('es-MX')}`, col4, totalsTop + 20);

      doc.font('Helvetica-Bold').text('TOTAL:', col3, totalsTop + 40);
      doc.font('Helvetica-Bold').text(`$${total.toLocaleString('es-MX')}`, col4, totalsTop + 40);

      // Footer
      const footerTop = totalsTop + 120;
      doc.fontSize(9)
        .font('Helvetica')
        .text(
          'Gracias por tu compra. Accede a tus cursos en: https://ohbasesoriasyconsultorias.com/my-courses',
          50,
          footerTop,
          {
            align: 'center',
            width: 500,
          }
        );

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

export function getInvoiceUrl(invoiceNumber: string): string {
  return `/invoices/${invoiceNumber}.pdf`;
}

export async function saveInvoiceToDisk(
  invoiceBuffer: Buffer,
  invoiceNumber: string
): Promise<string> {
  try {
    const invoicesDir = path.join(process.cwd(), 'public', 'invoices');

    // Create directory if it doesn't exist
    if (!fs.existsSync(invoicesDir)) {
      fs.mkdirSync(invoicesDir, { recursive: true });
    }

    const filePath = path.join(invoicesDir, `${invoiceNumber}.pdf`);
    fs.writeFileSync(filePath, invoiceBuffer);

    return getInvoiceUrl(invoiceNumber);
  } catch (error) {
    console.error('Error saving invoice to disk:', error);
    throw error;
  }
}
