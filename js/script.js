const sliderTrack = document.querySelector('.slider__track');
const slides = document.querySelectorAll('.slider__item');
const dots = document.querySelectorAll('.slider-dot');
let currentIndex = 0;
const slideWidth = slides[0].offsetWidth + 20; // Width + margin (360px + 10px + 10px)
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
