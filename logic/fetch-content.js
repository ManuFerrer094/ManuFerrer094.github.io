fetch('texts.json')
  .then(response => response.json())
  .then(data => {
    const updateElementContent = (selector, content) => {
      document.querySelector(selector).textContent = content;
    };

    const updateLinkHref = (selector, href) => {
      document.querySelector(selector).href = href;
    };

    const updateElementHTML = (selector, html) => {
      document.querySelector(selector).innerHTML = html;
    };

    updateElementContent('title', data.title);
    updateLinkHref("link[rel='icon']", data.favicon);

    updateElementHTML('#downloadButton .actual-text', data.downloadCVButton.text);
    updateElementHTML('#downloadButton .hover-text', data.downloadCVButton.text);
    document.querySelector('#downloadButton .hover-text').setAttribute('aria-hidden', data.downloadCVButton.ariaHidden);
    updateLinkHref('#downloadLink', data.downloadCVButton.link);

    const headerData = data.header;
    updateElementHTML('header .container .navbar-brand', headerData.navbarBrand);

    const navbarMenu = document.querySelector('header .container .navbar-nav');
    navbarMenu.innerHTML = '';
    headerData.menuItems.forEach(item => {
      const menuItem = document.createElement('li');
      menuItem.className = 'nav-item';
      const link = document.createElement('a');
      link.className = 'nav-link';
      link.href = item.link;
      if (item.target) {
        link.target = item.target;
      }
      link.textContent = item.text;
      menuItem.appendChild(link);
      navbarMenu.appendChild(menuItem);
    });

    updateElementHTML('footer .container', data.footer.text);

    const generateShieldURL = (technology) => {
      const colors = ['brightgreen', 'green', 'yellowgreen', 'yellow', 'orange', 'red', 'blue', 'lightgrey'];
      const randomIndex = Math.floor(Math.random() * colors.length);
      const randomColor = colors[randomIndex];
      colors.splice(randomIndex, 1);
      return `https://img.shields.io/badge/${technology}-informational?style=for-the-badge&logo=${technology}&logoColor=white&color=${randomColor}`;
    };      

    const updateStack = (sectionId, stack) => {
      const stackContainer = document.querySelector(`#${sectionId} .about-stack`);
      stackContainer.innerHTML = stack.map(tech => `<img src="${generateShieldURL(tech)}" alt="${tech}">`).join('');
    };

    const aboutData = data.about;
    updateElementContent('#about h2', aboutData.title);
    updateElementContent('#about .about-text p', aboutData.description);
    updateElementContent('#about .button .actual-text', data.buttons.downloadCV);
    updateStack('about', aboutData.stack);

    const experiencesData = data.experiences;
    updateElementContent('#experience h2', experiencesData.title);
    updateElementContent('#experience .about-text p', experiencesData.description);

    const tabList = document.querySelector('#myTab');
    const tabContent = document.querySelector('#myTabContent');
    experiencesData.items.forEach((experience, i) => {
      const tabButton = document.createElement('button');
      tabButton.className = `nav-link${i === 0 ? ' active' : ''}`;
      tabButton.id = `experience${i + 1}-tab`;
      tabButton.setAttribute('data-bs-toggle', 'tab');
      tabButton.setAttribute('data-bs-target', `#experience${i + 1}`);
      tabButton.type = 'button';
      tabButton.role = 'tab';
      tabButton.setAttribute('aria-controls', `experience${i + 1}`);
      tabButton.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
      tabButton.textContent = experience.name;
      tabList.appendChild(tabButton);

      const tabPane = document.createElement('div');
      tabPane.className = `tab-pane fade${i === 0 ? ' show active' : ''}`;
      tabPane.id = `experience${i + 1}`;
      tabPane.role = 'tabpanel';
      tabPane.setAttribute('aria-labelledby', `experience${i + 1}-tab`);
      tabPane.innerHTML = `
        <h3>${experience.name}</h3>
        <span><strong>${experience.role}</strong></span>
        <span class="date-header">${experience.date}</span>
        <p>${experience.description}</p>
        <div class="stack-utilizado">
          <h4>Stack utilizado:</h4>
          <div class="about-stack">${experience.stack.map(tech => `<img src="${generateShieldURL(tech)}" alt="${tech}">`).join('')}</div>
        </div>`;
      tabContent.appendChild(tabPane);
    });

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
