const sqlResults = document.getElementById('sql-results');
const textarea = document.querySelector('.query-input');
const darkModeToggle = document.getElementById('dark-mode-toggle');

function createTable(data) {
    const tableContainer = document.createElement('div');
    tableContainer.classList.add('table-container');

    const table = document.createElement('table');
    table.classList.add('table');

    const thead = document.createElement('thead');
    const tbody = document.createElement('tbody');

    const headerRow = document.createElement('tr');
    for (const key in data[0]) {
        const th = document.createElement('th');
        th.textContent = key;
        th.classList.add('th');
        headerRow.appendChild(th);
    }
    thead.appendChild(headerRow);

    data.forEach((row, index) => {
        const tr = document.createElement('tr');
        tr.classList.add(index % 2 === 0 ? 'gray-row' : 'white-row');
        for (const key in row) {
            const td = document.createElement('td');
            td.classList.add('td');
            if (row[key] == null) {
                td.textContent = 'NULL';
                td.classList.add('text-null');
            } else {
                td.textContent = row[key];
            }
            if (td.textContent.toString().length > 45) {
                td.classList.add('text-long');
                td.title = td.textContent;
            }
            tr.appendChild(td);
        }
        tbody.appendChild(tr);
    });

    table.appendChild(thead);
    table.appendChild(tbody);
    tableContainer.appendChild(table);

    return tableContainer;
}

function displayNoData() {
    const noData = document.createElement('div');
    noData.textContent = 'No data';
    noData.classList.add('no-data');
    sqlResults.appendChild(noData);
}

function displayError(rawData) {
    const errorDetails = document.createElement('details');
    errorDetails.classList.add('error-details');
    const errorSummary = document.createElement('summary');
    errorSummary.classList.add('error-summary');
    errorSummary.textContent = 'Error';
    errorDetails.appendChild(errorSummary);
    const errorPre = document.createElement('pre');
    errorPre.classList.add('error-pre');
    let errorText = rawData.sqlMessage.replace(/; /g, ';\n').replace(/\n/g, '<br>');
    errorPre.innerHTML = errorText;
    errorDetails.appendChild(errorPre);
    sqlResults.appendChild(errorDetails);
}

function displayInfo(rawData) {
    const infoDetails = document.createElement('details');
    infoDetails.classList.add('info-details');
    const infoSummary = document.createElement('summary');
    infoSummary.classList.add('info-summary');
    infoSummary.textContent = 'Query executed successfully';
    infoDetails.appendChild(infoSummary);
    const infoPre = document.createElement('pre');
    infoPre.classList.add('info-pre');
    let infoText = jsonToText(rawData);
    infoPre.innerHTML = infoText;
    infoDetails.appendChild(infoPre);
    sqlResults.appendChild(infoDetails);
}

function jsonToText(obj) {
    let result = '';
    for (let prop in obj) {
        if (typeof obj[prop] === 'object' && obj[prop] !== null) {
            result += prop + ':\n';
            if (Object.keys(obj[prop]).length !== 0) {
                result += jsonToText(obj[prop]);
            }
        } else {
            result += prop + ': ' + obj[prop] + '\n';
        }
    }
    return result;
}

function handleHTMXSwap() {
    const rawData = JSON.parse(sqlResults.innerHTML);
    sqlResults.innerHTML = '';

    if (Array.isArray(rawData)) {
        if (rawData.length > 0) {
            const table = createTable(rawData);
            sqlResults.appendChild(table);
        } else {
            displayNoData();
        }
    } else if (typeof rawData === 'object' && rawData.sqlMessage) {
        displayError(rawData);
    } else if (typeof rawData === 'object' && rawData.fieldCount !== undefined) {
        displayInfo(rawData);
    } else if (
        Array.isArray(rawData.recordsets) &&
        Array.isArray(rawData.recordsets[0]) &&
        rawData.recordsets[0].length > 0
    ) {
        const table = createTable(rawData.recordsets[0]);
        sqlResults.appendChild(table);
    } else if (typeof rawData === 'object' && rawData.info) {
        displayInfo(rawData);
    } else {
        sqlResults.innerHTML = rawData;
    }
}

function changeHeaderText() {
    var urlParams = new URLSearchParams(window.location.search);
    var databaseType = urlParams.get('databaseType');
    if (databaseType === 'mssql') {
        document.querySelector('.header-text').textContent = 'MSSQL';
    } else if (databaseType === 'mysql') {
        document.querySelector('.header-text').textContent = 'MySQL';
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

darkModeToggle.addEventListener('click', toggleDarkMode);

textarea.addEventListener('input', () => {
    const numberOfLines = textarea.value.split('\n').length;
    textarea.rows = numberOfLines + 1;
});

sqlResults.addEventListener('htmx:afterSwap', handleHTMXSwap);
window.addEventListener('DOMContentLoaded', changeHeaderText);