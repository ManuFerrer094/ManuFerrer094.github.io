import { updateElementHTML } from './utils.js';

fetch('texts.json')
  .then(response => response.json())
  .then(data => {
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
  })
  .catch(error => console.error('Error cargando el archivo JSON:', error));
