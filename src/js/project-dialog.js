const PROJECT_DIALOG_IMAGE = 'img/image-1.png';
const PROJECT_DIALOG_OVERLAY_ID = 'projectDialogOverlay';

function showProjectDialog() {
    const existingOverlay = document.getElementById(PROJECT_DIALOG_OVERLAY_ID);
    if (existingOverlay) return;

    const overlay = document.createElement('div');
    overlay.id = PROJECT_DIALOG_OVERLAY_ID;
    overlay.style.cssText = `
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.65);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        padding: 20px;
    `;

    const dialog = document.createElement('div');
    dialog.style.cssText = `
        width: min(90vw, 760px);
        max-height: 90vh;
        overflow: auto;
        background: #d9d9d9;
        border-radius: 20px;
        padding: 20px;
        color: #2f4f00;
        text-align: center;
    `;

    const image = document.createElement('img');
    image.src = PROJECT_DIALOG_IMAGE;
    image.alt = 'Project image 1024x1024';
    image.width = 1024;
    image.height = 1024;
    image.style.cssText = `
        width: min(100%, 420px);
        height: auto;
        aspect-ratio: 1 / 1;
        object-fit: cover;
        border-radius: 12px;
        display: block;
        margin: 0 auto 16px auto;
    `;

    const text = document.createElement('p');
    text.textContent = 'Questo progetto aiuta a capire come riciclare, riusare o ridurre i rifiuti analizzando foto.';
    text.style.cssText = 'font-size: 16px; line-height: 1.4; margin-bottom: 16px;';

    const apiKeyInput = document.createElement('input');
    apiKeyInput.type = 'password';
    apiKeyInput.placeholder = 'Inserisci API Key';
    apiKeyInput.value = sessionStorage.getItem('snapRecycleApiKey') || '';
    apiKeyInput.style.cssText = `
        width: min(100%, 420px);
        padding: 12px 14px;
        border: 1px solid #2f4f00;
        border-radius: 30px;
        outline: none;
        margin: 0 auto 16px auto;
        display: block;
    `;

    const apiKeyLabel = document.createElement('label');
    apiKeyLabel.textContent = 'API Key';
    apiKeyLabel.setAttribute('for', 'apiKeyInput');
    apiKeyLabel.style.cssText = `
        width: min(100%, 420px);
        display: block;
        margin: 0 auto 8px auto;
        text-align: left;
        font-weight: 700;
    `;

    apiKeyInput.id = 'apiKeyInput';

    const okButton = document.createElement('button');
    okButton.type = 'button';
    okButton.textContent = 'OK';
    okButton.style.cssText = `
        padding: 12px 22px;
        border: none;
        border-radius: 30px;
        background: #2f4f00;
        color: #ffffff;
        font-weight: 700;
        cursor: pointer;
    `;

    const closeDialog = () => {
        if (!overlay.parentNode) return;
        overlay.remove();
    };

    okButton.addEventListener('click', (event) => {
        event.stopPropagation();
        const apiKey = apiKeyInput.value.trim();
        if (!apiKey) {
            alert('Inserisci la API key prima di continuare.');
            apiKeyInput.focus();
            return;
        }
        sessionStorage.setItem('snapRecycleApiKey', apiKey);
        closeDialog();
    });

    dialog.addEventListener('click', (event) => {
        event.stopPropagation();
    });

    dialog.appendChild(image);
    dialog.appendChild(text);
    dialog.appendChild(apiKeyLabel);
    dialog.appendChild(apiKeyInput);
    dialog.appendChild(okButton);
    overlay.appendChild(dialog);
    document.body.appendChild(overlay);
}

window.showProjectDialog = showProjectDialog;
window.addEventListener('DOMContentLoaded', showProjectDialog);
