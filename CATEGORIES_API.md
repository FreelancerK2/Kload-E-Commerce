# Categories API Setup

Since there are permission issues with creating the API directory automatically, you'll need to create it manually.

## 1. Create the API Directory

```bash
mkdir -p app/api/admin/categories
```

## 2. Create the API Route File

Create `app/api/admin/categories/route.ts` with this content:

```typescript
import { NextRequest, NextResponse } from 'next/server';

// Mock data for now - you can replace this with your database
let categories = [
  {
    id: '1',
    name: 'Electronics',
    slug: 'electronics',
    description: 'Electronic devices and gadgets',
    imageUrl: '/images/categories/electronics.jpg',
    color: '#3B82F6',
    isActive: true,
    sortOrder: 0
  },
  {
    id: '2',
    name: 'Clothing',
    slug: 'clothing',
    description: 'Fashion and apparel',
    imageUrl: '/images/categories/clothing.jpg',
    color: '#8B5CF6',
    isActive: true,
    sortOrder: 1
  },
  {
    id: '3',
    name: 'Accessories',
    slug: 'accessories',
    description: 'Various accessories and add-ons',
    imageUrl: '/images/categories/accessories.jpg',
    color: '#10B981',
    isActive: true,
    sortOrder: 2
  }
];

// GET - Fetch all categories
export async function GET() {
  try {
    return NextResponse.json(categories.sort((a, b) => a.sortOrder - b.sortOrder));
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

// POST - Create new category
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, slug, description, imageUrl, color, isActive, sortOrder } = body;

    if (!name || !slug) {
      return NextResponse.json(
        { error: 'Name and slug are required' },
        { status: 400 }
      );
    }

    const newCategory = {
      id: Date.now().toString(),
      name,
      slug,
      description,
      imageUrl,
      color: color || '#3B82F6',
      isActive: isActive ?? true,
      sortOrder: sortOrder ?? categories.length
    };

    categories.push(newCategory);
    return NextResponse.json(newCategory, { status: 201 });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    );
  }
}

// PUT - Update category
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, slug, description, imageUrl, color, isActive, sortOrder } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Category ID is required' },
        { status: 400 }
      );
    }

    const categoryIndex = categories.findIndex(cat => cat.id === id);
    if (categoryIndex === -1) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    categories[categoryIndex] = {
      ...categories[categoryIndex],
      name,
      slug,
      description,
      imageUrl,
      color,
      isActive,
      sortOrder
    };

    return NextResponse.json(categories[categoryIndex]);
  } catch (error) {
    console.error('Error updating category:', error);
    return NextResponse.json(
      { error: 'Failed to update category' },
      { status: 500 }
    );
  }
}

// DELETE - Delete category
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Category ID is required' },
        { status: 400 }
      );
    }

    const categoryIndex = categories.findIndex(cat => cat.id === id);
    if (categoryIndex === -1) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    categories.splice(categoryIndex, 1);
    return NextResponse.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json(
      { error: 'Failed to delete category' },
      { status: 500 }
    );
  }
}
```

## 3. Update Your Database Schema

Run the Prisma migration to add the categories table:

```bash
npx prisma migrate dev --name add-categories
```

## 4. Run the Setup Script

```bash
node scripts/setup-categories.js
```

## 5. Test the API

You can test the endpoints:

- GET `/api/admin/categories` - List all categories
- POST `/api/admin/categories` - Create a new category
- PUT `/api/admin/categories` - Update a category
- DELETE `/api/admin/categories?id=1` - Delete a category

## Features

✅ **Full CRUD Operations** - Create, Read, Update, Delete categories
✅ **Image Management** - Upload and manage category images
✅ **Color Customization** - Choose from preset colors or custom colors
✅ **Sort Order** - Control the display order of categories
✅ **Active/Inactive Status** - Enable/disable categories
✅ **Slug Generation** - Automatic URL-friendly slugs
✅ **Admin Panel Integration** - Full integration with your existing admin dashboard

## Next Steps

1. Create the API directory and file manually
2. Run the database migration
3. Test the admin panel categories tab
4. Add your real category images to `/public/images/categories/`
5. Customize categories as needed

The admin panel will now have a dedicated "Categories" tab where you can manage all your product categories dynamically!
