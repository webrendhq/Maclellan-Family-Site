document.addEventListener('DOMContentLoaded', function() {
    const button = document.getElementById('enter-site-button');
    
    button.addEventListener('click', function() {
        window.location.href = '/sign-in.html';
    });
});