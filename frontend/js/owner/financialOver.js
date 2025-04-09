export function initOwner_financialOver() {
    console.log("Initializing financial overview");

    // Always inject Chart.js
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.js";
    script.onload = () => {
        console.log("Chart.js loaded dynamically");
        drawChart();
    };
    script.onerror = () => {
        console.error("Failed to load Chart.js");
    };
    document.head.appendChild(script);

    function drawChart() {
        const totalIncomeDisplay = document.getElementById("totalIncomeDisplay");
        const totalExpensesDisplay = document.getElementById("totalExpensesDisplay");
        const ctx = document.getElementById("financialChart");

        if (!ctx) {
            console.error("Canvas element not found");
            return;
        }

        const dummyData = {
            total_income: 125000,
            total_expenses: 85000,
            monthly_data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                income: [20000, 18000, 22000, 24000, 21000, 20000],
                expenses: [15000, 16000, 14000, 13000, 12000, 15000]
            }
        };

        totalIncomeDisplay.textContent = `Rs. ${dummyData.total_income.toLocaleString()}`;
        totalExpensesDisplay.textContent = `Rs. ${dummyData.total_expenses.toLocaleString()}`;

        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: dummyData.monthly_data.labels,
                datasets: [
                    {
                        label: 'Income (Rs.)',
                        data: dummyData.monthly_data.income,
                        backgroundColor: 'rgba(75, 192, 192, 0.7)',
                        borderColor: 'rgba(75, 192, 192, 1)',
                        borderWidth: 1
                    },
                    {
                        label: 'Expenses (Rs.)',
                        data: dummyData.monthly_data.expenses,
                        backgroundColor: 'rgba(255, 99, 132, 0.7)',
                        borderColor: 'rgba(255, 99, 132, 1)',
                        borderWidth: 1
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    title: {
                        display: true,
                        text: 'Monthly Financial Overview'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Amount (Rs.)'
                        }
                    }
                }
            }
        });

        console.log("Chart created successfully");
    }
}
