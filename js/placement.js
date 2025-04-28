document.addEventListener('DOMContentLoaded', function() {
  const tabBtns = document.querySelectorAll('.tab-btn');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

      this.classList.add('active');

      const tabId = this.getAttribute('data-tab') + '-tab';
      document.getElementById(tabId).classList.add('active');
    });
  });

  // Лічильник символів для текстових полів
  function setupCharCounter(textareaId, counterId, maxLength) {
    const textarea = document.getElementById(textareaId);
    const counter = document.getElementById(counterId);
    
    if (textarea && counter) {
      textarea.addEventListener('input', function() {
        const currentLength = this.value.length;
        counter.textContent = currentLength;
        
        if (currentLength > maxLength * 0.9) {
          counter.style.color = '#ff4757';
        } else {
          counter.style.color = '#495057';
        }
      });
    }
  }

  setupCharCounter('description', 'desc-counter', 500);
  setupCharCounter('unique-offer', 'offer-counter', 200);
  setupCharCounter('article-requirements', 'requirements-counter', 1000);

  // Попередній перегляд зображень
  function setupImagePreview(inputId, previewId) {
    const input = document.getElementById(inputId);
    const preview = document.getElementById(previewId);
    
    if (input && preview) {
      input.addEventListener('change', function() {
        if (this.files && this.files[0]) {
          const reader = new FileReader();
          
          reader.onload = function(e) {
            preview.innerHTML = `<img src="${e.target.result}" alt="Попередній перегляд">`;
          }
          
          reader.readAsDataURL(this.files[0]);
        }
      });
    }
  }

  setupImagePreview('logo', 'logo-preview');
  setupImagePreview('logo-vip', 'vip-logo-preview');

  // Валідація та відправка форми
  function handleFormSubmit(formId, endpoint) {
    const form = document.getElementById(formId);
    
    if (form) {
      form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Відправка...';
        
        try {
          const formData = new FormData(form);

          for (let [key, value] of formData.entries()) {
            console.log(key, value); // Виведе всі поля, наприклад: "company_name", "Example Company"
          }
          
          // Додаткові перевірки перед відправкою
          if (formId === 'standard-form' && !formData.get('company_name')) {
            throw new Error('Будь ласка, введіть назву компанії');
          }
          
          // Симуляція відправки на сервер
          const response = await fetch(endpoint, {
            method: 'POST',
            body: formData
          });
          
          const result = await response.json();
          
          if (response.ok) {
            // Успішна відправка
            alert('Ваша заявка успішно відправлена! Ми зв\'яжемося з вами найближчим часом.');
            form.reset();
            document.getElementById('logo-preview').innerHTML = '';
            document.getElementById('vip-logo-preview').innerHTML = '';
          } else {
            // Помилка від сервера
            throw new Error(result.message || 'Сталася помилка при відправці форми');
          }
        } catch (error) {
          alert(`Помилка: ${error.message}`);
          console.error('Помилка відправки форми:', error);
        } finally {
          submitBtn.disabled = false;
          submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Надіслати заявку';
        }
      });
    }
  }

  // Налаштування обробників для кожної форми
  handleFormSubmit('standard-form', '/api/add-business');
  handleFormSubmit('vip-form', '/api/add-business');
});