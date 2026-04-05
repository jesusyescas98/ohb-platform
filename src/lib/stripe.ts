import Stripe from 'stripe';
import { CourseRecord, Order } from './types';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export async function createCheckoutSession({
  userId,
  courseIds,
  email,
  successUrl,
  cancelUrl,
}: {
  userId: string;
  courseIds: string[];
  email: string;
  successUrl: string;
  cancelUrl: string;
}): Promise<string> {
  try {
    // Note: In a real implementation, you would load courses from the database
    // For now, return a placeholder session URL
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: email,
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        userId,
        courseIds: courseIds.join(','),
      },
      line_items: [
        {
          price_data: {
            currency: 'mxn',
            product_data: {
              name: `Cursos OHB (${courseIds.length} curso${courseIds.length > 1 ? 's' : ''})`,
              description: 'Acceso a cursos profesionales de OHB',
            },
            unit_amount: 100 * 100, // Placeholder: 100 MXN in cents
          },
          quantity: 1,
        },
      ],
    });

    return session.url || '';
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
}

export async function getSessionDetails(
  sessionId: string
): Promise<Stripe.Checkout.Session> {
  try {
    return await stripe.checkout.sessions.retrieve(sessionId);
  } catch (error) {
    console.error('Error retrieving session:', error);
    throw error;
  }
}

export function validateWebhookSignature(
  body: string,
  signature: string
): Stripe.Event {
  try {
    return stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error) {
    console.error('Webhook signature validation failed:', error);
    throw error;
  }
}

export async function getPaymentIntentDetails(
  paymentIntentId: string
): Promise<Stripe.PaymentIntent> {
  try {
    return await stripe.paymentIntents.retrieve(paymentIntentId);
  } catch (error) {
    console.error('Error retrieving payment intent:', error);
    throw error;
  }
}
