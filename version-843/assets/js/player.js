(function () {
    function initMoviePlayer(streamUrl) {
        var video = document.getElementById('movie-player');
        var cover = document.querySelector('.player-cover');
        var loaded = false;
        var hls = null;

        if (!video || !streamUrl) {
            return;
        }

        function attachStream() {
            if (loaded) {
                return Promise.resolve();
            }

            loaded = true;

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = streamUrl;
                return Promise.resolve();
            }

            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });

                hls.loadSource(streamUrl);
                hls.attachMedia(video);

                return new Promise(function (resolve) {
                    hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        resolve();
                    });
                });
            }

            video.src = streamUrl;
            return Promise.resolve();
        }

        function playMovie() {
            if (cover) {
                cover.classList.add('is-hidden');
            }

            attachStream().then(function () {
                var playResult = video.play();

                if (playResult && playResult.catch) {
                    playResult.catch(function () {
                        if (cover) {
                            cover.classList.remove('is-hidden');
                        }
                    });
                }
            });
        }

        if (cover) {
            cover.addEventListener('click', playMovie);
        }

        video.addEventListener('click', function () {
            if (video.paused) {
                playMovie();
            }
        });

        video.addEventListener('play', function () {
            if (cover) {
                cover.classList.add('is-hidden');
            }
        });

        video.addEventListener('ended', function () {
            if (cover) {
                cover.classList.remove('is-hidden');
            }
        });

        window.addEventListener('beforeunload', function () {
            if (hls) {
                hls.destroy();
            }
        });
    }

    window.initMoviePlayer = initMoviePlayer;
})();
