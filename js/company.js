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

    const phones = [company.phone1, company.phone2, company.phone3].filter(Boolean);

    // Отримання тегів
    let tagsHtml = '';
    try {
      const tagsRes = await fetch(`/company-tags`);
      if (tagsRes.ok) {
        const tags = await tagsRes.json();
        const companyTags = tags.filter(tag => tag.company_id == companyId);
        tagsHtml = companyTags.length
          ? companyTags.map(tag => `<span class="tag" style="display:inline-block;background:#e0f7fa;color:#007b83;padding:0.2em 0.7em;margin:0 0.3em 0.3em 0;border-radius:12px;font-size:0.95em;">${tag.tag}</span>`).join('')
          : '<span class="text-muted">-</span>';
      } else {
        tagsHtml = '<span class="text-muted">-</span>';
      }
    } catch {
      tagsHtml = '<span class="text-muted">-</span>';
    }

    // Основні дані
    document.querySelector('.company-logo').src = company.logo_path || '/images/default.png';
    document.querySelector('.company-info h2').textContent = company.name || 'Без назви';
    document.querySelector('.company-description').innerHTML = company.full_description || 'Опис відсутній.';

    // Соціальні мережі
    const socialMediaLinks = [];
    if (company.telegram) socialMediaLinks.push(`<b>Telegram:</b> <a href="${company.telegram}" target="_blank">${company.telegram}</a>`);
    if (company.viber) socialMediaLinks.push(`<b>Viber:</b> <a href="${company.viber}" target="_blank">${company.viber}</a>`);
    if (company.facebook) socialMediaLinks.push(`<b>Facebook:</b> <a href="${company.facebook}" target="_blank">${company.facebook}</a>`);
    if (company.instagram) socialMediaLinks.push(`<b>Instagram:</b> <a href="${company.instagram}" target="_blank">${company.instagram}</a>`);

    const socialMediaHtml = socialMediaLinks.length > 0 ? socialMediaLinks.map(s => `<div>${s}</div>`).join('') : '<div>-</div>';

    // Лівий блок з контактами
    document.querySelector('.company-details').innerHTML = `
      <div><b>Фактична адреса:</b> ${company.address || '-'}</div>
      <div><b>Поштова адреса:</b> ${company.address || '-'}</div>
      <div><b>Юридична адреса:</b> ${company.address || '-'}</div>
      <div><b>Телефони:</b> ${phones.length ? phones.map(p => `<a href="tel:${p}">${p}</a>`).join(', ') : '-'}</div>
      <div><b>Соціальні мережі:</b><br>${socialMediaHtml}</div>
      <div><b>Факс:</b> ${company.fax ? `<a href="tel:${company.fax}">${company.fax}</a>` : '-'}</div>
      <div><b>E-mail:</b> <a href="mailto:${company.email}">${company.email || '-'}</a></div>
      <div><b>Сайт:</b> <a href="${company.website || '#'}" target="_blank">${company.website || '-'}</a></div>
    `;

    // Послуги
    document.querySelector('.company-services').innerHTML = `
      <h5>Продукція, послуги</h5>
      <div>${tagsHtml}</div>
    `;

    // Оновлений правий блок (company-additional)
    // ЗМІНА ТУТ: Видалено блок "Кількість працівників"
    document.querySelector('.company-additional').innerHTML = `
      <div class="p-3 rounded bg-white mb-3">
        <h5>Реєстраційні дані</h5>
        <div class="mb-2">
          <div><b>Код ЄДРПОУ</b></div>
          <div>${company.edrpou_code || '-'}</div>
        </div>
        <div class="mb-2">
          <div><b>Керівник</b></div>
          <div>${company.founder || '-'}</div>
        </div>
        ${company.accountant ? `<div class="mb-2">
          <div><b>Бухгалтер</b></div>
          <div>${company.accountant}</div>
        </div>` : ''}
        <div class="mb-2">
          <div><b>Рік заснування:</b></div>
          <div>${company.year_founded || '-'}</div>
        </div>
        <div class="mb-2">
          <div><b>Дата реєстрації</b></div>
          <div>${company.created_at ? company.created_at.split('T')[0] : '-'}</div>
        </div>
        <div class="mb-2">
          <div><b>Дата оновлення</b></div>
          <div>${company.updated_at ? company.updated_at.split('T')[0] : '-'}</div>
        </div>
        ${company.working_hours ? `<div class="mb-2">
          <div><b>Графік роботи</b></div>
          <div>${company.working_hours.split('\n').map(line => `<div>${line}</div>`).join('')}</div>
        </div>` : ''}
      </div>
    `;

  } catch (error) {
    console.error(error);
    document.querySelector('.company-container').innerHTML = '<p>Помилка завантаження даних компанії.</p>';
  }

  // Відгуки
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
            <div class="p-3 rounded bg-white mb-3">
              <div class="fw-bold">${r.user_name || 'Анонім'}</div>
              <div class="review-stars">${'★'.repeat(r.rating || 0)}</div>
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

  await loadReviews();

  // Відправка нового відгуку
  const reviewForm = document.getElementById('review-form');
  const userNameInput = document.getElementById('review-name');
  const reviewTextInput = document.getElementById('review-text');

  // ДОДАЄМО ЦЕЙ КОД ДЛЯ ОБМЕЖЕННЯ ВВОДУ СИМВОЛІВ
  const MAX_USERNAME_LENGTH = 256;
  userNameInput.addEventListener('input', function() {
    if (this.value.length > MAX_USERNAME_LENGTH) {
      this.value = this.value.slice(0, MAX_USERNAME_LENGTH);
    }
  });
  // КІНЕЦЬ НОВОГО КОДУ

  reviewForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const user_name = userNameInput.value.trim();
    const review_text = reviewTextInput.value.trim();
    const ratingInput = document.querySelector('input[name="rating"]:checked');
    const rating = ratingInput ? parseInt(ratingInput.value) : null;

    if (!user_name || !review_text || rating === null) {
      alert('Будь ласка, заповніть усі поля та поставте оцінку.');
      return;
    }

    // Додаткова перевірка довжини перед відправкою (хоча event listener вже обріже)
    if (user_name.length > MAX_USERNAME_LENGTH) {
        alert(`Ім'я користувача не може перевищувати ${MAX_USERNAME_LENGTH} символів.`);
        return;
    }

    try {
      const res = await fetch(`/company/${companyId}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_name, review_text, rating })
      });

      if (res.ok) {
        alert('Відгук успішно додано!');
        userNameInput.value = '';
        reviewTextInput.value = '';
        document.querySelectorAll('input[name="rating"]').forEach(r => r.checked = false);
        await loadReviews();
      } else {
        const errorData = await res.json();
        alert(`Не вдалося додати відгук: ${errorData.error || 'Спробуйте ще раз.'}`);
      }
    } catch (error) {
      console.error('Помилка при відправці відгуку:', error);
      alert('Виникла помилка при відправці відгуку.');
    }
  });
});