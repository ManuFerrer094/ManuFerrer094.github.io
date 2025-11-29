document.addEventListener("DOMContentLoaded", function() {
  // Initialize theme system
  initializeTheme();

  // Download button functionality
  const downloadButton = document.getElementById('downloadButton');
  const downloadLink = document.getElementById('downloadLink');

  if (downloadButton && downloadLink) {
    downloadButton.addEventListener('click', function() {
      downloadLink.click();
    });
  }

  // Navbar scroll effect
  const navbar = document.querySelector('.modern-header');
  let lastScrollTop = 0;

  if (navbar) {
    window.addEventListener('scroll', function() {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      
      if (scrollTop > 50) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
      
      lastScrollTop = scrollTop;
    });
  }

  // Mobile menu toggle
  const navToggle = document.getElementById('navToggle');
  const navMenu = document.getElementById('navMenu');
  
  if (navToggle && navMenu) {
    navToggle.addEventListener('click', function() {
      navToggle.classList.toggle('active');
      navMenu.classList.toggle('active');
      document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
    });

    // Close menu when clicking on a link
    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', function() {
        navToggle.classList.remove('active');
        navMenu.classList.remove('active');
        document.body.style.overflow = '';
      });
    });

    // Close menu when clicking outside
    document.addEventListener('click', function(event) {
      if (!navMenu.contains(event.target) && !navToggle.contains(event.target) && navMenu.classList.contains('active')) {
        navToggle.classList.remove('active');
        navMenu.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
  }

  // Smooth scrolling for navigation links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      
      if (target) {
        const offsetTop = target.offsetTop - 100; // Account for fixed navbar
        
        window.scrollTo({
          top: offsetTop,
          behavior: 'smooth'
        });
      }
    });
  });

  // Add scroll reveal animation only for projects (not about/experience sections)
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting && !entry.target.classList.contains('fade-in')) {
        entry.target.classList.add('fade-in');
        // Stop observing this element once it's been animated
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Only observe project elements, not about-stack or experience elements
  document.querySelectorAll('.project').forEach(el => {
    const parentAbout = el.closest('#about');
    const parentExperience = el.closest('#experience');
    
    if (!parentAbout && !parentExperience) {
      observer.observe(el);
    }
  });
  
  // Ensure main sections are always visible after DOM is loaded
  setTimeout(() => {
    const aboutSection = document.getElementById('about');
    const experienceSection = document.getElementById('experience');
    
    if (aboutSection) {
      aboutSection.style.opacity = '1';
      aboutSection.style.visibility = 'visible';
    }
    
    if (experienceSection) {
      experienceSection.style.opacity = '1';
      experienceSection.style.visibility = 'visible';
    }
  }, 100);

  // Typing text rotator
  initTypingRotator(["Frontend Developer", "EX IFS Developer", "Turing AI Developer"], '.typing-text');

  // Create floating particles
  createLoadingSkeleton();
  createFloatingParticles();

  // Ensure particles reflect any recent theme/variable changes
  setTimeout(() => {
    recreateParticles();
  }, 200);

  // Add hover effects to tech stack images
  addTechStackEffects();
});

// Theme management functions
function initializeTheme() {
  // Get saved theme or default to dark
  const savedTheme = localStorage.getItem('theme') || 'dark';
  applyTheme(savedTheme);
  
  // Set up theme toggle button
  const themeToggle = document.getElementById('themeToggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', toggleTheme);
  }
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  applyTheme(newTheme);
  localStorage.setItem('theme', newTheme);
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  recreateParticles();
}

// Interactive Particle System
let particlesArray = [];
let mouse = { x: null, y: null, radius: 250 };

window.addEventListener('mousemove', function(event) {
  mouse.x = event.clientX;
  mouse.y = event.clientY;
});

class Particle {
    constructor(x, y, element, density) {
        this.x = x;
        this.y = y;
        this.baseX = x;
        this.baseY = y;
        this.element = element;
        this.density = density;
    }
    
    update() {
        // Calculate distance between mouse and particle
        let dx = mouse.x - this.x;
        let dy = mouse.y - this.y;
        let distance = Math.sqrt(dx*dx + dy*dy);
        
        if (distance < mouse.radius) {
            // Repulsion force (Push away effect)
            let forceDirectionX = dx / distance;
            let forceDirectionY = dy / distance;
            let maxDistance = mouse.radius;
            let force = (maxDistance - distance) / maxDistance;
            
            // Move away from mouse (inverted signs)
            let directionX = forceDirectionX * force * this.density;
            let directionY = forceDirectionY * force * this.density;
            
            this.x -= directionX;
            this.y -= directionY;
        } else {
            // Return to base position (Elastic effect)
            if (this.x !== this.baseX) {
                let dx = this.x - this.baseX;
                this.x -= dx/25;
            }
            if (this.y !== this.baseY) {
                let dy = this.y - this.baseY;
                this.y -= dy/25;
            }
        }
        
        // Apply transformation relative to base position
        let translateX = this.x - this.baseX;
        let translateY = this.y - this.baseY;
        
        this.element.style.transform = `translate3d(${translateX}px, ${translateY}px, 0)`;
    }
}

function animateParticles() {
    for (let i = 0; i < particlesArray.length; i++) {
        particlesArray[i].update();
    }
    requestAnimationFrame(animateParticles);
}

function recreateParticles() {
  const existingParticles = document.querySelector('.particles');
  if (existingParticles) {
    existingParticles.remove();
  }
  createFloatingParticles();
}

function createFloatingParticles() {
  const particlesContainer = document.createElement('div');
  particlesContainer.className = 'particles';
  document.body.appendChild(particlesContainer);

  const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
  const isLightMode = currentTheme === 'light';

  particlesArray = [];
  const particleCount = isLightMode ? 40 : 80;
  
  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement('div');
    particle.className = 'particle'; 
    
    // Random position
    const x = Math.random() * window.innerWidth;
    const y = Math.random() * window.innerHeight;
    
    particle.style.left = x + 'px';
    particle.style.top = y + 'px';
    
    // Create inner element for CSS animations (rotate/scale)
    const inner = document.createElement('div');
    inner.className = isLightMode ? 'cloud-particle' : 'star-particle';
    inner.style.width = '100%';
    inner.style.height = '100%';
    inner.style.position = 'relative'; 
    inner.style.top = '0';
    inner.style.left = '0';
    
    inner.style.animationDelay = Math.random() * 8 + 's';
    inner.style.animationDuration = (Math.random() * 6 + 4) + 's';

    if (isLightMode) {
      const w = Math.floor((Math.random() * 80) + 60);
      const h = Math.floor(w * (Math.random() * 0.35 + 0.18));
      particle.style.width = w + 'px';
      particle.style.height = h + 'px';
      inner.style.opacity = (0.8 + Math.random() * 0.2).toString();

      const svgns = 'http://www.w3.org/2000/svg';
      const svg = document.createElementNS(svgns, 'svg');
      svg.setAttribute('width', '100%');
      svg.setAttribute('height', '100%');
      svg.setAttribute('viewBox', `0 0 ${w} ${h}`);

      const path = document.createElementNS(svgns, 'path');
      const p = `M ${w*0.05} ${h*0.75} C ${w*0.05} ${h*0.35} ${w*0.25} ${h*0.15} ${w*0.4} ${h*0.25} C ${w*0.5} ${h*0.05} ${w*0.7} ${h*0.05} ${w*0.8} ${h*0.25} C ${w*0.95} ${h*0.25} ${w*0.95} ${h*0.6} ${w*0.7} ${h*0.7} C ${w*0.55} ${h*0.9} ${w*0.25} ${h*0.9} ${w*0.05} ${h*0.75} Z`;
      path.setAttribute('d', p);
      path.setAttribute('class', 'cloud-stroke');

      svg.appendChild(path);
      inner.appendChild(svg);
    } else {
      const size = (Math.random() * 3) + 1;
      particle.style.width = size + 'px';
      particle.style.height = size + 'px';
      inner.style.opacity = (0.6 + Math.random() * 0.5).toString();

      const svgns = 'http://www.w3.org/2000/svg';
      const svg = document.createElementNS(svgns, 'svg');
      svg.setAttribute('width', '100%');
      svg.setAttribute('height', '100%');
      svg.setAttribute('viewBox', `0 0 ${size} ${size}`);

      const circ = document.createElementNS(svgns, 'circle');
      circ.setAttribute('cx', size/2);
      circ.setAttribute('cy', size/2);
      circ.setAttribute('r', size/2);
      circ.setAttribute('fill', getComputedStyle(document.documentElement).getPropertyValue('--particle-star-color') || '#fff');
      
      svg.appendChild(circ);
      inner.appendChild(svg);
    }

    particle.appendChild(inner);
    particlesContainer.appendChild(particle);
    
    // Add to physics system (density affects speed)
    particlesArray.push(new Particle(x, y, particle, (Math.random() * 15) + 5));
  }
  
  // Start animation loop if not already running
  if (!window.particleAnimationRunning) {
      window.particleAnimationRunning = true;
      animateParticles();
  }
}

// Create simple loading skeletons for about and experience until content arrives
function createLoadingSkeleton() {
  const about = document.getElementById('about');
  if (about && !about.querySelector('.skeleton')) {
    const s = document.createElement('div');
    s.className = 'skeleton about-skeleton';
    s.innerHTML = `
      <div class="s-line title"></div>
      <div class="s-line text"></div>
      <div class="s-line badges"></div>
    `;
    const target = about.querySelector('.about-content') || about;
    target.appendChild(s);
  }

  const exp = document.getElementById('experience');
  if (exp && !exp.querySelector('.skeleton')) {
    const s2 = document.createElement('div');
    s2.className = 'skeleton experience-skeleton';
    s2.innerHTML = `
      <div class="s-line title"></div>
      <div class="s-line text"></div>
      <div class="s-line tab"></div>
    `;
    const target2 = exp.querySelector('.container') || exp;
    target2.insertBefore(s2, target2.firstChild);
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

function initTypingRotator(phrases, selector, options = {}) {
  const el = document.querySelector(selector);
  if (!el || !Array.isArray(phrases) || phrases.length === 0) return;

  const cfg = Object.assign({ typingSpeed: 90, deleteSpeed: 50, pauseDelay: 1500 }, options);

  el.setAttribute('aria-live', 'polite');

  if (!document.getElementById('typing-rotator-style')) {
    const style = document.createElement('style');
    style.id = 'typing-rotator-style';
    style.innerHTML = `
      .typing-cursor{display:inline-block; margin-left:6px; width:8px; animation:typing-blink 1s steps(1) infinite;}
      @keyframes typing-blink{50%{opacity:0}};
    `;
    document.head.appendChild(style);
  }

  el.innerHTML = '<span class="typing-chars"></span><span class="typing-cursor">|</span>';
  const chars = el.querySelector('.typing-chars');

  let phraseIndex = 0;
  let charIndex = 0;
  let deleting = false;

  function step() {
    const current = phrases[phraseIndex];

    if (!deleting) {
      chars.textContent = current.slice(0, charIndex + 1);
      charIndex++;
      if (charIndex === current.length) {
        setTimeout(() => { deleting = true; step(); }, cfg.pauseDelay);
        return;
      }
      setTimeout(step, cfg.typingSpeed);
    } else {
      chars.textContent = current.slice(0, charIndex - 1);
      charIndex--;
      if (charIndex === 0) {
        deleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
        setTimeout(step, cfg.typingSpeed);
        return;
      }
      setTimeout(step, cfg.deleteSpeed);
    }
  }

  step();
}