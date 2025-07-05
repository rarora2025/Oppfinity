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
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
        });
        }
    });
});

// Navbar scroll effect
window.addEventListener('scroll', function() {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 100) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Mobile menu toggle functionality
document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (mobileMenuToggle && navLinks) {
        mobileMenuToggle.addEventListener('click', function() {
            this.classList.toggle('active');
            navLinks.classList.toggle('active');
            document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : '';
        });
        
        // Close mobile menu when clicking on a link
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', function() {
                mobileMenuToggle.classList.remove('active');
                navLinks.classList.remove('active');
                document.body.style.overflow = '';
            });
        });
        
        // Close mobile menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!mobileMenuToggle.contains(e.target) && !navLinks.contains(e.target)) {
                mobileMenuToggle.classList.remove('active');
                navLinks.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
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

// Form interactions
document.addEventListener('DOMContentLoaded', function() {
    // Handle URL hash fragments for dashboard navigation
    if (window.location.hash === '#userDashboard') {
        setTimeout(() => {
            const dashboard = document.getElementById('userDashboard');
            if (dashboard) {
                // First scroll to the dashboard section
                dashboard.scrollIntoView({ behavior: 'smooth', block: 'start' });
                
                // Then adjust the position after a short delay to account for navbar
                setTimeout(() => {
                    const navbarHeight = 80;
                    window.scrollBy({ top: -navbarHeight - 20, behavior: 'smooth' });
                }, 300);
            }
        }, 1000); // Wait for auth state to be determined
    }

    const form = document.getElementById('contactForm');
    const formMessage = document.getElementById('formMessage');

    // Only add event listeners if the form exists
    if (form && formMessage) {
        // Enhanced form submission
        form.addEventListener('submit', function(e) {
            // Show loading state
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = '🚀 Processing...';
            submitBtn.disabled = true;
            
            // Add loading animation
            submitBtn.style.background = 'linear-gradient(45deg, #0099cc, #00d4ff)';
            submitBtn.style.animation = 'pulse 1s infinite';
            
            // Store form data for potential manual redirect
            const formData = new FormData(form);
            const formDataObj = {};
            formData.forEach((value, key) => {
                formDataObj[key] = value;
            });
            
            // Let the form submit naturally, but also handle redirect manually
            setTimeout(() => {
                // If we're still on the same page after 3 seconds, redirect manually
                setTimeout(() => {
                    if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
                        window.location.href = 'database.html';
                    }
                }, 3000);
            }, 1000);
        });

        // Enhanced form field interactions
        const formFields = form.querySelectorAll('input, textarea');
        
        formFields.forEach(field => {
            // Add focus effects
            field.addEventListener('focus', function() {
                this.parentElement.classList.add('focused');
                this.style.transform = 'translateY(-2px)';
            });
            
            field.addEventListener('blur', function() {
                this.parentElement.classList.remove('focused');
                this.style.transform = 'translateY(0)';
            });
            
            // Add typing animation for text inputs
            if (field.type === 'text' || field.type === 'email' || field.tagName === 'TEXTAREA') {
                field.addEventListener('input', function() {
                    if (this.value.length > 0) {
                        this.style.borderColor = '#00d4ff';
                    } else {
                        this.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                    }
                });
            }
        });
    }
});

// Scroll animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in-up');
        }
    });
}, observerOptions);

// Observe all sections for animation
document.querySelectorAll('section').forEach(section => {
    observer.observe(section);
});

// Parallax effect for hero section
window.addEventListener('scroll', function() {
    const scrolled = window.pageYOffset;
    const hero = document.querySelector('.hero');
    if (hero) {
        const rate = scrolled * -0.5;
        hero.style.transform = `translateY(${rate}px)`;
    }
});

// Add some interactive elements
document.addEventListener('DOMContentLoaded', function() {
    // Add hover effects to founder cards
    const founders = document.querySelectorAll('.founder');
    founders.forEach(founder => {
        founder.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-15px) scale(1.02)';
        });
        
        founder.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });

    // Add click effects to step cards
    const steps = document.querySelectorAll('.step');
    steps.forEach(step => {
        step.addEventListener('click', function() {
            this.style.transform = 'translateY(-5px) scale(1.01)';
            setTimeout(() => {
                this.style.transform = 'translateY(-10px) scale(1.02)';
            }, 150);
        });
    });

    // Add dashboard navigation link handler
    const dashboardNavLink = document.querySelector('.dashboard-nav-link');
    if (dashboardNavLink) {
        dashboardNavLink.addEventListener('click', function(e) {
            e.preventDefault();
            const dashboard = document.getElementById('userDashboard');
            if (dashboard) {
                // First scroll to the dashboard section
                dashboard.scrollIntoView({ behavior: 'smooth', block: 'start' });
                
                // Then adjust the position after a short delay to account for navbar
                setTimeout(() => {
                    const navbarHeight = 80;
                    window.scrollBy({ top: -navbarHeight - 20, behavior: 'smooth' });
                }, 300);
            }
        });
    }

    // Add typing effect to hero title
    const heroTitle = document.querySelector('.hero-content h1');
    if (heroTitle) {
        const text = heroTitle.textContent;
        heroTitle.textContent = '';
        let i = 0;
        
        function typeWriter() {
            if (i < text.length) {
                heroTitle.textContent += text.charAt(i);
                i++;
                setTimeout(typeWriter, 50);
            }
        }
        
        // Start typing effect after a delay
        setTimeout(typeWriter, 1000);
    }
});

// Add success message handling
function showSuccessMessage(message) {
    const formMessage = document.getElementById('formMessage');
    formMessage.textContent = message;
    formMessage.className = 'form-message success';
    formMessage.style.display = 'block';
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        formMessage.style.display = 'none';
    }, 5000);
}

// Add error message handling
function showErrorMessage(message) {
    const formMessage = document.getElementById('formMessage');
    formMessage.textContent = message;
    formMessage.className = 'form-message error';
    formMessage.style.display = 'block';
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        formMessage.style.display = 'none';
    }, 5000);
}

// Add form validation with visual feedback
function validateForm() {
    const form = document.getElementById('contactForm');
    if (!form) return false; // Return false if form doesn't exist
    
    const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
    let isValid = true;
    
    inputs.forEach(input => {
        if (!input.value.trim()) {
            input.style.borderColor = '#ff6b6b';
            input.style.animation = 'shake 0.5s ease-in-out';
            isValid = false;
        } else {
            input.style.borderColor = '#00d4ff';
        }
    });
    
    return isValid;
}

// Add shake animation for invalid fields
const shakeKeyframes = [
    { transform: 'translateX(0)' },
    { transform: 'translateX(-5px)' },
    { transform: 'translateX(5px)' },
    { transform: 'translateX(-5px)' },
    { transform: 'translateX(5px)' },
    { transform: 'translateX(0)' }
];

const shakeOptions = {
    duration: 500,
    easing: 'ease-in-out'
};

// Add CSS for shake animation
const style = document.createElement('style');
style.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
    }
    
    .shake {
        animation: shake 0.5s ease-in-out;
    }
`;
document.head.appendChild(style);

// Handle scrolling to dashboard when coming from professor matching page
function scrollToDashboardFromMatching() {
    const dashboard = document.getElementById('userDashboard');
    if (dashboard) {
        // Calculate offset for navbar and new dashboard position
        const navbarHeight = 80;
        const offset = navbarHeight + 40; // Extra padding for new position
        
        // Scroll to dashboard with offset
        const dashboardTop = dashboard.offsetTop - offset;
        window.scrollTo({
            top: dashboardTop,
            behavior: 'smooth'
        });
    }
}

// Check if we should scroll to dashboard (when coming from professor matching page)
if (window.location.hash === '#userDashboard') {
    // Small delay to ensure page is fully loaded
    setTimeout(scrollToDashboardFromMatching, 200);
} 