const express = require('express');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const app = express();
const pool = require('./db');
const PORT = process.env.PORT || 3000;

const logosDir = path.join(__dirname, 'images', 'logos');
if (!fs.existsSync(logosDir)) {
  fs.mkdirSync(logosDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, logosDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  },
});
const upload = multer({ storage });

app.use('/css', express.static(path.join(__dirname, 'css')));
app.use('/js', express.static(path.join(__dirname, 'js')));
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use(express.json());

const htmlPath = (file) => path.join(__dirname, 'html', file);
app.get('/', (req, res) => res.sendFile(htmlPath('index.html')));
app.get('/aboutus', (req, res) => res.sendFile(htmlPath('aboutus.html')));
app.get('/advert', (req, res) => res.sendFile(htmlPath('advert.html')));
app.get('/company', (req, res) => res.sendFile(htmlPath('company.html')));
app.get('/placement', (req, res) => res.sendFile(htmlPath('placement.html')));
app.get('/search', (req, res) => res.sendFile(htmlPath('search.html')));
app.get('/admin', (req, res) => res.sendFile(htmlPath('admin.html')));

app.get('/companies', async (_, res) => {
  try {
    const result = await pool.query('SELECT * FROM public.companies');
    res.json(result.rows);
  } catch (err) {
    console.error('Error getting companies:', err);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/last-companies', async (_, res) => {
  try {
    const result = await pool.query('SELECT * FROM companies ORDER BY created_at DESC LIMIT 8');
    res.json(result.rows);
  } catch (err) {
    console.error('Error getting last companies:', err);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/companies/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM companies WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Компанію не знайдено' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error getting company by ID:', err);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/companies/search/:name', async (req, res) => {
  const { name } = req.params;
  try {
    const result = await pool.query(
      'SELECT * FROM companies WHERE LOWER(name) LIKE LOWER($1)',
      [`%${name}%`]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error searching companies by name:', err);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/companies-by-tag-id/:tagId', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT c.* FROM companies c JOIN company_tags ct ON c.id = ct.company_id WHERE ct.id = $1',
      [req.params.tagId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching companies by tag ID:', err);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/companies-by-tag-name/:tagName', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT DISTINCT c.* FROM companies c JOIN company_tags ct ON c.id = ct.company_id WHERE LOWER(ct.tag) LIKE LOWER($1)',
      [`%${req.params.tagName}%`]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching companies by tag name:', err);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/companies-by-area-id/:areaId', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT c.* FROM companies c JOIN activity_areas aa ON aa.id = c.activity_area_id WHERE aa.id = $1',
      [req.params.areaId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching companies by area ID:', err);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/companies-by-category-id/:categoryId', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT c.* FROM companies c JOIN categories cc ON cc.id = c.category_id WHERE cc.id = $1',
      [req.params.categoryId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching companies by category ID:', err);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/reviews', async (_, res) => {
  try {
    const result = await pool.query('SELECT * FROM reviews');
    res.json(result.rows);
  } catch (err) {
    console.error('Error getting reviews:', err);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/last-reviews', async (_, res) => {
  try {
    const result = await pool.query('SELECT * FROM reviews ORDER BY created_at DESC LIMIT 8');
    res.json(result.rows);
  } catch (err) {
    console.error('Error getting reviews:', err);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/reviews/:companyId', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM reviews WHERE company_id = $1',
      [req.params.companyId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error getting reviews:', err);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/categories', async (_, res) => {
  try {
    const result = await pool.query('SELECT * FROM categories ORDER BY name');
    res.json(result.rows);
  } catch (err) {
    console.error('Error getting categories:', err);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/activity-areas', async (_, res) => {
  try {
    const result = await pool.query('SELECT * FROM activity_areas');
    res.json(result.rows);
  } catch (err) {
    console.error('Error getting activity areas:', err);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/company-tags', async (_, res) => {
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

app.post('/company/:id/reviews', express.json(), async (req, res) => {
  const { review_text, user_name } = req.body;
  const rating = 5;
  if (!review_text?.trim()) return res.status(400).json({ error: 'Текст відгуку обовʼязковий' });
  if (!user_name?.trim()) return res.status(400).json({ error: "Ім'я обов'язкове" });

  try {
    const result = await pool.query(
      'INSERT INTO reviews (company_id, review_text, user_name, rating, created_at) VALUES ($1, $2, $3, $4, NOW()) RETURNING *',
      [req.params.id, review_text.trim(), user_name.trim(), rating]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error adding review:', err);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/companies', upload.any(), async (req, res) => {
  try {
    console.log('🧾 Тіло запиту:', req.body);
    console.log('🖼️ Файл:', req.file);

    const {
      name,
      founder,
      edrpou_code,
      year_founded,
      phone1,
      phone2,
      phone3,
      activity_area_id,
      category_id,
      address,
      postal_code,
      email,
      telegram,
      viber,
      facebook,
      instagram,
      website,
      working_hours,
      short_description,
      full_description,
    } = req.body;

    const logo_path = req.file ? `/images/logos/${req.file.filename}` : null;

    const result = await pool.query(
      `INSERT INTO companies (
        name, founder, edrpou_code, year_founded, phone1, phone2, phone3,
        activity_area_id, category_id, address, postal_code, email,
        telegram, viber, facebook, instagram, website, logo_path,
        working_hours, short_description, full_description, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7,
        $8, $9, $10, $11, $12,
        $13, $14, $15, $16, $17, $18,
        $19, $20, $21, NOW(), NOW()
      ) RETURNING *`,
      [
        name, founder, edrpou_code, year_founded, phone1, phone2, phone3,
        activity_area_id, category_id, address, postal_code, email,
        telegram, viber, facebook, instagram, website, logo_path,
        working_hours, short_description, full_description,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('❌ ПОМИЛКА СЕРВЕРА:', err.stack);
    res.status(500).send('Помилка сервера при створенні компанії');
  }
});

app.post('/categories', async (req, res) => {
  const { name } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO categories (name) VALUES ($1) RETURNING *',
      [name]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('❌ categories POST error:', err);
    res.status(500).json({ error: 'Помилка при створенні категорії' });
  }
});

// Видалити категорію
app.delete('/categories/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM categories WHERE id = $1', [id]);
    res.sendStatus(204);
  } catch (err) {
    console.error('❌ categories DELETE error:', err);
    res.status(500).json({ error: 'Помилка при видаленні категорії' });
  }
});

app.delete('/companies/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM companies WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Компанію не знайдено' });
    res.json({ message: 'Компанія видалена' });
  } catch (err) {
    console.error('Помилка видалення компанії:', err);
    res.status(500).send('Внутрішня помилка сервера');
  }
});

app.listen(PORT, () => {
  console.log(`Сервер запущено на http://localhost:${PORT}`);
});
