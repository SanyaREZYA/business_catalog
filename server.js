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
    const result = await pool.query('SELECT * FROM companies WHERE id = $1', [
      req.params.id,
    ]);
    res.json(result.rows);
  } catch (err) {
    console.error('Error getting companies:', err);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/companies/search/:name', async (req, res) => {
  const { name } = req.params;

  try {
    const result = await pool.query(
      `SELECT *
       FROM companies
       WHERE LOWER(name) LIKE LOWER($1)`,
      [`%${name}%`],
    );

    res.json(result.rows);
  } catch (err) {
    console.error('Error searching companies by name:', err);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/companies-by-tag-id/:tagId', async (req, res) => {
  const { tagId } = req.params;

  try {
    const result = await pool.query(
      `SELECT c.*
       FROM companies c
                JOIN company_tags ct ON c.id = ct.company_id
       WHERE ct.id = $1`,
      [tagId],
    );

    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching companies by tag ID:', err);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/companies-by-tag-name/:tagName', async (req, res) => {
  const { tagName } = req.params;

  try {
    const result = await pool.query(
      `SELECT DISTINCT c.*
       FROM companies c
                JOIN company_tags ct ON c.id = ct.company_id
       WHERE LOWER(ct.tag) LIKE LOWER($1)`,
      [`%${tagName}%`],
    );

    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching companies by tag name:', err);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/companies-by-area-id/:areaId', async (req, res) => {
  const { areaId } = req.params;

  try {
    const result = await pool.query(
      `SELECT c.*
       FROM companies c
                JOIN activity_areas aa ON aa.id = c.activity_area_id
       WHERE aa.id = $1`,
      [areaId],
    );

    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching companies by area ID:', err);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/companies-by-category-id/:categoryId', async (req, res) => {
  const { categoryId } = req.params;

  try {
    const result = await pool.query(
      `SELECT c.*
       FROM companies c
                JOIN categories cc ON cc.id = c.category_id
       WHERE cc.id = $1`,
      [categoryId],
    );

    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching companies by category ID:', err);
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

app.get('/company-tags', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM company_tags');
    res.json(result.rows);
  } catch (err) {
    console.error('Error getting company tags:', err);
    res.status(500).send('Internal Server Error');
  }
});

app.listen(PORT, () => {
  console.log(`Сервер запущено на http://localhost:${PORT}`);
});
