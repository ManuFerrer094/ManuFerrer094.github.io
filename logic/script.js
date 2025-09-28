document.addEventListener("DOMContentLoaded", function() {
  // Initialize Atropos 3D effect
  const myAtropos = Atropos({
    el: '.atropos-exp',
    activeOffset: 40,
    shadowScale: 1.05,
  });

  // Download button functionality
  const downloadButton = document.getElementById('downloadButton');
  const downloadLink = document.getElementById('downloadLink');

  if (downloadButton && downloadLink) {
    downloadButton.addEventListener('click', function() {
      downloadLink.click();
    });
  }

  // Navbar scroll effect
  const navbar = document.querySelector('.navbar');
  let lastScrollTop = 0;

  window.addEventListener('scroll', function() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    if (scrollTop > 100) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
    
    lastScrollTop = scrollTop;
  });

  // Smooth scrolling for navigation links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      
      if (target) {
        const offsetTop = target.offsetTop - 120; // Account for fixed navbar
        
        window.scrollTo({
          top: offsetTop,
          behavior: 'smooth'
        });
      }
    });
  });

  // Add scroll reveal animation
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('fade-in');
      }
    });
  }, observerOptions);

  // Observe elements for animation
  document.querySelectorAll('.project, .about-stack, .experience .tab-pane').forEach(el => {
    observer.observe(el);
  });

  // Create floating particles
  createFloatingParticles();

  // Add hover effects to tech stack images
  addTechStackEffects();
});

// Create floating background particles
function createFloatingParticles() {
  const particlesContainer = document.createElement('div');
  particlesContainer.className = 'particles';
  document.body.appendChild(particlesContainer);

  for (let i = 0; i < 20; i++) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    
    // Random positioning and animation delay
    particle.style.left = Math.random() * 100 + '%';
    particle.style.top = Math.random() * 100 + '%';
    particle.style.animationDelay = Math.random() * 6 + 's';
    particle.style.animationDuration = (Math.random() * 3 + 3) + 's';
    
    particlesContainer.appendChild(particle);
  }
}

// Add interactive effects to tech stack images
function addTechStackEffects() {
  document.querySelectorAll('.about-stack img').forEach(img => {
    img.addEventListener('mouseenter', function() {
      this.style.transform = 'translateY(-8px) scale(1.1) rotate(5deg)';
    });
    
    img.addEventListener('mouseleave', function() {
      this.style.transform = 'translateY(0) scale(1) rotate(0deg)';
    });
  });
}

// Add loading states and error handling
window.addEventListener('load', function() {
  // Remove loading states
  document.querySelectorAll('.loading').forEach(el => {
    el.classList.remove('loading');
  });

  // Add entrance animations
  setTimeout(() => {
    document.querySelectorAll('.slide-up').forEach((el, index) => {
      setTimeout(() => {
        el.style.animationDelay = index * 100 + 'ms';
        el.classList.add('animate');
      }, index * 100);
    });
  }, 300);
});

// Handle navbar collapse on mobile
document.addEventListener('click', function(event) {
  const navbar = document.querySelector('.navbar-collapse');
  const toggler = document.querySelector('.navbar-toggler');
  
  if (navbar && navbar.classList.contains('show') && 
      !navbar.contains(event.target) && 
      !toggler.contains(event.target)) {
    toggler.click();
  }
});