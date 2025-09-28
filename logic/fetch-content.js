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
    .catch(error => {
        console.error('Error cargando el archivo JSON:', error);
        // Mostrar aviso visible para el usuario (ayuda al debugging cuando se abre via file://)
        try {
            // Only write fallback messages if the sections are still empty to avoid
            // overwriting content populated by other modules (helps race-condition cases).
            const aboutTitle = document.querySelector('#about h2');
            const aboutP = document.querySelector('#about .about-text p');
            if (aboutTitle && (!aboutTitle.textContent || aboutTitle.textContent.trim() === '')) {
                updateElementContent('#about h2', 'Contenido no disponible');
            }
            if (aboutP && (!aboutP.textContent || aboutP.textContent.trim() === '')) {
                updateElementHTML('#about .about-text p', '<em>No se ha podido cargar el contenido local. Ejecuta un servidor local (por ejemplo: <code>python -m http.server 8000</code>) y vuelve a cargar la página.</em>');
            }
            const expTitle = document.querySelector('#experience h2');
            const expP = document.querySelector('#experience .about-text p');
            if (expTitle && (!expTitle.textContent || expTitle.textContent.trim() === '')) {
                updateElementContent('#experience h2', 'Contenido no disponible');
            }
            if (expP && (!expP.textContent || expP.textContent.trim() === '')) {
                updateElementHTML('#experience .about-text p', '<em>No se ha podido cargar el contenido de experiencia. Abre la página via HTTP (ej. <code>http://localhost:8000</code>).</em>');
            }
        } catch (e) {
            // ignore if selectors not present
        }
    });
