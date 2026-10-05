(() => {
  const carousel = document.querySelector('.medical-details');
  if (!carousel) return;
  const track = carousel.querySelector('.medical-slides');
  const slides = [...track.querySelectorAll('.medical-row')];
  const mobile = window.matchMedia('(max-width: 1023px)');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const count = slides.length;
  // 両端に隣の科目を置き、端を越えたら同じ内容の元スライドへ戻す。
  const before = slides[count - 1].cloneNode(true);
  const after = slides[0].cloneNode(true);
  [before, after].forEach(slide => {
    slide.removeAttribute('id');
    slide.classList.add('medical-carousel-clone');
    slide.setAttribute('aria-hidden', 'true');
    slide.querySelector('img').draggable = false;
  });
  const controls = document.createElement('div');
  controls.className = 'medical-carousel-controls';
  const dots = document.createElement('div');
  dots.className = 'medical-carousel-dots';
  dots.setAttribute('role', 'group');
  dots.setAttribute('aria-label', '診療科目の切り替え');
  const status = document.createElement('p');
  status.className = 'medical-carousel-status';
  status.setAttribute('aria-live', 'polite');
  status.setAttribute('aria-atomic', 'true');
  controls.append(dots, status);
  carousel.append(controls);
  let index = 0;
  let scrollTimer;
  let drag = null;
  const wrap = number => (number % count + count) % count;

  const buttons = slides.map((slide, number) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.setAttribute('aria-label', `${number + 1}：${slide.querySelector('h2').textContent}`);
    button.setAttribute('aria-controls', slide.id);
    button.addEventListener('click', () => goTo(number));
    dots.append(button);
    slide.querySelector('img').draggable = false;
    return button;
  });

  function update() {
    if (!mobile.matches) return;
    const firstLine = carousel.querySelector('.medical-first-line');
    if (firstLine) {
      firstLine.style.fontSize = '';
      const naturalWidth = firstLine.getBoundingClientRect().width;
      const availableWidth = firstLine.parentElement.clientWidth;
      if (naturalWidth > availableWidth) {
        const fontSize = parseFloat(window.getComputedStyle(firstLine).fontSize);
        firstLine.style.fontSize = `${fontSize * availableWidth / naturalWidth}px`;
      }
    }
    const textHeight = Math.ceil(Math.max(...slides.map(slide => {
      const copy = slide.querySelector('div');
      return copy.querySelector('p').getBoundingClientRect().bottom - copy.getBoundingClientRect().top;
    })));
    carousel.style.setProperty('--medical-text-height', `${textHeight}px`);
    track.style.height = `${slides[index].getBoundingClientRect().height}px`;
    buttons.forEach((button, number) => button.setAttribute('aria-current', String(number === index)));
    slides.forEach((slide, number) => slide.setAttribute('aria-hidden', String(number !== index)));
    status.textContent = `${index + 1} / ${slides.length} 科目`;
  }

  function goTo(number, animate = true) {
    if (!mobile.matches) return;
    const position = number < 0 ? 0 : number >= count ? count + 1 : number + 1;
    index = wrap(number);
    update();
    track.scrollTo({ left: position * track.clientWidth, behavior: animate && !reducedMotion.matches ? 'smooth' : 'instant' });
  }

  function selectHash() {
    const number = slides.findIndex(slide => `#${slide.id}` === window.location.hash);
    goTo(number === -1 ? index : number, false);
  }

  function configure() {
    carousel.classList.toggle('is-carousel', mobile.matches);
    if (mobile.matches) {
      if (!before.isConnected) track.prepend(before);
      if (!after.isConnected) track.append(after);
      track.tabIndex = 0;
      track.setAttribute('role', 'region');
      track.setAttribute('aria-label', '診療内容カルーセル');
      selectHash();
    } else {
      before.remove();
      after.remove();
      track.style.height = '';
      carousel.style.removeProperty('--medical-text-height');
      carousel.querySelector('.medical-first-line').style.fontSize = '';
      track.removeAttribute('tabindex');
      track.removeAttribute('role');
      track.removeAttribute('aria-label');
      slides.forEach(slide => slide.removeAttribute('aria-hidden'));
    }
  }

  track.addEventListener('scroll', () => {
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(() => {
      if (!mobile.matches || drag) return;
      const position = Math.max(0, Math.min(count + 1, Math.round(track.scrollLeft / track.clientWidth)));
      index = wrap(position - 1);
      update();
      if (position === 0 || position === count + 1) goTo(index, false);
    }, 120);
  });
  track.addEventListener('keydown', event => {
    if (!mobile.matches || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    goTo(event.key === 'Home' ? 0 : event.key === 'End' ? slides.length - 1 : index + (event.key === 'ArrowRight' ? 1 : -1));
  });
  // タッチはブラウザの自然な横スクロール、マウスはドラッグで切り替える。
  track.addEventListener('pointerdown', event => {
    if (!mobile.matches || event.pointerType !== 'mouse' || event.button !== 0) return;
    event.preventDefault();
    drag = { x: event.clientX, left: track.scrollLeft };
    track.classList.add('is-dragging');
    track.setPointerCapture(event.pointerId);
  });
  track.addEventListener('pointermove', event => {
    if (drag) track.scrollLeft = drag.left + drag.x - event.clientX;
  });
  function endDrag() {
    if (!drag) return;
    const delta = track.scrollLeft - drag.left;
    drag = null;
    track.classList.remove('is-dragging');
    goTo(Math.abs(delta) > 40 ? index + Math.sign(delta) : index);
  }
  track.addEventListener('pointerup', endDrag);
  track.addEventListener('pointercancel', endDrag);
  track.addEventListener('lostpointercapture', endDrag);
  mobile.addEventListener('change', configure);
  window.addEventListener('hashchange', selectHash);
  let lastWidth = 0;
  new ResizeObserver(() => {
    if (!mobile.matches) return;
    if (lastWidth !== track.clientWidth) {
      lastWidth = track.clientWidth;
      goTo(index, false);
    } else update();
  }).observe(carousel);
  slides.forEach(slide => new ResizeObserver(update).observe(slide));
  configure();
})();
