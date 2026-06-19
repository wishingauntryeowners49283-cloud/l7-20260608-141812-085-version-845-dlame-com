(function () {
  function onReady(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function initMobileNav() {
    var toggle = document.querySelector('.mobile-toggle');
    var nav = document.querySelector('.mobile-nav');
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener('click', function () {
      nav.classList.toggle('open');
    });
  }

  function initHero() {
    var slider = document.querySelector('.hero-slider');
    if (!slider) {
      return;
    }
    var slides = Array.prototype.slice.call(slider.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('.hero-dot'));
    var previous = slider.querySelector('.hero-prev');
    var next = slider.querySelector('.hero-next');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    if (previous) {
      previous.addEventListener('click', function () {
        show(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        restart();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-slide') || '0'));
        restart();
      });
    });

    show(0);
    restart();
  }

  function initFilters() {
    var panels = Array.prototype.slice.call(document.querySelectorAll('.filter-panel'));
    panels.forEach(function (panel) {
      var scope = panel.parentElement || document;
      var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card'));
      var empty = scope.querySelector('[data-empty-state]');
      var input = panel.querySelector('[data-search-input]');
      var category = panel.querySelector('[data-filter-category]');
      var type = panel.querySelector('[data-filter-type]');
      var year = panel.querySelector('[data-filter-year]');
      var reset = panel.querySelector('[data-filter-reset]');

      function valueOf(node) {
        return node ? String(node.value || '').trim().toLowerCase() : '';
      }

      function filter() {
        var query = valueOf(input);
        var cat = valueOf(category);
        var typ = valueOf(type);
        var yr = valueOf(year);
        var visible = 0;

        cards.forEach(function (card) {
          var text = String(card.getAttribute('data-search') || '').toLowerCase();
          var cardCat = String(card.getAttribute('data-category') || '').toLowerCase();
          var cardType = String(card.getAttribute('data-type') || '').toLowerCase();
          var cardYear = String(card.getAttribute('data-year') || '').toLowerCase();
          var matched = true;

          if (query && text.indexOf(query) === -1) {
            matched = false;
          }
          if (cat && cardCat !== cat) {
            matched = false;
          }
          if (typ && cardType.indexOf(typ) === -1) {
            matched = false;
          }
          if (yr && cardYear !== yr) {
            matched = false;
          }

          card.classList.toggle('is-hidden', !matched);
          if (matched) {
            visible += 1;
          }
        });

        if (empty) {
          empty.classList.toggle('show', visible === 0);
        }
      }

      [input, category, type, year].forEach(function (node) {
        if (node) {
          node.addEventListener('input', filter);
          node.addEventListener('change', filter);
        }
      });

      if (reset) {
        reset.addEventListener('click', function () {
          [input, category, type, year].forEach(function (node) {
            if (node) {
              node.value = '';
            }
          });
          filter();
        });
      }
    });
  }

  function initPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));
    players.forEach(function (box) {
      var video = box.querySelector('video');
      var trigger = box.querySelector('[data-play]');
      if (!video || !trigger) {
        return;
      }

      var stream = trigger.getAttribute('data-stream');
      var hls = null;
      var loaded = false;

      function loadStream() {
        if (!stream || loaded) {
          return;
        }
        loaded = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = stream;
          video.load();
          return;
        }
        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(stream);
          hls.attachMedia(video);
          return;
        }
        video.src = stream;
        video.load();
      }

      function play() {
        box.classList.add('is-playing');
        loadStream();
        var started = video.play();
        if (started && typeof started.catch === 'function') {
          started.catch(function () {});
        }
      }

      trigger.addEventListener('click', play);
      video.addEventListener('click', function () {
        if (video.paused) {
          play();
        }
      });
      window.addEventListener('beforeunload', function () {
        if (hls) {
          hls.destroy();
        }
      });
    });
  }

  onReady(function () {
    initMobileNav();
    initHero();
    initFilters();
    initPlayers();
  });
})();
