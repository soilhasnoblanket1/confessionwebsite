const styleToggle = document.getElementById('style-toggle');
const cookieName = 'stylePreference';
const musicElement = document.createElement('audio');
musicElement.src = 'https://res.cloudinary.com/dgfj7bg8f/video/upload/v1727828099/Top_33_Songs_of_Lakey_Inspired____BEST_OF_LAKEY_INSPIRED____No_Copyright_ChillHop_Music_iMeNabdo3iQ_mp3cut.net_scipmq.mp3';
musicElement.volume = 0.75;

let musicPlaying = false;
let musicTimestamp = localStorage.getItem('musicTimestamp');

// Define the song list with timestamps
const songList = [
  { timestamp: 0, song: '5 Min Call' },
  { timestamp: 170, song: 'A Walk On The Moon' },
  { timestamp: 347, song: 'All I Need' },
  { timestamp: 582, song: 'Alone' },
  { timestamp: 783, song: 'Beach Dayz' },
  { timestamp: 966, song: 'Better Days' },
  { timestamp: 1173, song: 'Celebration' },
  { timestamp: 1377, song: 'Chill Day' },
  { timestamp: 1583, song: 'City Of Angels' },
  { timestamp: 1790, song: 'Doing Just Fine' },
  { timestamp: 1998, song: 'Falling' },
  { timestamp: 2206, song: 'Fast Lane' },
  { timestamp: 2424, song: 'Feeling Good' },
  { timestamp: 2640, song: 'Going Up' },
  { timestamp: 2860, song: 'Golden Hour' },
  { timestamp: 3089, song: 'I Found Me' },
  { timestamp: 3311, song: 'Illuminate' },
  { timestamp: 3538, song: 'Last Night' },
  { timestamp: 3854, song: 'Memories With You' },
  { timestamp: 4185, song: 'Monroe' },
  { timestamp: 4517, song: 'Moving On' },
  { timestamp: 4742, song: 'My Ride' },
  { timestamp: 4971, song: 'New Day' },
  { timestamp: 5198, song: 'Oceans' },
  { timestamp: 5424, song: 'On My Way' },
  { timestamp: 5664, song: 'Saturdays' },
  { timestamp: 5894, song: 'Street Dreams' },
  { timestamp: 6126, song: 'That Girl' },
  { timestamp: 6350, song: 'The Dreamer' },
  { timestamp: 6580, song: 'Visions' },
  { timestamp: 6808, song: 'Warm Nights' },
  { timestamp: 7041, song: 'Watching The Clouds' },
  { timestamp: 7272, song: 'Wonder' }
];

// Set the initial timestamp based on the stored value
if (musicTimestamp) {
  musicElement.currentTime = parseInt(musicTimestamp);
} else {
  musicElement.currentTime = 0;
}

// Update the timestamp when the music plays
musicElement.addEventListener('timeupdate', () => {
  const currentTimestamp = musicElement.currentTime;
  localStorage.setItem('musicTimestamp', currentTimestamp);
  console.log('Timestamp updated:', currentTimestamp);
});

let currentStyle = 'modern';

const cookieValue = getCookie(cookieName);
if (cookieValue === 'old') {
  currentStyle = 'old';
  injectCss('/styleold.css');
} else {
  injectCss('/style.css');
  playMusic();
}

styleToggle.addEventListener('click', () => {
  if (currentStyle === 'modern') {
    currentStyle = 'old';
    document.cookie = `${cookieName}=old; expires=Fri, 31 Dec 9999 23:59:59 GMT; path=/`;
    injectCss('/styleold.css', true);
    stopMusic();
  } else {
    currentStyle = 'modern';
    document.cookie = `${cookieName}=modern; expires=Fri, 31 Dec 9999 23:59:59 GMT; path=/`;
    injectCss('/style.css', true);
    playMusic();
  }
});

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return 'modern'; // default to modern theme
}
function injectCss(url, refresh = false) {
  const linkTag = document.createElement('link');
  linkTag.rel = 'stylesheet';
  linkTag.href = url;
  document.head.appendChild(linkTag);
  if (refresh) {
    setTimeout(() => {
      window.location.reload();
    }, 100);
  }
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
      styleElement.async = true; // saurav chor
      document.head.appendChild(styleElement);
    });
}


function playMusic() {
  if (!musicPlaying) {
    musicElement.play();
    musicPlaying = true;
    console.log('Music playing...');
  }
}

function stopMusic() {
  if (musicPlaying) {
    musicElement.pause();
    musicPlaying = false;
    console.log('Music stopped...');
  }
}

// Remove loading animation or message
document.body.classList.remove('loading');