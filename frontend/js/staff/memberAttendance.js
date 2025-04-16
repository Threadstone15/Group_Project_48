export function initStaff_memberAttendance() {
    console.log("Initializing member attendance");

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
            nextScanBtn.disabled = true;
            scannedData = null;
        }

        function enableArrivalLeaveButtons() {
            arrivalBtn.disabled = false;
            leaveBtn.disabled = false;
        }

        function disableAllButtons() {
            arrivalBtn.disabled = true;
            leaveBtn.disabled = true;
            nextScanBtn.disabled = true;
        }

        async function startScanner() {
            if (codeReader) await stopScanner();

            disableAllButtons(); // prevent multiple scans

            try {
                codeReader = new ZXing.BrowserMultiFormatReader();
                const devices = await codeReader.listVideoInputDevices();
                selectedDeviceId = devices[0]?.deviceId;

                if (!selectedDeviceId) {
                    showToast("No camera found", "error");
                    return;
                }

                await codeReader.decodeFromVideoDevice(selectedDeviceId, videoElement, (result, err) => {
                    if (result) {
                        scannedData = result.getText();
                        console.log("Scanned:", scannedData);
                        showToast("Scanned Successfully", "success");
                        stopScanner();
                        enableArrivalLeaveButtons();
                    }

                    if (err && !(err instanceof ZXing.NotFoundException)) {
                        console.warn("Scan Error:", err);
                    }
                });

                console.log("Scanner started");
            } catch (err) {
                console.error("Failed to start scanner:", err);
                showToast(`Scanner Error: ${err.message}`, "error");
            }
        }

        async function sendAttendanceRequest(data, arrived) {
            try {
                const authToken = localStorage.getItem("authToken");
                if (!authToken) throw new Error("Auth token not found. Please log in.");
                
                const now = new Date();
                const date = now.toISOString().split("T")[0]; // YYYY-MM-DD
                const time = now.toTimeString().split(" ")[0]; // HH:MM:SS

                const requestOptions = {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${authToken}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        data: data,
                        arrived: arrived,
                        date: date,
                        time: time
                    })
                };

                const response = await fetch("http://localhost:8080/Group_Project_48/backend/api/controllers/staffController.php?action=mark_attendance", requestOptions);

                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`Request failed: ${errorText}`);
                }

                const result = await response.json();
                console.log("Server Response:", result);
                showToast("Attendance marked successfully", "success");


            } catch (error) {
                console.error("Error:", error);
                showToast(`Error: ${error.message}`, "error");

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
            disableAllButtons();
            startScanner();
        });

        closeBtn.addEventListener('click', async () => {
            await stopScanner();
            modal.style.display = 'none';
            resetScannerUI();
        });

        nextScanBtn.addEventListener('click', () => {
            resetScannerUI();
            startScanner();
        });

        arrivalBtn.addEventListener('click', () => {
            if (scannedData) {
                sendAttendanceRequest(scannedData, 1); // arrived = true
            }
            nextScanBtn.disabled = false;
        });

        leaveBtn.addEventListener('click', () => {
            if (scannedData) {
                sendAttendanceRequest(scannedData, 0); // arrived = false
            }
            nextScanBtn.disabled = false;
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeBtn.click();
            }
        });
    }

    function showToast(message, type = 'success') {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerText = message;

        container.appendChild(toast);

        setTimeout(() => {
            toast.remove();
        }, 4000);
    }
}
