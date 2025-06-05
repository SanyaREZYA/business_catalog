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

    const socialMediaLinks = [];
    if (company.telegram) socialMediaLinks.push(`<div><b>Telegram:</b><br><a href="${company.telegram}" target="_blank"><span class="truncate">${company.telegram}</span></a></div>`);
    if (company.viber) socialMediaLinks.push(`<div><b>Viber:</b><br><a href="${company.viber}" target="_blank"><span class="truncate">${company.viber}</span></a></div>`);
    if (company.facebook) socialMediaLinks.push(`<div><b>Facebook:</b><br><a href="${company.facebook}" target="_blank"><span class="truncate">${company.facebook}</span></a></div>`);
    if (company.instagram) socialMediaLinks.push(`<div><b>Instagram:</b><br><a href="${company.instagram}" target="_blank"><span class="truncate">${company.instagram}</span></a></div>`);

    const socialMediaHtml = socialMediaLinks.length > 0 ? socialMediaLinks.join('') : '<div>-</div>';

    const phoneHtml = phones.length
      ? phones.map(p => `<div><a href="tel:${p}">${p}</a></div>`).join('')
      : '-';

    document.querySelector('.company-details').innerHTML = `
      <div><b>Фактична адреса:</b></div>
      <div>${company.address || '-'}</div>
      <div><b>Поштова адреса:</b></div>
      <div>${company.address || '-'}</div>
      <div><b>Юридична адреса:</b></div>
      <div>${company.address || '-'}</div>
      <div><b>Телефони:</b></div>
      ${phoneHtml}
      ${socialMediaHtml}
      <div><b>Факс:</b> ${company.fax ? `<a href="tel:${company.fax}"><span class="truncate">${company.fax}</span></a>` : '-'}</div>
      <div><b>E-mail:</b> <a href="mailto:${company.email}"><span class="truncate">${company.email || '-'}</span></a></div>
      <div><b>Сайт:</b> <a href="${company.website || '#'}" target="_blank"><span class="truncate">${company.website || '-'}</span></a></div>
    `;

    // КВЕДИ - Генеруємо HTML для КВЕДів
    let kwedsHtml = '';
    try {
      const companyKwedsRes = await fetch(`/company_kweds?company_id=${companyId}`);
      if (companyKwedsRes.ok) {
        const companyKweds = await companyKwedsRes.json(); 

        if (companyKweds.length) {
          const kvedPromises = companyKweds.map(async (ck) => {
            const kvedRes = await fetch(`/kveds/${ck.kwed_id}`);
            if (kvedRes.ok) {
              const kved = await kvedRes.json();
              const isMainClass = ck.is_main ? 'fw-bold text-primary' : ''; // Highlight main KVED
              // Змінено: Додано " - " перед kved.name
              return `<div class="${isMainClass}">- ${kved.name || '-'}</div>`; 
            }
            return '';
          });
          const kvedsArray = await Promise.all(kvedPromises);
          // Збережено inline style для збільшення шрифту КВЕДів
          kwedsHtml = `
            <div class="p-3 rounded bg-white mb-3" style="font-size: 1.2em;">
              <h5>Види діяльності КВЕД</h5>
              ${kvedsArray.join('')}
            </div>
          `;
        } else {
          // Збережено inline style для збільшення шрифту КВЕДів
          kwedsHtml = `
            <div class="p-3 rounded bg-white mb-3" style="font-size: 1.2em;">
              <h5>Види діяльності КВЕД</h5>
              <div class="text-muted">-</div>
            </div>
          `;
        }
      } else {
        // Збережено inline style для збільшення шрифту КВЕДів
        kwedsHtml = `
          <div class="p-3 rounded bg-white mb-3" style="font-size: 1.2em;">
            <h5>КВЕДИ</h5>
            <div class="text-danger">Не вдалося завантажити КВЕДИ.</div>
          </div>
        `;
      }
    } catch (error) {
      console.error('Помилка при завантаженні КВЕДІВ:', error);
      // Збережено inline style для збільшення шрифту КВЕДів
      kwedsHtml = `
        <div class="p-3 rounded bg-white mb-3" style="font-size: 1.2em;">
          <h5>КВЕДИ</h5>
          <div class="text-danger">Не вдалося завантажити КВЕДИ.</div>
        </div>
      `;
    }

    // Теги - Генеруємо HTML для Тегів
    // Змінено: Видалено inline style для контейнера тегів, щоб повернути попередній розмір
    const tagsSectionHtml = `
      <div class="p-3 rounded bg-white mb-3">
        <h5>Теги</h5>
        <div>${tagsHtml}</div>
      </div>
    `;

    // Оновлений правий блок (company-additional) - тепер містить тільки реєстраційні дані
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

    // Вставляємо КВЕДИ та Теги в центральний блок.
    // Додаємо їх після блоку company-description.
    const companyDescriptionElement = document.querySelector('.company-description');
    if (companyDescriptionElement) {
        // Порядок: спочатку КВЕДИ, потім Теги
        companyDescriptionElement.insertAdjacentHTML('afterend', tagsSectionHtml); // Додаємо Теги
        companyDescriptionElement.insertAdjacentHTML('afterend', kwedsHtml);    // Додаємо КВЕДИ (буде вище Тегів, якщо вставляти після одного й того ж елемента)
    } else {
        // Якщо company-description не знайдено, можна додати до company-container
        document.querySelector('.company-container').insertAdjacentHTML('beforeend', kwedsHtml);
        document.querySelector('.company-container').insertAdjacentHTML('beforeend', tagsSectionHtml);
    }

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
      alert('Виникла помишка при відправці відгуку.');
    }
  });
});