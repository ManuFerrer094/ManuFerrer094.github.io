fetch('texts.json')
  .then(response => response.json())
  .then(data => {
    const headerData = data.header;
    const navbarBrand = document.querySelector('header .container .navbar-brand');
    navbarBrand.innerHTML = `${headerData.firstName}<strong>${headerData.lastName}</strong>`;
    
    const linkedinLink = document.getElementById('linkedinLink');
    const githubLink = document.getElementById('githubLink');
    
    linkedinLink.href = headerData.linkedinUrl;
    githubLink.href = headerData.githubUrl;
  })
  .catch(error => console.error('Error cargando el archivo JSON:', error));
