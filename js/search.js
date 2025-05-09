document.addEventListener('DOMContentLoaded', function () {
  if (window.location.pathname === '/search') {
    const params = new URLSearchParams(window.location.search);
    const queryParam = params.get('query');
    if (queryParam && queryParam.trim()) {
      searchCombined(queryParam);
    }
  }

  const nameInput = document.querySelector('.input-group input[type="search"]');
  const nameButton = document.querySelector('.input-group button');
  const tagInput = document.querySelector('.tag-search input[type="text"]');
  const tagButton = document.querySelector('.tag-search button');

  // Функція отримує input-елемент і створює змінну query із його значення
  function handleSearch(inputElement) {
    const query = inputElement.value;
    if (!query.trim()) {
      renderError("Ви нічого не ввели в пошукове поле.");
      return;
    }
    if (window.location.pathname !== '/search') {
      window.location.href = `/search?query=${encodeURIComponent(query)}`;
    } else {
      history.replaceState(null, '', `/search?query=${encodeURIComponent(query)}`);
      searchCombined(query);
    }
  }

  if (nameInput && nameButton) {
    nameButton.addEventListener('click', () => handleSearch(nameInput));
    nameInput.addEventListener('keypress', function (e) {
      if (e.key === 'Enter') handleSearch(nameInput);
    });
  }

  if (tagInput && tagButton) {
    tagButton.addEventListener('click', () => handleSearch(tagInput));
    tagInput.addEventListener('keypress', function (e) {
      if (e.key === 'Enter') handleSearch(tagInput);
    });
  }
});

function searchCombined(query) {
  if (!query.trim()) return;

  let container = document.querySelector('main .row');
  if (!container) {
    const mainEl = document.createElement('main');
    container = document.createElement('div');
    container.className = 'row';
    mainEl.appendChild(container);
    document.body.appendChild(mainEl);
  }

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
      id,
      name = 'Без назви',
      short_description = 'Категорія',
      logo_path = '/images/default.png',
      address = 'Невідомо',
      email = '-',
      website = '#',
      founder = 'Невідомо',
      year_founded = 'Невідомо'
    } = company;

    const card = document.createElement('div');
    card.className = 'col-md-3 mb-6';

    card.innerHTML = `
      <div class="card h-100 shadow-sm">
        <div class="badge">${short_description}</div>
        <img alt="${name}" class="card-img-top" src="${logo_path}">
        <div class="card-body d-flex flex-column">
          <h5 class="card-title">${name}</h5>
          <p class="info-item"><span>📍</span> ${address}</p>
          <p class="info-item"><span>📧</span> ${email}</p>
          <p class="info-item"><span>🌐</span> ${website}</p>
          <div class="details mt-3" style="display: none;">
            <p class="info-item" style="margin-top:-1rem !important"><span>👤</span> ${founder}</p>
            <p class="info-item"><span>📅</span> ${year_founded}</p>
          </div>
          <div class="actions mt-auto d-flex justify-content-between">
            <button class="btn btn-outline-primary btn-sm contact-btn" data-id="${id}">Контакти</button>
            <a class="btn btn-primary btn-sm details-btn" href="/company.html?id=${id}">Детальніше</a>
          </div>
        </div>
      </div>`;
    container.appendChild(card);
  });

  const contactButtons = container.querySelectorAll('.contact-btn');
  contactButtons.forEach(button => {
    button.addEventListener('click', function () {
      const cardBody = this.closest('.card-body');
      const details = cardBody.querySelector('.details');
      if (details.style.display === 'none') {
        details.style.display = 'block';
        this.textContent = 'Згорнути';
      } else {
        details.style.display = 'none';
        this.textContent = 'Контакти';
      }
    });
  });
}

function renderError(message) {
  const container = document.querySelector('main .row');
  if (container) container.innerHTML = `<p class="text-danger">${message}</p>`;
}
