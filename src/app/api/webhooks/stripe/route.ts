import { NextRequest, NextResponse } from 'next/server';
import { validateWebhookSignature } from '@/lib/stripe';
import { OrdersDB, CourseEnrollmentsDB } from '@/lib/database';
import { generateInvoice, saveInvoiceToDisk } from '@/lib/invoiceGenerator';
import { sendInvoiceEmail } from '@/lib/emailService';
import { CoursesDB } from '@/lib/database';
import { AcademyUsersDB } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json({ error: 'No signature' }, { status: 400 });
    }

    // Validate webhook signature
    const event: any = validateWebhookSignature(body, signature);

    // Handle checkout.session.completed event
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as any;

      // Find the order by stripe session ID
      const order = OrdersDB.getByStripeSessionId(session.id);

      if (!order) {
        console.warn(`Order not found for session ${session.id}`);
        return NextResponse.json({ success: false }, { status: 400 });
      }

      // Get user and course details
      const user = AcademyUsersDB.getById(order.userId);
      if (!user) {
        console.warn(`User not found for order ${order.id}`);
        return NextResponse.json({ success: false }, { status: 400 });
      }

      // Create enrollments for each course
      const courses = order.courseIds
        .map((courseId) => CoursesDB.getAll().find((c) => c.id === courseId))
        .filter(Boolean) as any[];

      for (const course of courses) {
        if (!user.enrollments.includes(course.id)) {
          const enrollment = CourseEnrollmentsDB.create({
            userId: order.userId,
            courseId: course.id,
            enrolledAt: Date.now(),
            status: 'active',
            progress: 0,
          });

          // Create progress tracker
          const progress = require('@/lib/database').CourseProgressDB.create(enrollment.id, course.id);
          console.log(`Created enrollment and progress for course ${course.id}`);
        }
      }

      // Update order status to paid
      OrdersDB.updateStatus(order.id, 'paid', {
        stripePaymentIntentId: session.payment_intent,
        paidAt: Date.now(),
      });

      // Generate invoice
      try {
        const invoiceBuffer = await generateInvoice(order, courses, user.name, user.email, user.phone);
        const invoiceUrl = await saveInvoiceToDisk(invoiceBuffer, order.invoiceNumber);

        // Update order with invoice URL
        OrdersDB.updateStatus(order.id, 'paid', {
          invoicePdfUrl: invoiceUrl,
        });

        // Send invoice email
        await sendInvoiceEmail(user.email, order, invoiceUrl, courses.map((c) => c.title));
      } catch (invoiceError) {
        console.error('Error generating invoice:', invoiceError);
        // Don't fail the webhook if invoice generation fails
      }

      console.log(`Payment completed for order ${order.id}`);
      return NextResponse.json({ success: true });
    }

    // Handle other event types if needed
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}
