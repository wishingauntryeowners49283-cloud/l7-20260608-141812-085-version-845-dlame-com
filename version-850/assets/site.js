const HLS_VENDOR_PATH = './hls-vendor-dru42stk.js';

function ready(callback) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', callback);
  } else {
    callback();
  }
}

function initMobileMenu() {
  const button = document.querySelector('.site-menu-button');
  const menu = document.querySelector('.site-mobile-menu');
  if (!button || !menu) {
    return;
  }

  button.addEventListener('click', () => {
    const isOpen = !menu.classList.contains('hidden');
    menu.classList.toggle('hidden', isOpen);
    button.setAttribute('aria-expanded', String(!isOpen));
    button.textContent = isOpen ? '☰' : '×';
  });
}

function initGlobalSearch() {
  document.querySelectorAll('[data-global-search]').forEach((form) => {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const input = form.querySelector('input[name="q"]');
      const query = input ? input.value.trim() : '';
      const url = query ? `all-movies.html?q=${encodeURIComponent(query)}` : 'all-movies.html';
      window.location.href = url;
    });
  });
}

function normalizeText(value) {
  return String(value || '').toLowerCase().replace(/\s+/g, ' ').trim();
}

function initLiveFilters() {
  const panels = document.querySelectorAll('[data-filter-panel]');
  if (!panels.length) {
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const queryFromUrl = params.get('q') || '';

  panels.forEach((panel) => {
    const input = panel.querySelector('.js-live-search');
    const selects = Array.from(panel.querySelectorAll('.js-filter-select'));
    const count = panel.querySelector('[data-result-count]');
    const list = document.querySelector('[data-card-list]');
    const cards = list ? Array.from(list.querySelectorAll('.movie-card')) : [];

    if (input && queryFromUrl) {
      input.value = queryFromUrl;
    }

    const applyFilters = () => {
      const keyword = normalizeText(input ? input.value : '');
      let visibleCount = 0;

      cards.forEach((card) => {
        const searchable = normalizeText([
          card.dataset.title,
          card.dataset.region,
          card.dataset.year,
          card.dataset.type,
          card.dataset.genre,
          card.dataset.tags,
          card.textContent,
        ].join(' '));

        let visible = !keyword || searchable.includes(keyword);

        selects.forEach((select) => {
          if (!visible || !select.value) {
            return;
          }
          const field = select.dataset.field;
          visible = card.dataset[field] === select.value;
        });

        card.classList.toggle('is-filtered-out', !visible);
        if (visible) {
          visibleCount += 1;
        }
      });

      if (count) {
        count.textContent = String(visibleCount);
      }
    };

    if (input) {
      input.addEventListener('input', applyFilters);
    }
    selects.forEach((select) => select.addEventListener('change', applyFilters));
    applyFilters();
  });
}

function initHeroSlider() {
  const root = document.querySelector('[data-hero-slider]');
  if (!root) {
    return;
  }

  const slides = Array.from(root.querySelectorAll('.hero-slide'));
  const dots = Array.from(root.querySelectorAll('.hero-dot'));
  const prev = root.querySelector('[data-hero-prev]');
  const next = root.querySelector('[data-hero-next]');
  let activeIndex = 0;
  let timer = null;

  const showSlide = (index) => {
    activeIndex = (index + slides.length) % slides.length;
    slides.forEach((slide, slideIndex) => {
      const active = slideIndex === activeIndex;
      slide.classList.toggle('is-active', active);
      slide.setAttribute('aria-hidden', String(!active));
    });
    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle('is-active', dotIndex === activeIndex);
    });
  };

  const restart = () => {
    if (timer) {
      window.clearInterval(timer);
    }
    timer = window.setInterval(() => showSlide(activeIndex + 1), 5000);
  };

  if (prev) {
    prev.addEventListener('click', () => {
      showSlide(activeIndex - 1);
      restart();
    });
  }

  if (next) {
    next.addEventListener('click', () => {
      showSlide(activeIndex + 1);
      restart();
    });
  }

  dots.forEach((dot, dotIndex) => {
    dot.addEventListener('click', () => {
      showSlide(dotIndex);
      restart();
    });
  });

  showSlide(0);
  restart();
}

function initCoverFallbacks() {
  document.querySelectorAll('[data-cover-image]').forEach((image) => {
    image.addEventListener('error', () => {
      const frame = image.closest('.poster-frame');
      if (frame) {
        frame.classList.add('is-missing-cover');
      }
      image.remove();
    }, { once: true });
  });
}

async function attachHls(video, source) {
  if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = source;
    return;
  }

  try {
    const module = await import(HLS_VENDOR_PATH);
    const Hls = module.H;
    if (Hls && Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false,
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      video._hls = hls;
      return;
    }
  } catch (error) {
    console.warn('HLS vendor failed to load, falling back to direct source.', error);
  }

  video.src = source;
}

function initPlayers() {
  document.querySelectorAll('[data-player]').forEach((player) => {
    const button = player.querySelector('.js-play-button');
    const video = player.querySelector('video');
    const poster = player.querySelector('.player-poster');
    const status = player.querySelector('.player-status');

    if (!button || !video) {
      return;
    }

    button.addEventListener('click', async () => {
      const source = button.dataset.src;
      if (!source) {
        if (status) {
          status.textContent = '当前影片未绑定播放源。';
        }
        return;
      }

      button.disabled = true;
      if (status) {
        status.textContent = '正在初始化 HLS 播放器...';
      }

      video.classList.remove('hidden');
      if (poster) {
        poster.classList.add('hidden');
      }

      await attachHls(video, source);

      try {
        await video.play();
        if (status) {
          status.textContent = '正在播放：HLS 播放源已加载。';
        }
      } catch (error) {
        if (status) {
          status.textContent = '播放源已加载，请点击播放器上的播放按钮继续。';
        }
      }
    });
  });
}

function initBackToTop() {
  const button = document.querySelector('.back-to-top');
  if (!button) {
    return;
  }

  const update = () => {
    button.classList.toggle('is-visible', window.scrollY > 500);
  };

  button.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  window.addEventListener('scroll', update, { passive: true });
  update();
}

ready(() => {
  initMobileMenu();
  initGlobalSearch();
  initLiveFilters();
  initHeroSlider();
  initCoverFallbacks();
  initPlayers();
  initBackToTop();
});
