import { updateElementContent, generateShieldURL } from './utils.js';

fetch('texts.json')
  .then(response => response.json())
  .then(data => {
    const projectsData = data.projects;
    updateElementContent('#projects h2', projectsData.title);
    updateElementContent('#projects p', projectsData.description);

    const projectContainer = document.querySelector('#projects .row');
    projectsData.items.forEach(project => {
      const stackHtml = project.stack.map(tech => `<img src="${generateShieldURL(tech)}" alt="${tech}">`).join('');
      const projectHtml = `
        <div class="col-12 col-md-6 project-container">
          <div class="project">
            <h3>${project.name}</h3>
            <img src="${project.image}" alt="${project.name}">
            <p>${project.description}</p>
            <div class="stack-utilizado">
              <h4>Stack utilizado:</h4>
              <div class="about-stack">${stackHtml}</div>
            </div>
            <div class="btn-container">
              <a href="${project.githubLink}" class="btn project-button" target="_blank">Github</a>
              <a href="${project.demoLink}" class="btn project-button" target="_blank">Demo</a>
            </div>
          </div>
        </div>`;
      projectContainer.insertAdjacentHTML('beforeend', projectHtml);
    });
  })
  .catch(error => console.error('Error cargando el archivo JSON:', error));
