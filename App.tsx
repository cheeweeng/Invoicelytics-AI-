import React, { useState } from 'react';
import { LayoutDashboard, Upload, Table as TableIcon, FileText } from 'lucide-react';
import { Dashboard } from './components/Dashboard';
import { UploadSection } from './components/UploadSection';
import { InvoiceTable } from './components/InvoiceTable';
import { ProcessedDocument, ViewState } from './types';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.DASHBOARD);
  const [documents, setDocuments] = useState<ProcessedDocument[]>([]);

  const handleDocumentProcessed = (doc: ProcessedDocument) => {
    setDocuments(prev => [doc, ...prev]);
  };

  const renderContent = () => {
    switch (currentView) {
      case ViewState.DASHBOARD:
        return <Dashboard documents={documents} />;
      case ViewState.UPLOAD:
        return <UploadSection onProcessingComplete={handleDocumentProcessed} />;
      case ViewState.DATA:
        return <InvoiceTable documents={documents} />;
      default:
        return <Dashboard documents={documents} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white fixed h-full flex flex-col shadow-xl z-10">
        <div className="p-6 border-b border-slate-800 flex items-center space-x-3">
          <div className="bg-indigo-500 p-2 rounded-lg">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">DocuFlow</span>
        </div>

        <nav className="flex-1 p-4 space-y-2 mt-4">
          <button
            onClick={() => setCurrentView(ViewState.DASHBOARD)}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
              currentView === ViewState.DASHBOARD 
                ? 'bg-indigo-600 text-white shadow-md' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span className="font-medium">Overview</span>
          </button>

          <button
            onClick={() => setCurrentView(ViewState.UPLOAD)}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
              currentView === ViewState.UPLOAD 
                ? 'bg-indigo-600 text-white shadow-md' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Upload className="w-5 h-5" />
            <span className="font-medium">Upload Invoices</span>
          </button>

          <button
            onClick={() => setCurrentView(ViewState.DATA)}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
              currentView === ViewState.DATA 
                ? 'bg-indigo-600 text-white shadow-md' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <TableIcon className="w-5 h-5" />
            <span className="font-medium">Data Spreadsheet</span>
          </button>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="bg-slate-800 rounded-lg p-4">
            <p className="text-xs text-slate-400 mb-2">Storage Used</p>
            <div className="w-full bg-slate-700 rounded-full h-1.5 mb-2">
              <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: '45%' }}></div>
            </div>
            <p className="text-xs text-slate-500">{documents.length} documents processed</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              {currentView === ViewState.DASHBOARD && 'Managerial Dashboard'}
              {currentView === ViewState.UPLOAD && 'Document Ingestion'}
              {currentView === ViewState.DATA && 'Extracted Data Ledger'}
            </h1>
            <p className="text-slate-500 mt-1">
              {currentView === ViewState.DASHBOARD && 'Track your spending KPIs and vendor analytics.'}
              {currentView === ViewState.UPLOAD && 'AI-powered extraction for PDF and Image invoices.'}
              {currentView === ViewState.DATA && 'Review and export your structured invoice data.'}
            </p>
          </div>
          <div className="flex items-center space-x-4">
             <div className="flex items-center space-x-2 bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-xs font-medium text-slate-600">System Operational</span>
             </div>
          </div>
        </header>

        {renderContent()}
      </main>
    </div>
  );
};

export default App;
