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

    // Оновлюємо логотип
    document.querySelector('.company-logo').src = company.logo_path || '/images/default.png';

    // Назва компанії
    document.querySelector('.company-info h2').textContent = company.name || 'Без назви';

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

    // Опис компанії
    document.querySelector('.company-description').innerHTML = company.full_description || 'Опис відсутній.';

    // Додаткові поля
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
});