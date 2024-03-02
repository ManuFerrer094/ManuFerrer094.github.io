document.addEventListener("DOMContentLoaded", function() {
  const myAtropos = Atropos({
    el: '.atropos-exp',
  });

  const downloadButton = document.getElementById('downloadButton');
  const downloadLink = document.getElementById('downloadLink');

  downloadButton.addEventListener('click', function() {
    downloadLink.click();
  });
});