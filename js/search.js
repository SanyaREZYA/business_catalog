document.addEventListener('DOMContentLoaded', function () {
  // Елементи для пошуку за назвою компанії:
  const nameInput = document.querySelector('.input-group input[type="search"]');
  const nameButton = document.querySelector('.input-group button');
  
  // Елементи для пошуку по тегу:
  const tagInput = document.querySelector('.tag-search input[type="text"]');
  const tagButton = document.querySelector('.tag-search button');

  // Використовуємо спільну функцію для обробки обох видів пошуку
  if (nameInput && nameButton) {
    nameButton.addEventListener('click', () => searchCombined(nameInput.value));
    nameInput.addEventListener('keypress', function (e) {
      if (e.key === 'Enter') {
        searchCombined(nameInput.value);
      }
    });
  }

  if (tagInput && tagButton) {
    tagButton.addEventListener('click', () => searchCombined(tagInput.value));
    tagInput.addEventListener('keypress', function (e) {
      if (e.key === 'Enter') {
        searchCombined(tagInput.value);
      }
    });
  }
});

function searchCombined(query) {
  if (!query.trim()) return;

  // Створюємо два запити: для пошуку за назвою та для пошуку за тегом
  const searchByName = fetch(`/companies/search/${encodeURIComponent(query)}`)
    .then(res => {
      if (!res.ok) throw new Error('Network response was not ok for company name search');
      return res.json();
    });
    
  const searchByTag = fetch(`/companies-by-tag-name/${encodeURIComponent(query)}`)
    .then(res => {
      if (!res.ok) throw new Error('Network response was not ok for tag search');
      return res.json();
    });

  // Об'єднуємо результати, видаляючи дублікати (за id)
  Promise.all([searchByName, searchByTag])
    .then(([byName, byTag]) => {
      const merged = [];
      const seenIds = new Set();

      [...byName, ...byTag].forEach(company => {
        if (!seenIds.has(company.id)) {
          seenIds.add(company.id);
          merged.push(company);
        }
      });

      renderResults(merged);
    })
    .catch(err => {
      console.error('Combined search error:', err);
      renderError('Помилка при завантаженні результатів.');
    });
}

function renderResults(companies) {
  const container = document.querySelector('main .row');
  if (!container) return;

  container.innerHTML = '';

  if (!Array.isArray(companies) || companies.length === 0) {
    container.innerHTML = '<p class="text-muted">Нічого не знайдено.</p>';
    return;
  }

  companies.forEach(company => {
    const {
      name = 'Без назви',
      category = 'Категорія',
      logo_path = '/images/default.png',
      location = 'Невідомо',
      email = '-',
      website = '#'
    } = company;

    const card = document.createElement('div');
    card.className = 'col-md-3 mb-6';

    card.innerHTML = `
      <div class="card h-100 shadow-sm">
        <div class="badge">${category}</div>
        <img alt="${name}" class="card-img-top" src="${logo_path}">
        <div class="card-body d-flex flex-column">
          <h5 class="card-title">${name}</h5>
          <p class="info-item"><span>📍</span> ${location}</p>
          <p class="info-item"><span>📧</span> ${email}</p>
          <p class="info-item"><span>🌐</span> ${website}</p>
          <div class="actions mt-auto d-flex justify-content-between">
            <a class="btn btn-outline-primary btn-sm" href="${website}" target="_blank">Контакти</a>
            <a class="btn btn-primary btn-sm" href="#">Детальніше</a>
          </div>
        </div>
      </div>`;
    container.appendChild(card);
  });
}

function renderError(message) {
  const container = document.querySelector('main .row');
  if (container) {
    container.innerHTML = `<p class="text-danger">${message}</p>`;
  }
}
