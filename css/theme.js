const styleToggle = document.getElementById('style-toggle');
const cookieName = 'stylePreference';

// Check cookie on page load and apply correct style
const cookieValue = getCookie(cookieName);
let currentStyle = 'modern';
if (cookieValue === 'old') {
  currentStyle = 'old';
  const newStyleLink = document.createElement('link');
  newStyleLink.rel = 'stylesheet';
  newStyleLink.href = '/styleold.css';
  document.head.appendChild(newStyleLink);
} else {
  const newStyleLink = document.createElement('link');
  newStyleLink.rel = 'stylesheet';
  newStyleLink.href = '/style.css';
  document.head.appendChild(newStyleLink);
}

styleToggle.addEventListener('click', () => {
  if (currentStyle === 'modern') {
    currentStyle = 'old';
    document.cookie = `${cookieName}=old; expires=Fri, 31 Dec 9999 23:59:59 GMT; path=/`;
    const oldStyleLink = document.querySelector('link[href="/style.css"]');
    if (oldStyleLink) {
      oldStyleLink.remove();
    }
    const newStyleLink = document.createElement('link');
    newStyleLink.rel = 'stylesheet';
    newStyleLink.href = '/styleold.css';
    document.head.appendChild(newStyleLink);
  } else {
    currentStyle = 'modern';
    document.cookie = `${cookieName}=modern; expires=Fri, 31 Dec 9999 23:59:59 GMT; path=/`;
    const oldStyleLink = document.querySelector('link[href="/styleold.css"]');
    if (oldStyleLink) {
      oldStyleLink.remove();
    }
    const newStyleLink = document.createElement('link');
    newStyleLink.rel = 'stylesheet';
    newStyleLink.href = '/style.css';
    document.head.appendChild(newStyleLink);
  }
});

// Helper function to get cookie value
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
}