document.addEventListener('DOMContentLoaded', function() {
  const tabBtns = document.querySelectorAll('.tab-btn');
  const vipInput = document.getElementById('vip-flag');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      this.classList.add('active');
      const tabId = this.getAttribute('data-tab') + '-tab';
      document.getElementById(tabId).classList.add('active');

      if (vipInput) {
        vipInput.value = this.getAttribute('data-tab') === 'vip' ? 'true' : 'false';
      }
    });
  });

  function setupCharCounter(textareaId, counterId, maxLength) {
    const textarea = document.getElementById(textareaId);
    const counter = document.getElementById(counterId);
    
    if (textarea && counter) {
      textarea.addEventListener('input', function() {
        const currentLength = this.value.length;
        counter.textContent = currentLength;
        counter.style.color = currentLength > maxLength * 0.9 ? '#ff4757' : '#495057';
      });
    }
  }

  setupCharCounter('description', 'desc-counter', 500);
  setupCharCounter('unique-offer', 'offer-counter', 100);
  setupCharCounter('article-requirements', 'requirements-counter', 1000);
  setupCharCounter('working-hours', 'hours-counter', 200);
  setupCharCounter('working-hours-vip', 'hours-counter-vip', 200);

  function setupImagePreview(inputId, previewId) {
  const input = document.getElementById(inputId);
  const preview = document.getElementById(previewId);
  
    if (input && preview) {
      input.addEventListener('change', function() {
        if (this.files && this.files[0]) {
          const reader = new FileReader();
        
          reader.onload = function(e) {
            preview.innerHTML = `
              <img 
                src="${e.target.result}" 
                alt="Попередній перегляд логотипу" 
                style="max-width: 300px; max-height: 300px;"
              />
            `;
          }
        
          reader.readAsDataURL(this.files[0]);
        } else {
          preview.innerHTML = '';
        }
      });
    }
  }

  setupImagePreview('logo', 'logo-preview');
  setupImagePreview('logo-vip', 'vip-logo-preview');

  async function submitForm(form, endpoint) {
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.innerHTML;
    
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Відправка...';
    
    try {
      const formData = new FormData(form);
      const placementType = formData.get('placement_type');
      
      const requiredFields = {
        'company_name': 'Назва компанії',
        'contact-person': 'Відповідальна особа',
        'edrpou_code': 'Код ЄДРПОУ',
        'year_founded': 'Рік заснування',
        'postal_code': 'Поштовий індекс'
      };
  
      for (const [field, name] of Object.entries(requiredFields)) {
        if (!formData.get(field)) {
          throw new Error(`Будь ласка, заповніть поле "${name}"`);
        }
      }

      if (placementType === 'vip') {
        if (!formData.get('category') || !formData.get('region')) {
          throw new Error('Для VIP розміщення обов\'язково виберіть категорію та область');
        }
      }
  
      if (!/^\d{8,10}$/.test(formData.get('edrpou_code'))) {
        throw new Error('Код ЄДРПОУ має містити 8-10 цифр');
      }
  
      if (!/^\d{5}$/.test(formData.get('postal_code'))) {
        throw new Error('Поштовий індекс має містити 5 цифр');
      }
  
      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      });

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        throw new Error(`Очікувався JSON, але отримано: ${text.substring(0, 100)}...`);
      }
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Помилка сервера');
      }
      
      alert(result.message || 'Компанію успішно додано!');
      form.reset();
      document.querySelectorAll('.file-preview').forEach(el => el.innerHTML = '');
    } catch (error) {
      console.error('Помилка:', error);
      alert(`Помилка: ${error.message}`);
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnText;
    }
  }

  document.getElementById('standard-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    submitForm(e.target, '/api/add-business');
  });

  document.getElementById('vip-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    submitForm(e.target, '/api/add-business');
  });

  async function loadInitialData() {
  try {
    const areasResponse = await fetch('/activity-areas');
    const areas = await areasResponse.json();
    const regionSelect = document.getElementById('region');
    const vipRegionSelect = document.getElementById('vip-region');

    const categoriesResponse = await fetch('/categories');
    const categories = await categoriesResponse.json();
    const categorySelect = document.getElementById('category');
    const vipCategorySelect = document.getElementById('vip-category');

    const kvedsResponse = await fetch('/kveds');
    const kveds = await kvedsResponse.json();
    const kvedSelect = document.getElementById('kveds');
    const vipKvedSelect = document.getElementById('vip-kveds');

    const populateSelect = (select, data) => {
      if (select) {
        data.forEach(item => {
          const option = document.createElement('option');
          option.value = item.id;
          option.textContent = item.name;
          select.appendChild(option);
        });
      }
    };

    populateSelect(regionSelect, areas);
    populateSelect(categorySelect, categories);
    populateSelect(vipRegionSelect, areas);
    populateSelect(vipCategorySelect, categories);

    const parseKvedNumber = (name) => {
      const match = name.match(/^(\d+)(\.\d+)?/);
      if (!match) return 0;
      const integer = parseInt(match[1], 10);
      const decimal = match[2] ? parseFloat(match[2]) : 0;
      return integer + decimal;
    };

    const choicesArray = kveds
      .map(item => {
        const kvedNumber = parseKvedNumber(item.name);
        const searchable = item.name.replace(/\./g, '').toLowerCase();
        return {
          value: item.id,
          label: item.name,
          customProperties: {
            searchable
          },
          _sortNumber: kvedNumber
        };
      })
      .sort((a, b) => a._sortNumber - b._sortNumber);

    const kvedChoices = new Choices(kvedSelect, {
      removeItemButton: true,
      shouldSort: false,
      placeholderValue: 'Оберіть КВЕДи',
      searchPlaceholderValue: 'Пошук...',
      searchFields: ['label', 'customProperties.searchable'],
      searchResultLimit: -1,
    });

    const vipKvedChoices = new Choices(vipKvedSelect, {
      removeItemButton: true,
      shouldSort: false,
      placeholderValue: 'Оберіть КВЕДи',
      searchPlaceholderValue: 'Пошук...',
      searchFields: ['label', 'customProperties.searchable'],
      searchResultLimit: -1,
    });

    kvedChoices.setChoices(choicesArray, 'value', 'label', true);
    vipKvedChoices.setChoices(choicesArray, 'value', 'label', true);

  } catch (error) {
    console.error('Помилка завантаження даних:', error);
  }
}

  loadInitialData();
});

document.getElementById('edrpou')?.addEventListener('input', function() {
  const hint = this.nextElementSibling;
  if (this.validity.patternMismatch) {
    this.setCustomValidity('Код ЄДРПОУ має містити 8-10 цифр');
    if (hint) hint.style.display = 'block';
  } else {
    this.setCustomValidity('');
    if (hint) hint.style.display = 'none';
  }
});

document.getElementById('postal-code')?.addEventListener('input', function() {
  const hint = this.nextElementSibling;
  if (this.validity.patternMismatch) {
    this.setCustomValidity('Поштовий індекс має містити 5 цифр');
    if (hint) hint.style.display = 'block';
  } else {
    this.setCustomValidity('');
    if (hint) hint.style.display = 'none';
  }
});

document.getElementById('working-hours')?.addEventListener('input', function() {
  const counter = document.getElementById('hours-counter');
  if (counter) {
    counter.textContent = this.value.length;
    if (this.value.length > 200) {
      this.setCustomValidity('Максимальна довжина - 200 символів');
    } else {
      this.setCustomValidity('');
    }
  }
});
