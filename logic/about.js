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
      stackGrid.innerHTML = aboutData.stack.map(tech => {
        // Map tech names to icon filenames (assuming they exist in resources/images/)
        // If not, we can use a default icon or FontAwesome
        const iconName = tech.toLowerCase().replace(/\s+/g, '-');
        // Using a placeholder or mapping logic. For now, let's assume we have icons or use text.
        // Since I don't have the list of icons, I'll use a generic approach or try to find them.
        // Let's use FontAwesome icons where possible or a generic code icon
        
        let iconClass = 'fa-solid fa-code';
        if (tech.includes('Angular')) iconClass = 'fa-brands fa-angular';
        else if (tech.includes('React')) iconClass = 'fa-brands fa-react';
        else if (tech.includes('Vue')) iconClass = 'fa-brands fa-vuejs';
        else if (tech.includes('HTML')) iconClass = 'fa-brands fa-html5';
        else if (tech.includes('CSS')) iconClass = 'fa-brands fa-css3-alt';
        else if (tech.includes('JavaScript') || tech.includes('JS')) iconClass = 'fa-brands fa-js';
        else if (tech.includes('Node')) iconClass = 'fa-brands fa-node-js';
        else if (tech.includes('Python')) iconClass = 'fa-brands fa-python';
        else if (tech.includes('Java')) iconClass = 'fa-brands fa-java';
        else if (tech.includes('Docker')) iconClass = 'fa-brands fa-docker';
        else if (tech.includes('Git')) iconClass = 'fa-brands fa-git-alt';
        else if (tech.includes('SQL')) iconClass = 'fa-solid fa-database';
        else if (tech.includes('Mongo')) iconClass = 'fa-solid fa-leaf';
        else if (tech.includes('C#') || tech.includes('CSharp')) iconClass = 'fa-brands fa-microsoft';
        
        return `
          <div class="stack-item">
            <i class="${iconClass} stack-icon" style="font-size: 32px; color: var(--color-primary);"></i>
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
