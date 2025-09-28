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
      // Create li.nav-item and button.nav-link inside it (Bootstrap expects li > button)
      const li = document.createElement('li');
      li.className = 'nav-item';

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

      // Add manual click handler for tab switching
      tabButton.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Remove active class from all tabs and panes
        document.querySelectorAll('#myTab .nav-link').forEach(tab => {
          tab.classList.remove('active');
          tab.setAttribute('aria-selected', 'false');
        });
        document.querySelectorAll('#myTabContent .tab-pane').forEach(pane => {
          pane.classList.remove('show', 'active');
          pane.style.display = 'none';
        });
        
        // Add active class to clicked tab and corresponding pane
        this.classList.add('active');
        this.setAttribute('aria-selected', 'true');
        const targetPane = document.querySelector(this.getAttribute('data-bs-target'));
        if (targetPane) {
          targetPane.classList.add('show', 'active');
          targetPane.style.display = 'block';
        }
        
        console.log(`[experience] Switched to tab: ${this.textContent}`);
      });

      li.appendChild(tabButton);
      tabList.appendChild(li);

      const tabPane = document.createElement('div');
      tabPane.className = `tab-pane fade${i === 0 ? ' show active' : ''}`;
      tabPane.id = `experience${i + 1}`;
      tabPane.role = 'tabpanel';
      tabPane.setAttribute('aria-labelledby', `experience${i + 1}-tab`);
      tabPane.style.display = i === 0 ? 'block' : 'none'; // Force visibility for first tab
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
      
      console.log(`[experience] Created tab ${i + 1}: ${experience.name} with content length: ${tabPane.innerHTML.length}`);
    });

    // Add entrance animations and ensure section stays visible
    setTimeout(() => {
      const expSection = document.getElementById('experience');
      if (expSection) {
        // Remove skeleton if present
        const s = expSection.querySelector('.experience-skeleton');
        if (s) s.remove();
        
        // Ensure the section is always visible
        expSection.style.opacity = '1';
        expSection.style.visibility = 'visible';
        
        // Add animations only to tab panes, not the whole section
        document.querySelectorAll('.tab-pane').forEach((pane, index) => {
          if (!pane.classList.contains('slide-up')) {
            pane.classList.add('slide-up');
          }
        });
        
        console.log('[experience] tabs created, skeleton removed, and visibility ensured, items:', experiencesData.items.length);
      }
    }, 300);
  })
  .catch(error => console.error('Error cargando el archivo JSON:', error));
