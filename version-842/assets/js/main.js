(function () {
    const navToggle = document.querySelector('[data-nav-toggle]');
    const navMenu = document.querySelector('[data-nav-menu]');

    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function () {
            navMenu.classList.toggle('is-open');
        });
    }

    const slider = document.querySelector('[data-hero-slider]');

    if (slider) {
        const slides = Array.from(slider.querySelectorAll('[data-hero-slide]'));
        const buttons = Array.from(slider.querySelectorAll('[data-hero-index]'));
        let current = 0;
        let timer = null;

        const show = function (index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            buttons.forEach(function (button, buttonIndex) {
                button.classList.toggle('is-active', buttonIndex === current);
            });
        };

        const start = function () {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        };

        buttons.forEach(function (button) {
            button.addEventListener('click', function () {
                const index = Number(button.getAttribute('data-hero-index')) || 0;
                show(index);
                start();
            });
        });

        if (slides.length > 1) {
            start();
        }
    }

    const homeSearch = document.querySelector('[data-home-search]');

    if (homeSearch) {
        homeSearch.addEventListener('submit', function (event) {
            event.preventDefault();
            const input = homeSearch.querySelector('input[name="q"]');
            const value = input ? input.value.trim() : '';
            const url = value ? './search.html?q=' + encodeURIComponent(value) : './search.html';
            window.location.href = url;
        });
    }

    const searchForm = document.querySelector('[data-search-form]');
    const searchInput = document.querySelector('[data-search-input]');
    const resultGrid = document.querySelector('[data-search-results]');
    const resultTitle = document.querySelector('[data-result-title]');

    if (searchForm && searchInput && resultGrid) {
        const cards = Array.from(resultGrid.querySelectorAll('[data-movie-card]'));
        const categoryButtons = Array.from(document.querySelectorAll('[data-filter-category]'));
        const yearButtons = Array.from(document.querySelectorAll('[data-filter-year]'));
        const params = new URLSearchParams(window.location.search);
        const initialQuery = params.get('q') || '';
        let activeCategory = 'all';
        let activeYear = 'all';

        searchInput.value = initialQuery;

        const normalize = function (value) {
            return String(value || '').trim().toLowerCase();
        };

        const setActive = function (buttons, attr, value) {
            buttons.forEach(function (button) {
                button.classList.toggle('is-active', button.getAttribute(attr) === value);
            });
        };

        const apply = function () {
            const keyword = normalize(searchInput.value);
            let visible = 0;

            cards.forEach(function (card) {
                const haystack = normalize([
                    card.getAttribute('data-title'),
                    card.getAttribute('data-category'),
                    card.getAttribute('data-year'),
                    card.getAttribute('data-tags'),
                    card.textContent
                ].join(' '));
                const matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
                const matchCategory = activeCategory === 'all' || card.getAttribute('data-category') === activeCategory;
                const matchYear = activeYear === 'all' || card.getAttribute('data-year') === activeYear;
                const showCard = matchKeyword && matchCategory && matchYear;
                card.classList.toggle('is-hidden', !showCard);
                if (showCard) {
                    visible += 1;
                }
            });

            if (resultTitle) {
                resultTitle.textContent = keyword ? '搜索结果 ' + visible + ' 部' : '影片库';
            }
        };

        searchForm.addEventListener('submit', function (event) {
            event.preventDefault();
            apply();
        });

        searchInput.addEventListener('input', apply);

        categoryButtons.forEach(function (button) {
            button.addEventListener('click', function () {
                activeCategory = button.getAttribute('data-filter-category') || 'all';
                setActive(categoryButtons, 'data-filter-category', activeCategory);
                apply();
            });
        });

        yearButtons.forEach(function (button) {
            button.addEventListener('click', function () {
                activeYear = button.getAttribute('data-filter-year') || 'all';
                setActive(yearButtons, 'data-filter-year', activeYear);
                apply();
            });
        });

        apply();
    }
})();
