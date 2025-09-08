import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  if (!stripe) {
    return NextResponse.json(
      { error: 'Stripe is not configured' },
      { status: 500 }
    );
  }

  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    );
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object;
        console.log('Payment completed for session:', session.id);

        // Update order status to PAID
        await prisma.order.updateMany({
          where: {
            stripeSessionId: session.id,
          },
          data: {
            status: 'PAID',
          },
        });

        console.log('Order updated to PAID status');
        break;

      case 'checkout.session.expired':
        const expiredSession = event.data.object;
        console.log('Payment session expired:', expiredSession.id);

        // Update order status to CANCELLED
        await prisma.order.updateMany({
          where: {
            stripeSessionId: expiredSession.id,
          },
          data: {
            status: 'CANCELLED',
          },
        });

        console.log('Order updated to CANCELLED status');
        break;

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object;
        console.log('Payment failed:', failedPayment.id);

        // Update order status to CANCELLED
        await prisma.order.updateMany({
          where: {
            stripeSessionId: failedPayment.metadata?.session_id,
          },
          data: {
            status: 'CANCELLED',
          },
        });

        console.log('Order updated to FAILED status');
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
