const styleToggle = document.getElementById('style-toggle');
const cookieName = 'stylePreference';
const musicElement = document.createElement('audio');
musicElement.src = '/assets/lofi.mp3'; 
musicElement.volume = 0.75;

const cookieValue = getCookie(cookieName);
let currentStyle = 'modern';
let styleElement;
let musicPlaying = false;
let musicTimestamp = localStorage.getItem('musicTimestamp');

if (musicTimestamp) {
  musicElement.currentTime = musicTimestamp;
}

if (cookieValue === 'old') {
  currentStyle = 'old';
  loadCss('/styleold.css');
} else {
  loadCss('/style.css');
  playMusic();
}

styleToggle.addEventListener('click', () => {
  if (currentStyle === 'modern') {
    currentStyle = 'old';
    document.cookie = `${cookieName}=old; expires=Fri, 31 Dec 9999 23:59:59 GMT; path=/`;
    loadCss('/styleold.css');
    stopMusic();
  } else {
    currentStyle = 'modern';
    document.cookie = `${cookieName}=modern; expires=Fri, 31 Dec 9999 23:59:59 GMT; path=/`;
    loadCss('/style.css');
    playMusic();
  }
});

musicElement.addEventListener('timeupdate', () => {
  localStorage.setItem('musicTimestamp', musicElement.currentTime);
});

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
}

function loadCss(url) {
  if (styleElement) {
    styleElement.remove();
  }

  fetch(url)
    .then(response => response.text())
    .then(css => {
      styleElement = document.createElement('style');
      styleElement.textContent = css;
      document.head.appendChild(styleElement);
    });
}

function playMusic() {
  if (!musicPlaying) {
    musicElement.play();
    musicPlaying = true;
  }
}

function stopMusic() {
  if (musicPlaying) {
    musicElement.pause();
    musicPlaying = false;
  }
}
