const express = require('express');
const multer = require('multer');
const path = require('path');
const app = express();
const pool = require('./db');
const PORT = process.env.PORT || 3000;

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'images/');
  },
  filename: (req, file, cb) => {
    const originalName = file.originalname;
    const extension = path.extname(originalName);
    const nameWithoutExt = path.basename(originalName, extension);
    const filename = `${nameWithoutExt}${extension}`;
    cb(null, filename.toLowerCase());
  }
});
const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Дозволено завантажувати лише зображення'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024
  }
 });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(async (req, res, next) => {
  try {
    await pool.query('SELECT 1');
    next();
  } catch (err) {
    res.status(500).json({ error: 'Database connection error' });
  }
});

app.use('/css', express.static(path.join(__dirname, 'css')));
app.use('/js', express.static(path.join(__dirname, 'js')));
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use('/html', express.static(path.join(__dirname, 'html')));

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

app.post('/api/add-business', upload.single('logo'), async (req, res) => {
  try {
    const {
      placement_type,
      company_name: name,
      category,
      region,
      address,
      postal_code,
      'contact-person': founder,
      edrpou_code,
      year_founded,
      phone1,
      phone2,
      phone3,
      email,
      telegram,
      viber,
      facebook,
      instagram,
      website,
      description: full_description,
      'unique-offer': short_description,
      'working-hours': working_hours
    } = req.body;

    const requiredFields = {
      'Назва компанії': name,
      'Відповідальна особа': founder,
      'Категорія': category,
      'Область': region,
      'Код ЄДРПОУ': edrpou_code,
      'Рік заснування': year_founded,
      'Поштовий індекс': postal_code
    };

    for (const [field, value] of Object.entries(requiredFields)) {
      if (!value) throw new Error(`Поле "${field}" є обов'язковим`);
    }

    const activity_area_id = parseInt(region);
    const category_id = parseInt(category);
    const year = parseInt(year_founded);

    if (isNaN(activity_area_id) || isNaN(category_id) || isNaN(year)) {
      throw new Error('Некоректні числові значення');
    }

    if (!/^\d{8,10}$/.test(edrpou_code)) {
      throw new Error('Код ЄДРПОУ має містити 8-10 цифр');
    }

    if (!/^\d{5}$/.test(postal_code)) {
      throw new Error('Поштовий індекс має містити 5 цифр');
    }

    if (year < 1900 || year > new Date().getFullYear()) {
      throw new Error('Невірно вказаний рік заснування');
    }

    const logoPath = req.file ? req.file.path : null;

    const query = `
      INSERT INTO companies (
        name, founder, edrpou_code, year_founded, activity_area_id, 
        category_id, address, postal_code, phone1, phone2, phone3,
        email, telegram, viber, facebook, instagram, website, logo_path,
        short_description, full_description, working_hours,
        created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, NOW(), NOW())
      RETURNING id
    `;

    const values = [
      name,
      founder,
      edrpou_code,
      year,
      activity_area_id,
      category_id,
      address,
      postal_code,
      phone1,
      phone2 || null,
      phone3 || null,
      email,
      telegram || null,
      viber || null,
      facebook || null,
      instagram || null,
      website || null,
      logoPath,
      short_description || null,
      full_description || null,
      working_hours || null,
    ];

    const { rows } = await pool.query(query, values);
    
    res.setHeader('Content-Type', 'application/json');
    res.status(201).json({
      success: true,
      companyId: rows[0].id,
      message: 'Компанію успішно додано!'
    });
  } catch (error) {
    console.error('Помилка при додаванні компанії:', error);
    res.setHeader('Content-Type', 'application/json');
    res.status(400).json({  
      success: false,
      message: error.message
    });
  }
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
    const result = await pool.query('SELECT * FROM companies WHERE id = $1', [req.params.id]);
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

process.on('SIGINT', async () => {
  await pool.end();
  process.exit(0);
});