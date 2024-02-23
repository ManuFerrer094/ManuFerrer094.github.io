import { updateElementContent, updateLinkHref, updateElementHTML } from "./utils.js";

fetch('texts.json')
    .then(response => response.json())
    .then(data => {
        updateElementContent('title', data.title);
        updateLinkHref("link[rel='icon']", data.favicon);

        const currentYear = new Date().getFullYear();
        const footerContent = `&copy; ${currentYear} <a href="${data.footer.url}" target="_blank" class="navbar-brand">${data.footer.firstname}<strong>${data.footer.lastname}</strong></a>`;
        updateElementHTML('#footerContent', footerContent);

        const downloadLink = document.getElementById('downloadLink');
        downloadLink.href = data.downloadCVButton.link;
    })
    .catch(error => console.error('Error cargando el archivo JSON:', error));
