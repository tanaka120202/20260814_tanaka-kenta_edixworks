(() => {
  const gallery = document.querySelector('.home-gallery');
  if (!gallery) return;

  const viewport = gallery.querySelector('.gallery-viewport');
  const track = gallery.querySelector('.gallery-track');
  const status = gallery.querySelector('.gallery-status');
  const lightbox = document.querySelector('.gallery-lightbox');
  const enlargedImage = lightbox.querySelector('.gallery-lightbox-image');
  const caption = lightbox.querySelector('#gallery-lightbox-caption');
  let previousFocus;
  const originals = [...track.children];
  const count = originals.length;
  if (count < 2) return;

  gallery.classList.add('gallery-initializing');
  const clonesBefore = originals.slice(-2).map((slide) => slide.cloneNode(true));
  const clonesAfter = originals.slice(0, 2).map((slide) => slide.cloneNode(true));
  [...clonesBefore, ...clonesAfter].forEach((slide) => {
    slide.querySelector('img').loading = 'eager';
  });
  track.prepend(...clonesBefore);
  track.append(...clonesAfter);
  const slides = [...track.children];
  const firstIndex = 2;
  const lastIndex = count + 1;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let index = firstIndex;
  let timer;
  let transitionTimer;
  let settleTimer;
  let animating = false;
  let pendingImage = null;
  let suppressClick = false;
  let backdropPressed = false;

  function showCurrent() {
    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle('is-active', slideIndex === index);
      slide.classList.toggle('is-prev', slideIndex === index - 1);
      slide.classList.toggle('is-next', slideIndex === index + 1);
      slide.setAttribute('aria-hidden', slideIndex === index ? 'false' : 'true');
      const image = slide.querySelector('img');
      image.tabIndex = slideIndex === index ? 0 : -1;
      image.setAttribute('role', 'button');
      image.setAttribute('aria-label', `${image.alt}を拡大表示`);
      image.setAttribute('aria-haspopup', 'dialog');
    });
    status.textContent = `${((index - firstIndex + count) % count) + 1} / ${count} 枚目`;
  }

  function offsetFor(slideIndex) {
    const slideWidth = slides[0].offsetWidth;
    const gap = parseFloat(getComputedStyle(track).gap) || 0;
    return viewport.clientWidth / 2 - (slideIndex * (slideWidth + gap) + slideWidth / 2);
  }

  function position(animate) {
    track.style.transition = animate ? '' : 'none';
    track.style.transform = `translate3d(${offsetFor(index)}px, 0, 0)`;
    if (!animate) requestAnimationFrame(() => { track.style.transition = ''; });
  }

  function scheduleNext() {
    clearTimeout(timer);
    if (!reducedMotion && !document.hidden && !lightbox.open) timer = setTimeout(() => move(1), 5000);
  }

  function move(direction) {
    if (animating || lightbox.open) return;
    clearTimeout(timer);
    clearTimeout(settleTimer);
    if (reducedMotion) {
      index = ((index - firstIndex + direction + count) % count) + firstIndex;
      showCurrent();
      position(false);
      return;
    }
    animating = true;
    slides[index + direction].style.transformOrigin = direction > 0 ? 'left center' : 'right center';
    index += direction;
    showCurrent();
    position(true);
    transitionTimer = setTimeout(finishMove, 620);
  }

  function finishMove() {
    if (!animating) return;
    clearTimeout(transitionTimer);
    gallery.classList.add('gallery-initializing');
    slides[index].style.transformOrigin = '';
    if (index === firstIndex - 1) index = lastIndex;
    if (index === lastIndex + 1) index = firstIndex;
    showCurrent();
    position(false);
    // Settle every slide before enabling transitions for the next move.
    track.offsetWidth;
    gallery.classList.remove('gallery-initializing');
    animating = false;
    scheduleNext();
  }

  track.addEventListener('transitionend', (event) => {
    if (event.target === track && event.propertyName === 'transform') finishMove();
  });

  viewport.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openLightbox(event.target.closest('.gallery-slide img') || slides[index].querySelector('img'));
      return;
    }
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      move(event.key === 'ArrowLeft' ? -1 : 1);
    }
  });

  function centerLightbox() {
    const visible = window.visualViewport;
    lightbox.style.setProperty('--lightbox-left', `${visible?.offsetLeft ?? 0}px`);
    lightbox.style.setProperty('--lightbox-top', `${visible?.offsetTop ?? 0}px`);
    lightbox.style.setProperty('--lightbox-width', `${visible?.width ?? window.innerWidth}px`);
    lightbox.style.setProperty('--lightbox-height', `${visible?.height ?? window.innerHeight}px`);
  }
  let centerFrame;
  function requestCenterLightbox() {
    if (!lightbox.open) return;
    cancelAnimationFrame(centerFrame);
    centerFrame = requestAnimationFrame(centerLightbox);
  }
  window.addEventListener('resize', requestCenterLightbox);
  window.visualViewport?.addEventListener('resize', requestCenterLightbox);
  window.visualViewport?.addEventListener('scroll', requestCenterLightbox);

  function openLightbox(image) {
    if (lightbox.open) return;
    if (animating) finishMove();
    clearTimeout(timer);
    clearTimeout(settleTimer);
    previousFocus = viewport.contains(document.activeElement) ? document.activeElement : viewport;
    enlargedImage.src = image.currentSrc || image.src;
    enlargedImage.alt = image.alt;
    caption.textContent = image.alt;
    backdropPressed = false;
    document.documentElement.classList.add('gallery-lightbox-open');
    centerLightbox();
    lightbox.showModal();
    requestCenterLightbox();
  }

  function restoreGallery() {
    if (lightbox.open) return;
    if (document.documentElement.classList.contains('gallery-lightbox-open')) {
      document.documentElement.classList.remove('gallery-lightbox-open');
      scheduleNext();
    }
    previousFocus?.focus({ preventScroll: true });
  }
  function closeLightbox() {
    lightbox.close();
    restoreGallery();
  }
  lightbox.querySelector('.gallery-lightbox-close').addEventListener('click', closeLightbox);
  lightbox.addEventListener('pointerdown', (event) => {
    backdropPressed = event.target === lightbox;
  });
  lightbox.addEventListener('click', (event) => {
    if (event.target === lightbox && backdropPressed) closeLightbox();
    backdropPressed = false;
  });
  lightbox.addEventListener('cancel', (event) => {
    event.preventDefault();
    closeLightbox();
  });
  lightbox.addEventListener('close', restoreGallery);
  // pointerupで開くと、続くクリックがダイアログ背景に届くことがある。
  // タップ完了後のclickで開き、ドラッグに続くclickは無視する。
  viewport.addEventListener('click', (event) => {
    if (event.detail !== 0 && suppressClick) {
      pendingImage = null;
      return;
    }
    const image = event.target.closest('.gallery-slide img') || pendingImage;
    pendingImage = null;
    suppressClick = false;
    if (image) openLightbox(image);
  });

  let drag = null;
  viewport.addEventListener('dragstart', (event) => event.preventDefault());
  viewport.addEventListener('pointerdown', (event) => {
    pendingImage = null;
    suppressClick = false;
    if (animating || (event.pointerType === 'mouse' && event.button !== 0)) return;
    clearTimeout(timer);
    clearTimeout(settleTimer);
    drag = {
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      time: performance.now(),
      offset: offsetFor(index),
      image: event.target.closest('.gallery-slide img'),
      moved: false
    };
    viewport.classList.add('is-dragging');
    if (event.isTrusted && viewport.setPointerCapture) viewport.setPointerCapture(event.pointerId);
  });
  viewport.addEventListener('pointermove', (event) => {
    if (!drag || event.pointerId !== drag.id) return;
    const dx = event.clientX - drag.x;
    const dy = event.clientY - drag.y;
    if (!drag.moved && (Math.abs(dx) < 6 || Math.abs(dx) <= Math.abs(dy))) return;
    drag.moved = true;
    const limit = Math.abs(offsetFor(index + 1) - drag.offset);
    track.style.transition = 'none';
    track.style.transform = `translate3d(${drag.offset + Math.max(-limit, Math.min(limit, dx))}px, 0, 0)`;
  });
  function endDrag(event, canceled = false) {
    if (!drag || event.pointerId !== drag.id) return;
    const dx = event.clientX - drag.x;
    const dy = event.clientY - drag.y;
    const flick = Math.abs(dx) >= 20 && performance.now() - drag.time < 250;
    const switchSlide = !canceled && drag.moved && Math.abs(dx) > Math.abs(dy) && (Math.abs(dx) >= 40 || flick);
    const wasMoved = drag.moved;
    const tappedImage = !canceled && !wasMoved && Math.abs(dx) < 6 && Math.abs(dy) < 6 ? drag.image : null;
    pendingImage = tappedImage;
    suppressClick = !tappedImage;
    // タッチ後にclickが生成されない場合も、pointerupの処理が終わってから開く。
    if (tappedImage) setTimeout(() => {
      if (pendingImage !== tappedImage || lightbox.open) return;
      pendingImage = null;
      openLightbox(tappedImage);
    }, 0);
    drag = null;
    viewport.classList.remove('is-dragging');
    if (switchSlide) move(dx > 0 ? -1 : 1);
    else if (wasMoved) {
      position(true);
      settleTimer = setTimeout(scheduleNext, 600);
    } else scheduleNext();
  }
  viewport.addEventListener('pointerup', endDrag);
  viewport.addEventListener('pointercancel', (event) => endDrag(event, true));

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) clearTimeout(timer);
    else if (!animating) scheduleNext();
  });

  const onResize = () => {
    drag = null;
    viewport.classList.remove('is-dragging');
    if (animating) {
      clearTimeout(transitionTimer);
      gallery.classList.add('gallery-initializing');
      slides[index].style.transformOrigin = '';
      index = ((index - firstIndex + count) % count) + firstIndex;
      animating = false;
      showCurrent();
      position(false);
      track.offsetWidth;
      gallery.classList.remove('gallery-initializing');
    } else {
      position(false);
    }
    scheduleNext();
  };
  if ('ResizeObserver' in window) new ResizeObserver(onResize).observe(viewport);
  else window.addEventListener('resize', onResize);

  showCurrent();
  position(false);
  requestAnimationFrame(() => gallery.classList.remove('gallery-initializing'));
  scheduleNext();
})();
