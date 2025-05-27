document.addEventListener('DOMContentLoaded', async function () {
  const params = new URLSearchParams(window.location.search);
  const companyId = params.get('id');

  if (!companyId) {
    document.querySelector('.company-container').innerHTML = '<p>Компанію не знайдено.</p>';
    return;
  }

  try {
    const response = await fetch(`/companies/${companyId}`);
    if (!response.ok) throw new Error('Помилка завантаження даних компанії');
    const company = await response.json();

    // Деталі компанії
    const phones = [company.phone1, company.phone2, company.phone3].filter(Boolean);

    // Отримання тегів компанії
    let tagsHtml = '';
    try {
      const tagsRes = await fetch(`/company-tags`);
      if (tagsRes.ok) {
        const tags = await tagsRes.json();
        // Фільтруємо теги для цієї компанії
        const companyTags = tags.filter(tag => tag.company_id == companyId);
        if (companyTags.length) {
          tagsHtml = companyTags.map(tag => `<span class="tag" style="display:inline-block;background:#e0f7fa;color:#007b83;padding:0.2em 0.7em;margin:0 0.3em 0.3em 0;border-radius:12px;font-size:0.95em;">${tag.tag}</span>`).join('');
        } else {
          tagsHtml = '<span class="text-muted">-</span>';
        }
      } else {
        tagsHtml = '<span class="text-muted">-</span>';
      }
    } catch {
      tagsHtml = '<span class="text-muted">-</span>';
    }

    // --- Формування центрального блоку з логотипом зліва від назви ---
    document.querySelector('.company-logo').src = company.logo_path || '/images/default.png';
    document.querySelector('.company-info h2').textContent = company.name || 'Без назви';

    // Опис компанії
    document.querySelector('.company-description').innerHTML = company.full_description || 'Опис відсутній.';

    // Деталі компанії (ліва колонка)
    document.querySelector('.company-details').innerHTML = `
      <div><b>Фактична адреса:</b><br>${company.address || '-'}</div>
      <div><b>Поштова адреса:</b><br>${company.address || '-'}</div>
      <div><b>Юридична адреса:</b><br>${company.address || '-'}</div>
      <div><b>Телефони:</b><br>
        ${phones.length ? phones.map(phone => `<a href="tel:${phone}">${phone}</a>`).join(', ') : '-'}
      </div>
      <div><b>Факс:</b> ${company.fax ? `<a href="tel:${company.fax}">${company.fax}</a>` : '-'}</div>
      <div><b>E-mail:</b> <a href="mailto:${company.email}">${company.email || '-'}</a></div>
      <div><b>Сайт:</b> <a href="${company.website || '#'}" target="_blank">${company.website || '-'}</a></div>
    `;

    // Послуги (центральний блок)
    document.querySelector('.company-services').innerHTML = `
      <h5>Продукція, послуги</h5>
      <div>${tagsHtml}</div>
    `;

    // Додаткові поля (права колонка)
    document.querySelector('.company-additional').innerHTML = `
      <div class="p-3 border rounded bg-white mb-3 company-additional-wide">
        <h5>Реєстраційні дані</h5>
        <div>Код ЄДРПОУ: <b>${company.edrpou_code || '-'}</b></div>
        <div>Керівник: <b>${company.founder || '-'}</b></div>
        <div>Рік заснування: <b>${company.year_founded || '-'}</b></div>
        <div>Кількість працівників: <b>${company.employees_count || '-'}</b></div>
        <div>Дата реєстрації: <b>${company.created_at ? company.created_at.split('T')[0] : '-'}</b></div>
        <div>Дата оновлення: <b>${company.updated_at ? company.updated_at.split('T')[0] : '-'}</b></div>
      </div>
      <div class="p-3 border rounded bg-white">
        <h5>Графік роботи</h5>
        ${company.working_hours ? company.working_hours.split('\n').map(line => `<div>${line}</div>`).join('') : '<div>-</div>'}
      </div>
    `;

  } catch (error) {
    console.error(error);
    document.querySelector('.company-container').innerHTML = '<p>Помилка завантаження даних компанії.</p>';
  }

  // --- Відгуки (залишаємо, якщо потрібно) ---
  async function loadReviews() {
    const params = new URLSearchParams(window.location.search);
    const companyId = params.get('id');
    const list = document.getElementById('reviews-list');
    if (!list) return;
    list.innerHTML = '<div class="text-muted">Завантаження...</div>';
    try {
      const res = await fetch(`/companies/${companyId}/reviews`);
      if (res.ok) {
        const reviews = await res.json();
        if (reviews.length) {
          list.innerHTML = reviews.map(r => `
            <div class="mb-3 p-2 border rounded bg-white">
              <div class="fw-bold">${r.user_name || 'Анонім'}</div>
              <div>${r.review_text}</div>
              <div class="text-muted small">${r.created_at ? r.created_at.split('T')[0] : ''}</div>
            </div>
          `).join('');
        } else {
          list.innerHTML = '<div class="text-muted">Відгуків ще немає.</div>';
        }
      } else {
        list.innerHTML = '<div class="text-danger">Не вдалося завантажити відгуки.</div>';
      }
    } catch {
      list.innerHTML = '<div class="text-danger">Не вдалося завантажити відгуки.</div>';
    }
  }

  document.getElementById('review-form')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    const params = new URLSearchParams(window.location.search);
    const companyId = params.get('id');
    const name = document.getElementById('review-name').value.trim();
    const text = document.getElementById('review-text').value.trim();
    const form = this;
    let msg = form.querySelector('.review-msg');
    if (!msg) {
      msg = document.createElement('div');
      msg.className = 'review-msg mt-2';
      form.appendChild(msg);
    }
    msg.textContent = '';
    if (!text) {
      msg.textContent = 'Введіть текст відгуку.';
      msg.classList.add('text-danger');
      return;
    }
    if (!name) {
      msg.textContent = "Введіть ім'я.";
      msg.className = 'review-msg mt-2 text-danger';
      form.querySelector('button[type="submit"]').disabled = false;
      return;
    }
    form.querySelector('button[type="submit"]').disabled = true;
    msg.textContent = 'Надсилається...';
    msg.className = 'review-msg mt-2 text-secondary';
    try {
      const res = await fetch(`/companies/${companyId}/reviews`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ review_text: text, user_name: name })
      });
      if (res.ok) {
        document.getElementById('review-text').value = '';
        document.getElementById('review-name').value = '';
        msg.textContent = 'Відгук надіслано!';
        msg.className = 'review-msg mt-2 text-success';
        await loadReviews();
        const last = document.querySelector('#reviews-list > div:last-child');
        if (last) last.scrollIntoView({ behavior: 'smooth', block: 'end' });
      } else {
        msg.textContent = 'Не вдалося надіслати відгук.';
        msg.className = 'review-msg mt-2 text-danger';
      }
    } catch {
      msg.textContent = 'Не вдалося надіслати відгук.';
      msg.className = 'review-msg mt-2 text-danger';
    }
    form.querySelector('button[type="submit"]').disabled = false;
  });

  loadReviews();
});
