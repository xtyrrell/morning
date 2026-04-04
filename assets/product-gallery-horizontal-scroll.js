(function () {
  var MQ = window.matchMedia('(min-width: 750px)');

  function initGallery(gallery) {
    var slider = gallery.querySelector('ul[id^="Slider-Gallery"]');
    if (!slider) return;

    var track = gallery.querySelector('.product-gallery-scroll-bar__track');
    var thumb = gallery.querySelector('.product-gallery-scroll-bar__thumb');

    // ----- drag state -----
    var dragging = false;
    var dragStartX = 0;
    var dragStartScroll = 0;

    // ----- thumb position sync -----
    function syncThumb() {
      if (!track || !thumb) return;
      var scrollLeft = slider.scrollLeft;
      var scrollWidth = slider.scrollWidth;
      var clientWidth = slider.clientWidth;
      var maxScroll = Math.max(0, scrollWidth - clientWidth);
      if (maxScroll <= 0) {
        thumb.style.width = '100%';
        thumb.style.transform = 'translateX(0)';
        return;
      }
      var trackW = track.clientWidth;
      var thumbW = Math.max(trackW * (clientWidth / scrollWidth), 36);
      var maxTravel = trackW - thumbW;
      var pct = scrollLeft / maxScroll;
      thumb.style.width = thumbW + 'px';
      thumb.style.transform = 'translateX(' + (maxTravel * pct) + 'px)';
    }

    slider.addEventListener('scroll', syncThumb, { passive: true });

    // ----- wheel: convert vertical scroll to horizontal -----
    function onWheel(e) {
      if (!MQ.matches) return;
      var absY = Math.abs(e.deltaY);
      var absX = Math.abs(e.deltaX);
      // Only redirect if scrolling more vertically than horizontally
      if (absX >= absY) return;
      var max = slider.scrollWidth - slider.clientWidth;
      if (max <= 0) return;
      e.preventDefault();
      slider.scrollLeft += e.deltaY;
    }

    slider.addEventListener('wheel', onWheel, { passive: false });

    // ----- pointer drag (desktop only, not touch) -----
    function onPointerDown(e) {
      if (!MQ.matches || e.pointerType === 'touch' || e.button !== 0) return;
      dragging = true;
      dragStartX = e.clientX;
      dragStartScroll = slider.scrollLeft;
      try { slider.setPointerCapture(e.pointerId); } catch (_) {}
    }

    function onPointerMove(e) {
      if (!dragging) return;
      var delta = e.clientX - dragStartX;
      slider.scrollLeft = dragStartScroll - delta;
    }

    function onPointerUp(e) {
      if (!dragging) return;
      dragging = false;
      try { slider.releasePointerCapture(e.pointerId); } catch (_) {}
    }

    slider.addEventListener('pointerdown', onPointerDown);
    slider.addEventListener('pointermove', onPointerMove);
    slider.addEventListener('pointerup', onPointerUp);
    slider.addEventListener('pointercancel', onPointerUp);

    // ----- initial thumb + resize -----
    var ro = new ResizeObserver(function () { syncThumb(); });
    ro.observe(slider);
    if (track) ro.observe(track);

    MQ.addEventListener('change', syncThumb);
    requestAnimationFrame(syncThumb);
  }

  function run() {
    document.querySelectorAll('.product--gallery-scroll-horizontal media-gallery').forEach(initGallery);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
})();
