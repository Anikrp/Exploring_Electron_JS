// Show error message
function showError(message, elementId = 'error-message') {
    const errorDiv = document.getElementById(elementId) || createErrorElement(elementId);
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    
    // Hide error after 5 seconds
    setTimeout(() => {
        errorDiv.style.display = 'none';
    }, 5000);
}

// Create error element if it doesn't exist
function createErrorElement(elementId) {
    const errorDiv = document.createElement('div');
    errorDiv.id = elementId;
    errorDiv.className = 'alert alert-danger mt-3';
    errorDiv.style.display = 'none';
    
    // Insert after the first form in the document
    const form = document.querySelector('form');
    form.parentNode.insertBefore(errorDiv, form.nextSibling);
    
    return errorDiv;
}

// Show success message
function showSuccess(message, elementId = 'success-message') {
    const successDiv = document.getElementById(elementId) || createSuccessElement(elementId);
    successDiv.textContent = message;
    successDiv.style.display = 'block';
    
    // Hide success message after 5 seconds
    setTimeout(() => {
        successDiv.style.display = 'none';
    }, 5000);
}

// Create success element if it doesn't exist
function createSuccessElement(elementId) {
    const successDiv = document.createElement('div');
    successDiv.id = elementId;
    successDiv.className = 'alert alert-success mt-3';
    successDiv.style.display = 'none';
    
    // Insert after the first form in the document
    const form = document.querySelector('form');
    form.parentNode.insertBefore(successDiv, form.nextSibling);
    
    return successDiv;
}

// Validate form data
function validateForm(formData, rules) {
    const errors = [];
    
    for (const [field, value] of formData.entries()) {
        const fieldRules = rules[field];
        if (fieldRules) {
            // Required check
            if (fieldRules.required && !value) {
                errors.push(`${field} is required`);
                continue;
            }
            
            // Minimum length check
            if (fieldRules.minLength && value.length < fieldRules.minLength) {
                errors.push(`${field} must be at least ${fieldRules.minLength} characters`);
            }
            
            // Maximum length check
            if (fieldRules.maxLength && value.length > fieldRules.maxLength) {
                errors.push(`${field} cannot exceed ${fieldRules.maxLength} characters`);
            }
            
            // Pattern check
            if (fieldRules.pattern && !fieldRules.pattern.test(value)) {
                errors.push(fieldRules.message || `${field} format is invalid`);
            }
        }
    }
    
    return errors;
}

// Format date for display
function formatDate(date) {
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Export utilities
window.utils = {
    showError,
    showSuccess,
    validateForm,
    formatDate
};
