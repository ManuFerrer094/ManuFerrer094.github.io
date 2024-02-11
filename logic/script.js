const downloadButton = document.getElementById('downloadButton');
const downloadLink = document.getElementById('downloadLink');

downloadButton.addEventListener('click', function() {
  downloadLink.click();
});

document.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById('modal');
    const githubStarBtn = document.getElementById('githubStarBtn');
    const cerrarBtn = document.getElementById('cerrarBtn');
    const screenWidthThreshold = 768;

    if (window.innerWidth >= screenWidthThreshold) {
        window.addEventListener('mousemove', function(e) {
            if (e.clientY < 1) {
                modal.style.display = 'flex';
            }
        });
    }

    githubStarBtn.addEventListener('click', function() {
        window.open('https://github.com/ManuFerrer094/ManuFerrer094.github.io', '_blank');
    });

    cerrarBtn.addEventListener('click', function() {
        closeModal();
    });

    function closeModal() {
        modal.style.display = 'none';
    }
});

var currentYear = new Date().getFullYear();
document.getElementById("currentYear").textContent = currentYear;

