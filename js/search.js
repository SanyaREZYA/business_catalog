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
      category_name = 'Категорія',
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
        <div class="badge" title="${category_name}">
          <span class="ellipsis-text">${category_name}</span>
        </div>
        <img alt="${name}" class="card-img-top" src="${logo_path}">
        <div class="card-body">
          <h5 class="card-title" title="${name}">${name}</h5>
          <div class="info-list">
            <div class="info-item" title="${address}"><span>📍</span> <span class="ellipsis-text">${address}</span></div>
            <div class="info-item" title="${email}"><span>📧</span> <span class="ellipsis-text">${email}</span></div>
            <div class="info-item" title="${website}"><span>🌐</span> <span class="ellipsis-text">${website}</span></div>
          </div>
          <div class="rating rating-main mb-2" data-company-id="${id}">
            <span class="star" data-value="1">&#9733;</span>
            <span class="star" data-value="2">&#9733;</span>
            <span class="star" data-value="3">&#9733;</span>
            <span class="star" data-value="4">&#9733;</span>
            <span class="star" data-value="5">&#9733;</span>
          </div>
          <div class="details mt-3" style="display: none;">
            <p class="info-item" title="${founder}"><span>👤</span> <span class="ellipsis-text">${founder}</span></p>
            <p class="info-item" title="${year_founded}"><span>📅</span> <span class="ellipsis-text">${year_founded}</span></p>
            <div class="rating rating-details mb-2 mt-2" data-company-id="${id}">
              <span class="star" data-value="1">&#9733;</span>
              <span class="star" data-value="2">&#9733;</span>
              <span class="star" data-value="3">&#9733;</span>
              <span class="star" data-value="4">&#9733;</span>
              <span class="star" data-value="5">&#9733;</span>
            </div>
          </div>
          <div class="actions d-flex justify-content-between">
            <button class="btn btn-primary btn-sm contact-btn" data-id="${id}">Контакти</button>
            <a class="btn btn-primary btn-sm details-btn" href="/company?id=${id}">Детальніше</a>
          </div>
        </div>
      </div>
    `;
    container.appendChild(card);
  });

  initializeRatings();
  initializeContactButtons();
}

function initializeRatings() {

  document.querySelectorAll('.rating').forEach(rating => {
    const stars = rating.querySelectorAll('.star');
    let selected = 0;

    stars.forEach((star, idx) => {
      star.addEventListener('mouseenter', () => {
        stars.forEach((s, i) => {
          s.classList.remove('selected');
          if (i <= idx) s.classList.add('selected');
        });
      });
      star.addEventListener('mouseleave', () => {
        stars.forEach((s, i) => {
          s.classList.remove('selected');
          if (i < selected) s.classList.add('selected');
        });
      });
      star.addEventListener('click', () => {
        selected = idx + 1;
        stars.forEach((s, i) => {
          s.classList.remove('selected');
          if (i < selected) s.classList.add('selected');
        });
        // TODO: fetch для збереження рейтингу
      });
    });
  });
}

function initializeContactButtons() {
  document.querySelectorAll('.contact-btn').forEach(btn => {
    btn.addEventListener('click', function () {
      const cardBody = this.closest('.card-body');
      if (!cardBody) return;
      const details = cardBody.querySelector('.details');
      const ratingMain = cardBody.querySelector('.rating-main');
      const ratingDetails = cardBody.querySelector('.rating-details');
      if (details) {
        const show = (details.style.display === 'none' || !details.style.display);
        details.style.display = show ? 'block' : 'none';
        if (ratingMain) ratingMain.style.display = show ? 'none' : '';
        if (ratingDetails) ratingDetails.style.display = show ? '' : 'none';
      }
    });
  });

  document.querySelectorAll('.rating-main').forEach(r => r.style.display = '');
  document.querySelectorAll('.rating-details').forEach(r => r.style.display = 'none');
}

function renderError(message) {
  const container = document.querySelector('main .row');
  if (!container) return;
  container.innerHTML = `<p class="text-danger">${message}</p>`;
}
