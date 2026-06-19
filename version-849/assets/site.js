(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function setupMobileMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var menu = document.querySelector("[data-mobile-nav]");
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener("click", function () {
      menu.classList.toggle("open");
    });
  }

  function setupHero() {
    var slider = document.querySelector("[data-hero-slider]");
    if (!slider) {
      return;
    }
    var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
    var prev = slider.querySelector("[data-hero-prev]");
    var next = slider.querySelector("[data-hero-next]");
    var current = 0;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, itemIndex) {
        slide.classList.toggle("active", itemIndex === current);
      });
      dots.forEach(function (dot, itemIndex) {
        dot.classList.toggle("active", itemIndex === current);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(current - 1);
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
      });
    }

    show(0);
    window.setInterval(function () {
      show(current + 1);
    }, 5000);
  }

  function textOf(card) {
    return [
      card.getAttribute("data-title"),
      card.getAttribute("data-region"),
      card.getAttribute("data-type"),
      card.getAttribute("data-year"),
      card.getAttribute("data-genre"),
      card.textContent
    ].join(" ").toLowerCase();
  }

  function setupFilters() {
    var input = document.querySelector("[data-search-input]");
    var category = document.querySelector("[data-category-filter]");
    var year = document.querySelector("[data-year-filter]");
    var count = document.querySelector("[data-filter-count]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
    if (!cards.length || (!input && !category && !year)) {
      return;
    }

    function apply() {
      var keyword = input ? input.value.trim().toLowerCase() : "";
      var selectedCategory = category ? category.value : "";
      var selectedYear = year ? parseInt(year.value, 10) : 0;
      var visible = 0;

      cards.forEach(function (card) {
        var matchKeyword = !keyword || textOf(card).indexOf(keyword) !== -1;
        var matchCategory = !selectedCategory || card.getAttribute("data-category") === selectedCategory;
        var cardYear = parseInt(card.getAttribute("data-year") || "0", 10);
        var matchYear = !selectedYear || cardYear >= selectedYear;
        var shouldShow = matchKeyword && matchCategory && matchYear;
        card.classList.toggle("is-hidden", !shouldShow);
        if (shouldShow) {
          visible += 1;
        }
      });

      if (count) {
        count.textContent = "当前显示 " + visible + " 部影片";
      }
    }

    [input, category, year].forEach(function (control) {
      if (control) {
        control.addEventListener("input", apply);
        control.addEventListener("change", apply);
      }
    });
    apply();
  }

  function setupPlayer() {
    var video = document.querySelector("[data-hls-player]");
    if (!video) {
      return;
    }
    var playButton = document.querySelector("[data-play-button]");
    var status = document.querySelector("[data-player-status]");
    var source = video.getAttribute("data-src");
    var hlsInstance = null;
    var attached = false;

    function updateStatus(message) {
      if (status) {
        status.textContent = message;
      }
    }

    function attachSource() {
      if (attached || !source) {
        return;
      }
      attached = true;
      updateStatus("片源加载中");

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          updateStatus("片源已就绪");
        });
        hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            updateStatus("播放遇到问题，请稍后重试");
          }
        });
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        updateStatus("片源已就绪");
      } else {
        updateStatus("当前浏览器需要支持 HLS 播放");
      }
    }

    function playVideo() {
      attachSource();
      if (playButton) {
        playButton.classList.add("hidden");
      }
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {
          updateStatus("请再次点击播放器开始播放");
        });
      }
    }

    if (playButton) {
      playButton.addEventListener("click", playVideo);
    }
    video.addEventListener("play", function () {
      if (playButton) {
        playButton.classList.add("hidden");
      }
    });
    video.addEventListener("pause", function () {
      if (playButton && video.currentTime === 0) {
        playButton.classList.remove("hidden");
      }
    });
    window.addEventListener("beforeunload", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  ready(function () {
    setupMobileMenu();
    setupHero();
    setupFilters();
    setupPlayer();
  });
})();
