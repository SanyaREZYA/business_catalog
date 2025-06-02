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

    document.querySelector('.company-logo').src = company.logo_path || '/images/default.png';
    document.querySelector('.company-info h2').textContent = company.name || 'Без назви';

    document.querySelector('.company-description').innerHTML = company.full_description || 'Опис відсутній.';

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

    document.querySelector('.company-services').innerHTML = `
      <h5>Продукція, послуги</h5>
      <div>${tagsHtml}</div>
    `;

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

  // Завантаження відгуків
  async function loadReviews() {
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
              <div class="review-stars">${'★'.repeat(r.rating || 0)}</div> <div>${r.review_text}</div>
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

  await loadReviews();

  // Відправка нового відгуку
  const reviewForm = document.getElementById('review-form');
  const userNameInput = document.getElementById('review-name');
  const reviewTextInput = document.getElementById('review-text');

  reviewForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const user_name = userNameInput.value.trim();
    const review_text = reviewTextInput.value.trim();
    // Отримуємо вибране значення оцінки
    const ratingInput = document.querySelector('input[name="rating"]:checked');
    const rating = ratingInput ? parseInt(ratingInput.value) : null;
    console.log(rating);
    if (!user_name || !review_text || rating === null) {
      alert('Будь ласка, заповніть усі поля та поставте оцінку.');
      return;
    }

    try {
      const res = await fetch(`/company/${companyId}/reviews`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ user_name, review_text, rating })
      });

      if (res.ok) {
        alert('Відгук успішно додано!');
        userNameInput.value = '';
        reviewTextInput.value = '';
        document.querySelectorAll('input[name="rating"]').forEach(radio => radio.checked = false);
        await loadReviews();
      } else {
        alert('Не вдалося додати відгук. Спробуйте ще раз.');
      }
    } catch (error) {
      console.error('Помилка при відправці відгуку:', error);
      alert('Виникла помилка при відправці відгуку.');
    }
  });

});