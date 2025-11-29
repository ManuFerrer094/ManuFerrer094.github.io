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
  // About and Experience sections handle their own animations
  document.querySelectorAll('.project').forEach(el => {
    // Don't observe if it's inside #about or #experience sections
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
  
  // Recreate particles with theme-appropriate style
  recreateParticles();
}

function recreateParticles() {
  // Remove existing particles
  const existingParticles = document.querySelector('.particles');
  if (existingParticles) {
    existingParticles.remove();
  }
  
  // Create new particles based on current theme
  createFloatingParticles();
}

// Create floating background particles (adaptive to theme)
function createFloatingParticles() {
  const particlesContainer = document.createElement('div');
  particlesContainer.className = 'particles';
  document.body.appendChild(particlesContainer);

  const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
  const isLightMode = currentTheme === 'light';

  // Adjust particle count and style based on theme
  const particleCount = isLightMode ? 40 : 80; // Fewer particles in light mode
  
  for (let i = 0; i < particleCount; i++) {
    // create an svg-based particle so we can stroke/paint the cloud outlines
    const particle = document.createElement('div');
    particle.className = `particle ${isLightMode ? 'cloud-particle' : 'star-particle'}`;
    particle.style.left = Math.random() * 100 + '%';
    particle.style.top = Math.random() * 100 + '%';

    if (isLightMode) {
      // Create an SVG cloud outline (painted line) sized moderately
      const w = Math.floor((Math.random() * 80) + 60); // 60px - 140px width
      const h = Math.floor(w * (Math.random() * 0.35 + 0.18)); // proportional height
      particle.style.width = w + 'px';
      particle.style.height = h + 'px';
      particle.style.opacity = (0.8 + Math.random() * 0.2).toString();

      const svgns = 'http://www.w3.org/2000/svg';
      const svg = document.createElementNS(svgns, 'svg');
      svg.setAttribute('width', '100%');
      svg.setAttribute('height', '100%');
      svg.setAttribute('viewBox', `0 0 ${w} ${h}`);

      // create a gently curving cloud path made of arcs/circles approximated with path
      const path = document.createElementNS(svgns, 'path');
      // Simple cloud-like path using bezier curves
      const cx = w/2;
      const cy = h/2;
      const p = `M ${w*0.05} ${h*0.75} C ${w*0.05} ${h*0.35} ${w*0.25} ${h*0.15} ${w*0.4} ${h*0.25} C ${w*0.5} ${h*0.05} ${w*0.7} ${h*0.05} ${w*0.8} ${h*0.25} C ${w*0.95} ${h*0.25} ${w*0.95} ${h*0.6} ${w*0.7} ${h*0.7} C ${w*0.55} ${h*0.9} ${w*0.25} ${h*0.9} ${w*0.05} ${h*0.75} Z`;
      path.setAttribute('d', p);
      path.setAttribute('class', 'cloud-stroke');

      svg.appendChild(path);
      particle.appendChild(svg);
    } else {
      // Stars: small SVG circle with glow via filter (simulated via box-shadow in CSS)
      const size = (Math.random() * 3) + 1; // 1px - 4px
      particle.style.width = size + 'px';
      particle.style.height = size + 'px';
      particle.style.opacity = (0.6 + Math.random() * 0.5).toString();

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
      circ.setAttribute('opacity', '0.95');

      svg.appendChild(circ);
      particle.appendChild(svg);
    }

    particle.style.animationDelay = Math.random() * 8 + 's';
    particle.style.animationDuration = (Math.random() * 6 + 4) + 's';

    particlesContainer.appendChild(particle);
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

// Diagnostic MutationObserver to log changes to #about and #experience
try {
  const targetNodes = ['about', 'experience'].map(id => document.getElementById(id)).filter(Boolean);
  if (targetNodes.length) {
    const mObserver = new MutationObserver((mutations) => {
      mutations.forEach(m => {
        if (m.type === 'childList') {
          console.log('[mutation] childList change on', m.target.id, m);
        } else if (m.type === 'attributes') {
          console.log('[mutation] attribute change on', m.target.id, m.attributeName, 'newValue=', m.target.getAttribute(m.attributeName));
        }
      });
    });

    targetNodes.forEach(node => {
      mObserver.observe(node, { attributes: true, childList: true, subtree: true });
    });
    console.log('[diagnostic] MutationObserver attached to', targetNodes.map(n => n.id));
  }
} catch (e) {
  console.warn('[diagnostic] failed to attach MutationObserver', e);
}