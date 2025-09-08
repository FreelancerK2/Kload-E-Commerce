'use client';

import AdminLayout from '@/components/AdminLayout';
import { Settings } from 'lucide-react';

export default function AdminContentPage() {
  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <Settings className="h-8 w-8 text-red-600" />
            <h1 className="text-3xl font-bold text-gray-900">
              Content Management
            </h1>
          </div>
          <p className="text-gray-600">
            Manage site content, hero sections, and other content elements.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="text-center">
            <Settings className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Content Management
            </h2>
            <p className="text-gray-600 mb-6">
              This page will contain the content management interface. For now,
              you can manage content from the main admin dashboard.
            </p>
            <a
              href="/admin"
              className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Go to Admin Dashboard
            </a>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

