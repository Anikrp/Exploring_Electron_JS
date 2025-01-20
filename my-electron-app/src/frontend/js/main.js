document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');

    // Validation rules
    const validationRules = {
        username: {
            required: true,
            minLength: 3,
            maxLength: 30,
            pattern: /^[a-zA-Z0-9_-]+$/,
            message: 'Username can only contain letters, numbers, underscores, and hyphens'
        },
        email: {
            required: true,
            pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
            message: 'Please enter a valid email address'
        },
        password: {
            required: true,
            minLength: 6,
            maxLength: 50
        }
    };

    function showMessage(message, isError = false) {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert ${isError ? 'alert-danger' : 'alert-success'} mt-3`;
        alertDiv.textContent = message;
        
        // Remove any existing alerts
        document.querySelectorAll('.alert').forEach(alert => alert.remove());
        
        // Add the new alert
        const form = document.querySelector('form');
        form.parentNode.insertBefore(alertDiv, form.nextSibling);
        
        // Auto-remove after 5 seconds
        setTimeout(() => alertDiv.remove(), 5000);
    }

    function validateInput(input, rules) {
        const value = input.value.trim();
        const fieldRules = rules[input.name];
        
        if (!fieldRules) return '';

        if (fieldRules.required && !value) {
            return `${input.name} is required`;
        }

        if (fieldRules.minLength && value.length < fieldRules.minLength) {
            return `${input.name} must be at least ${fieldRules.minLength} characters`;
        }

        if (fieldRules.maxLength && value.length > fieldRules.maxLength) {
            return `${input.name} cannot exceed ${fieldRules.maxLength} characters`;
        }

        if (fieldRules.pattern && !fieldRules.pattern.test(value)) {
            return fieldRules.message || `${input.name} format is invalid`;
        }

        return '';
    }

    function disableForm(form, disabled = true) {
        const elements = form.elements;
        for (let i = 0; i < elements.length; i++) {
            elements[i].disabled = disabled;
        }
    }

    if (loginForm) {
        loginForm.addEventListener('submit', async function(event) {
            event.preventDefault();
            
            const email = loginForm.querySelector('[name="email"]');
            const password = loginForm.querySelector('[name="password"]');

            // Validate inputs
            const emailError = validateInput(email, validationRules);
            const passwordError = validateInput(password, validationRules);
            
            if (emailError || passwordError) {
                showMessage(emailError || passwordError, true);
                return;
            }

            try {
                disableForm(loginForm, true);
                const response = await window.api.login({ 
                    email: email.value.trim(), 
                    password: password.value 
                });

                if (response.token) {
                    showMessage('Login successful! Redirecting...');
                    setTimeout(() => {
                        window.location.href = 'dashboard.html';
                    }, 1000);
                }
            } catch (error) {
                showMessage(error.message || 'Login failed. Please try again.', true);
                console.error('Login error:', error);
            } finally {
                disableForm(loginForm, false);
            }
        });
    }

    if (signupForm) {
        signupForm.addEventListener('submit', async function(event) {
            event.preventDefault();
            
            const username = signupForm.querySelector('[name="username"]');
            const email = signupForm.querySelector('[name="email"]');
            const password = signupForm.querySelector('[name="password"]');

            // Validate inputs
            const usernameError = validateInput(username, validationRules);
            const emailError = validateInput(email, validationRules);
            const passwordError = validateInput(password, validationRules);
            
            if (usernameError || emailError || passwordError) {
                showMessage(usernameError || emailError || passwordError, true);
                return;
            }

            try {
                disableForm(signupForm, true);
                const response = await window.api.signup({ 
                    username: username.value.trim(), 
                    email: email.value.trim(), 
                    password: password.value 
                });

                if (response.message) {
                    showMessage('Signup successful! Redirecting to login...');
                    setTimeout(() => {
                        window.location.href = 'login.html';
                    }, 1500);
                }
            } catch (error) {
                showMessage(error.message || 'Signup failed. Please try again.', true);
                console.error('Signup error:', error);
            } finally {
                disableForm(signupForm, false);
            }
        });
    }
});