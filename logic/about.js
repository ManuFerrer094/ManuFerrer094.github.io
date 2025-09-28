import { updateElementContent, updateStack, updateBackgroundImage } from './utils.js';

fetch('texts.json')
  .then(response => response.json())
  .then(data => {
    const aboutData = data.about;
    updateElementContent('#about h2', aboutData.title);
    updateElementContent('#about .about-text p', aboutData.description);
    updateStack('about', aboutData.stack);
    updateBackgroundImage('about', aboutData.backgroundImageUrl);

    // Add scroll indicator to about section
    addScrollIndicator();
    
    // Add entrance animations
    setTimeout(() => {
      const aboutSection = document.querySelector('#about');
      if (aboutSection) {
        aboutSection.classList.add('fade-in');
      }
    }, 300);
  })
  .catch(error => console.error('Error cargando el archivo JSON:', error));

function addScrollIndicator() {
  const aboutSection = document.querySelector('#about');
  if (aboutSection) {
    const scrollIndicator = document.createElement('div');
    scrollIndicator.className = 'scroll-indicator';
    scrollIndicator.innerHTML = `
      <span>Scroll Down</span>
      <div style="width: 2px; height: 30px; background: var(--gradient-primary); border-radius: 1px; margin-top: 8px;"></div>
    `;
    aboutSection.appendChild(scrollIndicator);
  }
}
