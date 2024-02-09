document.addEventListener("DOMContentLoaded", function() {
    var images = document.querySelectorAll('.about-stack img');
    var animationActivated = [];

    function checkPosition() {
        var windowHeight = window.innerHeight;

        images.forEach(function(image, index) {
            var positionFromTop = image.getBoundingClientRect().top;

            if (positionFromTop - windowHeight <= 0 && !animationActivated[index]) {
                image.classList.add('animated');
                animationActivated[index] = true;
            }
        });
    }

    window.addEventListener('scroll', checkPosition);
    checkPosition();
});

document.addEventListener('DOMContentLoaded', function() {
    const buttons = document.querySelectorAll('.btn');
    
    buttons.forEach(button => {
        button.addEventListener('mouseenter', function() {
            this.classList.add('btn-hover');
        });
        
        button.addEventListener('mouseleave', function() {
            this.classList.remove('btn-hover');
        });
    });
});

