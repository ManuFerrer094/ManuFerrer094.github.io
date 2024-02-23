import { updateElementContent, generateShieldURL } from './utils.js';

const projectsPerPage = 4;
let currentPage = 1;

// Fetch del archivo JSON de configuración
fetch('./texts.json')
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  })
  .then(config => {
    const { githubUsername } = config;

    fetch(`https://api.github.com/users/${githubUsername}/repos`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(repos => {
        const ownRepos = repos
        .filter(repo => !repo.fork)
        .sort((a, b) => {
          if (a.homepage && b.homepage) {
            return new Date(b.created_at) - new Date(a.created_at);
          } else if (a.homepage) {
            return -1;
          } else if (b.homepage) {
            return 1;
          } else {
            return new Date(b.created_at) - new Date(a.created_at);
          }
        });

        const projectsData = {
          title: "Proyectos propios",
          description: "Aquí tienes mis proyectos de Github!",
          items: ownRepos.map(repo => ({
            name: repo.name,
            description: repo.description,
            stack: repo.topics,
            githubLink: repo.html_url,
            demoLink: repo.homepage,
          }))
        };

        updateElementContent('#projects h2', projectsData.title);
        updateElementContent('#projects p', projectsData.description);

        const projectContainer = document.querySelector('#projects .row');
        
        const divideProjectsIntoPages = () => {
          const startIndex = (currentPage - 1) * projectsPerPage;
          const endIndex = startIndex + projectsPerPage;
          return projectsData.items.slice(startIndex, endIndex);
        };

        const displayProjects = () => {
            projectContainer.innerHTML = '';
            const projectsToShow = divideProjectsIntoPages();
            projectsToShow.forEach(project => {
              let stackHtml = '';
              if (project.stack.length > 0) {
                stackHtml = `
                  <div class="stack-utilizado">
                    <h4>Stack</h4>
                    <div class="about-stack">${project.stack.map(tech => `<img src="${generateShieldURL(tech)}" alt="${tech}">`).join('')}</div>
                  </div>`;
              }
          
              const projectHtml = `
                <div class="col-12 col-md-6 project-container">
                  <div class="project">
                    <h3>${project.name}</h3>
                    <p>${project.description}</p>
                    ${stackHtml}
                    <div class="btn-container">
                      <a href="${project.githubLink}" class="btn project-button" target="_blank">GitHub <i class="fa-brands fa-github"></i></a>
                      ${project.demoLink ? `<a href="${project.demoLink}" class="btn project-button" target="_blank">Demo <i class="fa-solid fa-up-right-from-square"></i></a>` : ''}
                    </div>
                  </div>
                </div>`;
              
              projectContainer.insertAdjacentHTML('beforeend', projectHtml);
            });
          };
          
          const createPaginatorButtons = () => {
            const totalPages = Math.ceil(projectsData.items.length / projectsPerPage);
            const paginator = document.querySelector('.paginator');
            paginator.innerHTML = '';
        
            for (let i = 1; i <= totalPages; i++) {
                const button = document.createElement('button');
                button.textContent = i;
                button.classList.add('btn', 'paginator-button'); // Agregar las clases necesarias
                button.addEventListener('click', () => {
                    currentPage = i;
                    displayProjects();
                });
                paginator.appendChild(button);
            }
        };
        

        displayProjects();
        createPaginatorButtons();
      })
      .catch(error => console.error('Error cargando los repositorios de GitHub:', error));
  })
  .catch(error => console.error('Error cargando la configuración:', error));
