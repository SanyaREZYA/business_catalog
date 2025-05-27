// admin.js
let arrCat = [];
// Показати повідомлення про помилку в UI
function showErrorMessage(message) {
  let errorDiv = document.getElementById("errorMessage");
  if (!errorDiv) {
    errorDiv = document.createElement("div");
    errorDiv.id = "errorMessage";
    errorDiv.style.color = "red";
    errorDiv.style.margin = "10px 0";
    const container = document.querySelector("#companyForm")?.parentNode || document.body;
    container.insertBefore(errorDiv, container.firstChild);
  }
  errorDiv.textContent = message;

  setTimeout(() => {
    errorDiv.textContent = "";
  }, 5000);
}

// Прибрати повідомлення про помилку
function clearErrorMessage() {
  const errorDiv = document.getElementById("errorMessage");
  if (errorDiv) errorDiv.textContent = "";
}

// Завантажити категорії та оновити селект і таблицю
async function loadCategories() {
  try {
    const res = await fetch("/categories");
    if (!res.ok) throw new Error("Не вдалося завантажити категорії");
    const categories = await res.json();

    // Оновити селект category_id
    const select = document.getElementById("category_id");
    if (select) {
      select.innerHTML = '<option value="">Оберіть категорію</option>';
      categories.forEach(cat => {
        const option = document.createElement("option");
        option.value = cat.id;
        option.textContent = cat.name;
        arrCat.push(cat.id);
        select.appendChild(option);
      });
    }

    // Оновити таблицю категорій
    const tbody = document.querySelector("#categoryTable tbody");
    if (tbody) {
      tbody.innerHTML = '';
      categories.forEach(cat => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${cat.id}</td>
          <td>${cat.name}</td>
          <td>
            <button class="btn btn-sm btn-danger" onclick="deleteCategory(${cat.id})">🗑️</button>
          </td>
        `;
        tbody.appendChild(row);
      });
    }
  } catch (err) {
    console.error("❌ Помилка завантаження категорій:", err);
    showErrorMessage("Помилка завантаження категорій: " + err.message);
  }
}

// Показати/сховати форму додавання категорії
function showAddCategoryForm() {
  document.getElementById('addCategoryForm').classList.toggle('d-none');
}

// Додати нову категорію
async function addCategory() {
  const nameInput = document.getElementById('newCategoryName');
  const name = nameInput.value.trim();
  if (!name) return alert('Введіть назву категорії');

  try {
    const res = await fetch('/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name })
    });
    if (!res.ok) throw new Error("Не вдалося додати категорію");

    nameInput.value = '';
    document.getElementById('addCategoryForm').classList.add('d-none');
    await loadCategories();

  } catch (err) {
    console.error('❌ Помилка додавання категорії:', err);
    showErrorMessage("Не вдалося додати категорію: " + err.message);
  }
}

// Видалити категорію
async function deleteCategory(id) {
  if (!confirm('Ви впевнені, що хочете видалити цю категорію?')) return;

  try {
    const res = await fetch(`/categories/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error("Не вдалося видалити категорію");
    await loadCategories();
  } catch (err) {
    console.error('❌ Помилка видалення категорії:', err);
    showErrorMessage("Не вдалося видалити категорію: " + err.message);
  }
}

// Отримати список компаній з сервера та заповнити таблицю
async function fetchCompanies() {
  try {
    const response = await fetch("/companies");
    if (!response.ok) throw new Error("Не вдалося отримати список компаній");
    const companies = await response.json();
    populateTable(companies);
  } catch (error) {
    console.error("Помилка при отриманні компаній:", error);
    showErrorMessage("Помилка при отриманні компаній: " + error.message);
  }
}

// Заповнити таблицю компаніями
function populateTable(companies) {
  const tbody = document.querySelector("#companyTable tbody");
  if (!tbody) return;
  tbody.innerHTML = "";

  companies.forEach((company, index) => {
    const row = createCompanyRow(company, index + 1);
    tbody.appendChild(row);
  });
}

// Очистити таблицю компаній
function clearTable() {
  const tbody = document.querySelector("#companyTable tbody");
  if (tbody) tbody.innerHTML = "";
}

// Створити DOM-рядок таблиці для компанії (безпечне додавання тексту)
function createCompanyRow(company, index) {
  const row = document.createElement("tr");

  const createCell = (text) => {
    const td = document.createElement("td");
    td.textContent = text ?? "";
    return td;
  };

  row.appendChild(createCell(index));
  row.appendChild(createCell(company.name));
  row.appendChild(createCell(company.founder));
  row.appendChild(createCell(company.edrpou_code));
  row.appendChild(createCell(company.year_founded));
  row.appendChild(createCell(company.phone1));
  row.appendChild(createCell(company.phone2));
  row.appendChild(createCell(company.phone3));
  row.appendChild(createCell(company.activity_area_id));
  row.appendChild(createCell(company.category_id));
  row.appendChild(createCell(company.address));
  row.appendChild(createCell(company.postal_code));
  row.appendChild(createCell(company.email));
  row.appendChild(createCell(company.telegram));
  row.appendChild(createCell(company.viber));
  row.appendChild(createCell(company.facebook));
  row.appendChild(createCell(company.instagram));
  row.appendChild(createCell(company.website));

  const logoTd = document.createElement("td");
  if (company.logo_path) {
    const img = document.createElement("img");
    img.src = company.logo_path;
    img.alt = "logo";
    img.width = 40;
    logoTd.appendChild(img);
  }
  row.appendChild(logoTd);

  row.appendChild(createCell(company.working_hours));
  row.appendChild(createCell(company.short_description));
  row.appendChild(createCell(company.full_description));

  row.appendChild(createCell(company.created_at ? new Date(company.created_at).toLocaleString() : ""));
  row.appendChild(createCell(company.updated_at ? new Date(company.updated_at).toLocaleString() : ""));

  // Кнопка видалення
  const btnTd = document.createElement("td");
  const btn = document.createElement("button");
  btn.className = "btn btn-danger btn-sm";
  btn.textContent = "🗑";
  btn.onclick = () => handleDelete(btn, company.id ?? null);
  btnTd.appendChild(btn);
  row.appendChild(btnTd);

  return row;
}

// Додати компанію в таблицю (без повторного fetch)
function addCompanyRow(company) {
  const tbody = document.querySelector("#companyTable tbody");
  if (!tbody) return;
  const newIndex = tbody.rows.length + 1;
  const row = createCompanyRow(company, newIndex);
  tbody.appendChild(row);
}

// Видалення компанії
async function handleDelete(button, companyId) {
  if (companyId === null) {
    // Якщо немає id, просто видаляємо рядок
    button.closest("tr").remove();
    return;
  }

  if (!confirm("Ви дійсно хочете видалити цю компанію?")) return;

  try {
    const response = await fetch(`/companies/${companyId}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Не вдалося видалити компанію");
    button.closest("tr").remove();
  } catch (error) {
    alert("Помилка видалення компанії: " + error.message);
  }
}

// Заповнити форму тестовими даними
function autofillForm() {
  document.getElementById("name").value = "Тестова компанія";
  document.getElementById("founder").value = "Іван Тестовий";
  document.getElementById("edrpou_code").value = "12345678";
  document.getElementById("year_founded").value = "2020";
  document.getElementById("phone1").value = "+380991112233";
  document.getElementById("phone2").value = "+380671112233";
  document.getElementById("phone3").value = "+380631112233";
  document.getElementById("activity_area_id").value = "1";
  document.getElementById("category_id").value = "2";
  document.getElementById("address").value = "м. Київ, вул. Прикладна, 1";
  document.getElementById("postal_code").value = "01001";
  document.getElementById("email").value = "test@company.com";
  document.getElementById("telegram").value = "@testcompany";
  document.getElementById("viber").value = "@testviber";
  document.getElementById("facebook").value = "https://facebook.com/testcompany";
  document.getElementById("instagram").value = "https://instagram.com/testcompany";
  document.getElementById("website").value = "https://testcompany.com";
  document.getElementById("working_hours").value = "Пн-Пт: 09:00-18:00";
  document.getElementById("short_description").value = "Короткий опис компанії.";
  document.getElementById("full_description").value = "Повний опис компанії для детального перегляду.";
}

// Обробник сабміту форми додавання компанії
async function handleFormSubmit(e) {
  e.preventDefault();
  clearErrorMessage();

  const form = e.target;
  const formData = new FormData(form);

  console.log('Вибрана категорія ID:', formData.get('category_id'));

  // Локальна компанія для відображення у випадку помилки (без id)
  const formFields = Object.fromEntries(formData.entries());
  const tempCompany = {
    ...formFields,
    id: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    logo_path: null
  };

  try {
    const response = await fetch("/companies", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) throw new Error("Не вдалося створити компанію");

    const newCompany = await response.json();
    addCompanyRow(newCompany);

  } catch (error) {
    console.warn("❗ Помилка при створенні компанії, додаємо локально:", error);
    showErrorMessage("Сервер недоступний. Компанію додано лише в таблицю.");
    addCompanyRow(tempCompany);
  }

  // Закрити модальне вікно і очистити форму
  const modalElement = document.getElementById("companyModal");
  if (modalElement) {
    const modal = bootstrap.Modal.getInstance(modalElement);
    modal.hide();
  }
  form.reset();
}

// Переключення вкладок
document.querySelectorAll('#tabButtons .nav-link').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-content').forEach(tab => {
      tab.classList.add('d-none');
      tab.setAttribute('hidden', true);
    });

    const targetId = btn.getAttribute('data-tab');
    const target = document.getElementById(targetId);
    if (target) {
      target.classList.remove('d-none');
      target.removeAttribute('hidden');
    }

    document.querySelectorAll('#tabButtons .nav-link').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  });
});

// Фокус у формі після показу модального вікна
document.getElementById('companyModal')?.addEventListener('shown.bs.modal', () => {
  document.getElementById('name')?.focus();
});

// Ініціалізація після завантаження DOM
document.addEventListener("DOMContentLoaded", () => {
  fetchCompanies();
  loadCategories();

  const form = document.getElementById("companyForm");
  if (form) {
    form.addEventListener("submit", handleFormSubmit);
  }
});
