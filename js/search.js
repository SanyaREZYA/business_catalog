document.querySelectorAll('.rating').forEach(rating => {
  const stars = rating.querySelectorAll('.star');

  stars.forEach(star => {
    star.addEventListener('mouseover', () => {
      const value = +star.dataset.value;
      stars.forEach(s => {
        if (+s.dataset.value <= value) {
          s.classList.add('hovered');
        } else {
          s.classList.remove('hovered');
        }
      });
    });

    star.addEventListener('mouseout', () => {
      stars.forEach(s => s.classList.remove('hovered'));
    });

    star.addEventListener('click', () => {
      const value = +star.dataset.value;
      rating.dataset.rating = value;
      stars.forEach(s => {
        if (+s.dataset.value <= value) {
          s.classList.add('selected');
        } else {
          s.classList.remove('selected');
        }
      });
    });
  });
});
