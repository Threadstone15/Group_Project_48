const totalIncome = document.getElementById("totalIncome");
const totalExpenses = document.getElementById("totalExpenses");

//total income
fetch("get_total_expenses.php")
        .then(response => response.json())
        .then(gymData => {
            totalIncome.textContent = `Total Income: ${gymData.total_income}`
    })
    .catch(error => console.error("Error fetching gym data:", error));

    //total income
fetch("get_total_expenses.php")
.then(response => response.json())
.then(gymData => {
    totalExpenses.textContent = `Total Expenses: ${gymData.total_expenses}`
})
.catch(error => console.error("Error fetching gym data:", error));



