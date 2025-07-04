// Authentication functions
class AuthManager {
    constructor() {
        this.auth = firebase.auth();
        this.db = firebase.firestore();
        this.googleProvider = new firebase.auth.GoogleAuthProvider();
        
        // Only set up profile photo handlers if we're on a page with dashboard elements
        if (document.getElementById('dashboardProfilePhotoInput')) {
            this.setupProfilePhotoHandlers();
        }
        
        this.setupAuthStateListener();
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
        
        // Automatically redirect to main page (index.html) if we're on auth.html
        if (window.location.pathname.includes('auth.html')) {
            window.location.href = 'index.html#userDashboard';
        } else {
            // If already on index.html, scroll to dashboard after a short delay
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
            }, 500);
        }
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
        const dashboardNavLink = document.getElementById('dashboardNavLink');
        const authContainer = document.getElementById('authContainer');
        const userProfile = document.getElementById('userProfile');
        
        if (authNavBtn) authNavBtn.style.display = 'none';
        if (dashboardNavLink) dashboardNavLink.style.display = 'inline-block';
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
        const dashboardNavLink = document.getElementById('dashboardNavLink');
        const authContainer = document.getElementById('authContainer');
        const userProfile = document.getElementById('userProfile');
        
        if (authNavBtn) authNavBtn.style.display = 'inline-block';
        if (dashboardNavLink) dashboardNavLink.style.display = 'none';
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
            this.setupRealtimeProfileCompletion();
            this.setupDashboardEventListeners();
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
            const doc = await this.db.collection('users').doc(user.uid).get();
            if (doc.exists) {
                const profile = doc.data();
                this.populateProfileForm(profile);
                if (profile.profilePhoto) {
                    this.displayProfilePhoto(profile.profilePhoto);
                }
            }
        } catch (error) {
            console.error('Error loading profile:', error);
        }
    }

    // Populate profile form
    async populateProfileForm(profile) {
        const fields = ['fieldOfInterest', 'dateOfBirth', 'schoolName', 'researchInterests'];
        fields.forEach(field => {
            const element = document.getElementById(field);
            if (element && profile[field]) {
                element.value = profile[field];
            }
        });
        
        // Handle resume file if it exists (only show file name)
        if (profile.resumeFile && profile.resumeFile.name) {
            this.displayResumeFileInfo({
                name: profile.resumeFile.name,
                size: null
            });
        }
        
        this.setupRealtimeProfileCompletion();
        
        // Check completion and show/hide match button after populating
        setTimeout(() => {
            this.updateProfileCompletion();
        }, 100);
    }

    // Update profile completion percentage
    updateProfileCompletion(profile = null) {
        const requiredFields = ['fieldOfInterest', 'dateOfBirth', 'schoolName'];
        
        let completed = 0;
        let total = requiredFields.length;
        
        // If profile is provided, use it; otherwise read from DOM
        if (profile) {
            requiredFields.forEach(field => {
                if (profile[field] && profile[field].trim() !== '') {
                    completed++;
                }
            });
        } else {
            // Read from DOM elements
            requiredFields.forEach(field => {
                const element = document.getElementById(field);
                if (element && element.value && element.value.trim() !== '') {
                    completed++;
                }
            });
        }
        
        const percentage = Math.round((completed / total) * 100);
        const completionElement = document.getElementById('profileCompletion');
        if (completionElement) {
            completionElement.textContent = `${percentage}%`;
        }
        
        // Show/hide match button based on completion
        if (percentage === 100) {
            this.showMatchProfessorsButton();
        } else {
            this.hideMatchProfessorsButton();
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
            await this.db.collection('users').doc(user.uid).set({
                ...profileData,
                profilePhoto: profilePhoto,
                email: user.email,
                displayName: user.displayName || user.email.split('@')[0],
                updatedAt: new Date()
            }, { merge: true });

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
            console.log('Attempting to send password reset email to:', email);
            
            // Validate email format
            if (!email || !email.includes('@')) {
                throw new Error('Please enter a valid email address.');
            }
            
            await this.auth.sendPasswordResetEmail(email);
            console.log('Password reset email sent successfully');
            this.showSuccessMessage('Password reset email sent! Check your inbox and spam folder.');
        } catch (error) {
            console.error('Password reset error:', error);
            
            // Provide more specific error messages
            let errorMessage = 'Failed to send reset email. ';
            
            switch (error.code) {
                case 'auth/user-not-found':
                    errorMessage = 'No account found with this email address.';
                    break;
                case 'auth/invalid-email':
                    errorMessage = 'Please enter a valid email address.';
                    break;
                case 'auth/too-many-requests':
                    errorMessage = 'Too many attempts. Please wait a few minutes and try again.';
                    break;
                case 'auth/network-request-failed':
                    errorMessage = 'Network error. Please check your internet connection.';
                    break;
                default:
                    errorMessage += error.message || 'Please try again later.';
            }
            
            this.showErrorMessage(errorMessage);
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
        const dashboardPhotoInput = document.getElementById('dashboardProfilePhotoInput');
        const dashboardPhoto = document.getElementById('dashboardProfilePhoto');
        const dashboardInitial = document.getElementById('dashboardUserInitial');
        const dashboardAvatar = document.getElementById('dashboardProfileAvatar');
        
        // Only set up handlers if elements exist
        if (!dashboardPhotoInput || !dashboardPhoto || !dashboardInitial || !dashboardAvatar) {
            return;
        }
        
        dashboardAvatar.addEventListener('click', () => {
            dashboardPhotoInput.click();
        });
        
        dashboardPhotoInput.addEventListener('change', (e) => {
            this.handleProfilePhotoUpload(e, 'dashboardProfilePhoto', 'dashboardUserInitial');
        });
    }

    setupResumeUploadHandlers() {
        const resumeUpload = document.getElementById('resumeUpload');
        const resumeUploadArea = document.getElementById('resumeUploadArea');
        const resumeFileInfo = document.getElementById('resumeFileInfo');
        const removeResumeBtn = document.getElementById('removeResumeBtn');

        if (resumeUpload && resumeUploadArea) {
            // Click to upload
            resumeUploadArea.addEventListener('click', () => {
                resumeUpload.click();
            });

            // File selection
            resumeUpload.addEventListener('change', (event) => {
                this.handleResumeUpload(event);
            });

            // Drag and drop
            resumeUploadArea.addEventListener('dragover', (event) => {
                event.preventDefault();
                resumeUploadArea.classList.add('dragover');
            });

            resumeUploadArea.addEventListener('dragleave', (event) => {
                event.preventDefault();
                resumeUploadArea.classList.remove('dragover');
            });

            resumeUploadArea.addEventListener('drop', (event) => {
                event.preventDefault();
                resumeUploadArea.classList.remove('dragover');
                
                const files = event.dataTransfer.files;
                if (files.length > 0) {
                    resumeUpload.files = files;
                    this.handleResumeUpload({ target: resumeUpload });
                }
            });

            // Remove file
            if (removeResumeBtn) {
                removeResumeBtn.addEventListener('click', () => {
                    this.removeResumeFile();
                });
            }
        }
    }

    handleResumeUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        // Validate file type
        const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (!allowedTypes.includes(file.type)) {
            this.showErrorMessage('Please upload a PDF, DOC, or DOCX file.');
            return;
        }

        // Validate file size (5MB limit)
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            this.showErrorMessage('File size must be less than 5MB.');
            return;
        }

        // Display file info
        this.displayResumeFileInfo(file);
    }

    displayResumeFileInfo(file) {
        const resumeUploadArea = document.getElementById('resumeUploadArea');
        const resumeFileInfo = document.getElementById('resumeFileInfo');
        const resumeFileName = document.getElementById('resumeFileName');
        const resumeFileSize = document.getElementById('resumeFileSize');

        if (resumeUploadArea && resumeFileInfo && resumeFileName && resumeFileSize) {
            resumeUploadArea.style.display = 'none';
            resumeFileInfo.style.display = 'flex';
            
            resumeFileName.textContent = file.name;
            resumeFileSize.textContent = file.size ? this.formatFileSize(file.size) : '';
        }
    }

    removeResumeFile() {
        const resumeUpload = document.getElementById('resumeUpload');
        const resumeUploadArea = document.getElementById('resumeUploadArea');
        const resumeFileInfo = document.getElementById('resumeFileInfo');

        if (resumeUpload && resumeUploadArea && resumeFileInfo) {
            resumeUpload.value = '';
            resumeUploadArea.style.display = 'block';
            resumeFileInfo.style.display = 'none';
            
            // Save the updated profile (without resume) to Firebase
            this.saveUpdatedProfileWithoutResume();
        }
    }

    // Helper method to save profile without resume
    async saveUpdatedProfileWithoutResume() {
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

            // Collect current form data
            const profileData = {
                fieldOfInterest: document.getElementById('fieldOfInterest').value,
                dateOfBirth: document.getElementById('dateOfBirth').value,
                schoolName: document.getElementById('schoolName').value,
                researchInterests: document.getElementById('researchInterests').value,
                profilePhoto: profilePhoto,
                email: user.email,
                displayName: user.displayName || user.email.split('@')[0],
                updatedAt: new Date(),
                resumeFile: null // Explicitly set to null to remove it
            };
            
            // Save to Firebase with explicit resumeFile removal
            await this.db.collection('users').doc(user.uid).set(profileData, { merge: true });
            
            this.showSuccessMessage('Resume removed successfully!');
        } catch (error) {
            console.error('Error removing resume:', error);
            this.showErrorMessage('Failed to remove resume. Please try again.');
        }
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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

    // Handle profile save
    async handleProfileSave() {
        const saveBtn = document.querySelector('.save-profile-btn');
        const originalText = saveBtn.textContent;
        
        // Show loading state
        saveBtn.disabled = true;
        saveBtn.style.opacity = '0.7';
        saveBtn.textContent = 'Saving...';
        
        try {
            // Collect form data
            const profileData = {
                fieldOfInterest: document.getElementById('fieldOfInterest').value,
                dateOfBirth: document.getElementById('dateOfBirth').value,
                schoolName: document.getElementById('schoolName').value,
                researchInterests: document.getElementById('researchInterests').value
            };
            
            // Handle resume file if uploaded (only save file name)
            const resumeUpload = document.getElementById('resumeUpload');
            if (resumeUpload && resumeUpload.files.length > 0) {
                const file = resumeUpload.files[0];
                profileData.resumeFile = {
                    name: file.name
                };
            }
            
            // Save profile to Firebase
            await this.saveUserProfile(profileData);
            
            // Also save to localStorage for email generation
            const user = this.auth.currentUser;
            if (user) {
                const userProfileForEmails = {
                    name: user.displayName || user.email.split('@')[0],
                    schoolName: profileData.schoolName,
                    fieldOfInterest: profileData.fieldOfInterest,
                    researchInterests: profileData.researchInterests
                };
                localStorage.setItem('userProfile', JSON.stringify(userProfileForEmails));
            }
            
            // Check if profile is 100% complete
            const requiredFields = ['fieldOfInterest', 'dateOfBirth', 'schoolName'];
            let completed = 0;
            requiredFields.forEach(field => {
                if (profileData[field] && profileData[field].trim() !== '') {
                    completed++;
                }
            });
            
            const percent = Math.round((completed / requiredFields.length) * 100);
            
            // Show success state
            saveBtn.textContent = 'Saved! ✓';
            saveBtn.style.background = 'linear-gradient(45deg, #2ecc71, #27ae60)';
            
            // Show popup if profile is 100% complete
            if (percent === 100) {
                setTimeout(() => {
                    this.showProfileCompletionPopup();
                }, 1000); // Show popup after 1 second
            }
            
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

    // Add this after populateProfileForm
    setupRealtimeProfileCompletion() {
        const requiredFields = ['fieldOfInterest', 'dateOfBirth', 'schoolName'];
        const update = () => {
            let completed = 0;
            requiredFields.forEach(field => {
                const el = document.getElementById(field);
                if (el && el.value && el.value.trim() !== '') completed++;
            });
            const percent = Math.round((completed / requiredFields.length) * 100);
            this.updateCircularProgress(percent);
            
            // Auto-save when profile reaches 100% and show match button
            if (percent === 100) {
                this.autoSaveProfile();
                this.showMatchProfessorsButton();
            } else {
                this.hideMatchProfessorsButton();
            }
        };
        requiredFields.forEach(field => {
            const el = document.getElementById(field);
            if (el) el.addEventListener('input', update);
        });
        update(); // Initial call
    }

    // Auto-save profile when it reaches 100%
    async autoSaveProfile() {
        const user = this.auth.currentUser;
        if (!user) return;

        try {
            // Collect form data
            const profileData = {
                fieldOfInterest: document.getElementById('fieldOfInterest').value,
                dateOfBirth: document.getElementById('dateOfBirth').value,
                schoolName: document.getElementById('schoolName').value,
                researchInterests: document.getElementById('researchInterests').value
            };
            
            // Handle resume file if uploaded (only save file name)
            const resumeUpload = document.getElementById('resumeUpload');
            if (resumeUpload && resumeUpload.files.length > 0) {
                const file = resumeUpload.files[0];
                profileData.resumeFile = {
                    name: file.name
                };
            }
            
            // Save profile to Firebase
            await this.saveUserProfile(profileData);
            
            // Also save to localStorage for email generation
            const userProfileForEmails = {
                name: user.displayName || user.email.split('@')[0],
                schoolName: profileData.schoolName,
                fieldOfInterest: profileData.fieldOfInterest,
                researchInterests: profileData.researchInterests
            };
            localStorage.setItem('userProfile', JSON.stringify(userProfileForEmails));
            
            console.log('Profile auto-saved at 100% completion');
        } catch (error) {
            console.error('Error auto-saving profile:', error);
        }
    }

    // Show the match professors button
    showMatchProfessorsButton() {
        const matchBtn = document.getElementById('matchProfessorsBtn');
        if (matchBtn) {
            matchBtn.style.display = 'flex';
            // Add a subtle animation when it appears
            matchBtn.style.animation = 'fadeInUp 0.5s ease-out';
        }
    }

    // Hide the match professors button
    hideMatchProfessorsButton() {
        const matchBtn = document.getElementById('matchProfessorsBtn');
        if (matchBtn) {
            matchBtn.style.display = 'none';
        }
    }

    updateCircularProgress(percent) {
        const circle = document.querySelector('.circular-progress-bar');
        const text = document.getElementById('profileCompletion');
        // Get the actual radius from the SVG element
        let radius = 54;
        if (circle) {
            const r = circle.getAttribute('r');
            if (r) radius = parseFloat(r);
        }
        const circumference = 2 * Math.PI * radius;
        const offset = circumference - (percent / 100) * circumference;
        if (circle) {
            circle.style.strokeDasharray = `${circumference}`;
            circle.style.strokeDashoffset = offset;
        }
        if (text) text.textContent = percent + '%';
    }

    setupDashboardEventListeners() {
        // Resume upload handlers
        this.setupResumeUploadHandlers();

        // Profile form save handler
        const userProfileForm = document.getElementById('userProfileForm');
        if (userProfileForm) {
            userProfileForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleProfileSave();
            });
        }

        // Add event listeners
        const resumeUpload = document.getElementById('resumeUpload');
        const resumeUploadArea = document.getElementById('resumeUploadArea');
        const removeResumeBtn = document.getElementById('removeResumeBtn');
        const matchBtn = document.getElementById('matchProfessorsBtn');

        if (resumeUpload) {
            resumeUpload.addEventListener('change', (e) => this.handleResumeUpload(e));
        }
        
        if (resumeUploadArea) {
            resumeUploadArea.addEventListener('click', () => {
                if (resumeUpload) resumeUpload.click();
            });
        }
        
        if (removeResumeBtn) {
            removeResumeBtn.addEventListener('click', () => this.removeResume());
        }
        
        // Add event listener for match professors button
        if (matchBtn) {
            matchBtn.addEventListener('click', () => {
                window.location.href = 'professor-matching.html';
            });
        }
    }

    // Show profile completion popup
    showProfileCompletionPopup() {
        const popup = document.getElementById('profileCompletionPopup');
        if (popup) {
            popup.style.display = 'flex';
            
            // Add event listeners for popup buttons
            const matchBtn = document.getElementById('popupMatchBtn');
            const closeBtn = document.getElementById('popupCloseBtn');
            
            if (matchBtn) {
                matchBtn.addEventListener('click', () => {
                    window.location.href = 'professor-matching.html';
                });
            }
            
            if (closeBtn) {
                closeBtn.addEventListener('click', () => {
                    this.hideProfileCompletionPopup();
                });
            }
            
            // Close popup when clicking outside
            popup.addEventListener('click', (e) => {
                if (e.target === popup) {
                    this.hideProfileCompletionPopup();
                }
            });
        }
    }

    // Hide profile completion popup
    hideProfileCompletionPopup() {
        const popup = document.getElementById('profileCompletionPopup');
        if (popup) {
            popup.style.display = 'none';
        }
    }
}

// Initialize auth manager when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.authManager = new AuthManager();
    
    // Setup navigation sign out button
    const signOutNavBtn = document.getElementById('signOutNavBtn');
    if (signOutNavBtn) {
        signOutNavBtn.addEventListener('click', async function() {
            await window.authManager.signOut();
        });
    }
}); 