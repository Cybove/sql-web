function showResponse(responseText, isError = true) {
    const errorBox = document.querySelector('.error-box');
    const successBox = document.querySelector('.success-box');

    errorBox.style.display = isError ? 'block' : 'none';
    successBox.style.display = isError ? 'none' : 'block';
    isError ? (errorBox.innerText = responseText) : (successBox.innerText = responseText);
}

function checkInputs() {
    const username = document.getElementsByName('username')[0].value;
    const password = document.getElementsByName('password')[0].value;
    const confirmPassword = document.getElementsByName('confirmPassword')[0].value;

    if (username === '' || password === '' || confirmPassword === '') {
        showResponse('Please fill in all fields', true);
        return false;
    }

    if (password !== confirmPassword) {
        showResponse('Passwords do not match', true);
        return false;
    }

    return true;
}

function handleRegisterForm(event) {
    const target = event.detail.elt;
    const responseText = event.detail.xhr.responseText;

    if (target.matches('#register-form form')) {
        showResponse(responseText, true);
    }
}

function handleAfterOnLoad(event) {
    const xhr = event.detail.xhr;
    const redirectURL = xhr.getResponseHeader('Index-Redirect');
    const responseText = xhr.responseText;

    if (redirectURL) {
        showResponse(responseText, false);
        setTimeout(() => {
            window.location.href = redirectURL;
        }, 1000);
    }
}

function toggleDarkMode() {
    const body = document.body;
    body.classList.toggle('dark');
    const isDarkMode = body.classList.contains('dark');
    localStorage.setItem('darkMode', isDarkMode);
}

const isDarkMode = localStorage.getItem('darkMode') === 'true';
if (isDarkMode) {
    document.body.classList.add('dark');
}

const darkModeToggle = document.getElementById('dark-mode-toggle');
darkModeToggle.addEventListener('click', toggleDarkMode);

document.body.addEventListener('htmx:configRequest', function (event) {
    const target = event.detail.elt;

    if (target.matches('#register-form form') && !checkInputs()) {
        event.preventDefault();
    }
});

document.body.addEventListener('htmx:responseError', handleRegisterForm);

document.body.addEventListener('htmx:afterOnLoad', handleAfterOnLoad);
