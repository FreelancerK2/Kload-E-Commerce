import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { stripe, isStripeConfigured } from '@/lib/stripe';

export async function POST(request: NextRequest) {
  try {
    console.log('Checkout API called');

    // Try to get user info from Clerk headers
    const authHeader = request.headers.get('authorization');
    const userId = null;

    // For now, we'll handle guest checkout only
    // In a real app, you'd extract user info from headers or session
    const body = await request.json();
    const { items, successUrl, cancelUrl, guestInfo, createPaymentIntent } =
      body;

    console.log('Checkout request body:', {
      items,
      successUrl,
      cancelUrl,
      guestInfo,
      createPaymentIntent,
    });

    // If this is a payment intent request, handle it differently
    if (createPaymentIntent) {
      if (!isStripeConfigured() || !stripe) {
        return NextResponse.json(
          { error: 'Stripe is not configured' },
          { status: 500 }
        );
      }

      const { amount } = body;

      // Create a PaymentIntent with the order amount and currency
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount || 0,
        currency: 'usd',
        automatic_payment_methods: {
          enabled: true,
        },
      });

      return NextResponse.json({
        clientSecret: paymentIntent.client_secret,
      });
    }

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'No items in cart' }, { status: 400 });
    }

    // Validate stock availability before proceeding
    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.id },
      });

      if (!product) {
        return NextResponse.json(
          { error: `Product ${item.name} not found` },
          { status: 400 }
        );
      }

      if (!product.inStock || (product.stockCount || 0) < item.quantity) {
        return NextResponse.json(
          {
            error: `Insufficient stock for ${product.name}. Available: ${product.stockCount || 0}, Requested: ${item.quantity}`,
          },
          { status: 400 }
        );
      }
    }

    let user = null;
    const orderData: any = {};

    if (userId) {
      // Authenticated user - find or create user in database
      user = await prisma.user.findUnique({
        where: { clerkId: userId },
      });

      if (!user) {
        // Create user in database if they don't exist
        // This happens when a user signs up through Clerk but hasn't been synced to our database
        user = await prisma.user.create({
          data: {
            clerkId: userId,
            email: guestInfo?.email || 'user@example.com', // Fallback email
            firstName: guestInfo?.firstName || '',
            lastName: guestInfo?.lastName || '',
          },
        });
      }

      orderData.userId = user.id;
    } else {
      // Guest user - create or find guest user
      if (!guestInfo || !guestInfo.email) {
        return NextResponse.json(
          { error: 'Guest email is required' },
          { status: 400 }
        );
      }

      // Check if guest user exists, create if not
      user = await prisma.user.findFirst({
        where: {
          email: guestInfo.email,
        },
      });

      if (!user) {
        // Create guest user with a special clerkId for guests
        user = await prisma.user.create({
          data: {
            email: guestInfo.email,
            firstName: guestInfo.firstName || '',
            lastName: guestInfo.lastName || '',
            clerkId: `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          },
        });
      }

      orderData.userId = user.id;
    }

    // Calculate total
    const total = items.reduce((sum: number, item: any) => {
      return sum + item.price * item.quantity;
    }, 0);

    console.log('Stripe configured:', isStripeConfigured());

    if (!isStripeConfigured()) {
      console.log('Running in demo mode - Stripe not configured');
      // Demo mode - create order without Stripe
      // First, ensure demo products exist
      const demoProducts = await Promise.all(
        items.map(async (item: any) => {
          let product = await prisma.product.findUnique({
            where: { id: item.id },
          });

          if (!product) {
            // Create demo product if it doesn't exist
            product = await prisma.product.create({
              data: {
                id: item.id,
                sanityId: `demo_${item.id}`,
                name: item.name,
                description: `Demo product: ${item.name}`,
                price: item.price,
                images: item.image || '',
                category: 'demo',
                tags: 'demo,test',
                inStock: true,
                stockCount: 100,
              },
            });
          }
          return product;
        })
      );

      // Decrease stock for each item
      await Promise.all(
        items.map(async (item: any) => {
          const product = await prisma.product.findUnique({
            where: { id: item.id },
          });

          if (product) {
            const newStockCount = Math.max(
              0,
              (product.stockCount || 0) - item.quantity
            );
            const newInStock = newStockCount > 0;

            await prisma.product.update({
              where: { id: item.id },
              data: {
                stockCount: newStockCount,
                inStock: newInStock,
              },
            });

            console.log(
              `Stock updated for ${product.name}: ${product.stockCount} -> ${newStockCount}`
            );
          }
        })
      );

      const order = await prisma.order.create({
        data: {
          ...orderData,
          stripeSessionId: `demo_session_${Date.now()}`,
          total,
          status: 'PENDING',
          items: {
            create: items.map((item: any) => ({
              productId: item.id,
              quantity: item.quantity,
              price: item.price,
            })),
          },
        },
      });

      return NextResponse.json({
        sessionId: `demo_session_${Date.now()}`,
        url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/success?session_id=demo_session_${Date.now()}`,
        orderId: order.id,
        demo: true,
        message:
          'Demo mode: Stripe not configured. Order created successfully!',
      });
    }

    // Real Stripe checkout
    if (!stripe) {
      throw new Error('Stripe is not configured');
    }

    console.log('Creating Stripe checkout session...');

    // Log the URLs being used
    const finalSuccessUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}${successUrl || '/success'}?session_id={CHECKOUT_SESSION_ID}`;
    const finalCancelUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}${cancelUrl || '/cart'}`;

    console.log('Success URL length:', finalSuccessUrl.length);
    console.log('Cancel URL length:', finalCancelUrl.length);
    console.log('Success URL:', finalSuccessUrl);
    console.log('Cancel URL:', finalCancelUrl);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: items.map((item: any) => ({
        price_data: {
          currency: 'usd',
          product_data: {
            name: item.name,
            images: item.image && item.image.length < 500 ? [item.image] : [], // Only include image if URL is not too long
          },
          unit_amount: Math.round(item.price * 100), // Convert to cents
        },
        quantity: item.quantity,
      })),
      mode: 'payment',
      success_url: finalSuccessUrl,
      cancel_url: finalCancelUrl,
      metadata: {
        userId: user.id,
        isGuest: !userId ? 'true' : 'false',
        guestEmail: guestInfo?.email || '',
      },
      customer_email: guestInfo?.email || user.email, // Pre-fill email for guest users
    });

    console.log('Stripe session created:', session.id);

    // Decrease stock for each item
    await Promise.all(
      items.map(async (item: any) => {
        const product = await prisma.product.findUnique({
          where: { id: item.id },
        });

        if (product) {
          const newStockCount = Math.max(
            0,
            (product.stockCount || 0) - item.quantity
          );
          const newInStock = newStockCount > 0;

          await prisma.product.update({
            where: { id: item.id },
            data: {
              stockCount: newStockCount,
              inStock: newInStock,
            },
          });

          console.log(
            `Stock updated for ${product.name}: ${product.stockCount} -> ${newStockCount}`
          );
        }
      })
    );

    // Create order in database
    const order = await prisma.order.create({
      data: {
        ...orderData,
        stripeSessionId: session.id,
        total,
        status: 'PENDING',
        items: {
          create: items.map((item: any) => ({
            productId: item.id,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
    });

    console.log('Order created:', order.id);

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
      orderId: order.id,
    });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      {
        error: 'Failed to create checkout session',
        details: error instanceof Error ? error.message : 'Unknown error',
        stack:
          process.env.NODE_ENV === 'development'
            ? error instanceof Error
              ? error.stack
              : undefined
            : undefined,
      },
      { status: 500 }
    );
  }
}
