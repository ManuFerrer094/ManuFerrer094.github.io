import { updateElementContent } from './utils.js';

fetch('texts.json')
  .then(response => response.json())
  .then(data => {
    const aboutData = data.about;
    
    // Update title and description
    updateElementContent('#about .section-title', aboutData.title);
    updateElementContent('#about .about-description', aboutData.description);
    
    // Generate Tech Stack Grid
    const stackGrid = document.getElementById('techStack');
    if (stackGrid && aboutData.stack) {
      const iconMap = {
        'Angular': { cls: 'fa-brands fa-angular', color: '#dd0031' },
        'React': { cls: 'fa-brands fa-react', color: '#61dafb' },
        'Vue': { cls: 'fa-brands fa-vuejs', color: '#42b883' },
        'HTML5': { cls: 'fa-brands fa-html5', color: '#e34f26' },
        'CSS3': { cls: 'fa-brands fa-css3-alt', color: '#1572B6' },
        'TypeScript': { cls: 'fa-brands fa-js', color: '#3178c6' },
        'JavaScript': { cls: 'fa-brands fa-js', color: '#f7df1e' },
        'Node': { cls: 'fa-brands fa-node-js', color: '#6cc24a' },
        'Python': { cls: 'fa-brands fa-python', color: '#3776ab' },
        'Java': { cls: 'fa-brands fa-java', color: '#007396' },
        'Docker': { cls: 'fa-brands fa-docker', color: '#2496ed' },
        'Git': { cls: 'fa-brands fa-git-alt', color: '#f05032' },
        'SQL': { cls: 'fa-solid fa-database', color: '#0f172a' },
        'MongoDB': { cls: 'fa-solid fa-leaf', color: '#47A248' },
      };

      stackGrid.innerHTML = aboutData.stack.map(tech => {
        const key = tech.replace(/\s+/g, '');
        const map = iconMap[tech] || iconMap[key] || null;
        const iconClass = map ? map.cls : 'fa-solid fa-code';
        const iconColor = map ? map.color : 'var(--color-primary)';

        return `
          <div class="stack-item">
            <i class="${iconClass} stack-icon" style="font-size: 32px; color: ${iconColor};"></i>
            <span class="stack-name">${tech}</span>
          </div>
        `;
      }).join('');
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
