export function initOwner_financialOver() {
    console.log("Initializing financial overview");

    let latestData = null; // To store the latest data fetched from the API
    let selectedPeriod = "daily"; // track the current period selection
    let financialChart = null; // Chart instance

    // Dummy income data
    const dummyIncomeData = {
        daily: 12500,
        weekly: 87500,
        monthly: 375000
    };

    // DOM Elements
    const totalCountElement = document.getElementById("totalCount");
    const todayBtn = document.getElementById("daily");
    const weekBtn = document.getElementById("weekly");
    const monthBtn = document.getElementById("monthly");
    const incomeToggleBtn = document.getElementById("Income");
    const countToggleBtn = document.getElementById("Count");
    const growthToggleBtn = document.getElementById("Growth");

    // Default display
    if (totalCountElement) {
        totalCountElement.textContent = `Rs. ${dummyIncomeData.daily.toLocaleString()}`;
    }

    // Button Events for period selection
    if (todayBtn) {
        todayBtn.addEventListener("click", () => {
            setActiveButton(todayBtn);
            updateIncomeDisplay("daily");
        });
    }
    if (weekBtn) {
        weekBtn.addEventListener("click", () => {
            setActiveButton(weekBtn);
            updateIncomeDisplay("weekly");
        });
    }
    if (monthBtn) {
        monthBtn.addEventListener("click", () => {
            setActiveButton(monthBtn);
            updateIncomeDisplay("monthly");
        });
    }

    // Set default active button and load data/chart for daily
    if (todayBtn) {
        setActiveButton(todayBtn);
        updateIncomeDisplay("daily");
    }

    function setActiveButton(activeBtn) {
        document.querySelectorAll(".button-container button").forEach(btn => {
            btn.classList.remove("active");
        });
        activeBtn.classList.add("active");
    }

    async function updateIncomeDisplay(period) {
        selectedPeriod = period;

        try {
            const response = await fetch(
                `http://localhost:8080/Group_Project_48/backend/api/controllers/FinancialOverviewController.php?period=${period}`
            );
            const result = await response.json();
            console.log("Fetched Result:", result);

            if (result.status === "success") {
                const latestIncome = result.data.income[0] || 0;
                totalCountElement.textContent = `Rs. ${latestIncome.toLocaleString()}`;
                latestData = result.data;
                if (chartLoaded) {
                    setupCharts(); // re-render chart with new data
                }
                showToast("Financial data updated successfully", "success");
            } else {
                console.error("API Error:", result.message || "Unknown error from backend");
                showToast(result.message || "Failed to load financial data", "error");
            }
        } catch (error) {
            console.error("Fetch error:", error);
            showToast("Network error while fetching financial data", "error");
        }
    }

    // Load Chart.js dynamically
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.js";
    let chartLoaded = false;
    script.onload = () => {
        console.log("Chart.js loaded dynamically");
        chartLoaded = true;
        if (latestData) setupCharts();
    };
    script.onerror = () => console.error("Failed to load Chart.js");
    document.head.appendChild(script);

    function setupCharts() {
        const ctx = document.getElementById("financialChart");
        if (!ctx || !latestData) {
            console.warn("Cannot render chart: missing canvas or data.");
            return;
        }

        // Destroy existing chart instance before creating new one
        if (financialChart) {
            financialChart.destroy();
        }

        // Create new chart instance
        financialChart = new Chart(ctx, getChartConfig("income", latestData));

        // Attach toggle events (only once)
        if (!incomeToggleBtn.hasAttribute('data-listener')) {
            incomeToggleBtn.addEventListener("click", () => {
                financialChart.destroy();
                financialChart = new Chart(ctx, getChartConfig("income", latestData));
            });
            incomeToggleBtn.setAttribute('data-listener', 'true');
        }
        if (!countToggleBtn.hasAttribute('data-listener')) {
            countToggleBtn.addEventListener("click", () => {
                financialChart.destroy();
                financialChart = new Chart(ctx, getChartConfig("count", latestData));
            });
            countToggleBtn.setAttribute('data-listener', 'true');
        }
        if (!growthToggleBtn.hasAttribute('data-listener')) {
            growthToggleBtn.addEventListener("click", () => {
                financialChart.destroy();
                financialChart = new Chart(ctx, getChartConfig("growth", latestData));
            });
            growthToggleBtn.setAttribute('data-listener', 'true');
        }
    }

    function getChartConfig(type, data) {
        const commonOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: "top" },
                title: {
                    display: true,
                    text: `${type.charAt(0).toUpperCase() + type.slice(1)} Overview for ${
                        selectedPeriod.charAt(0).toUpperCase() + selectedPeriod.slice(1)
                    }`
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: type === "growth" ? "Growth (%)" : "Amount (Rs.)"
                    }
                }
            }
        };

        const datasetMap = {
            income: { label: "Income (Rs.)", data: data.income },
            count: { label: "Payment Counts", data: data.payment_count },
            growth: { label: "Growth (%)", data: data.growth_rate }
        };

        return {
            type: type === 'income' ? 'bar' : 'line',
            data: {
                labels: data.labels,
                datasets: [{
                    label: datasetMap[type].label,
                    data: datasetMap[type].data,
                    borderWidth: 1,
                    tension: type === 'income' ? 0 : 0.4,
                    fill: type !== 'income'
                }]
            },
            options: commonOptions
        };
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
    
    const pdfBtn = document.getElementById("pdfBtn");
    if (pdfBtn) {
        pdfBtn.addEventListener("click", async () => {
            console.log("PDF button clicked");
        
            // Show loading indicator
            const spinner = document.createElement('div');
            spinner.innerHTML = 'Generating PDF...';
            spinner.style.position = 'fixed';
            spinner.style.top = '50%';
            spinner.style.left = '50%';
            spinner.style.transform = 'translate(-50%, -50%)';
            spinner.style.padding = '20px';
            spinner.style.background = 'white';
            spinner.style.border = '1px solid #FF5F00';
            spinner.style.borderRadius = '5px';
            spinner.style.zIndex = '10000';
            spinner.style.color = '#FF5F00';
            spinner.style.fontFamily = 'Poppins, sans-serif';
            document.body.appendChild(spinner);
    
            try {
                await loadHtml2PdfScript();
                
                // Create a container for just the chart and its title
                const chartContainer = document.createElement('div');
                chartContainer.style.padding = '20px';
                chartContainer.style.backgroundColor = 'white';
                
                // Get the current chart title from the chart configuration
                const chartTitle = financialChart?.options?.plugins?.title?.text || 'Financial Chart';
                
                // Add title to our container
                const titleElement = document.createElement('h2');
                titleElement.textContent = chartTitle;
                titleElement.style.textAlign = 'center';
                titleElement.style.color = '#FF5F00';
                titleElement.style.marginBottom = '20px';
                chartContainer.appendChild(titleElement);
                
                // Convert canvas to image and add to container
                const canvas = document.getElementById('financialChart');
                if (canvas) {
                    await new Promise(resolve => setTimeout(resolve, 500)); // Wait for chart rendering
                    const imgData = canvas.toDataURL('image/png');
                    const img = document.createElement('img');
                    img.src = imgData;
                    img.style.maxWidth = '100%';
                    img.style.display = 'block';
                    img.style.margin = '0 auto';
                    chartContainer.appendChild(img);
                } else {
                    throw new Error('Chart not found');
                }
                
                // PDF options
                const opt = {
                    margin: 0.5,
                    filename: `financial-chart-${selectedPeriod}-${new Date().toISOString().split('T')[0]}.pdf`,
                    image: { type: 'jpeg', quality: 0.98 },
                    html2canvas: { 
                        scale: 2,
                        logging: true,
                        useCORS: true
                    },
                    jsPDF: { unit: 'in', format: 'a4', orientation: 'landscape' } // Landscape for better chart display
                };
                
                // Generate PDF
                await html2pdf().set(opt).from(chartContainer).save();
                
                showToast("Chart exported to PDF successfully", "success");
            } catch (error) {
                console.error("PDF generation failed:", error);
                showToast("Failed to export chart to PDF", "error");
            } finally {
                // Remove spinner
                spinner.remove();
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