import React from 'react';
import { ProcessedDocument } from '../types';
import { FileText, AlertTriangle, Download } from 'lucide-react';

interface InvoiceTableProps {
  documents: ProcessedDocument[];
}

export const InvoiceTable: React.FC<InvoiceTableProps> = ({ documents }) => {
  const handleExportCSV = () => {
    if (documents.length === 0) return;

    const headers = ['Date', 'Invoice #', 'Vendor', 'Category', 'Amount', 'Currency', 'Terms', 'Status'];
    const csvRows = [headers.join(',')];

    documents.forEach(doc => {
        if (doc.status === 'completed' && doc.data) {
            // Escape quotes in strings and wrap fields in quotes
            const escape = (str: string | undefined) => `"${(str || '').replace(/"/g, '""')}"`;
            
            const row = [
                escape(doc.data.date),
                escape(doc.data.invoiceNumber),
                escape(doc.data.vendorName),
                escape(doc.data.category),
                doc.data.totalAmount,
                escape(doc.data.currency),
                escape(doc.data.paymentTerms),
                escape('Processed')
            ];
            csvRows.push(row.join(','));
        }
    });

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoices_export_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  if (documents.length === 0) {
    return (
        <div className="flex flex-col items-center justify-center h-96 text-center p-8 bg-white rounded-xl border border-slate-200">
            <FileText className="w-12 h-12 text-slate-300 mb-4" />
            <h3 className="text-lg font-medium text-slate-900">No invoices found</h3>
            <p className="text-slate-500 mt-2">Upload documents to populate this spreadsheet.</p>
        </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          onClick={handleExportCSV}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium shadow-sm"
        >
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </button>
      </div>
      
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-semibold text-slate-900">Date</th>
                <th className="px-6 py-4 font-semibold text-slate-900">Invoice #</th>
                <th className="px-6 py-4 font-semibold text-slate-900">Vendor</th>
                <th className="px-6 py-4 font-semibold text-slate-900">Category</th>
                <th className="px-6 py-4 font-semibold text-slate-900">Amount</th>
                <th className="px-6 py-4 font-semibold text-slate-900">Terms</th>
                <th className="px-6 py-4 font-semibold text-slate-900">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {documents.map((doc) => (
                <tr key={doc.id} className="hover:bg-slate-50 transition-colors">
                  {doc.status === 'completed' && doc.data ? (
                    <>
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-900">{doc.data.date}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-slate-500">{doc.data.invoiceNumber}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-slate-900 font-medium">{doc.data.vendorName}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                          {doc.data.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-900">
                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: doc.data.currency }).format(doc.data.totalAmount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-slate-500">
                        {doc.data.paymentTerms || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center text-xs font-medium text-emerald-600">
                          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-2"></span>
                          Processed
                        </span>
                      </td>
                    </>
                  ) : (
                    <>
                      <td colSpan={4} className="px-6 py-4 text-slate-500 italic">
                          {doc.fileName} - {doc.error ? 'Processing failed' : 'Processing...'}
                      </td>
                      <td className="px-6 py-4">-</td>
                      <td className="px-6 py-4">-</td>
                      <td className="px-6 py-4">
                          {doc.status === 'error' ? (
                              <span className="inline-flex items-center text-xs font-medium text-red-600">
                                  <AlertTriangle className="w-3 h-3 mr-1" /> Failed
                              </span>
                          ) : (
                              <span className="inline-flex items-center text-xs font-medium text-amber-600">
                                  Processing
                              </span>
                          )}
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};