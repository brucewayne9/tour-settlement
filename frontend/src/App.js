import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const API_URL = 'http://75.43.156.100:30001/api';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [shows, setShows] = useState([]);
  const [settlements, setSettlements] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [showForm, setShowForm] = useState({
    show_id: '',
    date: '',
    venue_name: '',
    city: '',
    deal_type: 'HYBRID_0VS',
    artist_guarantee: '',
    artist_percent_of_net: '0.9'
  });

  const [revenueForm, setRevenueForm] = useState({
    show_id: '',
    ticket_gross: '',
    ticket_tax_percent: '0.05',
    facility_fee_percent: '0.03',
    credit_card_fee_percent: '0.025',
    sponsorship_revenue: '0',
    parking_revenue: '0',
    concessions_revenue: '0'
  });

  const [expenseForm, setExpenseForm] = useState({
    show_id: '',
    category: 'Marketing',
    description: '',
    amount: '',
    vendor: '',
    invoice_number: ''
  });

  const [settlementShowId, setSettlementShowId] = useState('');
  const [settlementPreview, setSettlementPreview] = useState(null);

  useEffect(() => {
    fetchShows();
    fetchSettlements();
  }, []);

  const fetchShows = async () => {
    try {
      const response = await axios.get(`${API_URL}/shows`);
      setShows(response.data);
    } catch (error) {
      console.error('Error fetching shows:', error);
    }
  };

  const fetchSettlements = async () => {
    try {
      const response = await axios.get(`${API_URL}/settlements`);
      setSettlements(response.data);
    } catch (error) {
      console.error('Error fetching settlements:', error);
    }
  };

  const handleSaveShow = async () => {
    setLoading(true);
    try {
      await axios.post(`${API_URL}/shows`, showForm);
      alert('Show saved successfully!');
      setShowForm({
        show_id: '',
        date: '',
        venue_name: '',
        city: '',
        deal_type: 'HYBRID_0VS',
        artist_guarantee: '',
        artist_percent_of_net: '0.9'
      });
      fetchShows();
    } catch (error) {
      console.error('Error saving show:', error);
      alert('Failed to save show: ' + error.message);
    }
    setLoading(false);
  };

  const handleSaveRevenue = async () => {
    setLoading(true);
    try {
      await axios.post(`${API_URL}/revenue`, revenueForm);
      alert('Revenue saved successfully!');
      setRevenueForm({
        show_id: '',
        ticket_gross: '',
        ticket_tax_percent: '0.05',
        facility_fee_percent: '0.03',
        credit_card_fee_percent: '0.025',
        sponsorship_revenue: '0',
        parking_revenue: '0',
        concessions_revenue: '0'
      });
    } catch (error) {
      console.error('Error saving revenue:', error);
      alert('Failed to save revenue: ' + error.message);
    }
    setLoading(false);
  };

  const handleAddExpense = async () => {
    setLoading(true);
    try {
      await axios.post(`${API_URL}/expenses`, expenseForm);
      alert('Expense added successfully!');
      setExpenseForm({
        show_id: '',
        category: 'Marketing',
        description: '',
        amount: '',
        vendor: '',
        invoice_number: ''
      });
    } catch (error) {
      console.error('Error adding expense:', error);
      alert('Failed to add expense: ' + error.message);
    }
    setLoading(false);
  };

  const handleCalculateSettlement = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/settlements/calculate/${settlementShowId}`);
      setSettlementPreview(response.data);
    } catch (error) {
      console.error('Error calculating settlement:', error);
      alert('Failed to calculate settlement: ' + error.message);
    }
    setLoading(false);
  };

  const handlePostSettlement = async () => {
    if (!settlementPreview) {
      alert('Please calculate settlement first');
      return;
    }
    
    setLoading(true);
    try {
      await axios.post(`${API_URL}/settlements/post`, settlementPreview);
      alert('Settlement posted successfully!');
      setSettlementPreview(null);
      setSettlementShowId('');
      fetchSettlements();
    } catch (error) {
      console.error('Error posting settlement:', error);
      alert('Failed to post settlement: ' + error.message);
    }
    setLoading(false);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(value || 0);
  };

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'shows', label: 'Shows', icon: '🎤' },
    { id: 'revenue', label: 'Revenue', icon: '💰' },
    { id: 'expenses', label: 'Expenses', icon: '📝' },
    { id: 'settlements', label: 'Settlements', icon: '🧾' },
    { id: 'pools', label: 'Advance Pools', icon: '🏦' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <header className="bg-black/30 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Tour Settlement System</h1>
              <p className="text-sm text-purple-300">Manage shows, revenue & settlements</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-white font-medium">Live System</p>
                <p className="text-xs text-green-300">🟢 Connected</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <nav className="bg-black/20 backdrop-blur border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'text-white border-b-2 border-purple-400 bg-white/5'
                    : 'text-purple-200 hover:text-white hover:bg-white/5'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8">
        
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <StatCard title="Total Shows" value={shows.length} subtitle="In database" color="purple" />
              <StatCard title="Settlements" value={settlements.length} subtitle="Posted" color="green" />
              <StatCard title="Backend Status" value="✓ Live" subtitle="API Connected" color="blue" />
              <StatCard title="Database" value="Airtable" subtitle="Active" color="orange" />
            </div>

            <Card title="Recent Shows" subtitle={`${shows.length} shows in system`}>
              {shows.length === 0 ? (
                <p className="text-purple-300 text-center py-8">No shows yet. Add your first show!</p>
              ) : (
                <div className="space-y-3">
                  {shows.slice(0, 5).map((show) => (
                    <div key={show.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                      <div>
                        <p className="font-medium text-white">{show.Venue || show.venue_name}</p>
                        <p className="text-sm text-purple-300">{show.City} • {new Date(show.Date).toLocaleDateString()}</p>
                      </div>
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-300">
                        {show.Status || 'Pending'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        )}

        {activeTab === 'shows' && (
          <Card title="Add New Show" subtitle="Enter show details and deal terms">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <InputField 
                label="Show ID" 
                value={showForm.show_id}
                onChange={(v) => setShowForm({...showForm, show_id: v})}
                placeholder="2025-ATL-01"
              />
              <InputField 
                label="Date" 
                type="date"
                value={showForm.date}
                onChange={(v) => setShowForm({...showForm, date: v})}
              />
              <InputField 
                label="Venue Name" 
                value={showForm.venue_name}
                onChange={(v) => setShowForm({...showForm, venue_name: v})}
                placeholder="State Farm Arena"
              />
              <InputField 
                label="City" 
                value={showForm.city}
                onChange={(v) => setShowForm({...showForm, city: v})}
                placeholder="Atlanta, GA"
              />
              <SelectField
                label="Deal Type"
                value={showForm.deal_type}
                onChange={(v) => setShowForm({...showForm, deal_type: v})}
                options={[
                  { value: 'GUARANTEE', label: 'Guarantee' },
                  { value: 'PERCENT_NET', label: '% of Net' },
                  { value: 'HYBRID_0VS', label: 'Hybrid 0 vs %' },
                  { value: 'JV', label: 'Joint Venture' }
                ]}
              />
              <InputField 
                label="Artist Guarantee" 
                type="number"
                value={showForm.artist_guarantee}
                onChange={(v) => setShowForm({...showForm, artist_guarantee: v})}
                placeholder="150000"
              />
              <InputField 
                label="Artist % of Net" 
                value={showForm.artist_percent_of_net}
                onChange={(v) => setShowForm({...showForm, artist_percent_of_net: v})}
                placeholder="0.9 or 90%"
              />
            </div>
            <div className="mt-6 flex gap-3">
              <button
                onClick={handleSaveShow}
                disabled={loading}
                className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Show'}
              </button>
              <button 
                onClick={() => setShowForm({
                  show_id: '', date: '', venue_name: '', city: '', 
                  deal_type: 'HYBRID_0VS', artist_guarantee: '', artist_percent_of_net: '0.9'
                })}
                className="px-6 py-2 bg-white/10 text-white rounded-lg font-medium hover:bg-white/20 transition-all"
              >
                Clear Form
              </button>
            </div>
          </Card>
        )}

        {activeTab === 'revenue' && (
          <Card title="Add Revenue" subtitle="Enter ticket sales and ancillary income">
            <div className="mb-6 p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
              <p className="text-sm text-purple-200">
                💡 <strong>Tip:</strong> Enter percentages as decimals (0.05 for 5%) or with % symbol (5%)
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <SelectField 
                label="Show ID"
                value={revenueForm.show_id}
                onChange={(v) => setRevenueForm({...revenueForm, show_id: v})}
                options={[
                  { value: '', label: 'Select show...' },
                  ...shows.map(s => ({ value: s['Show ID'], label: `${s['Show ID']} - ${s.Venue}` }))
                ]}
              />
              <InputField 
                label="Ticket Gross" 
                type="number" 
                value={revenueForm.ticket_gross}
                onChange={(v) => setRevenueForm({...revenueForm, ticket_gross: v})}
                placeholder="2500000" 
              />
              <InputField 
                label="Ticket Tax %" 
                value={revenueForm.ticket_tax_percent}
                onChange={(v) => setRevenueForm({...revenueForm, ticket_tax_percent: v})}
                placeholder="5% or 0.05" 
              />
              <InputField 
                label="Facility Fee %" 
                value={revenueForm.facility_fee_percent}
                onChange={(v) => setRevenueForm({...revenueForm, facility_fee_percent: v})}
                placeholder="3%" 
              />
              <InputField 
                label="Credit Card Fee %" 
                value={revenueForm.credit_card_fee_percent}
                onChange={(v) => setRevenueForm({...revenueForm, credit_card_fee_percent: v})}
                placeholder="2.5%" 
              />
              <InputField 
                label="Sponsorship Revenue" 
                type="number" 
                value={revenueForm.sponsorship_revenue}
                onChange={(v) => setRevenueForm({...revenueForm, sponsorship_revenue: v})}
                placeholder="50000" 
              />
              <InputField 
                label="Parking Revenue" 
                type="number" 
                value={revenueForm.parking_revenue}
                onChange={(v) => setRevenueForm({...revenueForm, parking_revenue: v})}
                placeholder="25000" 
              />
              <InputField 
                label="Concessions Revenue" 
                type="number" 
                value={revenueForm.concessions_revenue}
                onChange={(v) => setRevenueForm({...revenueForm, concessions_revenue: v})}
                placeholder="75000" 
              />
            </div>
            <div className="mt-6">
              <button 
                onClick={handleSaveRevenue}
                disabled={loading}
                className="px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-medium hover:from-green-600 hover:to-emerald-600 transition-all disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Revenue'}
              </button>
            </div>
          </Card>
        )}

        {activeTab === 'expenses' && (
          <Card title="Add Single Expense" subtitle="Enter individual expense items">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <SelectField 
                label="Show ID"
                value={expenseForm.show_id}
                onChange={(v) => setExpenseForm({...expenseForm, show_id: v})}
                options={[
                  { value: '', label: 'Select show...' },
                  ...shows.map(s => ({ value: s['Show ID'], label: `${s['Show ID']} - ${s.Venue}` }))
                ]}
              />
              <SelectField 
                label="Category"
                value={expenseForm.category}
                onChange={(v) => setExpenseForm({...expenseForm, category: v})}
                options={[
                  { value: 'Marketing', label: 'Marketing' },
                  { value: 'Production', label: 'Production' },
                  { value: 'Travel', label: 'Travel' },
                  { value: 'Venue', label: 'Venue' },
                  { value: 'Other', label: 'Other' }
                ]}
              />
              <InputField 
                label="Amount" 
                type="number" 
                value={expenseForm.amount}
                onChange={(v) => setExpenseForm({...expenseForm, amount: v})}
                placeholder="35000" 
              />
              <InputField 
                label="Description" 
                value={expenseForm.description}
                onChange={(v) => setExpenseForm({...expenseForm, description: v})}
                placeholder="Radio & OOH advertising" 
              />
              <InputField 
                label="Vendor" 
                value={expenseForm.vendor}
                onChange={(v) => setExpenseForm({...expenseForm, vendor: v})}
                placeholder="ACME Media" 
              />
              <InputField 
                label="Invoice Number" 
                value={expenseForm.invoice_number}
                onChange={(v) => setExpenseForm({...expenseForm, invoice_number: v})}
                placeholder="INV-001" 
              />
            </div>
            <div className="mt-6">
              <button 
                onClick={handleAddExpense}
                disabled={loading}
                className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50"
              >
                {loading ? 'Adding...' : 'Add Expense'}
              </button>
            </div>
          </Card>
        )}

        {activeTab === 'settlements' && (
          <Card title="Calculate Settlement" subtitle="Run settlement calculations for a show">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <SelectField 
                  label="Show ID"
                  value={settlementShowId}
                  onChange={setSettlementShowId}
                  options={[
                    { value: '', label: 'Select show...' },
                    ...shows.map(s => ({ value: s['Show ID'], label: `${s['Show ID']} - ${s.Venue}` }))
                  ]}
                />
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={handleCalculateSettlement}
                  disabled={loading || !settlementShowId}
                  className="px-6 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg font-medium hover:from-blue-600 hover:to-cyan-600 transition-all disabled:opacity-50"
                >
                  {loading ? 'Calculating...' : 'Calculate Preview'}
                </button>
                <button 
                  onClick={handlePostSettlement}
                  disabled={loading || !settlementPreview}
                  className="px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-medium hover:from-green-600 hover:to-emerald-600 transition-all disabled:opacity-50"
                >
                  Post Settlement
                </button>
              </div>

              {settlementPreview && (
                <div className="mt-8 p-6 bg-white/5 rounded-lg border border-white/10">
                  <h3 className="text-lg font-semibold text-white mb-4">Settlement Preview - {settlementPreview.show_id}</h3>
                  <div className="space-y-3">
                    <SettlementRow label="Adjusted Gross" value={settlementPreview.adjusted_gross} />
                    <SettlementRow label="Total Expenses" value={settlementPreview.total_expenses} negative />
                    <SettlementRow label="Net Operating Income (NOI)" value={settlementPreview.noi} bold />
                    <SettlementRow label={`Promoter Profit (${(settlementPreview.promoter_profit_percent * 100).toFixed(0)}%)`} value={settlementPreview.promoter_profit} negative />
                    <SettlementRow label="Net Sellable Product (NSP)" value={settlementPreview.nsp} bold />
                    <SettlementRow label={`Artist Share (${(settlementPreview.artist_percent * 100).toFixed(0)}%)`} value={settlementPreview.artist_share} />
                    <SettlementRow label="Artist Guarantee" value={settlementPreview.artist_guarantee} negative />
                    <SettlementRow label="Artist Overage" value={settlementPreview.artist_overage} />
                    <SettlementRow label={`Recoupment Sweep (${(settlementPreview.recoupment_sweep_percent * 100).toFixed(0)}%)`} value={settlementPreview.recoupment_sweep} negative />
                    <div className="pt-4 border-t-2 border-white/20">
                      <SettlementRow label="Cash Due to Artist" value={settlementPreview.cash_due_to_artist} final />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>
        )}

        {activeTab === 'pools' && (
          <Card title="Advance Pool Tracker" subtitle="Monitor recoupment progress">
            <div className="text-center py-12 text-purple-300">
              <p className="text-lg mb-4">🏦 Advance Pool Management</p>
              <p className="text-sm">Coming soon - Track advance recoupment across multiple shows</p>
            </div>
          </Card>
        )}

      </main>
    </div>
  );
}

function StatCard({ title, value, subtitle, color }) {
  const colors = {
    purple: 'from-purple-500 to-pink-500',
    green: 'from-green-500 to-emerald-500',
    blue: 'from-blue-500 to-cyan-500',
    orange: 'from-orange-500 to-amber-500'
  };
  
  return (
    <div className={`bg-gradient-to-br ${colors[color]} p-6 rounded-xl shadow-lg`}>
      <p className="text-sm text-white/80 mb-1">{title}</p>
      <p className="text-3xl font-bold text-white mb-1">{value}</p>
      <p className="text-xs text-white/70">{subtitle}</p>
    </div>
  );
}

function Card({ title, subtitle, children }) {
  return (
    <div className="bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 p-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white">{title}</h2>
        {subtitle && <p className="text-sm text-purple-300 mt-1">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

function InputField({ label, value, onChange, placeholder, type = 'text' }) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-purple-200 mb-2">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
      />
    </label>
  );
}

function SelectField({ label, value, onChange, options }) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-purple-200 mb-2">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
      >
        {options?.map(opt => (
          <option key={opt.value} value={opt.value} className="bg-slate-800">
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function SettlementRow({ label, value, negative, bold, final }) {
  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(Math.abs(val || 0));
  };

  return (
    <div className="flex justify-between items-center">
      <span className={`text-sm ${bold || final ? 'font-bold' : ''} ${final ? 'text-green-300' : 'text-purple-200'}`}>
        {label}
      </span>
      <span className={`${bold || final ? 'text-lg font-bold' : 'text-sm font-medium'} ${
        final ? 'text-green-400' : 
        negative ? 'text-red-400' : 
        'text-white'
      }`}>
        {negative && value > 0 ? '-' : ''}{formatCurrency(value)}
      </span>
    </div>
  );
}

export default App;
