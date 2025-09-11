'use client';

import { useState } from 'react';
import { FileText, Download, X } from 'lucide-react';
import jsPDF from 'jspdf';

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
  stripeSessionId: string;
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
      
      // Create PDF with proper text rendering
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 20;
      const contentWidth = pageWidth - (2 * margin);
      
      let yPosition = margin;
      
      // Helper function to add text with proper font
      const addText = (text: string, x: number, y: number, options: any = {}) => {
        pdf.setFont('helvetica', options.style || 'normal');
        pdf.setFontSize(options.size || 12);
        pdf.setTextColor(options.color || '#000000');
        pdf.text(text, x, y);
      };
      
      // Helper function to add centered text
      const addCenteredText = (text: string, y: number, options: any = {}) => {
        pdf.setFont('helvetica', options.style || 'normal');
        pdf.setFontSize(options.size || 12);
        pdf.setTextColor(options.color || '#000000');
        const textWidth = pdf.getTextWidth(text);
        const x = (pageWidth - textWidth) / 2;
        pdf.text(text, x, y);
      };
      
      // Helper function to draw a line
      const drawLine = (x1: number, y1: number, x2: number, y2: number, color: string = '#000000') => {
        pdf.setDrawColor(color);
        pdf.line(x1, y1, x2, y2);
      };
      
      // Helper function to draw a rectangle
      const drawRect = (x: number, y: number, width: number, height: number, fillColor?: string, strokeColor?: string) => {
        if (fillColor) {
          pdf.setFillColor(fillColor);
          pdf.rect(x, y, width, height, 'F');
        }
        if (strokeColor) {
          pdf.setDrawColor(strokeColor);
          pdf.rect(x, y, width, height, 'S');
        }
      };
      
      // Header - Company Logo and Name
      yPosition += 10;
      
      // Draw logo circle
      const logoSize = 15;
      const logoX = (pageWidth - logoSize) / 2;
      pdf.setFillColor('#000000');
      pdf.circle(logoX + logoSize/2, yPosition + logoSize/2, logoSize/2, 'F');
      
      // Add "K" in logo
      pdf.setTextColor('#FFFFFF');
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      const kWidth = pdf.getTextWidth('K');
      pdf.text('K', logoX + logoSize/2 - kWidth/2, yPosition + logoSize/2 + 2);
      
      yPosition += logoSize + 5;
      
      // Company name
      addCenteredText('Kload', yPosition, { size: 24, style: 'bold', color: '#111827' });
      yPosition += 8;
      addCenteredText('Premium E-commerce Store', yPosition, { size: 14, color: '#4b5563' });
      yPosition += 10;
      
      // Company tagline box
      const taglineY = yPosition;
      const taglineHeight = 15;
      drawRect(margin, taglineY, contentWidth, taglineHeight, '#f9fafb', '#e5e7eb');
      addCenteredText('Your One-Stop Electronic Market', taglineY + 6, { size: 12, style: 'bold', color: '#1f2937' });
      addCenteredText('Quality Electronics • Fast Delivery • 24/7 Support', taglineY + 11, { size: 10, color: '#4b5563' });
      yPosition += taglineHeight + 15;
      
      // Bill To and Invoice Details
      const sectionWidth = (contentWidth - 10) / 2;
      
      // Bill To section
      drawRect(margin, yPosition, sectionWidth, 25, '#f9fafb', '#e5e7eb');
      addText('Bill To:', margin + 5, yPosition + 8, { size: 12, style: 'bold', color: '#111827' });
      
      if (order.user) {
        addText(`${order.user.firstName} ${order.user.lastName}`, margin + 5, yPosition + 15, { size: 11, style: 'bold', color: '#111827' });
        addText(order.user.email, margin + 5, yPosition + 20, { size: 10, color: '#4b5563' });
      } else {
        addText('Guest Customer', margin + 5, yPosition + 15, { size: 10, color: '#6b7280' });
      }
      
      // Invoice Details section
      const invoiceX = margin + sectionWidth + 10;
      drawRect(invoiceX, yPosition, sectionWidth, 25, '#f9fafb', '#e5e7eb');
      addText('Invoice Details:', invoiceX + 5, yPosition + 8, { size: 12, style: 'bold', color: '#111827' });
      
      let detailY = yPosition + 12;
      addText(`Invoice #: ${order.id}`, invoiceX + 5, detailY, { size: 9, color: '#111827' });
      detailY += 4;
      addText(`Date: ${formatDate(order.createdAt)}`, invoiceX + 5, detailY, { size: 9, color: '#111827' });
      detailY += 4;
      
      // Status badge
      const statusText = order.status;
      const statusColor = order.status === 'PAID' ? '#166534' : 
                         order.status === 'PENDING' ? '#854d0e' : 
                         order.status === 'SHIPPED' ? '#1e40af' : '#991b1b';
      const statusBg = order.status === 'PAID' ? '#dcfce7' : 
                      order.status === 'PENDING' ? '#fef3c7' : 
                      order.status === 'SHIPPED' ? '#dbeafe' : '#fee2e2';
      
      // Draw status badge background
      const statusWidth = pdf.getTextWidth(statusText) + 4;
      drawRect(invoiceX + 5, detailY - 2, statusWidth, 5, statusBg);
      addText(statusText, invoiceX + 7, detailY, { size: 8, style: 'bold', color: statusColor });
      
      if (order.stripeSessionId) {
        detailY += 4;
        addText(`Payment ID: ${order.stripeSessionId}`, invoiceX + 5, detailY, { size: 9, color: '#111827' });
      }
      
      yPosition += 35;
      
      // Order Items Table
      addText('Order Items:', margin, yPosition, { size: 14, style: 'bold', color: '#111827' });
      yPosition += 8;
      
      // Table header
      const tableY = yPosition;
      const rowHeight = 8;
      const col1Width = contentWidth * 0.5;
      const col2Width = contentWidth * 0.15;
      const col3Width = contentWidth * 0.175;
      const col4Width = contentWidth * 0.175;
      
      // Header background
      drawRect(margin, tableY, contentWidth, rowHeight, '#f3f4f6', '#d1d5db');
      
      // Header text
      addText('Product', margin + 2, tableY + 5, { size: 10, style: 'bold', color: '#111827' });
      addText('Quantity', margin + col1Width + 2, tableY + 5, { size: 10, style: 'bold', color: '#111827' });
      addText('Unit Price', margin + col1Width + col2Width + 2, tableY + 5, { size: 10, style: 'bold', color: '#111827' });
      addText('Total', margin + col1Width + col2Width + col3Width + 2, tableY + 5, { size: 10, style: 'bold', color: '#111827' });
      
      yPosition += rowHeight;
      
      // Table rows
      order.items.forEach((item, index) => {
        const rowY = yPosition + (index * rowHeight);
        
        // Alternate row background
        if (index % 2 === 0) {
          drawRect(margin, rowY, contentWidth, rowHeight, '#ffffff');
        } else {
          drawRect(margin, rowY, contentWidth, rowHeight, '#f9fafb');
        }
        
        // Product name
        addText(item.name, margin + 2, rowY + 5, { size: 9, color: '#111827' });
        
        // Quantity badge
        const qtyText = item.quantity.toString();
        const qtyWidth = pdf.getTextWidth(qtyText) + 2;
        drawRect(margin + col1Width + 1, rowY + 1, qtyWidth, 6, '#dbeafe');
        addText(qtyText, margin + col1Width + 2, rowY + 4, { size: 8, style: 'bold', color: '#1e40af' });
        
        // Unit price
        addText(formatCurrency(item.price), margin + col1Width + col2Width + 2, rowY + 5, { size: 9, color: '#111827' });
        
        // Total
        addText(formatCurrency(item.price * item.quantity), margin + col1Width + col2Width + col3Width + 2, rowY + 5, { size: 9, style: 'bold', color: '#111827' });
        
        // Row border
        drawLine(margin, rowY + rowHeight, margin + contentWidth, rowY + rowHeight, '#d1d5db');
      });
      
      yPosition += (order.items.length * rowHeight) + 10;
      
      // Total section
      const totalY = yPosition;
      const totalWidth = 60;
      const totalX = margin + contentWidth - totalWidth;
      
      drawRect(totalX, totalY, totalWidth, 12, '#f9fafb', '#e5e7eb');
      addText('Total:', totalX + 5, totalY + 5, { size: 12, style: 'bold', color: '#111827' });
      addText(formatCurrency(order.total), totalX + 5, totalY + 9, { size: 14, style: 'bold', color: '#111827' });
      
      yPosition += 25;
      
      // Footer
      drawLine(margin, yPosition, margin + contentWidth, yPosition, '#d1d5db');
      yPosition += 10;
      
      // Thank you message
      drawRect(margin, yPosition, contentWidth, 20, '#f3f4f6', '#e5e7eb');
      addCenteredText('Thank you for your business!', yPosition + 6, { size: 12, style: 'bold', color: '#111827' });
      addCenteredText('We appreciate your trust in Kload for your electronic needs.', yPosition + 11, { size: 10, color: '#4b5563' });
      
      yPosition += 25;
      
      // Contact information
      const contactWidth = contentWidth / 3;
      const contactBoxHeight = 15;
      
      // Support
      drawRect(margin, yPosition, contactWidth - 5, contactBoxHeight, '#ffffff', '#e5e7eb');
      addText('Support', margin + 2, yPosition + 4, { size: 9, style: 'bold', color: '#111827' });
      addText('support@kload.com', margin + 2, yPosition + 8, { size: 8, color: '#4b5563' });
      
      // Phone
      drawRect(margin + contactWidth, yPosition, contactWidth - 5, contactBoxHeight, '#ffffff', '#e5e7eb');
      addText('Phone', margin + contactWidth + 2, yPosition + 4, { size: 9, style: 'bold', color: '#111827' });
      addText('+1 (555) 123-4567', margin + contactWidth + 2, yPosition + 8, { size: 8, color: '#4b5563' });
      
      // Website
      drawRect(margin + (contactWidth * 2), yPosition, contactWidth - 5, contactBoxHeight, '#ffffff', '#e5e7eb');
      addText('Website', margin + (contactWidth * 2) + 2, yPosition + 4, { size: 9, style: 'bold', color: '#111827' });
      addText('www.kload.com', margin + (contactWidth * 2) + 2, yPosition + 8, { size: 8, color: '#4b5563' });

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
          <div id="invoice-content" className="p-8 bg-white max-w-4xl mx-auto shadow-lg rounded-lg border border-gray-200">
            {/* Company Header */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center mb-4">
                <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mr-4">
                  <span className="text-white font-bold text-2xl">K</span>
                </div>
                <div className="text-left">
                  <h1 className="text-4xl font-bold text-gray-900">Kload</h1>
                  <p className="text-lg text-gray-600">Premium E-commerce Store</p>
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                <p className="text-gray-800 font-semibold text-base">Your One-Stop Electronic Market</p>
                <p className="text-sm text-gray-600 mt-1">Quality Electronics • Fast Delivery • 24/7 Support</p>
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
                      <th className="border border-gray-300 px-4 py-3 text-left text-sm font-bold text-gray-900" style={{width: '50%'}}>
                        Product
                      </th>
                      <th className="border border-gray-300 px-4 py-3 text-center text-sm font-bold text-gray-900" style={{width: '15%'}}>
                        Quantity
                      </th>
                      <th className="border border-gray-300 px-4 py-3 text-right text-sm font-bold text-gray-900" style={{width: '17.5%'}}>
                        Unit Price
                      </th>
                      <th className="border border-gray-300 px-4 py-3 text-right text-sm font-bold text-gray-900" style={{width: '17.5%'}}>
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items.map((item, index) => {
                      const firstImage = getFirstImage(item.image);
                      return (
                        <tr key={item.id} className="bg-white">
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
                                  className="w-12 h-12 object-cover rounded border border-gray-200 flex-shrink-0"
                                />
                              )}
                              <div className="flex-1">
                                <p className="font-semibold text-gray-900 text-sm leading-tight whitespace-nowrap overflow-hidden text-ellipsis">
                                  {item.name}
                                </p>
                                <p className="text-xs text-gray-500 mt-1 whitespace-nowrap overflow-hidden text-ellipsis">Premium Quality Product</p>
                              </div>
                            </div>
                          </td>
                          <td className="border border-gray-300 px-4 py-3 text-center">
                            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-bold">
                              {item.quantity}
                            </span>
                          </td>
                          <td className="border border-gray-300 px-4 py-3 text-right text-gray-700 font-semibold text-sm">
                            {formatCurrency(item.price)}
                          </td>
                          <td className="border border-gray-300 px-4 py-3 text-right font-bold text-gray-900 text-sm">
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
