document.addEventListener('DOMContentLoaded', async () => {
  const sliderTrack = document.querySelector('.slider__track');
  const slides = document.querySelectorAll('.slider__item');
  const dots = document.querySelectorAll('.slider-dot');
  let currentIndex = 0;
  const slideWidth = slides[0].offsetWidth + 20;
  const totalSlides = slides.length;

  slides.forEach((slide) => {
    const clone = slide.cloneNode(true);
    sliderTrack.appendChild(clone);
  });

  function updateSlider() {
    const allSlides = document.querySelectorAll('.slider__item');
    allSlides.forEach((slide, index) => {
      slide.classList.remove('slider__item--active');
      if (index === currentIndex + 1) {
        slide.classList.add('slider__item--active');
      }
    });

    dots.forEach((dot, index) => {
      dot.classList.toggle(
        'slider-dot--active',
        index === currentIndex % totalSlides,
      );
    });
  }

  function moveToSlide(index) {
    sliderTrack.style.transition = 'transform 0.5s ease-in-out';
    sliderTrack.style.transform = `translateX(${-index * slideWidth}px)`;
    currentIndex = index;

    if (currentIndex >= totalSlides) {
      setTimeout(() => {
        sliderTrack.style.transition = 'none';
        sliderTrack.style.transform = `translateX(0)`;
        currentIndex = 0;
        updateSlider();
      }, 500);
    } else {
      updateSlider();
    }
  }

  updateSlider();

  setInterval(() => {
    moveToSlide(currentIndex + 1);
  }, 3000);

  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      moveToSlide(index);
    });
  });

  async function loadReviews() {
    const feedbackContainer = document.getElementById('feedbackContainer');
    if (!feedbackContainer) {
      return;
    }

    try {
      const companiesResponse = await fetch('/companies');
      if (!companiesResponse.ok) {
        throw new Error(
          `Помилка HTTP: ${companiesResponse.status} ${companiesResponse.statusText}`,
        );
      }
      const companies = await companiesResponse.json();

      const companyMap = {};
      companies.forEach((company) => {
        companyMap[company.id] = {
          logo_path: company.logo_path,
          name: company.name,
        };
      });

      const reviewsResponse = await fetch('/last-reviews');
      if (!reviewsResponse.ok) {
        throw new Error(
          `Помилка HTTP: ${reviewsResponse.status} ${reviewsResponse.statusText}`,
        );
      }
      const reviews = await reviewsResponse.json();

      feedbackContainer.innerHTML = '';
      if (reviews.length === 0) {
        feedbackContainer.innerHTML = '<p>Відгуків поки немає.</p>';
        return;
      }

      reviews.forEach((review) => {
        const date = new Date(review.created_at);
        const formattedDate = `${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getFullYear()}`;

        const company = companyMap[review.company_id] || {
          logo_path: '/images/default-logo.png',
          name: 'Невідома компанія',
        };

        const reviewElement = document.createElement('div');
        reviewElement.className = 'feedback__item';
        reviewElement.innerHTML = `
        <a href="/reviews/${review.id}" class="feedback__item-image">
          <img src="${company.logo_path}" width="110px" height="110px" alt="${company.name}">
        </a>
        <div class="feedback__item-text">${review.review_text}</div>
        <div class="feedback__item-info">${review.user_name} ${formattedDate}</div>
        <a class="feedback__item-link white-back__button" href="/reviews/${review.id}">Читати детальніше</a>
      `;
        feedbackContainer.appendChild(reviewElement);
      });
    } catch (error) {
      console.error('Помилка завантаження відгуків:', error);
      feedbackContainer.innerHTML =
        '<p>Не вдалось завантажити відгуки. Попробуйте пізніше...</p>';
    }
  }

  async function loadCompanyServices() {
    const catalogBody = document.querySelector('.catalog__body');
    if (!catalogBody) {
      return;
    }

    let categoryMap = {};
    try {
      const response = await fetch('/categories');
      if (!response.ok) {
        throw new Error(
          `Помилка HTTP: ${response.status} ${response.statusText}`,
        );
      }
      const categories = await response.json();
      categories.forEach((category) => {
        categoryMap[category.id] = category.name;
      });
    } catch (error) {
      console.error('Помилка при завантаженні категорій:', error);
    }

    try {
      const response = await fetch('/companies');
      if (!response.ok) {
        throw new Error(
          `Помилка HTTP: ${response.status} ${response.statusText}`,
        );
      }
      const companies = await response.json();

      catalogBody.innerHTML = '';
      if (companies.length === 0) {
        catalogBody.innerHTML = '<p>Компанії відсутні.</p>';
        return;
      }

      companies.slice(0, 8).forEach((company) => {
        const categoryName =
          categoryMap[company.category_id] || `${company.category_id}`;
        const imageSrc = company.logo_path;
        const rating = 4.5;
        const stars = Math.min(5, Math.floor(rating));
        const starElements = Array(5)
          .fill()
          .map(
            (_, i) =>
              `<svg class="rate-star ${i < stars ? 'rate-star--yellow' : ''}" width="25" height="25" viewBox="0 0 24 24" focusable="false">
            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27z" fill="${i < stars ? 'orange' : 'gray'}"></path>
          </svg>`,
          )
          .join('');

        const companyElement = document.createElement('div');
        companyElement.className = 'item-catalog';
        companyElement.innerHTML = `
          <div class="item-catalog__wrapper">
            <div class="item-catalog__header">
              <div class="item-catalog__vip">VIP</div>
              <div class="item-catalog__category">${categoryName}</div>
            </div>
            <a class="item-catalog__img" target="_blank" href="${company.website}">
              <img src="/${imageSrc}" alt="${company.name}">
            </a>
            <a class="item-catalog__title" href="/companies/${company.id}">${company.name}</a>
            <ul class="item-catalog__list">
              <li class="item-catalog__item">
                <img class="item-catalog__item-ico" src="/images/world.svg" alt="">
                <span class="item-catalog__item-context">${company.address.split(', ')[0]}</span>
              </li>
              <li class="item-catalog__item">
                <img class="item-catalog__item-ico" src="/images/email.svg" alt="">
                <a href="mailto:${company.email}" class="item-catalog__item-context">${company.email}</a>
              </li>
              <li class="item-catalog__item">
                <img class="item-catalog__item-ico" src="/images/website.svg" alt="">
                <a target="_blank" href="${company.website}" class="item-catalog__item-context">${company.website.split('://')[1]}</a>
              </li>
            </ul>
            <div class="item-catalog__feedback">
              <div class="item-catalog__rate rate">
                ${starElements}
              </div>
              <a class="item-catalog__feedback-link" href="/reviews?company_id=${company.id}">Відгуки</a>
            </div>
            <div class="item-catalog__footer">
              <a class="item-catalog__button" href="#">Детальніше</a>
              <a class="item-catalog__contact-button" href="#">Контакти</a>
            </div>
          </div>
        `;
        catalogBody.appendChild(companyElement);
      });
    } catch (error) {
      console.error('Помилка при завантаженні компаній (послуги):', error);
      catalogBody.innerHTML =
        '<p>Не вдалося завантажити компанії. Попробуйте пізніше.</p>';
    }
  }

  async function loadLastAddedCompany() {
    const lastAddedBody = document.querySelector(
      '.catalog__last-added .catalog__body',
    );

    let categoryMap = {};
    try {
      const response = await fetch('/categories');
      if (!response.ok) {
        throw new Error(
          `Помилка HTTP: ${response.status} ${response.statusText}`,
        );
      }
      const categories = await response.json();
      categories.forEach((category) => {
        categoryMap[category.id] = category.name;
      });
    } catch (error) {
      console.error('Помилка при завантаженні категорій:', error);
    }

    try {
      const response = await fetch('/companies');
      if (!response.ok) {
        throw new Error(
          `Помилка HTTP: ${response.status} ${response.statusText}`,
        );
      }
      const companies = await response.json();

      lastAddedBody.innerHTML = '';
      if (companies.length === 0) {
        lastAddedBody.innerHTML = '<p>Компанії відсутні.</p>';
        return;
      }

      const latestCompanies = [...companies]
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 8);

      latestCompanies.forEach((company) => {
        const imageSrc = company.logo_path || '/images/poster_09.webp';
        const rating = 4.5;
        const stars = Math.min(5, Math.floor(rating));
        const starElements = Array(5)
          .fill()
          .map(
            (_, i) =>
              `<svg class="rate-star ${i < stars ? 'rate-star--yellow' : ''}" width="25" height="25" viewBox="0 0 24 24" focusable="false">
            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27z" fill="${i < stars ? 'orange' : 'gray'}"></path>
          </svg>`,
          )
          .join('');
        const categoryName =
          categoryMap[company.category_id] || `${company.category_id}`;

        const companyElement = document.createElement('div');
        companyElement.className = 'item-catalog';
        companyElement.innerHTML = `
          <div class="item-catalog__wrapper">
            <div class="item-catalog__header">
              <div class="item-catalog__vip">VIP</div>
              <div class="item-catalog__category">${categoryName}</div>
            </div>
            <a class="item-catalog__img" href="/companies/${company.id}">
              <img src="${imageSrc}" alt="${company.name}">
            </a>
            <a class="item-catalog__title" href="/companies/${company.id}">${company.name}</a>
            <ul class="item-catalog__list">
              <li class="item-catalog__item">
                <img class="item-catalog__item-ico" src="/images/world.svg" alt="">
                <span class="item-catalog__item-context">${company.address.split(', ')[0]}</span>
              </li>
              <li class="item-catalog__item">
                <img class="item-catalog__item-ico" src="/images/email.svg" alt="">
                <a href="mailto:${company.email}" class="item-catalog__item-context">${company.email}</a>
              </li>
              <li class="item-catalog__item">
                <img class="item-catalog__item-ico" src="/images/website.svg" alt="">
                <a target="_blank" href="${company.website}" class="item-catalog__item-context">${company.website.split('://')[1]}</a>
              </li>
            </ul>
            <div class="item-catalog__feedback">
              <div class="item-catalog__rate rate">
                ${starElements}
              </div>
              <a class="item-catalog__feedback-link" href="/reviews?company_id=${company.id}">Відгуки</a>
            </div>
            <div class="item-catalog__footer">
              <a class="item-catalog__button" href="/companies/${company.id}">Детальніше</a>
              <a class="item-catalog__contact-button" href="/companies/${company.id}/contact">Контакти</a>
            </div>
          </div>
        `;
        lastAddedBody.appendChild(companyElement);
      });
    } catch (error) {
      console.error('Помилка при завантаженні послуг:', error);
      lastAddedBody.innerHTML =
        '<p>Не вдалося завантажити послуги. Попробуйте пізніше.</p>';
    }
  }

  async function loadBusinessCategories() {
    const catalogBody = document.querySelector('.main-catalog__body');
    if (!catalogBody) {
      return;
    }

    try {
      const response = await fetch('/categories');
      if (!response.ok) {
        throw new Error(
          `Помилка HTTP: ${response.status} ${response.statusText}`,
        );
      }
      const categories = await response.json();

      catalogBody.innerHTML = '';
      if (categories.length === 0) {
        catalogBody.innerHTML = '<p>Категорії відсутні.</p>';
        return;
      }

      categories.slice(0, 4).forEach((category) => {
        const categoryElement = document.createElement('a');
        categoryElement.className = 'main-catalog__item';
        categoryElement.href = `/categories/${category.id}`;
        categoryElement.innerHTML = `
          <img src="/images/poster_09.webp" alt="${category.name}">
          <span>${category.name}</span>
        `;
        catalogBody.appendChild(categoryElement);
      });
    } catch (error) {
      catalogBody.innerHTML =
        '<p>Не вдалося завантажити категорії. Попробуйте пізніше...</p>';
    }
  }

  await Promise.all([
    loadReviews(),
    loadCompanyServices(),
    loadLastAddedCompany(),
    loadBusinessCategories(),
  ]);
});
