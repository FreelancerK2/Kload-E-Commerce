import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Fetch all products
export async function GET(request: NextRequest) {
  try {
    const products = await prisma.product.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    console.log(
      'API: Fetched products with discount data:',
      products.map((p) => ({
        id: p.id,
        name: p.name,
        price: p.price,
        originalPrice: p.originalPrice,
        discountPercentage: p.discountPercentage,
      }))
    );

    return NextResponse.json({ products });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

// POST - Create new product
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('POST request body:', body);
    const {
      name,
      description,
      price,
      originalPrice,
      discountPercentage,
      images,
      category,
      tags,
      inStock,
      stockCount,
      isFeatured,
      isNewArrival,
      isTrending,
      isTopRated,
      isFlashDeal,
    } = body;

    // Validate required fields
    if (!name || !description || !price) {
      return NextResponse.json(
        { error: 'Name, description, and price are required' },
        { status: 400 }
      );
    }

    const finalStockCount = parseInt(stockCount) || 0;
    const finalInStock = inStock !== undefined ? inStock : finalStockCount > 0;

    const product = await prisma.product.create({
      data: {
        sanityId: `manual_${Date.now()}`,
        name,
        description,
        price: parseFloat(price),
        originalPrice:
          originalPrice && parseFloat(originalPrice) > 0
            ? parseFloat(originalPrice)
            : null,
        discountPercentage:
          discountPercentage && parseInt(discountPercentage) > 0
            ? parseInt(discountPercentage)
            : null,
        images: images || '',
        category: category || 'General',
        tags: tags || '',
        inStock: finalInStock,
        stockCount: finalStockCount,
        isFeatured: isFeatured || false,
        isNewArrival: isNewArrival || false,
        isTrending: isTrending || false,
        isTopRated: isTopRated || false,
        isFlashDeal: isFlashDeal || false,
      },
    });

    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      {
        error: 'Failed to create product',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// PUT - Update product
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('PUT request body:', body);

    const {
      id,
      name,
      description,
      price,
      originalPrice,
      discountPercentage,
      images,
      category,
      tags,
      inStock,
      stockCount,
      isFeatured,
      isNewArrival,
      isTrending,
      isTopRated,
      isFlashDeal,
    } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    const finalStockCount = parseInt(stockCount) || 0;
    const finalInStock = finalStockCount > 0;

    const product = await prisma.product.update({
      where: { id },
      data: {
        name,
        description,
        price: parseFloat(price),
        originalPrice:
          originalPrice && parseFloat(originalPrice) > 0
            ? parseFloat(originalPrice)
            : null,
        discountPercentage:
          discountPercentage && parseInt(discountPercentage) > 0
            ? parseInt(discountPercentage)
            : null,
        images,
        category,
        tags,
        inStock: finalInStock,
        stockCount: finalStockCount,
        isFeatured: isFeatured || false,
        isNewArrival: isNewArrival || false,
        isTrending: isTrending || false,
        isTopRated: isTopRated || false,
        isFlashDeal: isFlashDeal || false,
      },
    });

    return NextResponse.json({ product }, { status: 200 });
  } catch (error) {
    console.error('Error updating product:', error);
    console.error(
      'Error details:',
      error instanceof Error ? error.message : 'Unknown error'
    );
    return NextResponse.json(
      {
        error: 'Failed to update product',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// DELETE - Delete product
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    await prisma.product.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    );
  }
}
