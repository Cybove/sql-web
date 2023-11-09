function handleLoginFormSubmission() {
    const showResponse = (responseText, isError = true) => {
        const errorBox = document.querySelector('.error-box');
        const successBox = document.querySelector('.success-box');

        errorBox.innerText = isError ? responseText : '';
        successBox.innerText = isError ? '' : responseText;
        errorBox.style.display = isError ? 'block' : 'none';
        successBox.style.display = isError ? 'none' : 'block';
    };

    const handleResponseError = (event) => {
        const target = event.detail.elt;

        if (target.matches('#login-form form')) {
            const responseText = event.detail.xhr.responseText;
            showResponse(responseText, true);
        }
    };

    const handleAfterOnLoad = (event) => {
        const xhr = event.detail.xhr;
        const responseText = xhr.responseText;
        var redirectURL = xhr.getResponseHeader('Sql-Redirect');

        if (redirectURL) {
            const databaseType = document.querySelector('.database-select').value;
            redirectURL += '?databaseType=' + databaseType;

            showResponse(responseText, false);
            setTimeout(() => {
                window.location.href = redirectURL;
            }, 500);
        }
    };

    const submitLoginForm = (event) => {
        event.preventDefault();

        const form = event.target;
        const formData = new FormData(form);

        const databaseType = formData.get('databaseType');

        form.dispatchEvent(new Event('htmx:configRequest', { bubbles: true }));
        form.dispatchEvent(new Event('htmx:configRequest', { bubbles: true, detail: { headers: { 'X-Database-Type': databaseType } } }));
    };

    document.querySelector('#login-form form').addEventListener('submit', submitLoginForm);

    document.body.addEventListener('htmx:responseError', handleResponseError);
    document.body.addEventListener('htmx:afterOnLoad', handleAfterOnLoad);
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

handleLoginFormSubmission();
