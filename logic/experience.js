import { updateElementContent, generateShieldURL } from './utils.js';

fetch('texts.json')
  .then(response => response.json())
  .then(data => {
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
        <strong>${experience.role}</strong>
        <div class="date">${experience.date}</div>
        <p>${experience.description}</p>
        <div class="stack-utilizado">
          <h4>Stack</h4>
          <div class="about-stack">${experience.stack.map(tech => `<img src="${generateShieldURL(tech)}" alt="${tech}">`).join('')}</div>
        </div>`;
      tabContent.appendChild(tabPane);
    });

    // Add entrance animations
    setTimeout(() => {
      document.querySelectorAll('.tab-pane').forEach((pane, index) => {
        pane.classList.add('slide-up');
      });
    }, 300);
  })
  .catch(error => console.error('Error cargando el archivo JSON:', error));
