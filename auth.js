// Authentication functions
class AuthManager {
    constructor() {
        this.auth = window.auth;
        this.googleProvider = window.googleProvider;
        this.setupAuthStateListener();
        this.setupProfilePhotoHandlers();
    }

    // Setup authentication state listener
    setupAuthStateListener() {
        this.auth.onAuthStateChanged((user) => {
            if (user) {
                this.onUserSignedIn(user);
            } else {
                this.onUserSignedOut();
            }
        });
    }

    // User signed in
    onUserSignedIn(user) {
        console.log('User signed in:', user.email);
        this.updateUIForSignedInUser(user);
        this.showUserProfile(user);
        this.showDashboard(user);
    }

    // User signed out
    onUserSignedOut() {
        console.log('User signed out');
        this.updateUIForSignedOutUser();
        this.hideUserProfile();
        this.hideDashboard();
    }

    // Update UI for signed in user
    updateUIForSignedInUser(user) {
        const authNavBtn = document.getElementById('authNavBtn');
        const userNavProfile = document.getElementById('userNavProfile');
        const authContainer = document.getElementById('authContainer');
        const userProfile = document.getElementById('userProfile');
        
        if (authNavBtn) authNavBtn.style.display = 'none';
        if (userNavProfile) {
            userNavProfile.style.display = 'flex';
            const userNameDisplay = userNavProfile.querySelector('.user-name-display');
            if (userNameDisplay) {
                const displayName = user.displayName || user.email.split('@')[0];
                // Truncate long names for navigation
                const truncatedName = displayName.length > 15 ? displayName.substring(0, 15) + '...' : displayName;
                userNameDisplay.textContent = `Welcome, ${truncatedName}!`;
            }
        }
        if (authContainer) authContainer.style.display = 'none';
        if (userProfile) {
            userProfile.style.display = 'block';
            const userEmail = userProfile.querySelector('.user-email');
            const userName = userProfile.querySelector('.user-name');
            
            if (userEmail) userEmail.textContent = user.email;
            if (userName) {
                const displayName = user.displayName || user.email.split('@')[0];
                const truncatedName = displayName.length > 20 ? displayName.substring(0, 20) + '...' : displayName;
                userName.textContent = truncatedName;
            }
        }
    }

    // Update UI for signed out user
    updateUIForSignedOutUser() {
        const authNavBtn = document.getElementById('authNavBtn');
        const userNavProfile = document.getElementById('userNavProfile');
        const authContainer = document.getElementById('authContainer');
        const userProfile = document.getElementById('userProfile');
        
        if (authNavBtn) authNavBtn.style.display = 'inline-block';
        if (userNavProfile) userNavProfile.style.display = 'none';
        if (authContainer) authContainer.style.display = 'block';
        if (userProfile) userProfile.style.display = 'none';
    }

    // Show user profile
    showUserProfile(user) {
        const profileSection = document.getElementById('userProfileSection');
        if (profileSection) {
            profileSection.style.display = 'block';
        }
    }

    // Hide user profile
    hideUserProfile() {
        const profileSection = document.getElementById('userProfileSection');
        if (profileSection) {
            profileSection.style.display = 'none';
        }
    }

    // Show dashboard
    showDashboard(user) {
        const dashboard = document.getElementById('userDashboard');
        if (dashboard) {
            dashboard.style.display = 'block';
            this.updateDashboardInfo(user);
            this.loadUserProfile();
        }
    }

    // Hide dashboard
    hideDashboard() {
        const dashboard = document.getElementById('userDashboard');
        if (dashboard) {
            dashboard.style.display = 'none';
        }
    }

    // Update dashboard information
    updateDashboardInfo(user) {
        const dashboardUserName = document.getElementById('dashboardUserName');
        const dashboardUserEmail = document.getElementById('dashboardUserEmail');
        const dashboardUserInitial = document.getElementById('dashboardUserInitial');
        
        if (dashboardUserName) {
            const displayName = user.displayName || user.email.split('@')[0];
            // Truncate long names to fit better
            const truncatedName = displayName.length > 20 ? displayName.substring(0, 20) + '...' : displayName;
            dashboardUserName.textContent = truncatedName;
        }
        if (dashboardUserEmail) {
            dashboardUserEmail.textContent = user.email;
        }
        if (dashboardUserInitial) {
            const displayName = user.displayName || user.email.split('@')[0];
            // Use first letter, or first two letters if it's a short name
            let initial = displayName.charAt(0).toUpperCase();
            if (displayName.length <= 3) {
                initial = displayName.substring(0, 2).toUpperCase();
            }
            dashboardUserInitial.textContent = initial;
        }
    }

    // Load user profile data
    async loadUserProfile() {
        const user = this.auth.currentUser;
        if (!user) return;

        try {
            // Load from Firestore
            const doc = await window.db.collection('users').doc(user.uid).get();
            if (doc.exists) {
                const profile = doc.data();
                this.populateProfileForm(profile);
                this.updateProfileCompletion(profile);
                if (profile.profilePhoto) {
                    this.displayProfilePhoto(profile.profilePhoto);
                }
            }
        } catch (error) {
            console.error('Error loading profile:', error);
        }
    }

    // Populate profile form
    populateProfileForm(profile) {
        const fields = ['fieldOfInterest', 'location', 'dateOfBirth', 'schoolName', 'researchInterests'];
        fields.forEach(field => {
            const element = document.getElementById(field);
            if (element && profile[field]) {
                element.value = profile[field];
            }
        });
    }

    // Update profile completion percentage
    updateProfileCompletion(profile) {
        const requiredFields = ['fieldOfInterest', 'location', 'dateOfBirth', 'schoolName'];
        const optionalFields = ['researchInterests'];
        
        let completed = 0;
        let total = requiredFields.length + (optionalFields.length * 0.5); // Optional fields count as half
        
        requiredFields.forEach(field => {
            if (profile[field] && profile[field].trim() !== '') {
                completed++;
            }
        });
        
        optionalFields.forEach(field => {
            if (profile[field] && profile[field].trim() !== '') {
                completed += 0.5;
            }
        });
        
        const percentage = Math.round((completed / total) * 100);
        const completionElement = document.getElementById('profileCompletion');
        if (completionElement) {
            completionElement.textContent = `${percentage}%`;
        }
    }

    // Save user profile
    async saveUserProfile(profileData) {
        const user = this.auth.currentUser;
        if (!user) return;

        try {
            // Get profile photo from DOM (if any)
            let profilePhoto = '';
            const dashboardPhoto = document.getElementById('dashboardProfilePhoto');
            if (dashboardPhoto && dashboardPhoto.src && dashboardPhoto.style.display !== 'none') {
                profilePhoto = dashboardPhoto.src;
            } else {
                const authPhoto = document.getElementById('profilePhoto');
                if (authPhoto && authPhoto.src && authPhoto.style.display !== 'none') {
                    profilePhoto = authPhoto.src;
                }
            }

            // Save to Firestore
            await window.db.collection('users').doc(user.uid).set({
                ...profileData,
                profilePhoto: profilePhoto,
                email: user.email,
                displayName: user.displayName || user.email.split('@')[0],
                updatedAt: new Date()
            }, { merge: true });

            this.updateProfileCompletion(profileData);
            this.showSuccessMessage('Profile saved to Firebase!');
        } catch (error) {
            console.error('Error saving profile:', error);
            this.showErrorMessage('Failed to save profile. Please try again.');
        }
    }

    // Sign up with email and password
    async signUp(email, password, name) {
        try {
            const userCredential = await this.auth.createUserWithEmailAndPassword(email, password);
            const user = userCredential.user;
            
            // Update user profile with display name
            await user.updateProfile({
                displayName: name
            });
            
            this.showSuccessMessage('Account created successfully!');
            return user;
        } catch (error) {
            this.showErrorMessage(this.getErrorMessage(error));
            throw error;
        }
    }

    // Sign in with email and password
    async signIn(email, password) {
        try {
            const userCredential = await this.auth.signInWithEmailAndPassword(email, password);
            this.showSuccessMessage('Signed in successfully!');
            return userCredential.user;
        } catch (error) {
            this.showErrorMessage(this.getErrorMessage(error));
            throw error;
        }
    }

    // Sign in with Google
    async signInWithGoogle() {
        try {
            const result = await this.auth.signInWithPopup(this.googleProvider);
            this.showSuccessMessage('Signed in with Google successfully!');
            return result.user;
        } catch (error) {
            this.showErrorMessage(this.getErrorMessage(error));
            throw error;
        }
    }

    // Sign out
    async signOut() {
        try {
            await this.auth.signOut();
            this.showSuccessMessage('Signed out successfully!');
        } catch (error) {
            this.showErrorMessage(this.getErrorMessage(error));
            throw error;
        }
    }

    // Reset password
    async resetPassword(email) {
        try {
            await this.auth.sendPasswordResetEmail(email);
            this.showSuccessMessage('Password reset email sent!');
        } catch (error) {
            this.showErrorMessage(this.getErrorMessage(error));
            throw error;
        }
    }

    // Get error message
    getErrorMessage(error) {
        switch (error.code) {
            case 'auth/user-not-found':
                return 'No account found with this email address.';
            case 'auth/wrong-password':
                return 'Incorrect password.';
            case 'auth/email-already-in-use':
                return 'An account with this email already exists.';
            case 'auth/weak-password':
                return 'Password should be at least 6 characters.';
            case 'auth/invalid-email':
                return 'Please enter a valid email address.';
            case 'auth/too-many-requests':
                return 'Too many failed attempts. Please try again later.';
            case 'auth/popup-closed-by-user':
                return 'Sign-in popup was closed. Please try again.';
            default:
                return error.message;
        }
    }

    // Show success message
    showSuccessMessage(message) {
        const messageDiv = document.getElementById('authMessage');
        if (messageDiv) {
            messageDiv.textContent = message;
            messageDiv.className = 'auth-message success';
            messageDiv.style.display = 'block';
            setTimeout(() => {
                messageDiv.style.display = 'none';
            }, 5000);
        }
    }

    // Show error message
    showErrorMessage(message) {
        const messageDiv = document.getElementById('authMessage');
        if (messageDiv) {
            messageDiv.textContent = message;
            messageDiv.className = 'auth-message error';
            messageDiv.style.display = 'block';
            setTimeout(() => {
                messageDiv.style.display = 'none';
            }, 5000);
        }
    }

    // Get current user
    getCurrentUser() {
        return this.auth.currentUser;
    }

    // Check if user is signed in
    isSignedIn() {
        return !!this.auth.currentUser;
    }

    // Setup profile photo handlers
    setupProfilePhotoHandlers() {
        // Auth page profile photo
        const profilePhotoInput = document.getElementById('profilePhotoInput');
        const profileAvatar = document.getElementById('profileAvatar');
        
        if (profilePhotoInput && profileAvatar) {
            profileAvatar.addEventListener('click', () => {
                profilePhotoInput.click();
            });
            
            profilePhotoInput.addEventListener('change', (e) => {
                this.handleProfilePhotoUpload(e, 'profilePhoto', 'avatarInitial');
            });
        }
        
        // Dashboard profile photo
        const dashboardProfilePhotoInput = document.getElementById('dashboardProfilePhotoInput');
        const dashboardProfileAvatar = document.getElementById('dashboardProfileAvatar');
        
        if (dashboardProfilePhotoInput && dashboardProfileAvatar) {
            dashboardProfileAvatar.addEventListener('click', () => {
                dashboardProfilePhotoInput.click();
            });
            
            dashboardProfilePhotoInput.addEventListener('change', (e) => {
                this.handleProfilePhotoUpload(e, 'dashboardProfilePhoto', 'dashboardUserInitial');
            });
        }
        
        // Profile form save handler
        const userProfileForm = document.getElementById('userProfileForm');
        if (userProfileForm) {
            userProfileForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleProfileSave();
            });
        }
    }

    // Handle profile photo upload
    handleProfilePhotoUpload(event, imageId, initialId) {
        const file = event.target.files[0];
        if (!file) return;
        
        // Validate file type
        if (!file.type.startsWith('image/')) {
            this.showErrorMessage('Please select an image file.');
            return;
        }
        
        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            this.showErrorMessage('Image size should be less than 5MB.');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
            const imageElement = document.getElementById(imageId);
            const initialElement = document.getElementById(initialId);
            
            if (imageElement && initialElement) {
                imageElement.src = e.target.result;
                imageElement.style.display = 'block';
                initialElement.style.display = 'none';
                
                // Save to localStorage
                const user = this.auth.currentUser;
                if (user) {
                    localStorage.setItem(`profilePhoto_${user.uid}`, e.target.result);
                }
                
                this.showSuccessMessage('Profile photo updated successfully!');
            }
        };
        reader.readAsDataURL(file);
    }

    // Handle profile save with better feedback
    async handleProfileSave() {
        const user = this.auth.currentUser;
        if (!user) return;

        const saveBtn = document.querySelector('.save-profile-btn');
        const originalText = saveBtn.textContent;
        
        try {
            // Show loading state
            saveBtn.textContent = 'Saving...';
            saveBtn.disabled = true;
            saveBtn.style.opacity = '0.7';
            
            // Collect form data
            const profileData = {
                fieldOfInterest: document.getElementById('fieldOfInterest').value,
                location: document.getElementById('location').value,
                dateOfBirth: document.getElementById('dateOfBirth').value,
                schoolName: document.getElementById('schoolName').value,
                researchInterests: document.getElementById('researchInterests').value
            };
            
            // Save profile
            await this.saveUserProfile(profileData);
            
            // Show success state
            saveBtn.textContent = 'Saved! ✓';
            saveBtn.style.background = 'linear-gradient(45deg, #2ecc71, #27ae60)';
            
            // Reset button after 3 seconds
            setTimeout(() => {
                saveBtn.textContent = originalText;
                saveBtn.disabled = false;
                saveBtn.style.opacity = '1';
                saveBtn.style.background = 'linear-gradient(45deg, #00d4ff, #0099cc)';
            }, 3000);
            
        } catch (error) {
            console.error('Error saving profile:', error);
            
            // Show error state
            saveBtn.textContent = 'Error! Try Again';
            saveBtn.style.background = 'linear-gradient(45deg, #e74c3c, #c0392b)';
            
            // Reset button after 3 seconds
            setTimeout(() => {
                saveBtn.textContent = originalText;
                saveBtn.disabled = false;
                saveBtn.style.opacity = '1';
                saveBtn.style.background = 'linear-gradient(45deg, #00d4ff, #0099cc)';
            }, 3000);
        }
    }

    // Display profile photo on all avatars
    displayProfilePhoto(photoData) {
        // Auth page
        const authPhoto = document.getElementById('profilePhoto');
        const authInitial = document.getElementById('avatarInitial');
        if (authPhoto && authInitial) {
            authPhoto.src = photoData;
            authPhoto.style.display = 'block';
            authInitial.style.display = 'none';
        }
        
        // Dashboard
        const dashboardPhoto = document.getElementById('dashboardProfilePhoto');
        const dashboardInitial = document.getElementById('dashboardUserInitial');
        if (dashboardPhoto && dashboardInitial) {
            dashboardPhoto.src = photoData;
            dashboardPhoto.style.display = 'block';
            dashboardInitial.style.display = 'none';
        }
    }
}

// Initialize auth manager when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.authManager = new AuthManager();
    
    // Setup profile form submission
    const profileForm = document.getElementById('userProfileForm');
    if (profileForm) {
        profileForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const profileData = {
                fieldOfInterest: document.getElementById('fieldOfInterest').value,
                location: document.getElementById('location').value,
                dateOfBirth: document.getElementById('dateOfBirth').value,
                schoolName: document.getElementById('schoolName').value,
                researchInterests: document.getElementById('researchInterests').value
            };
            
            await window.authManager.saveUserProfile(profileData);
        });
    }
    
    // Setup navigation sign out button
    const signOutNavBtn = document.getElementById('signOutNavBtn');
    if (signOutNavBtn) {
        signOutNavBtn.addEventListener('click', async function() {
            await window.authManager.signOut();
        });
    }
}); 