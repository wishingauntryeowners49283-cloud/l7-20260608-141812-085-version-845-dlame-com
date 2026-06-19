(function () {
    var menuButton = document.querySelector('.menu-toggle');
    var mainNav = document.querySelector('.main-nav');

    if (menuButton && mainNav) {
        menuButton.addEventListener('click', function () {
            mainNav.classList.toggle('is-open');
        });
    }

    var slider = document.querySelector('[data-hero-slider]');

    if (slider) {
        var slides = Array.prototype.slice.call(slider.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(slider.querySelectorAll('.hero-dot'));
        var previous = slider.querySelector('[data-hero-prev]');
        var next = slider.querySelector('[data-hero-next]');
        var current = 0;
        var timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }

            current = (index + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        function startAuto() {
            stopAuto();
            timer = window.setInterval(function () {
                showSlide(current + 1);
            }, 5600);
        }

        function stopAuto() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                showSlide(dotIndex);
                startAuto();
            });
        });

        if (previous) {
            previous.addEventListener('click', function () {
                showSlide(current - 1);
                startAuto();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                showSlide(current + 1);
                startAuto();
            });
        }

        slider.addEventListener('mouseenter', stopAuto);
        slider.addEventListener('mouseleave', startAuto);
        showSlide(0);
        startAuto();
    }

    var filterPanels = Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]'));

    filterPanels.forEach(function (panel) {
        var scope = panel.getAttribute('data-filter-panel') || 'body';
        var root = scope === 'body' ? document : document.querySelector(scope) || document;
        var cards = Array.prototype.slice.call(root.querySelectorAll('[data-filter-card]'));
        var keywordInput = panel.querySelector('[data-filter-keyword]');
        var typeSelect = panel.querySelector('[data-filter-type]');
        var regionSelect = panel.querySelector('[data-filter-region]');
        var yearSelect = panel.querySelector('[data-filter-year]');
        var emptyTip = root.querySelector('[data-empty-tip]') || document.querySelector('[data-empty-tip]');
        var params = new URLSearchParams(window.location.search);
        var initialKeyword = params.get('q') || '';

        if (keywordInput && initialKeyword) {
            keywordInput.value = initialKeyword;
        }

        function normalize(value) {
            return (value || '').toString().toLowerCase().trim();
        }

        function applyFilters() {
            var keyword = normalize(keywordInput ? keywordInput.value : '');
            var type = typeSelect ? typeSelect.value : '';
            var region = regionSelect ? regionSelect.value : '';
            var year = yearSelect ? yearSelect.value : '';
            var visibleCount = 0;

            cards.forEach(function (card) {
                var text = normalize([
                    card.getAttribute('data-title'),
                    card.getAttribute('data-genre'),
                    card.getAttribute('data-tags'),
                    card.getAttribute('data-region'),
                    card.textContent
                ].join(' '));
                var typeOk = !type || card.getAttribute('data-type') === type;
                var regionOk = !region || card.getAttribute('data-region') === region;
                var yearOk = !year || card.getAttribute('data-year') === year;
                var keywordOk = !keyword || text.indexOf(keyword) !== -1;
                var show = typeOk && regionOk && yearOk && keywordOk;

                card.style.display = show ? '' : 'none';

                if (show) {
                    visibleCount += 1;
                }
            });

            if (emptyTip) {
                emptyTip.classList.toggle('is-visible', visibleCount === 0);
            }
        }

        [keywordInput, typeSelect, regionSelect, yearSelect].forEach(function (control) {
            if (control) {
                control.addEventListener('input', applyFilters);
                control.addEventListener('change', applyFilters);
            }
        });

        applyFilters();
    });
})();
