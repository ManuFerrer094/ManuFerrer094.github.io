import { updateElementContent } from './utils.js';

fetch('texts.json')
  .then(response => response.json())
  .then(data => {
    const expData = data.experiences;
    
    updateElementContent('#experience .section-title', expData.title);
    updateElementContent('#experience .section-description', expData.description);
    
    const timelineContainer = document.getElementById('experienceTimeline');
    if (timelineContainer && expData.items) {
      timelineContainer.innerHTML = expData.items.map((item, index) => `
        <div class="timeline-item" style="transition-delay: ${index * 100}ms">
          <div class="timeline-dot"></div>
          <div class="timeline-content">
            <div class="timeline-header">
              <div>
                <span class="timeline-company">${item.name}</span>
                <h3 class="timeline-role">${item.role}</h3>
              </div>
              <span class="timeline-date">${item.date}</span>
            </div>
            <p class="timeline-description">${item.description}</p>
            <div class="timeline-tags">
              ${item.stack.map(tech => `<span class="tech-tag">${tech}</span>`).join('')}
            </div>
          </div>
        </div>
      `).join('');
      
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1 });
      
      const items = document.querySelectorAll('.timeline-item');
      items.forEach(item => {
        observer.observe(item);
      });

      const activeObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            document.querySelectorAll('.timeline-item.active').forEach(i => {
              if (i !== entry.target) i.classList.remove('active');
            });
            entry.target.classList.add('active');
          } else {
            entry.target.classList.remove('active');
          }
        });
      }, { root: null, rootMargin: '-40% 0px -40% 0px', threshold: 0 });

      items.forEach(item => activeObserver.observe(item));
      
      const expSection = document.getElementById('experience');
      if (expSection) {
        const skeleton = expSection.querySelector('.skeleton');
        if (skeleton) skeleton.remove();
      }
    }
  })
  .catch(error => console.error('Error loading JSON:', error));
