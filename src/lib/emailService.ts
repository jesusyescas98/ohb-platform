import { OHB_DOMAIN, Order, Certificate, CourseRecord } from './types';

/**
 * Email service for sending transactional emails
 * Currently mocks email sending. In production, integrate with Resend or SendGrid
 */

export async function sendInvoiceEmail(
  email: string,
  order: Order,
  invoiceUrl: string,
  courseNames: string[]
): Promise<void> {
  try {
    console.log(`[EMAIL] Sending invoice to ${email}`, {
      invoiceNumber: order.invoiceNumber,
      courses: courseNames,
      invoiceUrl,
    });

    // TODO: Replace with actual Resend API call
    // const { data, error } = await resend.emails.send({
    //   from: 'facturas@ohbasesoriasyconsultorias.com',
    //   to: email,
    //   subject: `Tu Factura ${order.invoiceNumber} - OHB`,
    //   html: `...`,
    //   attachments: [{ filename: '${order.invoiceNumber}.pdf', path: invoiceUrl }]
    // });

    console.log(`[EMAIL] Invoice email queued for ${email}`);
  } catch (error) {
    console.error('Error sending invoice email:', error);
    throw error;
  }
}

export async function sendCourseWelcomeEmail(
  email: string,
  courses: CourseRecord[]
): Promise<void> {
  try {
    console.log(`[EMAIL] Sending course welcome to ${email}`, {
      courses: courses.map((c) => c.title),
    });

    // TODO: Replace with actual Resend API call
    // const { data, error } = await resend.emails.send({
    //   from: 'soporte@ohbasesoriasyconsultorias.com',
    //   to: email,
    //   subject: '¡Bienvenido a tu nuevo curso!',
    //   html: `...`
    // });

    console.log(`[EMAIL] Welcome email queued for ${email}`);
  } catch (error) {
    console.error('Error sending welcome email:', error);
    throw error;
  }
}

export async function sendCertificateEmail(
  email: string,
  certificate: Certificate,
  courseName: string,
  certificateUrl: string
): Promise<void> {
  try {
    console.log(`[EMAIL] Sending certificate to ${email}`, {
      certificate: certificate.certificateCode,
      course: courseName,
    });

    // TODO: Replace with actual Resend API call
    // const { data, error } = await resend.emails.send({
    //   from: 'certificados@ohbasesoriasyconsultorias.com',
    //   to: email,
    //   subject: `¡Certificado de ${courseName}!`,
    //   html: `...`,
    //   attachments: [{ filename: 'certificado.pdf', path: certificateUrl }]
    // });

    console.log(`[EMAIL] Certificate email queued for ${email}`);
  } catch (error) {
    console.error('Error sending certificate email:', error);
    throw error;
  }
}

export async function sendPaymentConfirmationEmail(
  email: string,
  userName: string,
  invoiceNumber: string,
  total: number
): Promise<void> {
  try {
    console.log(`[EMAIL] Sending payment confirmation to ${email}`, {
      invoiceNumber,
      total,
    });

    // TODO: Replace with actual Resend API call
    const emailHtml = `
      <h1>¡Pago Recibido!</h1>
      <p>Hola ${userName},</p>
      <p>Tu pago ha sido procesado exitosamente.</p>
      <p><strong>Número de Factura:</strong> ${invoiceNumber}</p>
      <p><strong>Monto:</strong> $${total.toLocaleString('es-MX')}</p>
      <p>Puedes acceder a tus cursos en: <a href="${OHB_DOMAIN}/my-courses">Mis Cursos</a></p>
      <p>¡Gracias por tu compra!</p>
    `;

    console.log(`[EMAIL] Payment confirmation email queued for ${email}`);
  } catch (error) {
    console.error('Error sending payment confirmation email:', error);
    throw error;
  }
}
