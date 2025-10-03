// Import required packages
const express = require('express');
const cors = require('cors');
const Airtable = require('airtable');
require('dotenv').config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 30001;

// Middleware
app.use(cors());
app.use(express.json());

// Airtable configuration
const base = new Airtable({
  apiKey: process.env.AIRTABLE_API_KEY
}).base(process.env.AIRTABLE_BASE_ID);

// Helper function to parse percentages
function parsePercentage(value) {
  if (!value) return 0;
  const strValue = String(value);
  if (strValue.includes('%')) {
    return parseFloat(strValue.replace('%', '')) / 100;
  }
  return parseFloat(value);
}

// Health check
app.get('/', (req, res) => {
  res.json({ 
    message: 'Tour Settlement API is running',
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// Get all shows
app.get('/api/shows', async (req, res) => {
  try {
    const records = await base('Shows').select().all();
    const shows = records.map(record => ({
      id: record.id,
      ...record.fields
    }));
    res.json(shows);
  } catch (error) {
    console.error('Error fetching shows:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create new show
app.post('/api/shows', async (req, res) => {
  try {
    const { show_id, date, venue_name, city, deal_type, artist_guarantee, artist_percent_of_net } = req.body;
    
    const record = await base('Shows').create({
      'Show ID': show_id,
      'Date': date,
      'Venue': venue_name,
      'City': city,
      'Deal Type': deal_type,
      'Artist Guarantee': parseFloat(artist_guarantee) || 0,
      'Artist % of Net': parsePercentage(artist_percent_of_net),
      'Status': 'Draft'
    });
    
    res.json({
      id: record.id,
      ...record.fields
    });
  } catch (error) {
    console.error('Error creating show:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get show by ID
app.get('/api/shows/:id', async (req, res) => {
  try {
    const record = await base('Shows').find(req.params.id);
    res.json({
      id: record.id,
      ...record.fields
    });
  } catch (error) {
    console.error('Error fetching show:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create revenue entry
app.post('/api/revenue', async (req, res) => {
  try {
    const {
      show_id,
      ticket_gross,
      ticket_tax_percent,
      facility_fee_percent,
      credit_card_fee_percent,
      sponsorship_revenue,
      parking_revenue,
      concessions_revenue
    } = req.body;

    const record = await base('Revenue').create({
      'Show ID': show_id,
      'Ticket Gross': parseFloat(ticket_gross) || 0,
      'Ticket Tax %': parsePercentage(ticket_tax_percent),
      'Facility Fee %': parsePercentage(facility_fee_percent),
      'Credit Card Fee %': parsePercentage(credit_card_fee_percent),
      'Sponsorship Revenue': parseFloat(sponsorship_revenue) || 0,
      'Parking Revenue': parseFloat(parking_revenue) || 0,
      'Concessions Revenue': parseFloat(concessions_revenue) || 0
    });

    res.json({
      id: record.id,
      ...record.fields
    });
  } catch (error) {
    console.error('Error creating revenue:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get revenue by show ID
app.get('/api/revenue/:show_id', async (req, res) => {
  try {
    const records = await base('Revenue')
      .select({
        filterByFormula: `{Show ID} = '${req.params.show_id}'`
      })
      .all();
    
    const revenue = records.map(record => ({
      id: record.id,
      ...record.fields
    }));
    
    res.json(revenue);
  } catch (error) {
    console.error('Error fetching revenue:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create expense
app.post('/api/expenses', async (req, res) => {
  try {
    const {
      show_id,
      category,
      description,
      amount,
      vendor,
      invoice_number
    } = req.body;

    const record = await base('Expenses').create({
      'Show ID': show_id,
      'Category': category,
      'Description': description,
      'Amount': parseFloat(amount) || 0,
      'Vendor': vendor,
      'Invoice Number': invoice_number
    });

    res.json({
      id: record.id,
      ...record.fields
    });
  } catch (error) {
    console.error('Error creating expense:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get expenses by show ID
app.get('/api/expenses/:show_id', async (req, res) => {
  try {
    const records = await base('Expenses')
      .select({
        filterByFormula: `{Show ID} = '${req.params.show_id}'`
      })
      .all();
    
    const expenses = records.map(record => ({
      id: record.id,
      ...record.fields
    }));
    
    res.json(expenses);
  } catch (error) {
    console.error('Error fetching expenses:', error);
    res.status(500).json({ error: error.message });
  }
});

// Calculate settlement
app.post('/api/settlements/calculate/:show_id', async (req, res) => {
  try {
    const showId = req.params.show_id;

    // Fetch show details
    const showRecords = await base('Shows')
      .select({ filterByFormula: `{Show ID} = '${showId}'` })
      .all();
    
    if (showRecords.length === 0) {
      return res.status(404).json({ error: 'Show not found' });
    }
    const show = showRecords[0].fields;

    // Fetch revenue
    const revenueRecords = await base('Revenue')
      .select({ filterByFormula: `{Show ID} = '${showId}'` })
      .all();
    
    if (revenueRecords.length === 0) {
      return res.status(404).json({ error: 'Revenue not found' });
    }
    const revenue = revenueRecords[0].fields;

    // Fetch expenses
    const expenseRecords = await base('Expenses')
      .select({ filterByFormula: `{Show ID} = '${showId}'` })
      .all();
    
    const totalExpenses = expenseRecords.reduce((sum, record) => {
      return sum + (record.fields.Amount || 0);
    }, 0);

    // Calculate settlement
    const ticketGross = revenue['Ticket Gross'] || 0;
    const ticketTax = ticketGross * (revenue['Ticket Tax %'] || 0);
    const facilityFee = ticketGross * (revenue['Facility Fee %'] || 0);
    const creditCardFee = ticketGross * (revenue['Credit Card Fee %'] || 0);
    
    const adjustedGross = ticketGross - ticketTax - facilityFee - creditCardFee +
      (revenue['Sponsorship Revenue'] || 0) +
      (revenue['Parking Revenue'] || 0) +
      (revenue['Concessions Revenue'] || 0);

    const noi = adjustedGross - totalExpenses;
    const promoterProfitPercent = 0.10; // 10% default
    const promoterProfit = noi * promoterProfitPercent;
    const nsp = noi - promoterProfit;

    const artistPercent = show['Artist % of Net'] || 0.9;
    const artistShare = nsp * artistPercent;
    const artistGuarantee = show['Artist Guarantee'] || 0;
    const artistOverage = Math.max(0, artistShare - artistGuarantee);

    const recoupmentSweepPercent = 0.75; // 75% default
    const recoupmentSweep = artistOverage * recoupmentSweepPercent;
    const cashDueToArtist = artistGuarantee + (artistOverage - recoupmentSweep);

    const settlement = {
      show_id: showId,
      adjusted_gross: adjustedGross,
      total_expenses: totalExpenses,
      noi: noi,
      promoter_profit_percent: promoterProfitPercent,
      promoter_profit: promoterProfit,
      nsp: nsp,
      artist_percent: artistPercent,
      artist_share: artistShare,
      artist_guarantee: artistGuarantee,
      artist_overage: artistOverage,
      recoupment_sweep_percent: recoupmentSweepPercent,
      recoupment_sweep: recoupmentSweep,
      cash_due_to_artist: cashDueToArtist
    };

    res.json(settlement);
  } catch (error) {
    console.error('Error calculating settlement:', error);
    res.status(500).json({ error: error.message });
  }
});

// Post settlement to Airtable
app.post('/api/settlements/post', async (req, res) => {
  try {
    const settlement = req.body;

    const record = await base('Settlements').create({
      'Show ID': settlement.show_id,
      'Adjusted Gross': settlement.adjusted_gross,
      'Total Expenses': settlement.total_expenses,
      'NOI': settlement.noi,
      'Promoter Profit': settlement.promoter_profit,
      'NSP': settlement.nsp,
      'Artist Share': settlement.artist_share,
      'Artist Guarantee': settlement.artist_guarantee,
      'Artist Overage': settlement.artist_overage,
      'Recoupment Sweep': settlement.recoupment_sweep,
      'Cash Due to Artist': settlement.cash_due_to_artist,
      'Settlement Date': new Date().toISOString()
    });

    res.json({
      id: record.id,
      ...record.fields
    });
  } catch (error) {
    console.error('Error posting settlement:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all settlements
app.get('/api/settlements', async (req, res) => {
  try {
    const records = await base('Settlements').select().all();
    const settlements = records.map(record => ({
      id: record.id,
      ...record.fields
    }));
    res.json(settlements);
  } catch (error) {
    console.error('Error fetching settlements:', error);
    res.status(500).json({ error: error.message });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Tour Settlement API running on port ${PORT}`);
  console.log(`🌐 Server accessible at http://0.0.0.0:${PORT}`);
});
