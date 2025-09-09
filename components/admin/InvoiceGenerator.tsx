'use client';

import { useState } from 'react';
import { FileText, Download, X } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface User {
  firstName: string | null;
  lastName: string | null;
  email: string;
}

interface Order {
  id: string;
  stripeSessionId: string | null;
  total: number;
  status: string;
  createdAt: string;
  items: OrderItem[];
  user: User | null;
}

interface InvoiceGeneratorProps {
  order: Order;
  onClose: () => void;
}

export default function InvoiceGenerator({
  order,
  onClose,
}: InvoiceGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const generatePDF = async () => {
    setIsGenerating(true);
    try {
      console.log('🔄 Starting PDF generation...');
      
      const invoiceElement = document.getElementById('invoice-content');
      if (!invoiceElement) {
        throw new Error('Invoice content not found');
      }
      
      console.log('✅ Invoice element found:', invoiceElement);

      // Create canvas from HTML element
      console.log('🔄 Creating canvas from HTML...');
      const canvas = await html2canvas(invoiceElement, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: true, // Enable logging for debugging
        ignoreElements: (element) => {
          // Skip elements that might cause color parsing issues
          return element.tagName === 'SCRIPT' || element.tagName === 'STYLE';
        },
        onclone: (clonedDoc) => {
          // Convert oklch colors to hex/rgb in the cloned document
          const style = clonedDoc.createElement('style');
          style.textContent = `
            * {
              color: rgb(0, 0, 0) !important;
              background-color: rgb(255, 255, 255) !important;
              border-color: rgb(0, 0, 0) !important;
            }
            .bg-black { background-color: rgb(0, 0, 0) !important; }
            .text-white { color: rgb(255, 255, 255) !important; }
            .text-gray-900 { color: rgb(17, 24, 39) !important; }
            .text-gray-600 { color: rgb(75, 85, 99) !important; }
            .border-gray-200 { border-color: rgb(229, 231, 235) !important; }
            .bg-gray-50 { background-color: rgb(249, 250, 251) !important; }
          `;
          clonedDoc.head.appendChild(style);
        }
      });
      
      console.log('✅ Canvas created:', canvas.width, 'x', canvas.height);

      // Create PDF
      console.log('🔄 Creating PDF...');
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');

      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Download PDF
      const fileName = `invoice-${order.id}-${new Date().toISOString().split('T')[0]}.pdf`;
      console.log('🔄 Downloading PDF:', fileName);
      pdf.save(fileName);
      
      console.log('✅ PDF generated and downloaded successfully!');
    } catch (error) {
      console.error('❌ Error generating PDF:', error);
      alert(`Failed to generate PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const getFirstImage = (images: string) => {
    if (!images) return null;
    try {
      const imageArray = JSON.parse(images);
      if (Array.isArray(imageArray) && imageArray.length > 0) {
        return imageArray[0];
      }
    } catch (error) {
      return images;
    }
    return null;
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <FileText className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              Invoice #{order.id}
            </h2>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={generatePDF}
              disabled={isGenerating}
              className="bg-black text-white px-4 py-2 rounded-lg font-medium hover:scale-105 hover:shadow-lg transition-all duration-300 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="h-4 w-4" />
              <span>{isGenerating ? 'Generating...' : 'Download PDF'}</span>
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Invoice Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          <div id="invoice-content" className="p-8 bg-white">
            {/* Company Header */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center mb-4">
                <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center mr-3">
                  <span className="text-white font-bold text-xl">K</span>
                </div>
                <h1 className="text-3xl font-bold text-gray-900">Kload</h1>
              </div>
              <p className="text-gray-600">Premium E-commerce Store</p>
              <p className="text-gray-600">Your One-Stop Electronic Market</p>
            </div>

            {/* Invoice Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Bill To:
                </h3>
                {order.user ? (
                  <div className="text-gray-700">
                    <p className="font-medium">
                      {order.user.firstName} {order.user.lastName}
                    </p>
                    <p>{order.user.email}</p>
                  </div>
                ) : (
                  <p className="text-gray-500">Guest Customer</p>
                )}
              </div>
              <div className="text-right">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Invoice Details:
                </h3>
                <div className="text-gray-700">
                  <p>
                    <span className="font-medium">Invoice #:</span> {order.id}
                  </p>
                  <p>
                    <span className="font-medium">Date:</span>{' '}
                    {formatDate(order.createdAt)}
                  </p>
                  <p>
                    <span className="font-medium">Status:</span>
                    <span
                      className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                        order.status === 'PAID'
                          ? 'bg-green-100 text-green-800'
                          : order.status === 'PENDING'
                            ? 'bg-yellow-100 text-yellow-800'
                            : order.status === 'SHIPPED'
                              ? 'bg-blue-100 text-blue-800'
                              : order.status === 'DELIVERED'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {order.status}
                    </span>
                  </p>
                  {order.stripeSessionId && (
                    <p>
                      <span className="font-medium">Payment ID:</span>{' '}
                      {order.stripeSessionId}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Order Items Table */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Order Items:
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-300 px-4 py-3 text-left text-sm font-medium text-gray-900">
                        Product
                      </th>
                      <th className="border border-gray-300 px-4 py-3 text-center text-sm font-medium text-gray-900">
                        Quantity
                      </th>
                      <th className="border border-gray-300 px-4 py-3 text-right text-sm font-medium text-gray-900">
                        Unit Price
                      </th>
                      <th className="border border-gray-300 px-4 py-3 text-right text-sm font-medium text-gray-900">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items.map((item, index) => {
                      const firstImage = getFirstImage(item.image);
                      return (
                        <tr
                          key={item.id}
                          className={
                            index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                          }
                        >
                          <td className="border border-gray-300 px-4 py-3">
                            <div className="flex items-center space-x-3">
                              {firstImage && (
                                <img
                                  src={
                                    firstImage.startsWith('data:')
                                      ? firstImage
                                      : `data:image/jpeg;base64,${firstImage}`
                                  }
                                  alt={item.name}
                                  className="w-12 h-12 object-cover rounded border"
                                />
                              )}
                              <div>
                                <p className="font-medium text-gray-900">
                                  {item.name}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="border border-gray-300 px-4 py-3 text-center text-gray-700">
                            {item.quantity}
                          </td>
                          <td className="border border-gray-300 px-4 py-3 text-right text-gray-700">
                            {formatCurrency(item.price)}
                          </td>
                          <td className="border border-gray-300 px-4 py-3 text-right font-medium text-gray-900">
                            {formatCurrency(item.price * item.quantity)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Total */}
            <div className="flex justify-end">
              <div className="w-64">
                <div className="border-t-2 border-gray-300 pt-4">
                  <div className="flex justify-between items-center text-lg font-semibold text-gray-900">
                    <span>Total:</span>
                    <span>{formatCurrency(order.total)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-12 pt-8 border-t border-gray-200 text-center text-gray-600">
              <p>Thank you for your business!</p>
              <p className="mt-2">
                For support, please contact us at support@kload.com
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
