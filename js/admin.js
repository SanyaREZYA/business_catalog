fetch('/companies')
  .then(response => response.json())
  .then(data => {
    console.log(data); // тут твої дані з таблиці companies
  })
  .catch(err => console.error('Error fetching companies:', err));

fetch('/categories')
  .then(response => response.json())
  .then(data => {
    console.log(data); // тут твої дані з таблиці companies
  })
  .catch(err => console.error('Error fetching companies:', err));
  
// // Чекаємо, поки DOM повністю завантажиться
// async function fetchCompanies() {
//   try {
//     const response = await fetch("/companies");
//     const data = await response.json();  // отримуємо JSON-відповідь
//     console.log("Відповідь від сервера:", data);  // виводимо у консоль браузера
//     populateTable(data);
//   } catch (error) {
//     console.error("Помилка при отриманні компаній:", error);
//   }
// }
// // Функція для отримання списку компаній з сервера
// async function fetchCompanies() {
//   try {
//     // Виконуємо GET-запит на /companies
//     const response = await fetch("/companies");
//     // Читаємо відповідь у форматі JSON
//     const companies = await response.json();
//     // Викликаємо функцію для заповнення таблиці отриманими компаніями
//     populateTable(companies);
//   } catch (error) {
//     // Якщо сталася помилка, виводимо її в консоль
//     console.error("Помилка при отриманні компаній:", error);
//   }
// }

// // Функція для заповнення таблиці компаніями
// function populateTable(companies) {
//   // Знаходимо tbody таблиці з ID #companyTable
//   const tbody = document.querySelector("#companyTable tbody");
//   // Очищаємо вміст tbody (щоб не дублювати дані при повторному виклику)
//   tbody.innerHTML = "";

//   // Ітеруємо по кожній компанії у масиві
//   companies.forEach((company, index) => {
//     // Створюємо рядок таблиці <tr>
//     const row = document.createElement("tr");
//     // Заповнюємо рядок HTML з даними компанії
//     row.innerHTML = `
//       <td>${index + 1}</td> <!-- Порядковий номер -->
//       <td>${company.name}</td>
//       <td>${company.founder || ""}</td> <!-- Виводимо founder або порожнє, якщо нема -->
//       <td>${company.edrpou_code || ""}</td>
//       <td>${company.year_founded || ""}</td>
//       <td>${company.phone1 || ""}</td>
//       <td>${company.phone2 || ""}</td>
//       <td>${company.phone3 || ""}</td>
//       <td>${company.activity_area_id || ""}</td>
//       <td>${company.category_id || ""}</td>
//       <td>${company.address || ""}</td>
//       <td>${company.postal_code || ""}</td>
//       <td>${company.email || ""}</td>
//       <td>${company.telegram || ""}</td>
//       <td>${company.viber || ""}</td>
//       <td>${company.facebook || ""}</td>
//       <td>${company.instagram || ""}</td>
//       <td>${company.website || ""}</td>
//       <td><img src="${company.logo_path || ""}" alt="logo" width="40"></td> <!-- Логотип -->
//       <td>${company.working_hours || ""}</td>
//       <td>${company.short_description || ""}</td>
//       <td>${company.full_description || ""}</td>
//       <td>${new Date(company.created_at).toLocaleString()}</td> <!-- Форматована дата створення -->
//       <td>${new Date(company.updated_at).toLocaleString()}</td> <!-- Форматована дата оновлення -->
//       <td>
//         <!-- Кнопка видалення (тут можна додати функціонал) -->
//         <button class="btn btn-danger btn-sm">🗑</button>
//       </td>
//     `;
//     // Додаємо рядок у tbody таблиці
//     tbody.appendChild(row);
//   });
// }

// // Обробник відправлення форми додавання компанії
// async function handleFormSubmit(e) {
//   e.preventDefault(); // Запобігаємо стандартному перезавантаженню сторінки

//   // Збираємо дані з полів форми у об'єкт companyData
//   const companyData = {
//     name: document.getElementById("name").value,
//     founder: document.getElementById("founder").value,
//     edrpou_code: document.getElementById("edrpou_code").value,
//     year_founded: parseInt(document.getElementById("year_founded").value),
//     phone1: document.getElementById("phone1").value,
//     phone2: document.getElementById("phone2").value,
//     phone3: document.getElementById("phone3").value,
//     activity_area_id: parseInt(document.getElementById("activity_area_id").value),
//     category_id: parseInt(document.getElementById("category_id").value),
//     address: document.getElementById("address").value,
//     postal_code: document.getElementById("postal_code").value,
//     email: document.getElementById("email").value,
//     telegram: document.getElementById("telegram").value,
//     viber: document.getElementById("viber").value,
//     facebook: document.getElementById("facebook").value,
//     instagram: document.getElementById("instagram").value,
//     website: document.getElementById("website").value,
//     logo_path: document.getElementById("logo_path").value,
//     working_hours: document.getElementById("working_hours").value,
//     short_description: document.getElementById("short_description").value,
//     full_description: document.getElementById("full_description").value
//   };

//   try {
//     // Відправляємо POST-запит на сервер для створення компанії
//     const response = await fetch("/companies", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" }, // Вказуємо формат даних
//       body: JSON.stringify(companyData) // Серіалізуємо об'єкт у JSON
//     });

//     // Якщо статус відповіді не вдалий, викидаємо помилку
//     if (!response.ok) throw new Error("Не вдалося створити компанію");

//     // Закриваємо модальне вікно (припускаємо, що використовуємо Bootstrap Modal)
//     const modal = bootstrap.Modal.getInstance(document.getElementById("companyModal"));
//     modal.hide();

//     // Поновлюємо таблицю з компаніями після додавання нової
//     fetchCompanies();

//     // Очищаємо форму
//     e.target.reset();
//   } catch (error) {
//     // Виводимо помилку у консоль, якщо щось пішло не так
//     console.error("Помилка при створенні компанії:", error);
//   }
// }

// // Додаткова функція очищення таблиці (за потребою)
// function clearTable() {
//   document.querySelector("#companyTable tbody").innerHTML = "";
// }
