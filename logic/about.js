import { updateElementContent, updateStack, updateBackgroundImage } from './utils.js';

fetch('texts.json')
  .then(response => response.json())
  .then(data => {
    const aboutData = data.about;
    updateElementContent('#about h2', aboutData.title);
    updateElementContent('#about .about-text p', aboutData.description);
    updateStack('about', aboutData.stack);
    
    // Create the new layout structure
    const aboutContent = document.querySelector('#about .about-content');
    const aboutText = document.querySelector('#about .about-text');
    
    // Create image container
    const aboutImage = document.createElement('div');
    aboutImage.className = 'about-image';
    aboutImage.innerHTML = `<img src="${aboutData.backgroundImageUrl}" alt="Manuel Ferrer">`;
    
    // Clear existing content and rebuild
    aboutContent.innerHTML = '';
    aboutContent.appendChild(aboutImage);
    aboutContent.appendChild(aboutText);

    // Add scroll indicator to about section
    addScrollIndicator();
    
    // Add entrance animations and ensure section stays visible
    setTimeout(() => {
      const aboutSection = document.querySelector('#about');
      if (aboutSection) {
        // Remove skeleton if present
        const skeleton = aboutSection.querySelector('.about-skeleton');
        if (skeleton) skeleton.remove();
        
        // Ensure the section is always visible
        aboutSection.style.opacity = '1';
        aboutSection.style.visibility = 'visible';
        
        // Add fade-in animation to children elements only
        const aboutStack = aboutSection.querySelector('.about-stack');
        if (aboutStack && !aboutStack.classList.contains('fade-in')) {
          aboutStack.classList.add('fade-in');
        }
        
        console.log('[about] content injected, skeleton removed, and visibility ensured');
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
