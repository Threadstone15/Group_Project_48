export function initOwner_analytics() {
    console.log("Initializing analytics overview");

    let latestAnalyticsData = null;
    let chartInstance = null;

    // DOM Elements
    const totalCountElement = document.getElementById("totalCount");
    const periodButtons = document.querySelectorAll(".infoBtn");

    // Default fetch for Today
    if (periodButtons.length > 0) setActiveButton(periodButtons[0]);
    fetchAndRenderAnalytics("Today");

    // Attach event listeners to period buttons
    periodButtons.forEach(button => {
        button.addEventListener("click", () => {
            const selectedPeriod = button.id;
            setActiveButton(button);
            fetchAndRenderAnalytics(selectedPeriod);
        });
    });

    function setActiveButton(activeBtn) {
        periodButtons.forEach(btn => btn.classList.remove("active"));
        activeBtn.classList.add("active");
    }

    // Load Chart.js dynamically
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.js";
    let chartLoaded = false;

    script.onload = () => {
        console.log("Chart.js loaded dynamically");
        chartLoaded = true;
        if (latestAnalyticsData) renderChart(latestAnalyticsData);
    };

    script.onerror = () => {
        console.error("Failed to load Chart.js");
    };

    document.head.appendChild(script);

    // Fetch data from backend
    async function fetchAndRenderAnalytics(period) {
        try {
            const response = await fetch(`http://localhost:8080/Group_Project_48/backend/api/controllers/attendanceOverviewController.php?period=${period}`);
            const result = await response.json();

            console.log("Analytics Result:", result);

            if (result.status === "success") {
                const { labels, attendance_count: values } = result.data;
                const total = result.total || 0;
                totalCountElement.textContent = `${total} attendances`;

                latestAnalyticsData = { labels, values, period };

                if (chartLoaded) {
                    renderChart(latestAnalyticsData);
                } else {
                    console.warn("Chart.js not loaded yet");
                }
            } else {
                console.error("Backend Error:", result.message);
            }
        } catch (error) {
            console.error("Fetch error:", error);
        }
    }

    // Render chart with Chart.js
    function renderChart({ labels, values, period }) {
        const ctx = document.getElementById("attendanceChart");
        if (!ctx) {
            console.error("Canvas element not found for chart");
            return;
        }

        if (chartInstance) {
            chartInstance.destroy();
        }

        chartInstance = new Chart(ctx, {
            type: "line",
            data: {
                labels: labels,
                datasets: [
                    {
                        label: `Attendance - ${period}`,
                        data: values,
                        fill: false, // Don't fill under the line
                        backgroundColor: "rgba(75, 192, 192, 0.5)",
                        borderColor: "rgba(75, 192, 192, 1)",
                        tension: 0.3, // Optional: smooth out the line
                        pointBackgroundColor: "rgba(75, 192, 192, 1)",
                        pointBorderColor: "#fff",
                        pointRadius: 4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: "top" },
                    title: {
                        display: true,
                        text: `Attendance Overview - ${period}`
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: "Number of Attendances"
                        }
                    }
                }
            }
        });
        console.log("Chart rendered successfully");        
    }

    
    function loadHtml2PdfScript() {
        return new Promise((resolve, reject) => {
            if (window.html2pdf) {
                resolve();
                return;
            }
            const script = document.createElement("script");
            script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }


    //extra functionality for pdf download
    const pdfBtn = document.getElementById("pdfBtn");

    if (pdfBtn) {
        pdfBtn.addEventListener("click", async () => {
            console.log("PDF button clicked");
        
            try {
                await loadHtml2PdfScript();
        
                const contentElement = document.querySelector(".content-container");
                const pdfButton = document.getElementById("pdfBtn");
                const filterButtons = document.querySelector(".button-container-chart");
        
                // Hide the PDF button and filter buttons
                pdfButton.style.display = "none";
                if (filterButtons) filterButtons.style.display = "none";
        
                const opt = {
                    margin: 0.5,
                    filename: `attendance-report-${new Date().toISOString().split('T')[0]}.pdf`,
                    image: { type: 'jpeg', quality: 0.98 },
                    html2canvas: { scale: 2 },
                    jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
                };
        
                await html2pdf().set(opt).from(contentElement).save();
        
                // Restore visibility
                pdfButton.style.display = "inline-block";
                if (filterButtons) filterButtons.style.display = "flex";
        
            } catch (error) {
                console.error("PDF generation failed:", error);
                // Restore just in case
                pdfButton.style.display = "inline-block";
                if (filterButtons) filterButtons.style.display = "flex";
            }
        });
        
}



    
    
}
