document.addEventListener('DOMContentLoaded', function() {
    // Get the elements
    const fadeOutButton = document.getElementById('signin-choice');
    const fadeInButton = document.getElementById('signup-choice');
    const signInElement = document.getElementById('sign-in-wrapper');
    const signUpElement = document.getElementById('sign-up-wrapper');

    // Function to fade out
    function fadeOut(element) {
        let opacity = 1;
        const timer = setInterval(function() {
            if (opacity <= 0.1) {
                clearInterval(timer);
                element.style.display = 'none';
            }
            element.style.opacity = opacity;
            opacity -= opacity * 0.1;
        }, 20);
    }

    // Function to fade in
    function fadeIn(element) {
        let opacity = 0.1;
        element.style.display = 'flex';
        const timer = setInterval(function() {
            if (opacity >= 1) {
                clearInterval(timer);
            }
            element.style.opacity = opacity;
            opacity += opacity * 0.1;
        }, 20);
    }

    // Event listener for sign in button (fade out sign up, fade in sign in)
    fadeOutButton.addEventListener('click', function() {
        fadeOut(signUpElement);
        fadeIn(signInElement);
    });

    // Event listener for sign up button (fade out sign in, fade in sign up)
    fadeInButton.addEventListener('click', function() {
        fadeOut(signInElement);
        fadeIn(signUpElement);
    });
});