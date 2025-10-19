class AuthManager {
    constructor() {
        this.currentUser = null;
        this.initializeAuth();
    }

    initializeAuth() {
        const savedUser = localStorage.getItem('tuneSpaceUser');
        if (savedUser) {
            this.currentUser = JSON.parse(savedUser);
            this.updateUI();
        }
        this.bindEvents();
    }

    bindEvents() {
        const loginBtn = document.querySelector('.login-btn');
        const logoutBtn = document.querySelector('.logout-btn');
        const heroCta = document.querySelector('.hero-cta');
        const authSwitchBtn = document.getElementById('authSwitchBtn');
        const loginForm = document.getElementById('loginForm');
        const registerForm = document.getElementById('registerForm');
        const bookBtns = document.querySelectorAll('.book-btn');

        loginBtn?.addEventListener('click', () => this.showAuthModal('login'));
        heroCta?.addEventListener('click', () => {
            if (this.currentUser) {
                document.getElementById('studios').scrollIntoView({ behavior: 'smooth' });
            } else {
                this.showAuthModal('login');
            }
        });
        logoutBtn?.addEventListener('click', () => this.logout());
        authSwitchBtn?.addEventListener('click', () => this.switchAuthForm());

        loginForm?.addEventListener('submit', e => {
            e.preventDefault();
            this.handleLogin();
        });

        registerForm?.addEventListener('submit', e => {
            e.preventDefault();
            this.handleRegister();
        });

        bookBtns.forEach(btn => {
            btn.addEventListener('click', e => {
                if (!this.currentUser) {
                    e.preventDefault();
                    this.showAuthModal('login');
                    return false;
                }
            });
        });
    }

    showAuthModal(mode = 'login') {
        const authModal = document.getElementById('authModal');
        const authTitle = document.getElementById('authTitle');
        const loginForm = document.getElementById('loginForm');
        const registerForm = document.getElementById('registerForm');
        const authSwitchText = document.getElementById('authSwitchText');
        const authSwitchBtn = document.getElementById('authSwitchBtn');

        if (mode === 'login') {
            authTitle.textContent = 'Login to TuneSpace';
            loginForm.style.display = 'block';
            registerForm.style.display = 'none';
            authSwitchText.textContent = "Don't have an account?";
            authSwitchBtn.textContent = 'Register here';
        } else {
            authTitle.textContent = 'Create Account';
            loginForm.style.display = 'none';
            registerForm.style.display = 'block';
            authSwitchText.textContent = 'Already have an account?';
            authSwitchBtn.textContent = 'Login here';
        }

        Components.openModal('authModal');
    }

    switchAuthForm() {
        const loginForm = document.getElementById('loginForm');
        const isLoginVisible = loginForm.style.display !== 'none';
        this.showAuthModal(isLoginVisible ? 'register' : 'login');
    }

    handleLogin() {
        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value;

        if (!email || !password) {
            Components.showToast('Error', 'Please fill in all fields', 'error');
            return;
        }

        fetch('http://127.0.0.1:5000/login', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ username: email, password: password })  // Assuming username is email here
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                this.currentUser = {
                    name: data.user.username || data.user.email || email,
                    email: email,
                    role: data.user.role || 'user'
                };
                localStorage.setItem('tuneSpaceUser', JSON.stringify(this.currentUser));
                this.updateUI();
                Components.closeModal('authModal');
                Components.showToast('Welcome to TuneSpace!', `Logged in successfully as ${this.currentUser.role}.`);
                document.getElementById('loginForm').reset();
            } else {
                Components.showToast('Login Failed', data.message || 'Unknown error', 'error');
            }
        })
        .catch(() => {
            Components.showToast('Network Error', 'Please try again later.', 'error');
        });
    }

    handleRegister() {
        const name = document.getElementById('registerName').value.trim();
        const email = document.getElementById('registerEmail').value.trim();
        const password = document.getElementById('registerPassword').value;
        const role = document.getElementById('registerRole').value;

        if (!name || !email || !password) {
            Components.showToast('Error', 'Please fill in all fields', 'error');
            return;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            Components.showToast('Error', 'Please enter a valid email address', 'error');
            return;
        }

        fetch('http://127.0.0.1:5000/register', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                username: name,
                email: email,
                password: password,
                role: role
            })
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                Components.showToast('Account Created!', 'Welcome to TuneSpace. You can now log in.');
                this.showAuthModal('login');
                document.getElementById('registerForm').reset();
            } else {
                Components.showToast('Registration Failed', data.message || 'Unknown error', 'error');
            }
        })
        .catch(() => {
            Components.showToast('Network Error', 'Please try again later.', 'error');
        });
    }

    logout() {
        this.currentUser = null;
        localStorage.removeItem('tuneSpaceUser');
        this.updateUI();
        Components.showToast('Logged out', 'See you next time!');
    }

    updateUI() {
        const loginBtn = document.querySelector('.login-btn');
        const logoutBtn = document.querySelector('.logout-btn');
        const userWelcome = document.querySelector('.user-welcome');
        const bookingsLink = document.querySelector('.bookings-link');
        const adminLink = document.querySelector('.admin-link');

        if (this.currentUser) {
            loginBtn.style.display = 'none';
            logoutBtn.style.display = 'inline-flex';
            userWelcome.style.display = 'inline';
            userWelcome.textContent = `Welcome, ${this.currentUser.name}`;

            if (this.currentUser.role === 'user') {
                bookingsLink.style.display = 'inline-flex';
                adminLink.style.display = 'none';
            } else if (this.currentUser.role === 'admin') {
                bookingsLink.style.display = 'inline-flex';
                adminLink.style.display = 'inline-flex';
            }
        } else {
            loginBtn.style.display = 'inline-flex';
            logoutBtn.style.display = 'none';
            userWelcome.style.display = 'none';
            bookingsLink.style.display = 'none';
            adminLink.style.display = 'none';
        }
    }

    getCurrentUser() {
        return this.currentUser;
    }

    isAuthenticated() {
        return this.currentUser !== null;
    }

    isAdmin() {
        return this.currentUser && this.currentUser.role === 'admin';
    }
}

// Initialize auth manager
window.authManager = new AuthManager();
