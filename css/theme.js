const styleToggle = document.getElementById('style-toggle');
const cookieName = 'stylePreference';

const cookieValue = getCookie(cookieName);
let currentStyle = 'modern';
let styleElement;

if (cookieValue === 'old') {
  currentStyle = 'old';
  loadCss('/styleold.css');
} else {
  loadCss('/style.css');
}

styleToggle.addEventListener('click', () => {
  if (currentStyle === 'modern') {
    currentStyle = 'old';
    document.cookie = `${cookieName}=old; expires=Fri, 31 Dec 9999 23:59:59 GMT; path=/`;
    loadCss('/styleold.css');
  } else {
    currentStyle = 'modern';
    document.cookie = `${cookieName}=modern; expires=Fri, 31 Dec 9999 23:59:59 GMT; path=/`;
    loadCss('/style.css');
  }
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

  const xhr = new XMLHttpRequest();
  xhr.open('GET', url, false);
  xhr.send();

  if (xhr.status === 200) {
    styleElement = document.createElement('style');
    styleElement.textContent = xhr.responseText;
    document.head.appendChild(styleElement);
  }
}
