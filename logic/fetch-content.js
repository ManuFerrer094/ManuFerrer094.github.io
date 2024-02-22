import { updateElementContent, updateLinkHref, updateElementHTML } from "./utils.js";

fetch('texts.json')
  .then(response => response.json())
  .then(data => {
    updateElementContent('title', data.title);
    updateLinkHref("link[rel='icon']", data.favicon);

    updateElementHTML('#downloadButton .actual-text', data.downloadCVButton.text);
    updateElementHTML('#downloadButton .hover-text', data.downloadCVButton.text);
    document.querySelector('#downloadButton .hover-text').setAttribute('aria-hidden', data.downloadCVButton.ariaHidden);
    updateLinkHref('#downloadLink', data.downloadCVButton.link);

    updateElementHTML('footer .container', data.footer.text);
    updateElementContent('#about .button .actual-text', data.buttons.downloadCV);
  })
  .catch(error => console.error('Error cargando el archivo JSON:', error));
