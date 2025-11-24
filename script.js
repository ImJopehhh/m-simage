// script.js

document.addEventListener('DOMContentLoaded', () => {
    
    // Smooth Scrolling untuk navigasi
    document.querySelectorAll('.navbar__menu a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            document.querySelector(targetId).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // Menambahkan kelas 'scrolled' pada navbar saat user scroll
    const navbar = document.querySelector('.navbar');
    const heroHeight = document.querySelector('.hero-section').offsetHeight;

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
});
