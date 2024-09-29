// Add a class to hide the body initially
document.body.classList.add('hidden');

// Check cookie on page load and apply correct style
const cookieValue = getCookie(cookieName);
let currentStyle = 'modern';
if (cookieValue === 'old') {
  currentStyle = 'old';
  const newStyleLink = document.createElement('link');
  newStyleLink.rel = 'stylesheet';
  newStyleLink.href = '/styleold.css';
  newStyleLink.onload = function() {
    // Remove the hidden class once the CSS is loaded
    document.body.classList.remove('hidden');
  };
  document.head.appendChild(newStyleLink);
} else {
  const newStyleLink = document.createElement('link');
  newStyleLink.rel = 'stylesheet';
  newStyleLink.href = '/style.css';
  newStyleLink.onload = function() {
    // Remove the hidden class once the CSS is loaded
    document.body.classList.remove('hidden');
  };
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
    newStyleLink.onload = function() {
      document.body.classList.remove('hidden');
    };
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
    newStyleLink.onload = function() {
      document.body.classList.remove('hidden');
    };
    document.head.appendChild(newStyleLink);
  }
});
