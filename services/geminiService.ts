import { GoogleGenAI, Type } from "@google/genai";
import { InvoiceData } from "../types";

// Initialize Gemini Client
// Note: API_KEY is injected via environment variable as per instructions
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const INVOICE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    invoiceNumber: {
      type: Type.STRING,
      description: "The unique identifier/number of the invoice.",
    },
    date: {
      type: Type.STRING,
      description: "The date of the invoice in YYYY-MM-DD format.",
    },
    vendorName: {
      type: Type.STRING,
      description: "The name of the vendor or company issuing the invoice.",
    },
    totalAmount: {
      type: Type.NUMBER,
      description: "The total final amount due on the invoice, including all taxes and charges.",
    },
    currency: {
      type: Type.STRING,
      description: "The currency code (e.g., USD, EUR, GBP).",
    },
    category: {
      type: Type.STRING,
      description: "The operational category of the expense (e.g., Software, Hardware, Office Supplies, Utilities, Consulting, Travel).",
    },
    taxAmount: {
      type: Type.NUMBER,
      description: "The total tax amount if available.",
    },
    summary: {
      type: Type.STRING,
      description: "A brief 1-sentence summary of what was purchased.",
    },
    paymentTerms: {
      type: Type.STRING,
      description: "The payment terms found on the invoice (e.g., 'Net 30', 'Due on Receipt', 'Due in 15 days') or the specific due date.",
    },
  },
  required: ["invoiceNumber", "date", "vendorName", "totalAmount", "currency", "category", "paymentTerms"],
};

export const extractInvoiceData = async (
  base64Data: string,
  mimeType: string
): Promise<InvoiceData> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Data,
            },
          },
          {
            text: "Analyze this document. It is a vendor invoice. Extract the key data points according to the schema provided. If the document is not an invoice, try to map it as best as possible or return generic values.",
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: INVOICE_SCHEMA,
        temperature: 0.1, // Low temperature for factual extraction
      },
    });

    const text = response.text;
    if (!text) {
        throw new Error("No text returned from Gemini");
    }

    const data = JSON.parse(text) as InvoiceData;
    return data;

  } catch (error) {
    console.error("Error extracting invoice data:", error);
    throw error;
  }
};

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Remove the Data-URL prefix (e.g., "data:application/pdf;base64,")
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
  });
};