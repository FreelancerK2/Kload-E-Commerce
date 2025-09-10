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
          if (element.tagName === 'SCRIPT' || element.tagName === 'STYLE') {
            return true;
          }
          // Skip elements with oklch colors (cast to HTMLElement to access style property)
          const htmlElement = element as HTMLElement;
          if (htmlElement.style && htmlElement.style.color && htmlElement.style.color.includes('oklch')) {
            return true;
          }
          return false;
        },
        onclone: (clonedDoc) => {
          // Create a comprehensive style override that maintains design but uses safe colors
          const style = clonedDoc.createElement('style');
          style.textContent = `
            /* Base styles with safe colors - prevent oklch issues */
            * {
              color: #111827 !important;
            }
            
            body, html { 
              font-family: Arial, sans-serif !important; 
              margin: 0 !important; 
              padding: 0 !important; 
              color: #111827 !important;
            }
            
            /* Invoice container - clean professional design */
            #invoice-content { 
              padding: 24px !important; 
              background: white !important; 
              max-width: 800px !important; 
              margin: 0 auto !important; 
              font-size: 12px !important;
              line-height: 1.3 !important;
            }
            
            /* Header styles - clean spacing */
            .text-center { text-align: center !important; }
            .mb-10 { margin-bottom: 20px !important; }
            .mb-8 { margin-bottom: 16px !important; }
            .mb-6 { margin-bottom: 12px !important; }
            .mb-5 { margin-bottom: 10px !important; }
            .mb-4 { margin-bottom: 8px !important; }
            .mb-3 { margin-bottom: 6px !important; }
            .mb-2 { margin-bottom: 4px !important; }
            .mb-1 { margin-bottom: 2px !important; }
            .mt-8 { margin-top: 16px !important; }
            .mt-6 { margin-top: 12px !important; }
            .mt-5 { margin-top: 10px !important; }
            .pt-6 { padding-top: 12px !important; }
            .pt-4 { padding-top: 8px !important; }
            .pt-3 { padding-top: 6px !important; }
            
            /* Logo and company name - clean sizing */
            .w-12 { width: 36px !important; }
            .h-12 { height: 36px !important; }
            .w-14 { width: 42px !important; }
            .h-14 { height: 42px !important; }
            .w-16 { width: 48px !important; }
            .h-16 { height: 48px !important; }
            .w-20 { width: 56px !important; }
            .h-20 { height: 56px !important; }
            .bg-black { background: #000000 !important; }
            .bg-gradient-to-br { background: #000000 !important; }
            .rounded-full { border-radius: 50% !important; }
            .rounded-xl { border-radius: 6px !important; }
            .text-white { color: #ffffff !important; }
            .text-lg { font-size: 12px !important; }
            .text-xl { font-size: 14px !important; }
            .text-2xl { font-size: 16px !important; }
            .text-3xl { font-size: 18px !important; }
            .font-bold { font-weight: bold !important; }
            .text-4xl { font-size: 20px !important; }
            .text-5xl { font-size: 22px !important; }
            
            /* Force all colors to use standard hex values to avoid oklch issues */
            * { 
              color: inherit !important; 
            }
            
            /* Override any oklch colors that might be generated by Tailwind */
            [style*="oklch"] { 
              color: #111827 !important; 
            }
            
            /* Ensure all text elements use standard colors */
            h1, h2, h3, h4, h5, h6, p, span, div, td, th { 
              color: #111827 !important; 
            }
            
            /* Text colors - using standard hex colors */
            .text-gray-900, .text-gray-900 * { color: #111827 !important; }
            .text-gray-600, .text-gray-600 * { color: #4b5563 !important; }
            .text-gray-500, .text-gray-500 * { color: #6b7280 !important; }
            .text-gray-700, .text-gray-700 * { color: #374151 !important; }
            .text-gray-800, .text-gray-800 * { color: #1f2937 !important; }
            .text-white, .text-white * { color: #ffffff !important; }
            
            /* Background colors - using standard hex colors */
            .bg-gray-50, .bg-gray-50 * { background: #f9fafb !important; }
            .bg-gray-100, .bg-gray-100 * { background: #f3f4f6 !important; }
            .bg-gray-200, .bg-gray-200 * { background: #e5e7eb !important; }
            .bg-blue-100, .bg-blue-100 * { background: #dbeafe !important; }
            .bg-green-100, .bg-green-100 * { background: #dcfce7 !important; }
            .bg-yellow-100, .bg-yellow-100 * { background: #fef3c7 !important; }
            .bg-red-100, .bg-red-100 * { background: #fee2e2 !important; }
            .bg-black, .bg-black * { background: #000000 !important; }
            
            /* Text colors for badges - using standard hex colors */
            .text-blue-800, .text-blue-800 * { color: #1e40af !important; }
            .text-green-800, .text-green-800 * { color: #166534 !important; }
            .text-yellow-800, .text-yellow-800 * { color: #854d0e !important; }
            .text-red-800, .text-red-800 * { color: #991b1b !important; }
            
            /* Borders */
            .border { border: 1px solid #d1d5db !important; }
            .border-2 { border: 2px solid #d1d5db !important; }
            .border-gray-200 { border-color: #e5e7eb !important; }
            .border-gray-300 { border-color: #d1d5db !important; }
            .border-t { border-top: 1px solid #d1d5db !important; }
            .border-t-2 { border-top: 2px solid #d1d5db !important; }
            .border-b { border-bottom: 1px solid #d1d5db !important; }
            .border-b-2 { border-bottom: 2px solid #d1d5db !important; }
            
            /* Padding and margins - clean spacing */
            .p-3 { padding: 6px !important; }
            .p-4 { padding: 8px !important; }
            .p-6 { padding: 12px !important; }
            .p-8 { padding: 16px !important; }
            .px-3 { padding-left: 6px !important; padding-right: 6px !important; }
            .px-4 { padding-left: 8px !important; padding-right: 8px !important; }
            .px-6 { padding-left: 12px !important; padding-right: 12px !important; }
            .py-1 { padding-top: 2px !important; padding-bottom: 2px !important; }
            .py-2 { padding-top: 4px !important; padding-bottom: 4px !important; }
            .py-3 { padding-top: 6px !important; padding-bottom: 6px !important; }
            .py-4 { padding-top: 8px !important; padding-bottom: 8px !important; }
            .pb-2 { padding-bottom: 4px !important; }
            .space-y-1 > * + * { margin-top: 2px !important; }
            .space-y-2 > * + * { margin-top: 4px !important; }
            
            /* Layout */
            .grid { display: grid !important; }
            .grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)) !important; }
            .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
            .gap-8 { gap: 32px !important; }
            .flex { display: flex !important; }
            .items-center { align-items: center !important; }
            .justify-center { justify-content: center !important; }
            .justify-end { justify-content: flex-end !important; }
            .justify-between { justify-content: space-between !important; }
            .space-x-4 > * + * { margin-left: 16px !important; }
            .space-x-8 > * + * { margin-left: 32px !important; }
            .space-y-2 > * + * { margin-top: 8px !important; }
            .text-left { text-align: left !important; }
            .text-right { text-align: right !important; }
            .text-center { text-align: center !important; }
            
            /* Table styles */
            .w-full { width: 100% !important; }
            .border-collapse { border-collapse: collapse !important; }
            .overflow-x-auto { overflow-x: auto !important; }
            .rounded-lg { border-radius: 8px !important; }
            .shadow-sm { box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05) !important; }
            
            /* Image styles - clean sizing */
            .w-16 { width: 40px !important; }
            .h-16 { height: 40px !important; }
            .w-12 { width: 32px !important; }
            .h-12 { height: 32px !important; }
            .object-cover { object-fit: cover !important; }
            .rounded-lg { border-radius: 4px !important; }
            .rounded { border-radius: 4px !important; }
            
            /* Badge styles */
            .rounded-full { border-radius: 9999px !important; }
            .px-2 { padding-left: 8px !important; padding-right: 8px !important; }
            .px-3 { padding-left: 12px !important; padding-right: 12px !important; }
            .px-4 { padding-left: 16px !important; padding-right: 16px !important; }
            .py-1 { padding-top: 2px !important; padding-bottom: 2px !important; }
            .text-sm { font-size: 14px !important; }
            .font-semibold { font-weight: 600 !important; }
            .font-medium { font-weight: 500 !important; }
            
            /* Specific overrides to prevent oklch */
            * { 
              background-image: none !important; 
              background: inherit !important; 
            }
          `;
          clonedDoc.head.appendChild(style);
        }
      });
      
      console.log('✅ Canvas created:', canvas.width, 'x', canvas.height);

      // Create PDF - Force single page
      console.log('🔄 Creating PDF...');
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');

      const imgWidth = 210; // A4 width in mm
      const pageHeight = 295; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Scale down the image to fit on one page if it's too tall
      let finalWidth = imgWidth;
      let finalHeight = imgHeight;
      
      if (imgHeight > pageHeight) {
        // Scale down proportionally to fit on one page
        const scale = pageHeight / imgHeight;
        finalHeight = pageHeight;
        finalWidth = imgWidth * scale;
      }

      // Center the image on the page
      const xOffset = (imgWidth - finalWidth) / 2;
      const yOffset = (pageHeight - finalHeight) / 2;

      pdf.addImage(imgData, 'PNG', xOffset, yOffset, finalWidth, finalHeight);

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
          <div id="invoice-content" className="p-6 bg-white max-w-4xl mx-auto">
            {/* Company Header */}
            <div className="text-center mb-6">
              <div className="flex items-center justify-center mb-3">
                <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center mr-3">
                  <span className="text-white font-bold text-xl">K</span>
                </div>
                <div className="text-left">
                  <h1 className="text-3xl font-bold text-gray-900">Kload</h1>
                  <p className="text-base text-gray-600">Premium E-commerce Store</p>
                </div>
              </div>
              <div className="bg-gray-100 p-3 rounded-lg border border-gray-200">
                <p className="text-gray-700 font-medium text-sm">Your One-Stop Electronic Market</p>
                <p className="text-xs text-gray-500 mt-1">Quality Electronics • Fast Delivery • 24/7 Support</p>
              </div>
            </div>

            {/* Bill To and Invoice Details - Side by Side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Bill To Section */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h3 className="text-base font-bold text-gray-900 mb-2">Bill To:</h3>
                {order.user ? (
                  <div className="text-gray-700">
                    <p className="font-semibold text-base">
                      {order.user.firstName} {order.user.lastName}
                    </p>
                    <p className="text-gray-600 text-sm">{order.user.email}</p>
                  </div>
                ) : (
                  <p className="text-gray-500 font-medium text-sm">Guest Customer</p>
                )}
              </div>

              {/* Invoice Details Section */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h3 className="text-base font-bold text-gray-900 mb-2">Invoice Details:</h3>
                <div className="text-gray-700 space-y-1">
                  <p className="text-sm">
                    <span className="font-semibold">Invoice #:</span> 
                    <span className="ml-2 font-mono text-xs">{order.id}</span>
                  </p>
                  <p className="text-sm">
                    <span className="font-semibold">Date:</span>{' '}
                    <span className="ml-2">{formatDate(order.createdAt)}</span>
                  </p>
                  <p className="flex items-center text-sm">
                    <span className="font-semibold">Status:</span>
                    <span
                      className={`ml-2 px-2 py-1 rounded text-xs font-bold ${
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
                    <p className="text-sm">
                      <span className="font-semibold">Payment ID:</span>{' '}
                      <span className="ml-2 font-mono text-xs">{order.stripeSessionId}</span>
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Order Items Table */}
            <div className="mb-6">
              <h3 className="text-base font-bold text-gray-900 mb-2">Order Items:</h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300 rounded-lg overflow-hidden">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 px-3 py-2 text-left text-xs font-bold text-gray-900">
                        Product
                      </th>
                      <th className="border border-gray-300 px-3 py-2 text-center text-xs font-bold text-gray-900">
                        Quantity
                      </th>
                      <th className="border border-gray-300 px-3 py-2 text-right text-xs font-bold text-gray-900">
                        Unit Price
                      </th>
                      <th className="border border-gray-300 px-3 py-2 text-right text-xs font-bold text-gray-900">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items.map((item, index) => {
                      const firstImage = getFirstImage(item.image);
                      return (
                        <tr key={item.id} className="bg-white">
                          <td className="border border-gray-300 px-3 py-2">
                            <div className="flex items-center space-x-2">
                              {firstImage && (
                                <img
                                  src={
                                    firstImage.startsWith('data:')
                                      ? firstImage
                                      : `data:image/jpeg;base64,${firstImage}`
                                  }
                                  alt={item.name}
                                  className="w-10 h-10 object-cover rounded border border-gray-200"
                                />
                              )}
                              <div>
                                <p className="font-semibold text-gray-900 text-sm">
                                  {item.name}
                                </p>
                                <p className="text-xs text-gray-500">Premium Quality Product</p>
                              </div>
                            </div>
                          </td>
                          <td className="border border-gray-300 px-3 py-2 text-center">
                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-bold">
                              {item.quantity}
                            </span>
                          </td>
                          <td className="border border-gray-300 px-3 py-2 text-right text-gray-700 font-semibold text-sm">
                            {formatCurrency(item.price)}
                          </td>
                          <td className="border border-gray-300 px-3 py-2 text-right font-bold text-gray-900 text-sm">
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
            <div className="flex justify-end mb-6">
              <div className="text-right bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="flex items-center space-x-3">
                  <span className="text-lg font-bold text-gray-900">Total:</span>
                  <span className="text-xl font-bold text-gray-900">
                    {formatCurrency(order.total)}
                  </span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-6 pt-4 border-t border-gray-300 text-center">
              <div className="bg-gray-100 p-4 rounded-lg">
                <p className="text-base font-bold text-gray-900 mb-1">Thank you for your business!</p>
                <p className="text-gray-600 mb-3 text-sm">
                  We appreciate your trust in Kload for your electronic needs.
                </p>
                <div className="flex justify-center space-x-6 text-xs text-gray-500">
                  <div className="bg-white p-2 rounded border border-gray-200">
                    <p className="font-semibold">Support</p>
                    <p>support@kload.com</p>
                  </div>
                  <div className="bg-white p-2 rounded border border-gray-200">
                    <p className="font-semibold">Phone</p>
                    <p>+1 (555) 123-4567</p>
                  </div>
                  <div className="bg-white p-2 rounded border border-gray-200">
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
