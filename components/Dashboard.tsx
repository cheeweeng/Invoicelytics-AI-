import React, { useMemo, useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, Legend 
} from 'recharts';
import { ProcessedDocument } from '../types';
import { KPICard } from './KPICard';
import { DollarSign, CreditCard, PieChart as PieIcon, Activity, Globe } from 'lucide-react';

interface DashboardProps {
  documents: ProcessedDocument[];
}

const COLORS = ['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#8b5cf6', '#0ea5e9'];

// Approximate exchange rates relative to USD (Base = 1.0)
// In a real production app, these would be fetched from a live Forex API
const EXCHANGE_RATES: Record<string, number> = {
  'USD': 1.0,
  'SGD': 1.34,
  'EUR': 0.92,
  'GBP': 0.79,
  'AUD': 1.52,
  'CAD': 1.35,
  'JPY': 150.0,
  'CNY': 7.20,
  'INR': 83.0
};

const SUPPORTED_CURRENCIES = Object.keys(EXCHANGE_RATES);

export const Dashboard: React.FC<DashboardProps> = ({ documents }) => {
  const [displayCurrency, setDisplayCurrency] = useState<string>('USD');
  
  const validDocs = documents.filter(d => d.status === 'completed' && d.data);

  // Helper to convert any amount to the selected display currency
  const convertAmount = (amount: number, fromCurrency: string): number => {
    const normalizeCurrency = (c: string) => c?.toUpperCase().trim() || 'USD';
    const fromRate = EXCHANGE_RATES[normalizeCurrency(fromCurrency)] || 1.0;
    const toRate = EXCHANGE_RATES[displayCurrency];

    // Convert to USD first (Base), then to Target
    const amountInUSD = amount / fromRate;
    return amountInUSD * toRate;
  };

  const kpis = useMemo(() => {
    const totalSpend = validDocs.reduce((sum, doc) => {
      const amount = doc.data?.totalAmount || 0;
      const currency = doc.data?.currency || 'USD';
      return sum + convertAmount(amount, currency);
    }, 0);

    const uniqueVendors = new Set(validDocs.map(d => d.data?.vendorName)).size;
    const invoiceCount = validDocs.length;
    
    const avgSpend = invoiceCount > 0 ? totalSpend / invoiceCount : 0;

    return {
      totalSpend,
      uniqueVendors,
      invoiceCount,
      avgSpend
    };
  }, [validDocs, displayCurrency]);

  const categoryData = useMemo(() => {
    const catMap: Record<string, number> = {};
    validDocs.forEach(doc => {
      const cat = doc.data?.category || 'Uncategorized';
      const amount = doc.data?.totalAmount || 0;
      const currency = doc.data?.currency || 'USD';
      const convertedAmount = convertAmount(amount, currency);
      
      catMap[cat] = (catMap[cat] || 0) + convertedAmount;
    });
    return Object.entries(catMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [validDocs, displayCurrency]);

  const vendorData = useMemo(() => {
    const vendMap: Record<string, number> = {};
    validDocs.forEach(doc => {
      const vend = doc.data?.vendorName || 'Unknown';
      const amount = doc.data?.totalAmount || 0;
      const currency = doc.data?.currency || 'USD';
      const convertedAmount = convertAmount(amount, currency);

      vendMap[vend] = (vendMap[vend] || 0) + convertedAmount;
    });
    return Object.entries(vendMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5); // Top 5
  }, [validDocs, displayCurrency]);

  const monthlyData = useMemo(() => {
    const timeMap: Record<string, number> = {};
    validDocs.forEach(doc => {
        if (!doc.data?.date) return;
        // Assume date is YYYY-MM-DD
        const month = doc.data.date.substring(0, 7); // YYYY-MM
        const amount = doc.data.totalAmount || 0;
        const currency = doc.data.currency || 'USD';
        const convertedAmount = convertAmount(amount, currency);

        timeMap[month] = (timeMap[month] || 0) + convertedAmount;
    });
    return Object.entries(timeMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [validDocs, displayCurrency]);

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: displayCurrency }).format(val);

  if (validDocs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center p-8 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
        <Activity className="w-12 h-12 text-slate-300 mb-4" />
        <h3 className="text-lg font-medium text-slate-900">No Data Available</h3>
        <p className="text-slate-500 mt-2 max-w-md">Upload and process invoices to see your analytics dashboard come to life.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Dashboard Toolbar */}
      <div className="flex justify-end items-center">
        <div className="flex items-center space-x-2 bg-white p-2 rounded-lg border border-slate-200 shadow-sm">
          <Globe className="w-4 h-4 text-slate-500" />
          <span className="text-sm text-slate-600 font-medium">Display Currency:</span>
          <select 
            value={displayCurrency}
            onChange={(e) => setDisplayCurrency(e.target.value)}
            className="bg-transparent text-sm font-bold text-indigo-600 focus:outline-none cursor-pointer"
          >
            {SUPPORTED_CURRENCIES.map(curr => (
              <option key={curr} value={curr}>{curr}</option>
            ))}
          </select>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard 
          title={`Total Spend (${displayCurrency})`}
          value={formatCurrency(kpis.totalSpend)} 
          icon={<DollarSign className="w-5 h-5" />}
          change={12.5} // Mock change
        />
        <KPICard 
          title="Total Invoices" 
          value={kpis.invoiceCount.toString()} 
          icon={<CreditCard className="w-5 h-5" />}
          change={5.2}
        />
        <KPICard 
          title="Active Vendors" 
          value={kpis.uniqueVendors.toString()} 
          icon={<Activity className="w-5 h-5" />}
          change={0}
          trendLabel="Same as last month"
        />
         <KPICard 
          title={`Avg. Invoice Value (${displayCurrency})`} 
          value={formatCurrency(kpis.avgSpend)} 
          icon={<PieIcon className="w-5 h-5" />}
          change={-2.4}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Spend by Category */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 mb-6">Spend by Category ({displayCurrency})</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Vendors */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 mb-6">Top Vendors ({displayCurrency})</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={vendorData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="name" width={100} tick={{fontSize: 12}} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} cursor={{fill: '#f8fafc'}} />
                <Bar dataKey="value" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Trend */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm lg:col-span-2">
          <h3 className="text-lg font-semibold text-slate-900 mb-6">Monthly Spend Trend ({displayCurrency})</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} dot={{r: 4}} activeDot={{r: 8}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};