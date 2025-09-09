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
          // Remove all existing stylesheets that might contain oklch colors
          const existingStyles = clonedDoc.querySelectorAll('style, link[rel="stylesheet"]');
          existingStyles.forEach(style => style.remove());
          
          // Create a comprehensive style override
          const style = clonedDoc.createElement('style');
          style.textContent = `
            * {
              color: rgb(0, 0, 0) !important;
              background-color: rgb(255, 255, 255) !important;
              border-color: rgb(0, 0, 0) !important;
              background-image: none !important;
              background: rgb(255, 255, 255) !important;
            }
            
            /* Override all Tailwind classes with safe colors */
            .bg-black, .bg-gradient-to-br { background: rgb(0, 0, 0) !important; }
            .text-white { color: rgb(255, 255, 255) !important; }
            .text-gray-900 { color: rgb(17, 24, 39) !important; }
            .text-gray-600 { color: rgb(75, 85, 99) !important; }
            .text-gray-500 { color: rgb(107, 114, 128) !important; }
            .text-gray-700 { color: rgb(55, 65, 81) !important; }
            .border-gray-200 { border-color: rgb(229, 231, 235) !important; }
            .border-gray-300 { border-color: rgb(209, 213, 219) !important; }
            .bg-gray-50 { background: rgb(249, 250, 251) !important; }
            .bg-gray-100 { background: rgb(243, 244, 246) !important; }
            .bg-gray-200 { background: rgb(229, 231, 235) !important; }
            .bg-blue-100 { background: rgb(219, 234, 254) !important; }
            .text-blue-800 { color: rgb(30, 64, 175) !important; }
            .bg-green-100 { background: rgb(220, 252, 231) !important; }
            .text-green-800 { color: rgb(22, 101, 52) !important; }
            .bg-yellow-100 { background: rgb(254, 249, 195) !important; }
            .text-yellow-800 { color: rgb(133, 77, 14) !important; }
            .bg-red-100 { background: rgb(254, 226, 226) !important; }
            .text-red-800 { color: rgb(153, 27, 27) !important; }
            
            /* Override gradients with solid colors */
            .from-black, .to-gray-800, .from-gray-100, .to-gray-200 {
              background: rgb(243, 244, 246) !important;
            }
            
            /* Ensure all elements use safe colors */
            div, span, p, h1, h2, h3, h4, h5, h6, td, th, tr, table {
              color: rgb(0, 0, 0) !important;
              background-color: rgb(255, 255, 255) !important;
            }
            
            /* Specific overrides for invoice elements */
            #invoice-content * {
              color: rgb(0, 0, 0) !important;
              background-color: rgb(255, 255, 255) !important;
            }
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
            <div className="text-center mb-10">
              <div className="flex items-center justify-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-black to-gray-800 rounded-xl flex items-center justify-center mr-4 shadow-lg">
                  <span className="text-white font-bold text-2xl">K</span>
                </div>
                <div className="text-left">
                  <h1 className="text-4xl font-bold text-gray-900 mb-1">Kload</h1>
                  <p className="text-lg text-gray-600 font-medium">Premium E-commerce Store</p>
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <p className="text-gray-700 font-medium">Your One-Stop Electronic Market</p>
                <p className="text-sm text-gray-500 mt-1">Quality Electronics • Fast Delivery • 24/7 Support</p>
              </div>
            </div>

            {/* Invoice Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-4 border-b border-gray-300 pb-2">
                  Bill To:
                </h3>
                {order.user ? (
                  <div className="text-gray-700 space-y-2">
                    <p className="font-semibold text-lg">
                      {order.user.firstName} {order.user.lastName}
                    </p>
                    <p className="text-gray-600">{order.user.email}</p>
                  </div>
                ) : (
                  <p className="text-gray-500 font-medium">Guest Customer</p>
                )}
              </div>
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-4 border-b border-gray-300 pb-2">
                  Invoice Details:
                </h3>
                <div className="text-gray-700 space-y-2">
                  <p>
                    <span className="font-semibold">Invoice #:</span> 
                    <span className="ml-2 font-mono text-sm bg-white px-2 py-1 rounded border">{order.id}</span>
                  </p>
                  <p>
                    <span className="font-semibold">Date:</span>{' '}
                    <span className="ml-2">{formatDate(order.createdAt)}</span>
                  </p>
                  <p className="flex items-center">
                    <span className="font-semibold">Status:</span>
                    <span
                      className={`ml-2 px-3 py-1 rounded-full text-sm font-bold ${
                        order.status === 'PAID'
                          ? 'bg-green-100 text-green-800 border border-green-200'
                          : order.status === 'PENDING'
                            ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                            : order.status === 'SHIPPED'
                              ? 'bg-blue-100 text-blue-800 border border-blue-200'
                              : order.status === 'DELIVERED'
                                ? 'bg-green-100 text-green-800 border border-green-200'
                                : 'bg-red-100 text-red-800 border border-red-200'
                      }`}
                    >
                      {order.status}
                    </span>
                  </p>
                  {order.stripeSessionId && (
                    <p>
                      <span className="font-semibold">Payment ID:</span>{' '}
                      <span className="ml-2 font-mono text-sm bg-white px-2 py-1 rounded border">{order.stripeSessionId}</span>
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Order Items Table */}
            <div className="mb-10">
              <h3 className="text-xl font-bold text-gray-900 mb-6 border-b border-gray-300 pb-2">
                Order Items:
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border-2 border-gray-300 rounded-lg overflow-hidden shadow-sm">
                  <thead>
                    <tr className="bg-gradient-to-r from-gray-100 to-gray-200">
                      <th className="border-2 border-gray-300 px-6 py-4 text-left text-sm font-bold text-gray-900">
                        Product
                      </th>
                      <th className="border-2 border-gray-300 px-6 py-4 text-center text-sm font-bold text-gray-900">
                        Quantity
                      </th>
                      <th className="border-2 border-gray-300 px-6 py-4 text-right text-sm font-bold text-gray-900">
                        Unit Price
                      </th>
                      <th className="border-2 border-gray-300 px-6 py-4 text-right text-sm font-bold text-gray-900">
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
                            index % 2 === 0 ? 'bg-white hover:bg-gray-50' : 'bg-gray-50 hover:bg-gray-100'
                          }
                        >
                          <td className="border-2 border-gray-300 px-6 py-4">
                            <div className="flex items-center space-x-4">
                              {firstImage && (
                                <img
                                  src={
                                    firstImage.startsWith('data:')
                                      ? firstImage
                                      : `data:image/jpeg;base64,${firstImage}`
                                  }
                                  alt={item.name}
                                  className="w-16 h-16 object-cover rounded-lg border-2 border-gray-200 shadow-sm"
                                />
                              )}
                              <div>
                                <p className="font-bold text-gray-900 text-lg">
                                  {item.name}
                                </p>
                                <p className="text-sm text-gray-500">Premium Quality Product</p>
                              </div>
                            </div>
                          </td>
                          <td className="border-2 border-gray-300 px-6 py-4 text-center">
                            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-bold text-lg">
                              {item.quantity}
                            </span>
                          </td>
                          <td className="border-2 border-gray-300 px-6 py-4 text-right text-gray-700 font-semibold text-lg">
                            {formatCurrency(item.price)}
                          </td>
                          <td className="border-2 border-gray-300 px-6 py-4 text-right font-bold text-gray-900 text-lg">
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
            <div className="flex justify-end mb-10">
              <div className="w-80">
                <div className="bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg p-6 border-2 border-gray-300 shadow-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-gray-900">Total:</span>
                    <span className="text-3xl font-bold text-gray-900 bg-white px-4 py-2 rounded-lg border-2 border-gray-300">
                      {formatCurrency(order.total)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-12 pt-8 border-t-2 border-gray-300 text-center">
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <p className="text-xl font-bold text-gray-900 mb-2">Thank you for your business!</p>
                <p className="text-gray-600 mb-4">
                  We appreciate your trust in Kload for your electronic needs.
                </p>
                <div className="flex justify-center space-x-8 text-sm text-gray-500">
                  <div>
                    <p className="font-semibold">Support</p>
                    <p>support@kload.com</p>
                  </div>
                  <div>
                    <p className="font-semibold">Phone</p>
                    <p>+1 (555) 123-4567</p>
                  </div>
                  <div>
                    <p className="font-semibold">Website</p>
                    <p>www.kload.com</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
