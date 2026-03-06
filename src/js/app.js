const API_ENDPOINT = 'https://models.github.ai/inference/chat/completions';

let uploadedImages = [];
let lastPrompt = "";

// --- SELEZIONE ELEMENTI ---
const imageUpload = document.getElementById('imageUpload');
const imagePreview = document.getElementById('imagePreview');
const promptInput = document.getElementById('promptInput');
const resultsDiv = document.getElementById('analysisResults');

const ACTION_PROMPTS = {
    RECYCLE: "suggerisciun modo per riciclarel'oggeto nell’immagine",
    REUSE: "suggerisci un modo per riutillizare l'oggeto nell’immagine, ",
    REDUCE: "suggerisci un modo per ridurre l'utilizzo dell'oggeto nell’immagine",
    OTHER: "Devi trovare altre soluzioni diverse da ridurre, riusare e riciclare per l'oggetto nell'immagine"
};

const DEFAULT_SYSTEM_PROMPT = "Sei un assistente ambientale, qunado rispondi DEVI rispondere con l'uso di icone, spiegando tutto con punti chiave in grassetto. SE NEL IMMAGGINE VEDI PERSONE O ANIMALI RICORDA CHE NON PUOI RISPONDERE";

// --- EVENT LISTENERS ---

// 1. Caricamento Foto
document.getElementById('addPhotoBtn').addEventListener('click', () => imageUpload.click());
imageUpload.addEventListener('change', handleImageUpload);
document.getElementById('settingsBtn').addEventListener('click', () => {
    if (typeof window.showProjectDialog === 'function') {
        window.showProjectDialog();
    }
});

// 2. Pulsanti Azione (Recycle, Reuse, ecc.)
//    Nota: la seguente if controlla se il browser è considerato
//    mobile basandosi sulla larghezza interna della finestra. Se
//    vuoi modificare l'area di attivazione, cambia il valore 768.
//    Questa è la parte JS che distingue PC da mobile.
//    Se vuoi disabilitare completamente questa distinzione, puoi rimuovere la condizione e lasciare solo il codice all'interno.
document.querySelectorAll('.action-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const type = btn.getAttribute('data-type');
        const promptValue = ACTION_PROMPTS[type] || "";
        lastPrompt = promptValue;
        analyzeWithPrompt(promptValue);
    });
});

// 3. Invio manuale (Freccia in basso)
//document.getElementById('sendPromptBtn').addEventListener('click', () => analyzeWithPrompt());

// 4. Refresh / Trash (Pulisce tutto)
document.getElementById('refreshBtn').addEventListener('click', resetApp);

// 5. Copia Risultato
document.getElementById('copyBtn').addEventListener('click', () => {
    navigator.clipboard.writeText(resultsDiv.innerText);
    alert("Testo copiato!");
});

// 6. Retry (Ripete l'ultima analisi)
document.getElementById('retryBtn').addEventListener('click', () => {

    analyzeWithPrompt(null);

});

// --- FUNZIONI ---

function handleImageUpload(event) {
    const files = event.target.files;
    Array.from(files).forEach(file => {
        const reader = new FileReader();

        reader.onload = (e) => {
            addImageFromDataUrl(e.target.result);
        };

        reader.readAsDataURL(file);
    });
}

function addImageFromDataUrl(dataUrl) {
    if (!dataUrl) return;
    uploadedImages = [dataUrl];
    renderPreviews();
}

function renderPreviews() {
    imagePreview.innerHTML = '';

    if (uploadedImages.length === 0) {
        imagePreview.innerHTML = '<span class="box-label">add photo</span>';
        return;
    }

    const img = document.createElement('img');
    img.src = uploadedImages[uploadedImages.length - 1];
    img.className = 'preview-image';
    imagePreview.appendChild(img);
}

async function analyzeWithPrompt(overridePrompt = null) {
    const text = overridePrompt || lastPrompt;
    const apiKey = sessionStorage.getItem('snapRecycleApiKey') || '';

    if (uploadedImages.length === 0) return alert("Carica prima una foto!");
    if (!apiKey) return alert("Inserisci prima la API key nel dialog iniziale.");
    if (!text && !overridePrompt) return alert("Prima premi un pulsante azione.");

    resultsDiv.innerHTML = "<em>Analizzando...</em>";

    const content = [{ type: "text", text: text }];
    uploadedImages.forEach(base64 => {
        content.push({ type: "image_url", image_url: { url: base64 } });
    });

    try {
        const response = await fetch(API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: "gpt-4o",
                messages: [
                    { role: "system", content: DEFAULT_SYSTEM_PROMPT },
                    { role: "user", content: content }
                ]
            })
        });

        const data = await response.json();
        // take the generated text and strip common markdown characters
        let result = data.choices[0].message.content || "";
        // remove markdown formatting characters such as *, _, `, #, ~
        result = result.replace(/([*_`#~])/g, "");
        resultsDiv.innerText = result;
        // salva nella cronologia
        saveToHistory(uploadedImages[uploadedImages.length - 1], result);
    } catch (err) {
        resultsDiv.innerText = "Errore di connessione all'API.";
    }


}

function resetApp() {
    uploadedImages = [];
    renderPreviews();
    resultsDiv.innerText = "";
    promptInput.value = "";
}



window.addImageFromDataUrl = addImageFromDataUrl;


// ==========================
// HISTORY SYSTEM
// ==========================

const historyPanel = document.getElementById("historyPanel");
let historyItems = JSON.parse(localStorage.getItem("snapRecycleHistory")) || [];

const leftPanel = document.querySelector('.left-panel');
const rightPanel = document.querySelector('.right-panel');
const mobileHistoryQuery = window.matchMedia('(max-width: 640px)');
const historyOriginalParent = historyPanel ? historyPanel.parentElement : null;
const historyOriginalNextSibling = historyPanel ? historyPanel.nextSibling : null;

function updateHistoryPanelPosition() {
    if (!historyPanel || !leftPanel || !rightPanel || !historyOriginalParent) return;

    if (mobileHistoryQuery.matches) {
        rightPanel.insertAdjacentElement('afterend', historyPanel);
        return;
    }

    if (historyOriginalNextSibling && historyOriginalNextSibling.parentNode === historyOriginalParent) {
        historyOriginalParent.insertBefore(historyPanel, historyOriginalNextSibling);
    } else {
        historyOriginalParent.appendChild(historyPanel);
    }
}

if (typeof mobileHistoryQuery.addEventListener === 'function') {
    mobileHistoryQuery.addEventListener('change', updateHistoryPanelPosition);
} else {
    mobileHistoryQuery.addListener(updateHistoryPanelPosition);
}

updateHistoryPanelPosition();

// salva immagine + risposta
function saveToHistory(image, result) {

    const item = {
        image: image,
        result: result,
        time: new Date().toISOString()
    };

    historyItems.unshift(item);

    // limite cronologia (10 elementi)
    if (historyItems.length > 10) {
        historyItems.pop();
    }

    localStorage.setItem("snapRecycleHistory", JSON.stringify(historyItems));

    renderHistory();
}

// mostra cronologia
function renderHistory() {

    historyPanel.innerHTML = "";

    if (historyItems.length === 0) {
        historyPanel.innerHTML = '<span class="box-label">Cronologia</span>';
        return;
    }

    historyItems.forEach((item, index) => {

        const itemContainer = document.createElement("div");
        itemContainer.className = "history-item";

        const img = document.createElement("img");
        img.src = item.image;
        img.className = "history-image";

        img.addEventListener("click", () => {

            // ricarica immagine
            uploadedImages = [item.image];
            renderPreviews();

            // ricarica risultato
            resultsDiv.innerText = item.result;

        });

        const removeBtn = document.createElement("button");
        removeBtn.className = "history-remove-btn";
        removeBtn.innerHTML = "×";
        removeBtn.title = "Remove from history";
        removeBtn.addEventListener("click", (e) => {
            e.stopPropagation(); // prevent triggering the image click
            removeFromHistory(index);
        });

        itemContainer.appendChild(img);
        itemContainer.appendChild(removeBtn);
        historyPanel.appendChild(itemContainer);
    });
}

// carica cronologia all'avvio
renderHistory();

// rimuovi elemento dalla cronologia
function removeFromHistory(index) {
    historyItems.splice(index, 1);
    localStorage.setItem("snapRecycleHistory", JSON.stringify(historyItems));
    renderHistory();
}

