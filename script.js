// API URL
const API_BASE_URL = 'http://localhost:3000/api';

// API call function
async function apiCall(endpoint, method = 'GET', data = null) {
    try {
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json',
            }
        };

        if (data) {
            options.body = JSON.stringify(data);
        }

        const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('API call failed:', error);
        throw error;
    }
}

// State management
let currentUser = null;
let users = [
    { id: 'admin-default', username: 'admin', password: 'admin123', role: 'admin' }
];
let jobs = [];
let payments = [];
let products = [];
let settings = {
    companyName: 'Your Company',
    currency: 'INR',
    dateFormat: 'DD-MM-YYYY',
    theme: 'light'
};

// Job management functions
function editJob(id) {
    const job = jobs.find(j => j.id === id);
    if (job) {
        document.getElementById('jobDate').value = job.date;
        document.getElementById('clientName').value = job.clientName;
        document.getElementById('vendorSelect').value = job.vendor;
        document.getElementById('jobAmount').value = job.amount;
        document.getElementById('jobDescription').value = job.description;
        document.getElementById('jobId').value = id;
        document.getElementById('jobSubmitBtn').textContent = 'Update Job';
    }
}

function deleteJob(id) {
    if (confirm('Are you sure you want to delete this job?')) {
        jobs = jobs.filter(j => j.id !== id);
        saveDataToLocalStorage();
        refreshJobsList();
        refreshMonthlySummary();
    }
}

// Payment management functions
function editPayment(id) {
    const payment = payments.find(p => p.id === id);
    if (payment) {
        document.getElementById('paymentDate').value = payment.date;
        document.getElementById('paymentvendor').value = payment.vendor;
        document.getElementById('paymentAmount').value = payment.amount;
        document.getElementById('paymentDescription').value = payment.description;
        document.getElementById('paymentId').value = id;
        document.getElementById('paymentSubmitBtn').textContent = 'Update Payment';
    }
}

function deletePayment(id) {
    if (confirm('Are you sure you want to delete this payment?')) {
        payments = payments.filter(p => p.id !== id);
        saveDataToLocalStorage();
        refreshPaymentsList();
        refreshMonthlySummary();
    }
}

// Product management functions
function editProduct(name) {
    const product = products.find(p => p.name === name);
    if (product) {
        document.getElementById('productName').value = product.name;
        document.getElementById('productRate').value = product.rate;
        document.getElementById('productDescription').value = product.description;
        document.getElementById('oldProductName').value = name;
        document.getElementById('productSubmitBtn').textContent = 'Update Product';
    }
}

function deleteProduct(name) {
    if (confirm('Are you sure you want to delete this product?')) {
        products = products.filter(p => p.name !== name);
        saveDataToLocalStorage();
        refreshProductsList();
        refreshDropdowns();
    }
}

// Local storage functions
function loadDataFromLocalStorage() {
    try {
        const storedUsers = localStorage.getItem('users');
        if (storedUsers) {
            users = JSON.parse(storedUsers);
        }

        const storedJobs = localStorage.getItem('jobs');
        if (storedJobs) {
            jobs = JSON.parse(storedJobs);
        }

        const storedPayments = localStorage.getItem('payments');
        if (storedPayments) {
            payments = JSON.parse(storedPayments);
        }

        const storedProducts = localStorage.getItem('products');
        if (storedProducts) {
            products = JSON.parse(storedProducts);
        }

        const storedSettings = localStorage.getItem('settings');
        if (storedSettings) {
            settings = JSON.parse(storedSettings);
            loadSettingsIntoForm();
        }

        const storedTheme = localStorage.getItem('theme');
        if (storedTheme === 'dark') {
            document.documentElement.classList.add('dark');
        }
    } catch (error) {
        console.error('Error loading data from localStorage:', error);
    }
}

function saveDataToLocalStorage() {
    try {
        localStorage.setItem('users', JSON.stringify(users));
        localStorage.setItem('jobs', JSON.stringify(jobs));
        localStorage.setItem('payments', JSON.stringify(payments));
        localStorage.setItem('products', JSON.stringify(products));
        localStorage.setItem('settings', JSON.stringify(settings));
    } catch (error) {
        console.error('Error saving data to localStorage:', error);
    }
}

// Loading management
function showLoading() {
    document.getElementById('loading').classList.remove('hidden');
}

function hideLoading() {
    document.getElementById('loading').classList.add('hidden');
}

// Theme management
const themeToggle = document.getElementById('themeToggle');
themeToggle.addEventListener('click', () => {
    document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', document.documentElement.classList.contains('dark') ? 'dark' : 'light');
});

// Login functionality
document.getElementById('loginForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
        activateUserSession(user);
    } else {
        alert('Invalid username or password');
    }
});

// User session management
function activateUserSession(user) {
    currentUser = user;
    document.getElementById('loginSection').classList.add('hidden');
    document.getElementById('dashboard').classList.remove('hidden');
    document.getElementById('userDisplay').textContent = `Welcome, ${user.username}`;

    // Show/hide admin elements based on user role
    const adminElements = document.querySelectorAll('.admin-only');
    const isAdmin = user.role === 'admin';
    adminElements.forEach(el => {
        if (isAdmin) {
            el.classList.remove('hidden');
        } else {
            el.classList.add('hidden');
        }
    });

    if (isAdmin) {
        document.getElementById('adminNavigation').classList.remove('hidden');
        document.getElementById('adminPanelStatus').classList.remove('hidden');
        document.getElementById('adminRoleDisplay').textContent = user.username;
        refreshAdminDashboard();
    }

    refreshData();
}

function logout() {
    currentUser = null;
    document.getElementById('loginSection').classList.remove('hidden');
    document.getElementById('dashboard').classList.add('hidden');
    document.getElementById('loginForm').reset();
}

// Initialize navigation
function initNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const pages = document.querySelectorAll('.page-section');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetPage = link.getAttribute('data-page');

            // Update active states
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');

            pages.forEach(page => {
                if (page.id === `${targetPage}-page`) {
                    page.classList.add('active');
                } else {
                    page.classList.remove('active');
                }
            });
        });
    });
}

// Data refresh functions
function refreshData() {
    refreshJobsList();
    refreshPaymentsList();
    refreshMonthlySummary();
    refreshDropdowns();
    if (currentUser?.role === 'admin') {
        refreshUsersList();
        refreshProductsList();
        refreshAdminDashboard();
    }
}

function refreshDropdowns() {
    const vendorSelects = document.querySelectorAll('.vendor-select');
    vendorSelects.forEach(select => {
        select.innerHTML = '<option value="">Select Vendor</option>';
        products.forEach(product => {
            const option = document.createElement('option');
            option.value = product.name;
            option.textContent = product.name;
            select.appendChild(option);
        });
    });
}

// Form validation functions
function showError(inputId, message) {
    const input = document.getElementById(inputId);
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    input.classList.add('input-error');
    input.parentNode.appendChild(errorDiv);
}

function clearError(inputId) {
    const input = document.getElementById(inputId);
    const errorMessage = input.parentNode.querySelector('.error-message');
    if (errorMessage) {
        errorMessage.remove();
    }
    input.classList.remove('input-error');
}

// Utility functions
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN');
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: settings.currency || 'INR'
    }).format(amount);
}

// Event listeners
document.getElementById('monthFilter').addEventListener('change', refreshData);

// Initial setup
document.getElementById('monthFilter').valueAsDate = new Date();
loadDataFromLocalStorage();
initNavigation();

// Add form event listeners
document.getElementById('userForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    const username = document.getElementById('newUsername').value;
    const password = document.getElementById('newPassword').value;
    const role = document.getElementById('userRole').value;

    if (users.some(u => u.username === username)) {
        alert('Username already exists');
        return;
    }

    users.push({
        id: Date.now().toString(),
        username,
        password,
        role
    });

    saveDataToLocalStorage();
    refreshUsersList();
    this.reset();
});

document.getElementById('productForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    const name = document.getElementById('productName').value;
    const rate = document.getElementById('productRate').value;
    const description = document.getElementById('productDescription').value;
    const oldName = document.getElementById('oldProductName').value;

    if (oldName) {
        // Update existing product
        const index = products.findIndex(p => p.name === oldName);
        if (index !== -1) {
            products[index] = { name, rate, description };
        }
    } else {
        // Add new product
        if (products.some(p => p.name === name)) {
            alert('Product already exists');
            return;
        }
        products.push({ name, rate, description });
    }

    saveDataToLocalStorage();
    refreshProductsList();
    refreshDropdowns();
    this.reset();
    document.getElementById('productSubmitBtn').textContent = 'Add Product';
});

document.getElementById('jobForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    const date = document.getElementById('jobDate').value;
    const clientName = document.getElementById('clientName').value;
    const vendor = document.getElementById('vendorSelect').value;
    const amount = document.getElementById('jobAmount').value;
    const description = document.getElementById('jobDescription').value;
    const jobId = document.getElementById('jobId').value;

    if (jobId) {
        // Update existing job
        const index = jobs.findIndex(j => j.id === jobId);
        if (index !== -1) {
            jobs[index] = { id: jobId, date, clientName, vendor, amount, description };
        }
    } else {
        // Add new job
        jobs.push({
            id: Date.now().toString(),
            date,
            clientName,
            vendor,
            amount,
            description
        });
    }

    saveDataToLocalStorage();
    refreshJobsList();
    refreshMonthlySummary();
    this.reset();
    document.getElementById('jobSubmitBtn').textContent = 'Add Job';
});

document.getElementById('paymentForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    const date = document.getElementById('paymentDate').value;
    const vendor = document.getElementById('paymentvendor').value;
    const amount = document.getElementById('paymentAmount').value;
    const description = document.getElementById('paymentDescription').value;
    const paymentId = document.getElementById('paymentId').value;

    if (paymentId) {
        // Update existing payment
        const index = payments.findIndex(p => p.id === paymentId);
        if (index !== -1) {
            payments[index] = { id: paymentId, date, vendor, amount, description };
        }
    } else {
        // Add new payment
        payments.push({
            id: Date.now().toString(),
            date,
            vendor,
            amount,
            description
        });
    }

    saveDataToLocalStorage();
    refreshPaymentsList();
    refreshMonthlySummary();
    this.reset();
    document.getElementById('paymentSubmitBtn').textContent = 'Add Payment';
});
