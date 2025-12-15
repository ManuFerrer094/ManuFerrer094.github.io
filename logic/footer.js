fetch('texts.json')
  .then(response => response.json())
  .then(data => {
    const footerData = data.footer;
    const headerData = data.header;
    
    const footerLinkedin = document.getElementById('footerLinkedin');
    const footerGithub = document.getElementById('footerGithub');
    
    if (footerLinkedin) {
      footerLinkedin.href = footerData.url || headerData.linkedinUrl;
    }
    
    if (footerGithub) {
      footerGithub.href = headerData.githubUrl;
    }
    
    const currentYearSpan = document.getElementById('currentYear');
    if (currentYearSpan) {
      currentYearSpan.textContent = new Date().getFullYear();
    }
  })
  .catch(error => console.error('Error loading JSON for footer:', error));
