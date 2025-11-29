import { updateElementContent } from './utils.js';

const projectsPerPage = 6;
let currentPage = 1;

// Mock data in case API fails or for testing
const MOCK_PROJECTS = [
  {
    name: "Portfolio V2",
    description: "Mi portafolio personal actualizado con las últimas tecnologías web, diseño glassmorphism y animaciones avanzadas.",
    topics: ["html", "css", "javascript", "glassmorphism"],
    html_url: "https://github.com/ManuFerrer094/ManuFerrer094.github.io",
    homepage: "https://manuferrer094.github.io",
    fork: false
  },
  {
    name: "Task Manager App",
    description: "Aplicación de gestión de tareas con funcionalidades de drag & drop, categorías y persistencia de datos.",
    topics: ["react", "redux", "firebase", "styled-components"],
    html_url: "#",
    homepage: "#",
    fork: false
  },
  {
    name: "E-commerce Dashboard",
    description: "Panel de administración para tiendas online con gráficos en tiempo real y gestión de inventario.",
    topics: ["vue", "chartjs", "tailwind", "node"],
    html_url: "#",
    homepage: "#",
    fork: false
  },
  {
    name: "Weather Forecast",
    description: "App del clima que consume múltiples APIs para ofrecer pronósticos precisos y mapas interactivos.",
    topics: ["angular", "rxjs", "leaflet", "weather-api"],
    html_url: "#",
    homepage: "#",
    fork: false
  }
];

fetch('./texts.json')
  .then(response => {
    if (!response.ok) throw new Error('Network response was not ok');
    return response.json();
  })
  .then(config => {
    const { githubUsername } = config;

    fetch(`https://api.github.com/users/${githubUsername}/repos`)
      .then(response => {
        if (!response.ok) throw new Error('GitHub API response was not ok');
        return response.json();
      })
      .then(repos => {
        // Filter out forks if desired, or keep them
        // repos = repos.filter(repo => !repo.fork);
        
        if (repos.length === 0) {
          console.warn('No repos found, using mock data');
          return MOCK_PROJECTS;
        }
        return repos;
      })
      .catch(error => {
        console.warn('Error fetching GitHub repos, using mock data:', error);
        return MOCK_PROJECTS;
      })
      .then(repos => {
        // Sort repos: homepage first, then by creation date
        repos.sort((a, b) => {
          if (a.homepage && !b.homepage) return -1;
          if (!a.homepage && b.homepage) return 1;
          return new Date(b.created_at || Date.now()) - new Date(a.created_at || Date.now());
        });

        const projectsData = {
          title: "Proyectos Destacados",
          description: "Explora una selección de mis proyectos personales y experimentos con código.",
          items: repos.map(repo => {
            // Determine image URL: Use screenshot of homepage if available, otherwise a consistent placeholder
            let imageUrl;
            if (repo.homepage && repo.homepage.startsWith('http')) {
              // Use a screenshot service for live demos - requesting desktop viewport (1200px)
              imageUrl = `https://image.thum.io/get/width/1200/crop/1200/800/noanimate/${repo.homepage}`;
            } else {
              // Fallback for projects without live demo
              imageUrl = `https://picsum.photos/seed/${repo.name}/600/400?grayscale&blur=2`; 
            }

            return {
              name: repo.name,
              description: repo.description || 'Proyecto de desarrollo web enfocado en rendimiento y experiencia de usuario.',
              stack: repo.topics || ['code'],
              githubLink: repo.html_url,
              demoLink: repo.homepage,
              isFork: repo.fork,
              image: imageUrl
            };
          })
        };

        updateElementContent('#projects .section-title', projectsData.title);
        updateElementContent('#projects .section-description', projectsData.description);

        const projectGrid = document.getElementById('projectsGrid');
        
        if (!projectGrid) {
            console.error('Projects grid container not found!');
            return;
        }
        
        const displayProjects = () => {
            const startIndex = (currentPage - 1) * projectsPerPage;
            const endIndex = startIndex + projectsPerPage;
            const projectsToShow = projectsData.items.slice(startIndex, endIndex);
            
            projectGrid.innerHTML = projectsToShow.map((project, index) => `
              <article class="project-card slide-up" style="animation-delay: ${index * 100}ms">
                <div class="project-image">
                  <img src="${project.image}" alt="${project.name}" loading="lazy">
                </div>
                <div class="project-content">
                  <h3 class="project-title">
                    ${project.name}
                    ${project.isFork ? '<i class="fa-solid fa-code-branch" style="font-size: 0.6em; opacity: 0.5; margin-left: 8px;" title="Forked"></i>' : ''}
                  </h3>
                  <p class="project-description">${project.description}</p>
                  <div class="project-tech">
                    ${project.stack.slice(0, 4).map(tech => `<span class="tech-badge">${tech}</span>`).join('')}
                    ${project.stack.length > 4 ? `<span class="tech-badge">+${project.stack.length - 4}</span>` : ''}
                  </div>
                  <div class="project-actions">
                    <a href="${project.githubLink}" class="btn-project" target="_blank" aria-label="Ver código en GitHub">
                      <i class="fa-brands fa-github"></i> Código
                    </a>
                    ${project.demoLink ? `
                      <a href="${project.demoLink}" class="btn-project btn-project-demo" target="_blank" aria-label="Ver demo en vivo">
                        <i class="fa-solid fa-external-link-alt"></i> Demo
                      </a>
                    ` : ''}
                  </div>
                </div>
              </article>
            `).join('');
            
            // Trigger animations
            setTimeout(() => {
              document.querySelectorAll('.project-card').forEach(card => card.classList.add('animate'));
            }, 50);
            
            updatePagination();
        };      
            
        const updatePagination = () => {
          const totalPages = Math.ceil(projectsData.items.length / projectsPerPage);
          const paginator = document.getElementById('projectsPagination');
          
          if (!paginator) return;
          
          if (totalPages <= 1) {
            paginator.innerHTML = '';
            return;
          }
          
          let paginationHtml = `
            <button class="page-btn" ${currentPage === 1 ? 'disabled' : ''} onclick="changePage(${currentPage - 1})">
              <i class="fa-solid fa-chevron-left"></i>
            </button>
          `;
          
          for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
              paginationHtml += `
                <button class="page-btn ${currentPage === i ? 'active' : ''}" onclick="changePage(${i})">
                  ${i}
                </button>
              `;
            } else if (i === currentPage - 2 || i === currentPage + 2) {
              paginationHtml += `<span style="padding: 0 8px; color: var(--color-text-muted);">...</span>`;
            }
          }
          
          paginationHtml += `
            <button class="page-btn" ${currentPage === totalPages ? 'disabled' : ''} onclick="changePage(${currentPage + 1})">
              <i class="fa-solid fa-chevron-right"></i>
            </button>
          `;
          
          paginator.innerHTML = paginationHtml;
        };
        
        window.changePage = (page) => {
          currentPage = page;
          displayProjects();
          document.getElementById('projects').scrollIntoView({ behavior: 'smooth' });
        };
        
        displayProjects();
      });
  })
  .catch(error => console.error('Error loading config:', error));
