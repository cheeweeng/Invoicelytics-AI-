import React, { useCallback, useState } from 'react';
import { UploadCloud, File as FileIcon, X, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { extractInvoiceData, fileToBase64 } from '../services/geminiService';
import { ProcessedDocument } from '../types';

interface UploadSectionProps {
  onProcessingComplete: (doc: ProcessedDocument) => void;
}

export const UploadSection: React.FC<UploadSectionProps> = ({ onProcessingComplete }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [processingQueue, setProcessingQueue] = useState<{name: string, status: 'pending' | 'processing' | 'done' | 'error'}[]>([]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const processFile = async (file: File) => {
    const queueItem = { name: file.name, status: 'processing' as const };
    setProcessingQueue(prev => [...prev, queueItem]);

    const newDocId = Math.random().toString(36).substring(7);
    
    try {
      // 1. Convert to Base64
      const base64 = await fileToBase64(file);
      
      // 2. Send to Gemini
      const extractedData = await extractInvoiceData(base64, file.type);

      // 3. Create Document Object
      const doc: ProcessedDocument = {
        id: newDocId,
        fileName: file.name,
        status: 'completed',
        uploadDate: Date.now(),
        data: extractedData
      };

      onProcessingComplete(doc);
      setProcessingQueue(prev => prev.map(item => item.name === file.name ? { ...item, status: 'done' } : item));
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setProcessingQueue(prev => prev.filter(item => item.name !== file.name));
      }, 3000);

    } catch (error) {
      console.error(error);
      const errorDoc: ProcessedDocument = {
        id: newDocId,
        fileName: file.name,
        status: 'error',
        uploadDate: Date.now(),
        error: "Failed to process document"
      };
      onProcessingComplete(errorDoc);
      setProcessingQueue(prev => prev.map(item => item.name === file.name ? { ...item, status: 'error' } : item));
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files: File[] = Array.from(e.dataTransfer.files);
    const validTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
    
    files.forEach(file => {
        if (validTypes.includes(file.type)) {
            processFile(file);
        } else {
            alert(`File ${file.name} is not a supported format (PDF, PNG, JPEG only)`);
        }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
        const files = Array.from(e.target.files);
        files.forEach(processFile);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div 
        className={`
            relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 ease-in-out
            ${isDragging ? 'border-indigo-500 bg-indigo-50/50' : 'border-slate-200 hover:border-indigo-400 bg-white'}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input 
          type="file" 
          multiple 
          accept=".pdf,.png,.jpg,.jpeg"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          onChange={handleFileInput}
        />
        
        <div className="flex flex-col items-center justify-center pointer-events-none">
          <div className="bg-indigo-100 p-4 rounded-full mb-4 text-indigo-600">
            <UploadCloud className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-semibold text-slate-900 mb-2">
            Upload Invoices
          </h3>
          <p className="text-slate-500 mb-6 max-w-sm">
            Drag & drop PDFs or images here, or click to browse. We support PDF, PNG, and JPG.
          </p>
          <button className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors shadow-sm">
            Browse Files
          </button>
        </div>
      </div>

      {/* Processing Status */}
      {processingQueue.length > 0 && (
        <div className="mt-8 space-y-3">
          <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">Processing Queue</h4>
          {processingQueue.map((item, idx) => (
            <div key={`${item.name}-${idx}`} className="flex items-center justify-between bg-white p-4 rounded-lg border border-slate-100 shadow-sm">
                <div className="flex items-center space-x-3">
                    <FileIcon className="w-5 h-5 text-slate-400" />
                    <span className="text-sm font-medium text-slate-700">{item.name}</span>
                </div>
                <div className="flex items-center">
                    {item.status === 'processing' && (
                        <div className="flex items-center text-indigo-600 text-sm">
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Analyzing...
                        </div>
                    )}
                    {item.status === 'done' && (
                        <div className="flex items-center text-emerald-600 text-sm">
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            Complete
                        </div>
                    )}
                    {item.status === 'error' && (
                        <div className="flex items-center text-red-500 text-sm">
                            <AlertCircle className="w-4 h-4 mr-2" />
                            Error
                        </div>
                    )}
                </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};