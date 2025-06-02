const express = require('express');
const path = require('path');
const app = express();
const pool = require('./db');
const { query } = require('./db'); // Можливо, `query` не потрібен тут, якщо ви використовуєте `pool.query`
const PORT = process.env.PORT || 3000;

app.use('/css', express.static(path.join(__dirname, 'css')));
app.use('/js', express.static(path.join(__dirname, 'js')));
app.use('/images', express.static(path.join(__dirname, 'images')));

// Дуже ВАЖЛИВО: Додайте цей рядок для парсингу JSON-тіла запитів
app.use(express.json());

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
    const result = await pool.query(
      `SELECT c.*, cat.name AS category_name
       FROM companies c
       LEFT JOIN categories cat ON c.category_id = cat.id`
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error getting companies:', err);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/last-companies', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT c.*, cat.name AS category_name
       FROM companies c
       LEFT JOIN categories cat ON c.category_id = cat.id
       ORDER BY c.created_at DESC LIMIT 8`
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error getting last companies:', err);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/companies/:id', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT c.*, cat.name AS category_name
       FROM companies c
       LEFT JOIN categories cat ON c.category_id = cat.id
       WHERE c.id = $1`,
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Компанію не знайдено' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error getting company by id:', err);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/companies/search/:name', async (req, res) => {
  const { name } = req.params;

  try {
    const result = await pool.query(
      `SELECT c.*, cat.name AS category_name
       FROM companies c
       LEFT JOIN categories cat ON c.category_id = cat.id
       WHERE LOWER(c.name) LIKE LOWER($1)`,
      [`%${name}%`]
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
      `SELECT c.*, cat.name AS category_name
       FROM companies c
       JOIN company_tags ct ON c.id = ct.company_id
       LEFT JOIN categories cat ON c.category_id = cat.id
       WHERE ct.id = $1`,
      [tagId]
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
      `SELECT DISTINCT c.*, cat.name AS category_name
       FROM companies c
       JOIN company_tags ct ON c.id = ct.company_id
       LEFT JOIN categories cat ON c.category_id = cat.id
       WHERE LOWER(ct.tag) LIKE LOWER($1)`,
      [`%${tagName}%`]
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
      `SELECT c.*, cat.name AS category_name
       FROM companies c
       JOIN activity_areas aa ON aa.id = c.activity_area_id
       LEFT JOIN categories cat ON c.category_id = cat.id
       WHERE aa.id = $1`,
      [areaId]
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
      `SELECT c.*, cat.name AS category_name
       FROM companies c
       JOIN categories cat ON c.category_id = cat.id
       WHERE cat.id = $1`,
      [categoryId]
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

app.get('/last-reviews', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM reviews ORDER BY created_at DESC LIMIT 8'
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error getting reviews:', err);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/reviews/:companyId', async (req, res) => {
  const { companyId } = req.params;
  try {
    const result = await pool.query(
      'SELECT * FROM reviews WHERE company_id = $1',
      [companyId]
    );
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

app.get('/companies/:id/reviews', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM reviews WHERE company_id = $1 ORDER BY created_at DESC',
      [req.params.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error getting reviews:', err);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/company/:id/reviews', async (req, res) => {
  try {
    // Отримуємо review_text, user_name ТА rating з тіла запиту
    const { review_text, user_name, rating } = req.body; 

    if (!review_text || !review_text.trim()) {
      return res.status(400).json({ error: 'Текст відгуку обовʼязковий' });
    }
    if (!user_name || !user_name.trim()) {
      return res.status(400).json({ error: "Ім'я обов'язкове" });
    }
    // Додаємо перевірку на коректність значення rating
    if (typeof rating !== 'number' || rating < 1 || rating > 5) {
        return res.status(400).json({ error: 'Рейтинг має бути числом від 1 до 5.' });
    }

    const result = await pool.query(
      'INSERT INTO reviews (company_id, review_text, user_name, rating, created_at) VALUES ($1, $2, $3, $4, NOW()) RETURNING *',
      [req.params.id, review_text.trim(), user_name.trim(), rating] // Використовуємо отриманий rating
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error adding review:', err);
    res.status(500).send('Internal Server Error');
  }
});

app.listen(PORT, () => {
  console.log(`Сервер запущено на http://localhost:${PORT}`);
});