import { H as Hls } from './hls.js';

const bindPlayer = function (shell) {
    const video = shell.querySelector('video');
    const button = shell.querySelector('.play-overlay');
    const source = shell.getAttribute('data-hls');
    let hls = null;
    let loaded = false;

    if (!video || !button || !source) {
        return;
    }

    const load = function () {
        if (loaded) {
            return;
        }

        loaded = true;

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
            return;
        }

        if (Hls && Hls.isSupported()) {
            hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(source);
            hls.attachMedia(video);
            return;
        }

        video.src = source;
    };

    const start = function () {
        load();
        shell.classList.add('is-loading');
        const attempt = video.play();

        if (attempt && typeof attempt.then === 'function') {
            attempt.then(function () {
                shell.classList.add('is-playing');
            }).catch(function () {
                shell.classList.remove('is-loading');
            });
        }
    };

    button.addEventListener('click', start);

    video.addEventListener('click', function () {
        if (video.paused) {
            start();
        } else {
            video.pause();
        }
    });

    video.addEventListener('play', function () {
        shell.classList.add('is-playing');
        shell.classList.remove('is-loading');
    });

    video.addEventListener('pause', function () {
        shell.classList.remove('is-playing');
    });

    video.addEventListener('ended', function () {
        shell.classList.remove('is-playing');
    });

    window.addEventListener('beforeunload', function () {
        if (hls) {
            hls.destroy();
        }
    });
};

document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.player-shell[data-hls]').forEach(bindPlayer);
});
