export interface InvoiceData {
  invoiceNumber: string;
  date: string; // ISO YYYY-MM-DD
  vendorName: string;
  totalAmount: number;
  currency: string;
  category: string;
  taxAmount?: number;
  summary?: string;
  paymentTerms?: string;
}

export interface ProcessedDocument {
  id: string;
  fileName: string;
  status: 'processing' | 'completed' | 'error';
  uploadDate: number;
  data?: InvoiceData;
  error?: string;
}

export enum ViewState {
  DASHBOARD = 'DASHBOARD',
  UPLOAD = 'UPLOAD',
  DATA = 'DATA'
}