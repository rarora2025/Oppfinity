// Wait for authManager to be available
function waitForAuthManager() {
    if (window.authManager) {
        setupAuthUI();
    } else {
        setTimeout(waitForAuthManager, 100);
    }
}

// Setup auth UI when authManager is available
function setupAuthUI() {
    // Get form elements
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const forgotPasswordForm = document.getElementById('forgotPasswordForm');
    const userProfile = document.getElementById('userProfile');
    
    // Get form elements
    const loginFormElement = document.getElementById('loginFormElement');
    const signupFormElement = document.getElementById('signupFormElement');
    const forgotPasswordFormElement = document.getElementById('forgotPasswordFormElement');
    
    // Get buttons
    const googleSignInBtn = document.getElementById('googleSignInBtn');
    const googleSignUpBtn = document.getElementById('googleSignUpBtn');
    const signOutBtn = document.getElementById('signOutBtn');
    
    // Get links
    const showSignupLink = document.getElementById('showSignupLink');
    const showLoginLink = document.getElementById('showLoginLink');
    const forgotPasswordLink = document.getElementById('forgotPasswordLink');
    const backToLoginLink = document.getElementById('backToLoginLink');
    
    // Form switching functions
    function showForm(formToShow) {
        // Hide all forms
        loginForm.style.display = 'none';
        signupForm.style.display = 'none';
        forgotPasswordForm.style.display = 'none';
        userProfile.style.display = 'none';
        
        // Show the requested form
        formToShow.style.display = 'block';
        
        // Clear any messages
        const messageDiv = document.getElementById('authMessage');
        if (messageDiv) {
            messageDiv.style.display = 'none';
        }
    }
    
    // Form switching event listeners
    showSignupLink.addEventListener('click', function(e) {
        e.preventDefault();
        showForm(signupForm);
    });
    
    showLoginLink.addEventListener('click', function(e) {
        e.preventDefault();
        showForm(loginForm);
    });
    
    forgotPasswordLink.addEventListener('click', function(e) {
        e.preventDefault();
        showForm(forgotPasswordForm);
    });
    
    backToLoginLink.addEventListener('click', function(e) {
        e.preventDefault();
        showForm(loginForm);
    });
    
    // Form submission handlers
    loginFormElement.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        const submitBtn = this.querySelector('button[type="submit"]');
        
        // Show loading state
        submitBtn.disabled = true;
        submitBtn.classList.add('loading');
        submitBtn.textContent = 'Signing in...';
        
        try {
            await window.authManager.signIn(email, password);
        } catch (error) {
            console.error('Login error:', error);
        } finally {
            // Reset button state
            submitBtn.disabled = false;
            submitBtn.classList.remove('loading');
            submitBtn.textContent = 'Sign In';
        }
    });
    
    signupFormElement.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const name = document.getElementById('signupName').value;
        const email = document.getElementById('signupEmail').value;
        const password = document.getElementById('signupPassword').value;
        const submitBtn = this.querySelector('button[type="submit"]');
        
        // Show loading state
        submitBtn.disabled = true;
        submitBtn.classList.add('loading');
        submitBtn.textContent = 'Creating account...';
        
        try {
            await window.authManager.signUp(email, password, name);
        } catch (error) {
            console.error('Signup error:', error);
        } finally {
            // Reset button state
            submitBtn.disabled = false;
            submitBtn.classList.remove('loading');
            submitBtn.textContent = 'Create Account';
        }
    });

    forgotPasswordFormElement.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const email = document.getElementById('resetEmail').value;
        const submitBtn = this.querySelector('button[type="submit"]');
        
        // Show loading state
        submitBtn.disabled = true;
        submitBtn.classList.add('loading');
        submitBtn.textContent = 'Sending reset link...';
        
        try {
            await window.authManager.resetPassword(email);
            
            // Show success message
            const messageDiv = document.getElementById('authMessage');
            if (messageDiv) {
                messageDiv.textContent = 'Password reset email sent! Check your inbox for the reset link.';
                messageDiv.className = 'auth-message success';
                messageDiv.style.display = 'block';
            }
            
            // Clear the form
            document.getElementById('resetEmail').value = '';
            
            // Redirect back to login after 3 seconds
            setTimeout(() => {
                showForm(loginForm);
                if (messageDiv) {
                    messageDiv.style.display = 'none';
                }
            }, 3000);
            
        } catch (error) {
            console.error('Password reset error:', error);
            
            // Show error message
            const messageDiv = document.getElementById('authMessage');
            if (messageDiv) {
                messageDiv.textContent = error.message || 'Failed to send reset email. Please try again.';
                messageDiv.className = 'auth-message error';
                messageDiv.style.display = 'block';
            }
        } finally {
            // Reset button state
            submitBtn.disabled = false;
            submitBtn.classList.remove('loading');
            submitBtn.textContent = 'Send Reset Link';
        }
    });

    // Google sign-in handlers
    googleSignInBtn.addEventListener('click', async function() {
        this.disabled = true;
        this.classList.add('loading');
        this.textContent = 'Signing in...';
        
        try {
            await window.authManager.signInWithGoogle();
        } catch (error) {
            console.error('Google sign-in error:', error);
        } finally {
            this.disabled = false;
            this.classList.remove('loading');
            this.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
            `;
        }
    });

    googleSignUpBtn.addEventListener('click', async function() {
        this.disabled = true;
        this.classList.add('loading');
        this.textContent = 'Creating account...';
        
        try {
            await window.authManager.signInWithGoogle();
        } catch (error) {
            console.error('Google sign-up error:', error);
        } finally {
            this.disabled = false;
            this.classList.remove('loading');
            this.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
            `;
        }
    });

    // Sign out handler
    signOutBtn.addEventListener('click', async function() {
        this.disabled = true;
        this.textContent = 'Signing out...';
        
        try {
            await window.authManager.signOut();
        } catch (error) {
            console.error('Sign out error:', error);
        } finally {
            this.disabled = false;
            this.textContent = 'Sign Out';
        }
    });

    // Input focus effects
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.style.transform = 'translateY(-2px)';
        });
        
        input.addEventListener('blur', function() {
            this.parentElement.style.transform = 'translateY(0)';
        });
    });

    // Password strength indicator (optional enhancement)
    const passwordInput = document.getElementById('signupPassword');
    if (passwordInput) {
        passwordInput.addEventListener('input', function() {
            const password = this.value;
            const strength = this.parentElement.querySelector('.password-strength');
            
            if (!strength) {
                const strengthDiv = document.createElement('div');
                strengthDiv.className = 'password-strength';
                strengthDiv.style.cssText = `
                    height: 4px;
                    background: rgba(255,255,255,0.2);
                    border-radius: 2px;
                    margin-top: 0.5rem;
                    overflow: hidden;
                `;
                
                const strengthBar = document.createElement('div');
                strengthBar.style.cssText = `
                    height: 100%;
                    transition: all 0.3s ease;
                    border-radius: 2px;
                `;
                strengthDiv.appendChild(strengthBar);
                this.parentElement.appendChild(strengthDiv);
            }
            
            const strengthBar = this.parentElement.querySelector('.password-strength div');
            let strengthPercent = 0;
            let strengthColor = '#e74c3c';
            
            if (password.length >= 6) strengthPercent = 25;
            if (password.length >= 8) strengthPercent = 50;
            if (password.length >= 10) strengthPercent = 75;
            if (password.length >= 12) strengthPercent = 100;
            
            if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strengthPercent += 25;
            if (password.match(/\d/)) strengthPercent += 25;
            if (password.match(/[^a-zA-Z\d]/)) strengthPercent += 25;
            
            if (strengthPercent >= 75) strengthColor = '#2ecc71';
            else if (strengthPercent >= 50) strengthColor = '#f39c12';
            
            strengthBar.style.width = Math.min(strengthPercent, 100) + '%';
            strengthBar.style.background = strengthColor;
        });
    }
}

// Start waiting for authManager
document.addEventListener('DOMContentLoaded', function() {
    waitForAuthManager();
}); 