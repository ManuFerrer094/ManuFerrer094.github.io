import { updateElementContent, updateStack, updateBackgroundImage } from './utils.js';

fetch('texts.json')
  .then(response => response.json())
  .then(data => {
    const aboutData = data.about;
    updateElementContent('#about h2', aboutData.title);
    updateElementContent('#about .about-text p', aboutData.description);
    updateElementContent('#about .button .actual-text', data.buttons.downloadCV);
    updateStack('about', aboutData.stack);
    updateBackgroundImage('about', aboutData.backgroundImageUrl);
  })
  .catch(error => console.error('Error cargando el archivo JSON:', error));
