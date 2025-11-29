fetch('texts.json')
  .then(response => response.json())
  .then(data => {
    const headerData = data.header;
    
    // Update Brand
    const brandText = document.querySelector('.brand-text');
    if (brandText) {
      brandText.textContent = `${headerData.firstName.charAt(0)}${headerData.lastName.charAt(0)}`;
    }
    
    // Update Social Links
    const linkedinLink = document.getElementById('linkedinLink');
    const githubLink = document.getElementById('githubLink');
    
    if (linkedinLink) linkedinLink.href = headerData.linkedinUrl;
    if (githubLink) githubLink.href = headerData.githubUrl;
    
    // Update CV Link
    const downloadLink = document.getElementById('downloadLink');
    if (downloadLink && data.downloadCVButton) {
      downloadLink.href = data.downloadCVButton.link;
    }
  })
  .catch(error => console.error('Error loading JSON:', error));
