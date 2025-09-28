document.addEventListener("DOMContentLoaded", function() {
  // Atropos effect removed — using particles/stars instead.

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

  // Add hover effects to tech stack images
  addTechStackEffects();
});

// Create floating background particles
function createFloatingParticles() {
  const particlesContainer = document.createElement('div');
  particlesContainer.className = 'particles';
  document.body.appendChild(particlesContainer);

  // Increase particle count for more stars and vary sizes/opacity for depth
  for (let i = 0; i < 80; i++) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    
    // Random positioning, size, brightness and animation delay for star effect
    particle.style.left = Math.random() * 100 + '%';
    particle.style.top = Math.random() * 100 + '%';
    const size = (Math.random() * 2) + 1; // 1px to 3px
    particle.style.width = size + 'px';
    particle.style.height = size + 'px';
    particle.style.opacity = (0.3 + Math.random() * 0.8).toString();
    particle.style.animationDelay = Math.random() * 8 + 's';
    particle.style.animationDuration = (Math.random() * 6 + 4) + 's';
    particle.style.filter = `blur(${Math.random() * 1}px)`;
    
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