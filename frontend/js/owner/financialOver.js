//import Chart from "https://cdn.jsdelivr.net/npm/chart.js";

export function initOwner_financialOver() {
    const totalIncome = document.getElementById("totalIncome");
    const periodSelector = document.getElementById("periodSelector");
    const monthSelectorContainer = document.getElementById("monthSelectorContainer");
    const monthSelector = document.getElementById("monthSelector");
    const incomeChartCanvas = document.getElementById("incomeChart").getContext("2d");

    let incomeChart;
    let payments = [];

    function fetchPaymentsFromBackend(callback) {
        const authToken = localStorage.getItem("authToken");
        if (!authToken) {
            console.error("Auth token not found. Please log in.");
            return;
        }

        const requestOptions = {
            method: "GET",
            headers: { Authorization: `Bearer ${authToken}` },
            redirect: "follow",
        };

        fetch("http://localhost:8080/Group_Project_48/backend/api/controllers/ownerController.php?action=get_all_payments", requestOptions)
            .then((response) => {
                if (!response.ok) throw new Error("Failed to fetch payments");
                return response.json();
            })
            .then((data) => {
                console.log("Fetched payment data:", data);
                if (Array.isArray(data)) {
                    payments = data;
                } else if (Array.isArray(data.data)) {
                    payments = data.data;
                } else {
                    console.error("Unexpected data format", data);
                    payments = [];
                }

                if (callback) callback();
            })
            .catch((error) => console.error("Error fetching payments:", error));
    }

    function calculateIncome(period, month = null) {
        const now = new Date();
        const currentYear = now.getFullYear();

        let filteredPayments = payments.filter(p => p["Amount"] && p["Date"]);

        console.log(filteredPayments);

        if (period === "monthly") {
            filteredPayments = filteredPayments.filter(payment => {
                const date = new Date(payment["Date"]);
                return date.getFullYear() === currentYear && (date.getMonth() + 1) === parseInt(month);

            });
        } else if (period === "annual") {
            filteredPayments = filteredPayments.filter(payment => {
                const date = new Date(payment.date);
                return date.getFullYear() === currentYear;
            });
        }

        const total = filteredPayments.reduce((sum, payment) => sum + parseFloat(payment["Amount"]), 0);

        totalIncome.textContent = `Total Income: Rs.${total.toFixed(2)}`;

        // For graph data
        const chartData = {};
        filteredPayments.forEach(payment => {
            const date = new Date(payment.date);
            const key = (period === "monthly")
                ? `${date.getDate()}`
                : `${date.getMonth() + 1}`;

            chartData[key] = (chartData[key] || 0) + parseFloat(payment.amount);
        });

        const labels = Object.keys(chartData).sort((a, b) => parseInt(a) - parseInt(b));
        const incomeData = labels.map(label => chartData[label]);

        renderGraph(labels, incomeData, period);
    }

    function renderGraph(labels, data, period) {
        if (incomeChart) {
            incomeChart.destroy();
        }

        incomeChart = new Chart(incomeChartCanvas, {
            type: 'bar',
            data: {
                labels,
                datasets: [{
                    label: 'Income',
                    data,
                    backgroundColor: 'rgba(75, 192, 192, 0.3)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1,
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: `Income - ${period.charAt(0).toUpperCase() + period.slice(1)}`
                    }
                }
            }
        });
    }

    periodSelector.addEventListener("change", () => {
        const selectedPeriod = periodSelector.value;
        if (selectedPeriod === "monthly") {
            monthSelectorContainer.style.display = "block";
            calculateIncome("monthly", monthSelector.value);
        } else {
            monthSelectorContainer.style.display = "none";
            calculateIncome("annual");
        }
    });

    monthSelector.addEventListener("change", () => {
        calculateIncome("monthly", monthSelector.value);
    });

    fetchPaymentsFromBackend(() => {
        const currentMonth = new Date().getMonth() + 1;
        monthSelector.value = currentMonth.toString().padStart(2, '0');
        calculateIncome("monthly", currentMonth);
    });
}
