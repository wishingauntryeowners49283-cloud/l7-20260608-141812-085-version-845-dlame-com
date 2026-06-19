(function () {
  var video = document.querySelector('video[data-hls]');
  var button = document.querySelector('.play-layer');

  if (!video) {
    return;
  }

  var src = video.getAttribute('data-hls');
  var ready = false;

  function bindVideo() {
    if (ready || !src) {
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
      ready = true;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(src);
      hls.attachMedia(video);
      ready = true;
      return;
    }

    video.src = src;
    ready = true;
  }

  function hideButton() {
    if (button) {
      button.classList.add('is-hidden');
    }
  }

  function playVideo() {
    bindVideo();
    hideButton();
    var promise = video.play();

    if (promise && typeof promise.catch === 'function') {
      promise.catch(function () {
        if (button) {
          button.classList.remove('is-hidden');
        }
      });
    }
  }

  if (button) {
    button.addEventListener('click', playVideo);
  }

  video.addEventListener('click', function () {
    if (video.paused) {
      playVideo();
    }
  });

  video.addEventListener('play', hideButton);
  bindVideo();
})();
