export function initStaff_memberAttendance() {
    console.log("Initializing member attendance");

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/@zxing/library@latest';
    script.onload = setupScanner;
    script.onerror = () => console.error('Failed to load ZXing library');
    document.head.appendChild(script);

    function setupScanner() {
        const modal = document.getElementById("qrModal");
        const manualModal = document.getElementById("manualModal");
        const markBtn = document.getElementById("markAttendanceBtn");
        const manualBtn = document.getElementById("manualAttendanceBtn");
        const closeBtn = document.querySelector(".close-btn");
        const manualCloseBtn = document.querySelector(".manual-close");
        const arrivalBtn = document.getElementById("arrivalBtn");
        const leaveBtn = document.getElementById("leaveBtn");
        const nextScanBtn = document.getElementById("nextScanBtn");
        const submitManualBtn = document.getElementById("submitManualAttendance");
        const videoElement = document.getElementById("qr-video");
        const memberIdInput = document.getElementById("memberId");
        const attendanceTableBody = document.getElementById("attendanceTableBody");

        let codeReader = null;
        let selectedDeviceId = null;
        let scannedData = null;

        // Initialize
        fetchAttendanceData();

        // ===== Functions =====

        function resetScannerUI() {
            arrivalBtn.disabled = true;
            leaveBtn.disabled = true;
            nextScanBtn.disabled = true;
            scannedData = null;
        }

        function enableArrivalLeaveButtons() {
            arrivalBtn.disabled = false;
            leaveBtn.disabled = false;
            nextScanBtn.disabled = false;
        }

        function disableAllButtons() {
            arrivalBtn.disabled = true;
            leaveBtn.disabled = true;
            nextScanBtn.disabled = true;
        }

        async function startScanner() {
            if (codeReader) await stopScanner();

            disableAllButtons();

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

        async function stopScanner() {
            if (codeReader) {
                await codeReader.reset();
                codeReader = null;
                console.log("Scanner stopped");
            }
        }

        async function sendAttendanceRequest(data, arrived) {
            try {
                showLoading(true);
                const authToken = localStorage.getItem("authToken");
                if (!authToken) throw new Error("Auth token not found. Please log in.");

                const now = new Date();
                const date = now.toISOString().split("T")[0];
                const time = now.toTimeString().split(" ")[0];

                const requestOptions = {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${authToken}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        member_id: data,
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
                fetchAttendanceData();
            } catch (error) {
                console.error("Error:", error);
                showToast(`Error: ${error.message}`, "error");
            } finally {
                showLoading(false);
            }
        }

        async function sendManualAttendanceRequest(memberId, arrived) { 
            try {
                showLoading(true);
                const authToken = localStorage.getItem("authToken");
                if (!authToken) throw new Error("Auth token not found. Please log in.");

                const now = new Date();
                const date = now.toISOString().split("T")[0];
                const time = now.toTimeString().split(" ")[0];

                const requestOptions = {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${authToken}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        member_id: data,
                        arrived: arrived,
                        date: date,
                        time: time
                    })
                };

                const response = await fetch("http://localhost:8080/Group_Project_48/backend/api/controllers/staffController.php?action=mark_attendance_manual", requestOptions);

                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`Request failed: ${errorText}`);
                }

                const result = await response.json();
                console.log("Server Response:", result);
                showToast("Attendance marked successfully", "success");
                fetchAttendanceData();
            } catch (error) {
                console.error("Error:", error);
                showToast(`Error: ${error.message}`, "error");
            } finally {
                showLoading(false);
            }
        }
        
        async function fetchAttendanceData() {
            try {
                showLoading(true);
                const authToken = localStorage.getItem("authToken");
                if (!authToken) throw new Error("Auth token not found. Please log in.");

                const requestOptions = {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${authToken}`
                    }
                };

                const response = await fetch("http://localhost:8080/Group_Project_48/backend/api/controllers/staffController.php?action=get_attendance", requestOptions);

                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`Request failed: ${errorText}`);
                }

                const result = await response.json();
                console.log("Attendance Data:", result);
                populateAttendanceTable(result.data || []);
            } catch (error) {
                console.error("Error fetching attendance data:", error);
                showToast(`Error: ${error.message}`, "error");
                populateAttendanceTable([]);
            } finally {
                showLoading(false);
            }
        }

        function populateAttendanceTable(members) {
            attendanceTableBody.innerHTML = '';

            if (members.length === 0) {
                const row = document.createElement('tr');
                row.innerHTML = '<td colspan="5" style="text-align: center;">No attendance records found</td>';
                attendanceTableBody.appendChild(row);
                return;
            }

            members.forEach(member => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${escapeHtml(member.member_id)}</td>
                    <td>${escapeHtml(member.name)}</td>
                    <td>${escapeHtml(member.arrival_time || '-')}</td>
                    <td>${escapeHtml(member.departure_time || '-')}</td>
                    <td>${getStatusText(member.status)}</td>
                `;
                attendanceTableBody.appendChild(row);
            });
        }

        function getStatusText(status) {
            switch (status) {
                case 'present': return 'Present';
                case 'left': return 'Left';
                case 'absent': return 'Absent';
                default: return status;
            }
        }

        function escapeHtml(unsafe) {
            if (unsafe === null || unsafe === undefined) return '';
            return unsafe.toString()
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#039;");
        }

        function showLoading(show) {
            const spinner = document.getElementById('loading-spinner');
            spinner.classList.toggle('hidden', !show);
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

        // ===== Event bindings =====

        markBtn.addEventListener('click', () => {
            modal.style.display = 'flex';
            disableAllButtons();
            startScanner();
        });

        manualBtn.addEventListener('click', () => {
            manualModal.style.display = 'flex';
            memberIdInput.value = '';
        });

        closeBtn.addEventListener('click', async () => {
            await stopScanner();
            modal.style.display = 'none';
            resetScannerUI();
        });

        manualCloseBtn.addEventListener('click', () => {
            manualModal.style.display = 'none';
        });

        nextScanBtn.addEventListener('click', () => {
            resetScannerUI();
            startScanner();
        });

        arrivalBtn.addEventListener('click', () => {
            if (scannedData) {
                sendAttendanceRequest(scannedData, 1);
            }
        });

        leaveBtn.addEventListener('click', () => {
            if (scannedData) {
                sendAttendanceRequest(scannedData, 0);
            }
        });

        submitManualBtn.addEventListener('click', () => {
            const memberId = memberIdInput.value.trim();
            const isArrival = document.getElementById('arrivalRadio').checked;

            if (!memberId) {
                showToast("Please enter a Member ID", "error");
                return;
            }

            if (!memberId.match(/^M\d+$/i)) {
                showToast("Invalid Member ID format (e.g. M14, M15)", "error");
                return;
            }

            sendManualAttendanceRequest(memberId.toUpperCase(), isArrival ? 1 : 0);
            manualModal.style.display = 'none';
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeBtn.click();
            }
        });

        manualModal.addEventListener('click', (e) => {
            if (e.target === manualModal) {
                manualCloseBtn.click();
            }
        });

        memberIdInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                submitManualBtn.click();
            }
        });
    }
}
