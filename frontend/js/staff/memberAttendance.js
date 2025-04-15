export function initStaff_memberAttendance() {
    console.log("Initializing member attendance");

    // Dynamically load ZXing library
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/@zxing/library@latest';
    script.onload = setupScanner;
    script.onerror = () => console.error('Failed to load ZXing library');
    document.head.appendChild(script);

    function setupScanner() {
        const modal = document.getElementById("qrModal");
        const markBtn = document.getElementById("markAttendanceBtn");
        const closeBtn = document.querySelector(".close-btn");
        const arrivalBtn = document.getElementById("arrivalBtn");
        const leaveBtn = document.getElementById("leaveBtn");
        const startScanBtn = document.getElementById("startScanBtn");
        const nextScanBtn = document.getElementById("nextScanBtn");
        const videoElement = document.getElementById("qr-video");

        let codeReader = null;
        let selectedDeviceId = null;
        let scannedData = null;

        function resetScannerUI() {
            arrivalBtn.disabled = true;
            leaveBtn.disabled = true;
            scannedData = null;
        }

        async function startScanner() {
            if (codeReader) {
                await stopScanner(); // Stop if running
            }

            try {
                codeReader = new ZXing.BrowserMultiFormatReader();

                const videoInputDevices = await codeReader.listVideoInputDevices();
                selectedDeviceId = videoInputDevices[0]?.deviceId;

                if (!selectedDeviceId) {
                    alert("No camera device found");
                    return;
                }

                await codeReader.decodeFromVideoDevice(
                    selectedDeviceId,
                    videoElement,
                    (result, err) => {
                        if (result) {
                            scannedData = result.getText();
                            console.log("Scanned:", scannedData);
                            stopScanner();
                            arrivalBtn.disabled = false;
                            leaveBtn.disabled = false;
                        }

                        if (err && !(err instanceof ZXing.NotFoundException)) {
                            console.warn("Scan Error:", err);
                        }
                    }
                );

                console.log("ZXing Scanner started");
            } catch (err) {
                console.error("Failed to start scanner:", err);
                alert(`Scanner Error: ${err.message}`);
            }
        }

        async function stopScanner() {
            if (codeReader) {
                await codeReader.reset();
                codeReader = null;
                console.log("Scanner stopped");
            }
        }

        // Event bindings
        markBtn.addEventListener('click', () => {
            modal.style.display = 'flex';
            setTimeout(startScanner, 100);
        });

        closeBtn.addEventListener('click', async () => {
            await stopScanner();
            modal.style.display = 'none';
            resetScannerUI();
        });

        startScanBtn.addEventListener('click', startScanner);
        nextScanBtn.addEventListener('click', () => {
            resetScannerUI();
            startScanner();
        });

        arrivalBtn.addEventListener('click', () => {
            if (scannedData) {
                alert(`Marked arrival for: ${scannedData}`);
                resetScannerUI();
            }
        });

        leaveBtn.addEventListener('click', () => {
            if (scannedData) {
                alert(`Marked departure for: ${scannedData}`);
                resetScannerUI();
            }
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeBtn.click();
            }
        });
    }
}
