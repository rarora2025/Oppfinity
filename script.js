// Initialize ScrollReveal
ScrollReveal().reveal('.about-content', {
    delay: 200,
    duration: 1000,
    distance: '50px',
    origin: 'bottom'
});

ScrollReveal().reveal('.founder', {
    delay: 300,
    duration: 1000,
    distance: '50px',
    origin: 'bottom',
    interval: 200
});

ScrollReveal().reveal('.step', {
    delay: 200,
    duration: 1000,
    distance: '50px',
    origin: 'bottom',
    interval: 200
});

ScrollReveal().reveal('.university-card', {
    delay: 200,
    duration: 1000,
    distance: '50px',
    origin: 'bottom',
    interval: 200
});

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Navbar scroll effect
window.addEventListener('scroll', function() {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.style.background = 'rgba(255, 255, 255, 0.95)';
        navbar.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
    } else {
        navbar.style.background = 'rgba(255, 255, 255, 0.95)';
        navbar.style.boxShadow = 'none';
    }
});

// Add animation to CTA button
const ctaButton = document.querySelector('.cta-button');
if (ctaButton) {
    ctaButton.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-3px)';
        this.style.boxShadow = '0 10px 20px rgba(0, 0, 0, 0.2)';
    });
    
    ctaButton.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0)';
        this.style.boxShadow = 'none';
    });
}

// Add loading animation for images
const images = document.querySelectorAll('img');
images.forEach(img => {
    img.addEventListener('load', function() {
        this.style.opacity = '1';
    });
    img.style.opacity = '0';
    img.style.transition = 'opacity 0.5s ease';
});

// Handle research interest "Other" option
const researchInterest = document.getElementById('researchInterest');
const otherInterest = document.getElementById('otherInterest');

researchInterest.addEventListener('change', function() {
    if (this.value === 'other') {
        otherInterest.style.display = 'block';
        otherInterest.required = true;
        // Smooth appearance
        otherInterest.style.opacity = '0';
        setTimeout(() => {
            otherInterest.style.opacity = '1';
        }, 10);
    } else {
        otherInterest.style.display = 'none';
        otherInterest.required = false;
    }
}); 