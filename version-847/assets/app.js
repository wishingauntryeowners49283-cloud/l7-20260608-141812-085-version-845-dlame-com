
(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  var carousel = document.querySelector('[data-hero-carousel]');

  if (carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
    var activeIndex = 0;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      activeIndex = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === activeIndex);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === activeIndex);
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        showSlide(dotIndex);
      });
    });

    window.setInterval(function () {
      showSlide(activeIndex + 1);
    }, 5000);
  }

  var categorySearch = document.querySelector('[data-category-search]');

  if (categorySearch) {
    var categoryCards = Array.prototype.slice.call(document.querySelectorAll('[data-category]'));

    categorySearch.addEventListener('input', function () {
      var term = categorySearch.value.trim().toLowerCase();

      categoryCards.forEach(function (card) {
        var text = card.getAttribute('data-category').toLowerCase() + ' ' + card.textContent.toLowerCase();
        card.classList.toggle('is-hidden-by-filter', term && text.indexOf(term) === -1);
      });
    });
  }

  var filterBox = document.querySelector('[data-filter-box]');

  if (filterBox) {
    var input = filterBox.querySelector('[data-filter-input]');
    var typeSelect = filterBox.querySelector('[data-filter-type]');
    var yearSelect = filterBox.querySelector('[data-filter-year]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-filter-list] .movie-card'));
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q');

    if (input && query) {
      input.value = query;
    }

    function matches(card) {
      var term = input ? input.value.trim().toLowerCase() : '';
      var type = typeSelect ? typeSelect.value : '';
      var year = yearSelect ? yearSelect.value : '';
      var haystack = [
        card.getAttribute('data-title'),
        card.getAttribute('data-region'),
        card.getAttribute('data-type'),
        card.getAttribute('data-year'),
        card.getAttribute('data-genre'),
        card.getAttribute('data-tags'),
        card.textContent
      ].join(' ').toLowerCase();
      var typeMatch = !type || (card.getAttribute('data-type') || '').indexOf(type) !== -1 || haystack.indexOf(type.toLowerCase()) !== -1;
      var yearMatch = !year || (card.getAttribute('data-year') || '') === year;
      var termMatch = !term || haystack.indexOf(term) !== -1;

      return typeMatch && yearMatch && termMatch;
    }

    function applyFilter() {
      cards.forEach(function (card) {
        card.classList.toggle('is-hidden-by-filter', !matches(card));
      });
    }

    [input, typeSelect, yearSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilter);
        control.addEventListener('change', applyFilter);
      }
    });

    applyFilter();
  }
}());

function initializePlayer(source) {
  var video = document.querySelector('[data-player-video]');
  var trigger = document.querySelector('[data-play-trigger]');
  var loaded = false;
  var hls = null;

  if (!video || !trigger || !source) {
    return;
  }

  function loadVideo() {
    if (loaded) {
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(source);
      hls.attachMedia(video);
    } else {
      video.src = source;
    }

    video.controls = true;
    loaded = true;
  }

  function startVideo() {
    loadVideo();
    trigger.classList.add('is-hidden');

    var playPromise = video.play();

    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {
        trigger.classList.remove('is-hidden');
      });
    }
  }

  trigger.addEventListener('click', startVideo);

  video.addEventListener('click', function () {
    if (video.paused) {
      startVideo();
    }
  });

  window.addEventListener('beforeunload', function () {
    if (hls) {
      hls.destroy();
    }
  });
}
