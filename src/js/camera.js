const cameraBtn = document.getElementById('cameraBtn');

function stopCameraStream(stream) {
    if (!stream) return;
    stream.getTracks().forEach(track => track.stop());
}

function removeCameraOverlay(overlay, stream) {
    stopCameraStream(stream);
    if (overlay && overlay.parentNode) {
        overlay.parentNode.removeChild(overlay);
    }
}

async function openCameraCapture() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert('La fotocamera non è supportata su questo browser.');
        return;
    }

    let stream;
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed; inset:0; background:rgba(0,0,0,0.75); display:flex; align-items:center; justify-content:center; z-index:9999;';

    const panel = document.createElement('div');
    panel.style.cssText = 'background:#d9d9d9; border-radius:16px; padding:16px; width:min(92vw, 560px);';

    const video = document.createElement('video');
    video.setAttribute('autoplay', 'true');
    video.setAttribute('playsinline', 'true');
    video.style.cssText = 'width:100%; border-radius:12px; background:#000;';

    const actions = document.createElement('div');
    actions.style.cssText = 'display:flex; justify-content:flex-end; gap:10px; margin-top:12px;';

    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = 'Cancel';
    cancelBtn.style.cssText = 'padding:10px 14px; border:none; border-radius:10px; cursor:pointer;';

    const captureBtn = document.createElement('button');
    captureBtn.textContent = 'Capture';
    captureBtn.style.cssText = 'padding:10px 14px; border:none; border-radius:10px; cursor:pointer;';

    actions.appendChild(cancelBtn);
    actions.appendChild(captureBtn);
    panel.appendChild(video);
    panel.appendChild(actions);
    overlay.appendChild(panel);
    document.body.appendChild(overlay);

    try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        video.srcObject = stream;
    } catch (err) {
        removeCameraOverlay(overlay, stream);
        alert('Impossibile accedere alla fotocamera. Controlla i permessi del browser.');
        return;
    }

    cancelBtn.addEventListener('click', () => {
        removeCameraOverlay(overlay, stream);
    });

    captureBtn.addEventListener('click', () => {
        if (!video.videoWidth || !video.videoHeight) return;

        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const context = canvas.getContext('2d');
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.92);

        if (typeof window.addImageFromDataUrl === 'function') {
            window.addImageFromDataUrl(dataUrl);
        }

        removeCameraOverlay(overlay, stream);
    });

    overlay.addEventListener('click', (event) => {
        if (event.target === overlay) {
            removeCameraOverlay(overlay, stream);
        }
    });
}

if (cameraBtn) {
    cameraBtn.addEventListener('click', openCameraCapture);
}
