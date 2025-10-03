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
