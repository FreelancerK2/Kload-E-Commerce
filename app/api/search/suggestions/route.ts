import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const limit = parseInt(searchParams.get('limit') || '5');

    if (!query || query.trim().length < 1) {
      return NextResponse.json({ suggestions: [] });
    }

    const searchTerm = query.trim();

    // Search for products that match the query
    const products = await prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: searchTerm } },
          { description: { contains: searchTerm } },
          { category: { contains: searchTerm } },
          { tags: { contains: searchTerm } },
        ],
        inStock: true, // Only show in-stock products
      },
      select: {
        id: true,
        name: true,
        price: true,
        originalPrice: true,
        images: true,
        category: true,
        rating: true,
      },
      take: limit,
      orderBy: [
        // Prioritize exact name matches
        { name: 'asc' },
        { rating: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    // Format suggestions with product info
    const suggestions = products.map((product) => ({
      id: product.id,
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice,
      category: product.category,
      rating: product.rating,
      image: product.images ? JSON.parse(product.images)[0] : null,
      type: 'product',
    }));

    // Add category suggestions if no products found or to supplement results
    const categories = await prisma.product.findMany({
      where: {
        category: { contains: searchTerm },
        inStock: true,
      },
      select: {
        category: true,
      },
      distinct: ['category'],
      take: 3,
    });

    const categorySuggestions = categories.map((cat) => ({
      id: `category-${cat.category}`,
      name: cat.category,
      type: 'category',
    }));

    // Combine and limit total suggestions
    const allSuggestions = [...suggestions, ...categorySuggestions].slice(
      0,
      limit
    );

    return NextResponse.json({ suggestions: allSuggestions });
  } catch (error) {
    console.error('Error fetching search suggestions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch suggestions' },
      { status: 500 }
    );
  }
}
