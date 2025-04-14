const express = require('express');
const path = require('path');
const app = express();
const pool = require('./db');
const PORT = process.env.PORT || 3000;

app.use('/css', express.static(path.join(__dirname, 'css')));
app.use('/js', express.static(path.join(__dirname, 'js')));
app.use('/images', express.static(path.join(__dirname, 'images')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'html', 'index.html'));
});

app.get('/aboutus', (req, res) => {
  res.sendFile(path.join(__dirname, 'html', 'aboutus.html'));
});

app.get('/advert', (req, res) => {
  res.sendFile(path.join(__dirname, 'html', 'advert.html'));
});

app.get('/company', (req, res) => {
  res.sendFile(path.join(__dirname, 'html', 'company.html'));
});

app.get('/placement', (req, res) => {
  res.sendFile(path.join(__dirname, 'html', 'placement.html'));
});

app.get('/search', (req, res) => {
  res.sendFile(path.join(__dirname, 'html', 'search.html'));
});

app.get('/companies', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM companies');
    res.json(result.rows);
  } catch (err) {
    console.error('Error getting companies:', err);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/companies/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM companies WHERE id = ?', [req.params.id]);
    res.json(result.rows);
  } catch (err) {
    console.error('Error getting companies:', err);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/reviews', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM reviews');
    res.json(result.rows);
  } catch (err) {
    console.error('Error getting reviews:', err);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/categories', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM categories');
    res.json(result.rows);
  } catch (err) {
    console.error('Error getting categories:', err);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/activity-areas', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM activity_areas');
    res.json(result.rows);
  } catch (err) {
    console.error('Error getting activity areas:', err);
    res.status(500).send('Internal Server Error');
  }
});

app.listen(PORT, () => {
  console.log(`Сервер запущено на http://localhost:${PORT}`);
});