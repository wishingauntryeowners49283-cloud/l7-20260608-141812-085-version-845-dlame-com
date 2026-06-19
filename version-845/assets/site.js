(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
        } else {
            document.addEventListener("DOMContentLoaded", fn);
        }
    }

    ready(function () {
        var toggle = document.querySelector("[data-menu-toggle]");
        var panel = document.querySelector("[data-mobile-panel]");
        if (toggle && panel) {
            toggle.addEventListener("click", function () {
                panel.classList.toggle("is-open");
            });
        }

        var hero = document.querySelector("[data-hero]");
        if (hero) {
            var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
            var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
            var prev = hero.querySelector("[data-hero-prev]");
            var next = hero.querySelector("[data-hero-next]");
            var index = 0;
            var timer;

            function show(nextIndex) {
                if (!slides.length) return;
                index = (nextIndex + slides.length) % slides.length;
                slides.forEach(function (slide, slideIndex) {
                    slide.classList.toggle("is-active", slideIndex === index);
                });
                dots.forEach(function (dot, dotIndex) {
                    dot.classList.toggle("is-active", dotIndex === index);
                });
            }

            function start() {
                stop();
                timer = window.setInterval(function () {
                    show(index + 1);
                }, 5000);
            }

            function stop() {
                if (timer) {
                    window.clearInterval(timer);
                }
            }

            if (prev) {
                prev.addEventListener("click", function () {
                    show(index - 1);
                    start();
                });
            }
            if (next) {
                next.addEventListener("click", function () {
                    show(index + 1);
                    start();
                });
            }
            dots.forEach(function (dot, dotIndex) {
                dot.addEventListener("click", function () {
                    show(dotIndex);
                    start();
                });
            });
            hero.addEventListener("mouseenter", stop);
            hero.addEventListener("mouseleave", start);
            start();
        }

        var filterBar = document.querySelector("[data-filter-bar]");
        var list = document.querySelector("[data-filter-list]");
        if (filterBar && list) {
            var input = filterBar.querySelector("[data-filter-input]");
            var year = filterBar.querySelector("[data-filter-year]");
            var region = filterBar.querySelector("[data-filter-region]");
            var type = filterBar.querySelector("[data-filter-type]");
            var sort = filterBar.querySelector("[data-filter-sort]");
            var empty = document.querySelector("[data-filter-empty]");
            var items = Array.prototype.slice.call(list.querySelectorAll(".movie-item"));
            var original = items.slice();
            var params = new URLSearchParams(window.location.search);
            var q = params.get("q");
            if (q && input) {
                input.value = q;
            }

            function contains(haystack, needle) {
                return haystack.toLowerCase().indexOf(needle.toLowerCase()) !== -1;
            }

            function apply() {
                var keyword = input ? input.value.trim() : "";
                var selectedYear = year ? year.value : "";
                var selectedRegion = region ? region.value : "";
                var selectedType = type ? type.value : "";
                var visible = 0;

                items.forEach(function (item) {
                    var text = [
                        item.getAttribute("data-title"),
                        item.getAttribute("data-region"),
                        item.getAttribute("data-type"),
                        item.getAttribute("data-genre"),
                        item.getAttribute("data-tags")
                    ].join(" ");
                    var ok = true;
                    if (keyword && !contains(text, keyword)) ok = false;
                    if (selectedYear && item.getAttribute("data-year") !== selectedYear) ok = false;
                    if (selectedRegion && item.getAttribute("data-region") !== selectedRegion) ok = false;
                    if (selectedType && item.getAttribute("data-type") !== selectedType) ok = false;
                    item.style.display = ok ? "" : "none";
                    if (ok) visible += 1;
                });

                if (sort) {
                    var mode = sort.value;
                    var ordered = original.slice();
                    if (mode === "year") {
                        ordered.sort(function (a, b) {
                            return Number(b.getAttribute("data-year") || 0) - Number(a.getAttribute("data-year") || 0);
                        });
                    } else if (mode === "views") {
                        ordered.sort(function (a, b) {
                            return Number(b.getAttribute("data-views") || 0) - Number(a.getAttribute("data-views") || 0);
                        });
                    } else if (mode === "title") {
                        ordered.sort(function (a, b) {
                            return String(a.getAttribute("data-title") || "").localeCompare(String(b.getAttribute("data-title") || ""), "zh-Hans-CN");
                        });
                    }
                    ordered.forEach(function (item) {
                        list.appendChild(item);
                    });
                }

                if (empty) {
                    empty.classList.toggle("is-visible", visible === 0);
                }
            }

            [input, year, region, type, sort].forEach(function (control) {
                if (control) {
                    control.addEventListener("input", apply);
                    control.addEventListener("change", apply);
                }
            });
            apply();
        }
    });

    window.initMoviePlayer = function (videoId, buttonId, url) {
        var video = document.getElementById(videoId);
        var button = document.getElementById(buttonId);
        var attached = false;
        var hls;

        if (!video || !button || !url) {
            return;
        }

        function attach() {
            if (attached) {
                return Promise.resolve();
            }
            attached = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = url;
                return Promise.resolve();
            }
            if (window.Hls && window.Hls.isSupported()) {
                hls = new Hls({ enableWorker: true, lowLatencyMode: true });
                hls.loadSource(url);
                hls.attachMedia(video);
                return new Promise(function (resolve) {
                    hls.on(Hls.Events.MANIFEST_PARSED, resolve);
                    window.setTimeout(resolve, 1400);
                });
            }
            video.src = url;
            return Promise.resolve();
        }

        function play() {
            attach().then(function () {
                return video.play();
            }).catch(function () {
                try {
                    video.play();
                } catch (error) {}
            });
            button.classList.add("is-hidden");
        }

        button.addEventListener("click", play);
        video.addEventListener("click", function () {
            if (!attached || video.paused) {
                play();
            }
        });
        video.addEventListener("play", function () {
            button.classList.add("is-hidden");
        });
    };
})();
