fetch('texts.json')
  .then(response => response.json())
  .then(data => {
    const footerData = data.footer;
    const headerData = data.header; // Fallback for social links
    
    // Update Social Links in Footer
    const footerLinkedin = document.getElementById('footerLinkedin');
    const footerGithub = document.getElementById('footerGithub');
    
    if (footerLinkedin) {
      footerLinkedin.href = footerData.url || headerData.linkedinUrl;
    }
    
    if (footerGithub) {
      // Assuming github url is in header data as it's not explicitly in footer data structure shown
      footerGithub.href = headerData.githubUrl;
    }
    
    // Update Year
    const currentYearSpan = document.getElementById('currentYear');
    if (currentYearSpan) {
      currentYearSpan.textContent = new Date().getFullYear();
    }
  })
  .catch(error => console.error('Error loading JSON for footer:', error));
