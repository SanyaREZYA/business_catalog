const track = document.querySelector('.slider__track');
let slides = Array.from(track.children);
const dots = document.querySelectorAll('.slider-dot');

const slideWidth = slides[0].offsetWidth + 40;
let position = 2;
let autoSlideInterval;
let isAnimating = false;

const cloneStart = slides.slice(0, 2).map(el => el.cloneNode(true));
const cloneEnd = slides.slice(-2).map(el => el.cloneNode(true));
cloneStart.forEach(clone => track.appendChild(clone));
cloneEnd.reverse().forEach(clone => track.prepend(clone));
slides = Array.from(track.children);

track.style.transform = `translateX(-${slideWidth * position}px)`;

function updateActiveSlide(pos) {
  slides.forEach(slide => slide.classList.remove('slider__active-slide'));
  slides[pos + 1]?.classList.add('slider__active-slide');

  let realIndex = (pos - 2) % 3;
  if (realIndex < 0) realIndex += 3;
  dots.forEach(dot => dot.classList.remove('slider-dot--active'));
  dots[realIndex].classList.add('slider-dot--active');
}

function moveSlide(forward = true) {
  if (isAnimating) return;
  isAnimating = true;

  const nextPosition = position + (forward ? 1 : -1);

  if (nextPosition >= slides.length - 2) {
    track.style.transition = 'transform 0.5s ease-in-out';
    track.style.transform = `translateX(-${slideWidth * nextPosition}px)`;

    track.addEventListener('transitionend', () => {
      track.style.transition = 'none';
      position = 2;
      track.style.transform = `translateX(-${slideWidth * position}px)`;

      requestAnimationFrame(() => {
        track.style.transition = 'transform 0.5s ease-in-out';
        isAnimating = false;
        updateActiveSlide(position);
      });
    }, { once: true });

    return;
  }

if (nextPosition < 2) {
  track.style.transition = 'transform 0.5s ease-in-out';
  track.style.transform = `translateX(-${slideWidth * nextPosition}px)`;

  track.addEventListener('transitionend', () => {
    track.style.transition = 'none';
    position = slides.length - 3;
    track.style.transform = `translateX(-${slideWidth * position}px)`;

    requestAnimationFrame(() => {
      track.style.transition = 'transform 0.5s ease-in-out';
      isAnimating = false;
      updateActiveSlide(position);
    });
  }, { once: true });

  return;
}

position = nextPosition;
updateActiveSlide(position);
track.style.transition = 'transform 0.5s ease-in-out';
track.style.transform = `translateX(-${slideWidth * position}px)`;

track.addEventListener('transitionend', () => {
  isAnimating = false;
}, { once: true });
}


function handleReset() {
  if (position >= slides.length - 2) {
    track.style.transition = 'none';

    position = 2;
    track.style.transform = `translateX(-${slideWidth * position}px)`;

    requestAnimationFrame(() => {
      track.style.transition = 'transform 0.5s ease-in-out';
      isAnimating = false;
      updateActiveSlide(position);
    });

    return;
  }

  if (position < 2) {
    track.style.transition = 'none';
    position = slides.length - 3;
    track.style.transform = `translateX(-${slideWidth * position}px)`;

    requestAnimationFrame(() => {
      track.style.transition = 'transform 0.5s ease-in-out';
      isAnimating = false;
      updateActiveSlide(position);
    });

    return;
  }

  isAnimating = false;
}

  function startAutoSlide() {
    autoSlideInterval = setInterval(() => moveSlide(true), 3000);
  }

  function stopAutoSlide() {
    clearInterval(autoSlideInterval);
  }

  startAutoSlide();

  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      if (isAnimating) return;
      stopAutoSlide();
      isAnimating = true;

      position = index + 2;
      updateActiveSlide(position);
      track.style.transition = 'transform 0.5s ease-in-out';
      track.style.transform = `translateX(-${slideWidth * position}px)`;

      track.addEventListener('transitionend', () => {
        isAnimating = false;
        startAutoSlide();
      }, { once: true });
    });
  });

  updateActiveSlide(position);