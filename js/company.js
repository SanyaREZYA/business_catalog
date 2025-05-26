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

    document.querySelector('.company-logo').src = company.logo_path || '/images/default.png';

    document.querySelector('.company-info h2').textContent = company.name || 'Без назви';

    const phones = [company.phone1, company.phone2, company.phone3].filter(Boolean);

    let tagsHtml = '';
    try {
      const tagsRes = await fetch(`/company-tags`);
      if (tagsRes.ok) {
        const tags = await tagsRes.json();
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

    document.querySelector('.company-details').innerHTML = `
      <p>📍 ${company.address || 'Невідомо'}</p>
      <p>✉️ Email: <a href="mailto:${company.email}">${company.email || '-'}</a></p>
      <p>📞 Телефони:</p>
      <ul>
        ${phones.length ? phones.map(phone => `<li>${phone.trim()}</li>`).join('') : ''}
      </ul>
      <p>📱 Telegram: <a href="${company.telegram || '#'}" target="_blank">${company.telegram || '-'}</a></p>
      <p>👤 Керівник: ${company.founder || '-'}</p>
      <p>📋 Послуги:</p>
      <div>${tagsHtml}</div>
      <p>🌐 Сайт: <a href="${company.website || '#'}" target="_blank">${company.website || '-'}</a></p>
    `;

    document.querySelector('.company-description').innerHTML = company.full_description || 'Опис відсутній.';

    document.querySelector('.company-additional').innerHTML = `
      <p>🆔 ЄДРПОУ: <span>${company.edrpou_code || '-'}</span></p>
      <p>📅 Рік заснування: <span>${company.year_founded || '-'}</span></p>
      <p>📮 Поштовий індекс: <span>${company.postal_code || '-'}</span></p>
      <p>📞 Viber: <span>${company.viber || '-'}</span></p>
      <p>📘 Facebook: <a href="${company.facebook || '#'}" target="_blank">${company.facebook || '-'}</a></p>
      <p>📸 Instagram: <a href="${company.instagram || '#'}" target="_blank">${company.instagram || '-'}</a></p>
      <p>⏰ Робочий час: <span>${company.working_hours || '-'}</span></p>
      <p>🕒 Створено: <span>${company.created_at ? company.created_at.split('T')[0] : '-'}</span></p>
      <p>🔄 Оновлено: <span>${company.updated_at ? company.updated_at.split('T')[0] : '-'}</span></p>
    `;
  } catch (error) {
    console.error(error);
    document.querySelector('.company-container').innerHTML = '<p>Помилка завантаження даних компанії.</p>';
  }

  async function loadReviews() {
    const params = new URLSearchParams(window.location.search);
    const companyId = params.get('id');
    const list = document.getElementById('reviews-list');
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
      const res = await fetch(`/company/${companyId}/reviews`, {
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