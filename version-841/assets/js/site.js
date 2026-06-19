(function () {
    'use strict';

    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    function normalize(value) {
        return (value || '').toString().trim().toLowerCase();
    }

    function initMobileMenu() {
        var button = document.querySelector('[data-menu-button]');
        var nav = document.querySelector('[data-mobile-nav]');

        if (!button || !nav) {
            return;
        }

        button.addEventListener('click', function () {
            nav.classList.toggle('is-open');
        });
    }

    function initHeroCarousel() {
        var carousel = document.querySelector('[data-hero-carousel]');

        if (!carousel) {
            return;
        }

        var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
        var prev = carousel.querySelector('[data-hero-prev]');
        var next = carousel.querySelector('[data-hero-next]');
        var current = 0;
        var timer = null;

        function show(index) {
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

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(parseInt(dot.getAttribute('data-hero-dot'), 10));
                start();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                show(current - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(current + 1);
                start();
            });
        }

        carousel.addEventListener('mouseenter', stop);
        carousel.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function filterCards(query) {
        var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
        var normalizedQuery = normalize(query);
        var visibleCount = 0;

        cards.forEach(function (card) {
            var haystack = normalize([
                card.getAttribute('data-title'),
                card.getAttribute('data-keywords'),
                card.textContent
            ].join(' '));
            var matched = !normalizedQuery || haystack.indexOf(normalizedQuery) !== -1;
            card.hidden = !matched;

            if (matched) {
                visibleCount += 1;
            }
        });

        var count = document.querySelector('[data-result-count]');
        if (count) {
            count.textContent = '共 ' + visibleCount + ' 部影片';
        }

        var emptyState = document.querySelector('[data-empty-state]');
        if (emptyState) {
            emptyState.hidden = visibleCount !== 0;
        }
    }

    function initSearchAndFilters() {
        var params = new URLSearchParams(window.location.search);
        var query = params.get('q') || '';
        var inputs = Array.prototype.slice.call(document.querySelectorAll('[data-search-input]'));
        var forms = Array.prototype.slice.call(document.querySelectorAll('[data-search-form]'));
        var hasCards = document.querySelectorAll('[data-card]').length > 0;

        inputs.forEach(function (input) {
            if (query && !input.value) {
                input.value = query;
            }

            input.addEventListener('input', function () {
                if (hasCards) {
                    filterCards(input.value);
                }
            });
        });

        forms.forEach(function (form) {
            form.addEventListener('submit', function (event) {
                var input = form.querySelector('[data-search-input]');
                var value = input ? input.value.trim() : '';

                if (hasCards && value) {
                    event.preventDefault();
                    filterCards(value);
                    var newUrl = window.location.pathname + '?q=' + encodeURIComponent(value);
                    window.history.replaceState(null, '', newUrl);
                }
            });
        });

        if (query && hasCards) {
            filterCards(query);
        }
    }

    function initPlayers() {
        var shells = Array.prototype.slice.call(document.querySelectorAll('[data-player-shell]'));

        shells.forEach(function (shell) {
            var video = shell.querySelector('video[data-hls-src]');
            var button = shell.querySelector('[data-player-start]');
            var message = shell.querySelector('[data-player-message]');
            var hlsInstance = null;

            if (!video || !button) {
                return;
            }

            function setMessage(text) {
                if (message) {
                    message.textContent = text;
                }
            }

            function loadAndPlay() {
                var source = video.getAttribute('data-hls-src');

                if (!source) {
                    setMessage('未找到播放源。');
                    return;
                }

                button.classList.add('is-hidden');

                if (window.Hls && window.Hls.isSupported()) {
                    if (!hlsInstance) {
                        hlsInstance = new window.Hls({
                            enableWorker: true,
                            lowLatencyMode: true
                        });

                        hlsInstance.loadSource(source);
                        hlsInstance.attachMedia(video);
                        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                            video.play().catch(function () {
                                setMessage('浏览器阻止了自动播放，请再次点击播放按钮。');
                            });
                        });
                        hlsInstance.on(window.Hls.Events.ERROR, function () {
                            setMessage('视频加载遇到网络或格式问题，请刷新后重试。');
                        });
                    } else {
                        video.play();
                    }
                } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = source;
                    video.addEventListener('loadedmetadata', function () {
                        video.play();
                    }, { once: true });
                    video.load();
                } else {
                    setMessage('当前浏览器需要 HLS 支持库，脚本加载失败时请检查网络。');
                }
            }

            button.addEventListener('click', loadAndPlay);
            video.addEventListener('play', function () {
                button.classList.add('is-hidden');
                setMessage('正在播放。');
            });
            video.addEventListener('pause', function () {
                if (!video.ended) {
                    setMessage('已暂停，可使用播放器控制继续观看。');
                }
            });
        });
    }

    function initBackToTop() {
        var button = document.querySelector('[data-back-to-top]');

        if (!button) {
            return;
        }

        window.addEventListener('scroll', function () {
            button.classList.toggle('is-visible', window.scrollY > 420);
        });

        button.addEventListener('click', function () {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    function initMissingImages() {
        var images = Array.prototype.slice.call(document.querySelectorAll('img'));

        images.forEach(function (image) {
            image.addEventListener('error', function () {
                image.style.opacity = '0';
                image.parentElement && image.parentElement.classList.add('image-pending');
            }, { once: true });
        });
    }

    ready(function () {
        initMobileMenu();
        initHeroCarousel();
        initSearchAndFilters();
        initPlayers();
        initBackToTop();
        initMissingImages();
    });
})();
