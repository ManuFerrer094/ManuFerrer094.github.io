import { updateElementContent } from './utils.js';

fetch('texts.json')
  .then(response => response.json())
  .then(data => {
    const aboutData = data.about;
    
    // Update title and description
    updateElementContent('#about .section-title', aboutData.title);
    updateElementContent('#about .about-description', aboutData.description);
    
    // Generate Tech Stack Cards with Categories
    const stackGrid = document.getElementById('techStack');
    if (stackGrid && aboutData.stackCategories) {
      const iconMap = {
        'Angular': { cls: 'fa-brands fa-angular', color: '#dd0031' },
        'React': { cls: 'fa-brands fa-react', color: '#61dafb' },
        'Vue': { cls: 'fa-brands fa-vuejs', color: '#42b883' },
        'HTML5': { cls: 'fa-brands fa-html5', color: '#e34f26' },
        'CSS3': { cls: 'fa-brands fa-css3-alt', color: '#1572B6' },
        'TypeScript': { cls: 'fa-brands fa-js', color: '#3178c6' },
        'JavaScript': { cls: 'fa-brands fa-js', color: '#f7df1e' },
        'SQL': { cls: 'fa-solid fa-database', color: '#0f172a' },
        'MongoDB': { cls: 'fa-solid fa-leaf', color: '#47A248' },
      };

      const categories = [
        { key: 'languages', title: 'Lenguajes', icon: 'fa-solid fa-code' },
        { key: 'frameworks', title: 'Frameworks', icon: 'fa-solid fa-layer-group' },
        { key: 'databases', title: 'Bases de Datos', icon: 'fa-solid fa-database' }
      ];

      stackGrid.innerHTML = categories.map((category, index) => {
        const techs = aboutData.stackCategories[category.key] || [];
        const techItems = techs.map(tech => {
          const map = iconMap[tech] || { cls: 'fa-solid fa-code', color: 'var(--color-primary)' };
          return `
            <div class="tech-tag">
              <i class="${map.cls}" style="color: ${map.color};"></i>
              <span>${tech}</span>
            </div>
          `;
        }).join('');

        return `
          <div class="stack-card">
            <div class="stack-card-header" data-category="${category.key}">
              <div class="stack-card-title">
                <i class="${category.icon}"></i>
                <h4>${category.title}</h4>
              </div>
              <i class="fa-solid fa-chevron-down stack-card-arrow"></i>
            </div>
            <div class="stack-card-content" id="${category.key}-content">
              ${techItems}
            </div>
          </div>
        `;
      }).join('');

      // Add click handlers for accordion
      document.querySelectorAll('.stack-card-header').forEach(header => {
        header.addEventListener('click', function() {
          const card = this.parentElement;
          const content = card.querySelector('.stack-card-content');
          const arrow = this.querySelector('.stack-card-arrow');
          
          // Toggle active
          card.classList.toggle('active');
          
          if (card.classList.contains('active')) {
            content.style.maxHeight = content.scrollHeight + 'px';
            arrow.style.transform = 'rotate(180deg)';
          } else {
            content.style.maxHeight = '0';
            arrow.style.transform = 'rotate(0deg)';
          }
        });
      });

      // Open first card by default
      const firstCard = document.querySelector('.stack-card');
      if (firstCard) {
        firstCard.classList.add('active');
        const firstContent = firstCard.querySelector('.stack-card-content');
        const firstArrow = firstCard.querySelector('.stack-card-arrow');
        if (firstContent) firstContent.style.maxHeight = firstContent.scrollHeight + 'px';
        if (firstArrow) firstArrow.style.transform = 'rotate(180deg)';
      }
    }
    
    // Remove skeleton and show content
    const aboutSection = document.querySelector('#about');
    if (aboutSection) {
      const skeleton = aboutSection.querySelector('.about-skeleton');
      if (skeleton) skeleton.remove();
      
      aboutSection.classList.add('loaded');
    }
  })
  .catch(error => console.error('Error loading JSON:', error));
