document.addEventListener('DOMContentLoaded', function () {
  const input = document.querySelector('.input-group input[type="search"]');
  const button = document.querySelector('.input-group button');

  if (!input || !button) return;

  button.addEventListener('click', () => searchCompany(input.value));

  input.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
      searchCompany(input.value);
    }
  });
});

function searchCompany(name) {
  if (!name.trim()) return;

  fetch(`/companies/search/${encodeURIComponent(name)}`)
    .then(res => {
      if (!res.ok) throw new Error('Network response was not ok');
      return res.json();
    })
    .then(data => renderResults(data))
    .catch(err => {
      console.error('Search error:', err);
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
      image = '/images/default.png',
      location = 'Невідомо',
      email = '-',
      website = '#'
    } = company;

    const card = document.createElement('div');
    card.className = 'col-md-3 mb-6';

    card.innerHTML = `
      <div class="card h-100 shadow-sm">
        <div class="badge">${category}</div>
        <img alt="${name}" class="card-img-top" src="${image}">
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
