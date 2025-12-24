document.addEventListener('DOMContentLoaded', function() {
  console.log('Hope Project - Initializing...');
  
  // Show navigation on all pages except home
  if (!document.querySelector('.home-header')) {
    const mainNav = document.querySelector('.main-nav');
    if (mainNav) {
      mainNav.classList.remove('hidden');
    }
  }

  // Card clicks for homepage
  document.querySelectorAll('.category-card').forEach(card => {
    card.addEventListener('click', function() {
      let targetPage;
      switch(this.id) {
        case 'resources-card': targetPage = 'resources.html'; break;
        case 'boards-card': targetPage = 'boards.html'; break;
        case 'letters-card': targetPage = 'letters.html'; break;
        case 'about-card': targetPage = 'about.html'; break;
        default: targetPage = 'index.html';
      }
      window.location.href = targetPage;
    });
  });

  // Initialize cat functionality on ALL pages
  initCatMascot();
  
  setActiveNavLink();
  createStars();
});

// Initialize cat mascot with speech bubble
function initCatMascot() {
  const catMascot = document.querySelector('.cat-mascot');
  const speechBubble = document.querySelector('.speech-bubble');
  const closeBubble = document.querySelector('.close-bubble');
  
  console.log('Initializing cat mascot:', {catMascot, speechBubble, closeBubble});
  
  if (catMascot && speechBubble && closeBubble) {
    // Click on cat to show bubble
    catMascot.addEventListener('click', function(e) {
      console.log('Cat clicked, showing bubble');
      speechBubble.style.display = 'block';
      e.stopPropagation();
    });
    
    // Click on close button to hide bubble
    closeBubble.addEventListener('click', function(e) {
      console.log('Close button clicked, hiding bubble');
      speechBubble.style.display = 'none';
      e.stopPropagation();
    });
    
    // Click anywhere else to hide bubble
    document.addEventListener('click', function(e) {
      if (speechBubble.style.display === 'block' && 
          !speechBubble.contains(e.target) && 
          !catMascot.contains(e.target)) {
        console.log('Clicked outside, hiding bubble');
        speechBubble.style.display = 'none';
      }
    });
    
    // Prevent clicks inside bubble from closing it
    speechBubble.addEventListener('click', function(e) {
      e.stopPropagation();
    });
    
    // Set appropriate message for current page
    setCatMessage();
    
    console.log('Cat mascot initialized successfully');
  } else {
    console.log('Cat elements not found on this page');
  }
}

function setCatMessage() {
  const bubble = document.querySelector('.speech-bubble p');
  if (!bubble) return;

  const messages = {
    'index': [
      "Welcome to Hope Project! Click on a category to begin.",
      "You're not alone. We're here to help.",
      "Small steps lead to big changes."
    ],
    'resources': [
      "Remember, you are not alone.",
      "It's okay to ask for help when you need it.",
      "These resources are here to support you."
    ],
    'boards': [
      "Try dragging a sticker to decorate your board!",
      "Express yourself freely - this is your space.",
      "Creativity can be a wonderful outlet."
    ],
    'letters': [
      "Your words can brighten someone's day.",
      "Kindness costs nothing but means everything.",
      "Share encouragement with others who might need it."
    ],
    'about': [
      "Hope Project is here to support you.",
      "We believe in creating safe spaces for everyone.",
      "Your experiences matter and you are valued."
    ]
  };

  let page = 'index';
  if (window.location.pathname.includes('resources')) page = 'resources';
  else if (window.location.pathname.includes('boards')) page = 'boards';
  else if (window.location.pathname.includes('letters')) page = 'letters';
  else if (window.location.pathname.includes('about')) page = 'about';

  const randomIndex = Math.floor(Math.random() * messages[page].length);
  bubble.textContent = messages[page][randomIndex];
}

function setActiveNavLink() {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link').forEach(link => {
    const linkPage = link.getAttribute('href');
    if (linkPage === currentPage) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

function createStars() {
  // Only create stars on homepage
  if (!document.querySelector('.home-header')) return;
  
  const starCount = 50;
  const container = document.querySelector('.stars-container') || document.body;
  
  for (let i = 0; i < starCount; i++) {
    const star = document.createElement('div');
    star.className = 'star';

    const size = Math.random() * 6 + 3;
    const posX = Math.random() * 100;
    const posY = Math.random() * 100;
    const delay = Math.random() * 5;
    const duration = Math.random() * 5 + 3;
    const color = `hsl(${Math.random() * 360}, 100%, 85%)`;

    star.style.width = `${size}px`;
    star.style.height = `${size}px`;
    star.style.left = `${posX}vw`;
    star.style.top = `${posY}vh`;
    star.style.animationDelay = `${delay}s`;
    star.style.animationDuration = `${duration}s`;
    star.style.background = color;

    container.appendChild(star);
  }
}