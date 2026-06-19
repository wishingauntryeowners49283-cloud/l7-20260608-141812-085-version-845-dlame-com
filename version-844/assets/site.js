(function () {
    function selectAll(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function initHeader() {
        var header = document.querySelector('[data-header]');
        var toggle = document.querySelector('[data-nav-toggle]');
        var nav = document.querySelector('[data-nav]');
        if (!header) {
            return;
        }
        var update = function () {
            if (window.scrollY > 18) {
                header.classList.add('is-scrolled');
            } else {
                header.classList.remove('is-scrolled');
            }
        };
        update();
        window.addEventListener('scroll', update, { passive: true });
        if (toggle && nav) {
            toggle.addEventListener('click', function () {
                header.classList.toggle('nav-open');
            });
            selectAll('a', nav).forEach(function (link) {
                link.addEventListener('click', function () {
                    header.classList.remove('nav-open');
                });
            });
        }
    }

    function initHero() {
        var hero = document.querySelector('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = selectAll('[data-hero-slide]', hero);
        var dots = selectAll('[data-hero-dot]', hero);
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        if (!slides.length) {
            return;
        }
        var current = 0;
        var timer = null;
        var show = function (index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, idx) {
                slide.classList.toggle('active', idx === current);
            });
            dots.forEach(function (dot, idx) {
                dot.classList.toggle('active', idx === current);
            });
        };
        var restart = function () {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        };
        dots.forEach(function (dot, idx) {
            dot.addEventListener('click', function () {
                show(idx);
                restart();
            });
        });
        if (prev) {
            prev.addEventListener('click', function () {
                show(current - 1);
                restart();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(current + 1);
                restart();
            });
        }
        restart();
    }

    function normalize(value) {
        return (value || '').toString().trim().toLowerCase();
    }

    function initFilters() {
        selectAll('[data-filter-scope]').forEach(function (scope) {
            var input = scope.querySelector('[data-filter-input]');
            var year = scope.querySelector('[data-filter-year]');
            var genre = scope.querySelector('[data-filter-genre]');
            var category = scope.querySelector('[data-filter-category]');
            var cards = selectAll('.movie-card', scope);
            var apply = function () {
                var queryValue = normalize(input && input.value);
                var yearValue = normalize(year && year.value);
                var genreValue = normalize(genre && genre.value);
                var categoryValue = normalize(category && category.value);
                cards.forEach(function (card) {
                    var text = normalize([
                        card.getAttribute('data-title'),
                        card.getAttribute('data-genre'),
                        card.getAttribute('data-region'),
                        card.textContent
                    ].join(' '));
                    var ok = true;
                    if (queryValue && text.indexOf(queryValue) === -1) {
                        ok = false;
                    }
                    if (yearValue && normalize(card.getAttribute('data-year')) !== yearValue) {
                        ok = false;
                    }
                    if (genreValue && text.indexOf(genreValue) === -1) {
                        ok = false;
                    }
                    if (categoryValue && normalize(card.getAttribute('data-category')) !== categoryValue) {
                        ok = false;
                    }
                    card.classList.toggle('hidden-by-filter', !ok);
                });
            };
            [input, year, genre, category].forEach(function (control) {
                if (!control) {
                    return;
                }
                control.addEventListener('input', apply);
                control.addEventListener('change', apply);
            });
            var params = new URLSearchParams(window.location.search);
            var q = params.get('q');
            if (q && input) {
                input.value = q;
                apply();
            }
        });
    }

    function initPlayer(source) {
        var video = document.getElementById('moviePlayer');
        var overlay = document.getElementById('playerOverlay');
        if (!video || !source) {
            return;
        }
        var loaded = false;
        var hlsInstance = null;
        var load = function () {
            if (loaded) {
                return Promise.resolve();
            }
            loaded = true;
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
                return Promise.resolve();
            }
            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
                return Promise.resolve();
            }
            video.src = source;
            return Promise.resolve();
        };
        var start = function () {
            load().then(function () {
                if (overlay) {
                    overlay.classList.add('is-hidden');
                }
                var promise = video.play();
                if (promise && typeof promise.catch === 'function') {
                    promise.catch(function () {});
                }
            });
        };
        if (overlay) {
            overlay.addEventListener('click', start);
        }
        video.addEventListener('click', function () {
            if (!loaded) {
                start();
            }
        });
        video.addEventListener('play', function () {
            if (overlay) {
                overlay.classList.add('is-hidden');
            }
        });
        window.addEventListener('pagehide', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
                hlsInstance = null;
            }
        });
    }

    window.MovieSite = {
        initPlayer: initPlayer
    };

    document.addEventListener('DOMContentLoaded', function () {
        initHeader();
        initHero();
        initFilters();
    });
})();
