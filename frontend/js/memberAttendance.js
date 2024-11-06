document.addEventListener("DOMContentLoaded", function() {
    const table = document.getElementById("attendanceTable");
    const headers = table.querySelectorAll("th");
    const rows = Array.from(table.querySelectorAll("tbody tr"));

    // Function to sort table by column
    function sortTable(columnIndex) {
        const sortedRows = rows.sort((a, b) => {
            const aText = a.cells[columnIndex].textContent.trim();
            const bText = b.cells[columnIndex].textContent.trim();

            return aText.localeCompare(bText, undefined, { numeric: true });
        });

        // Remove old rows
        table.querySelector("tbody").innerHTML = "";

        // Append sorted rows
        sortedRows.forEach(row => table.querySelector("tbody").appendChild(row));
    }

    // Add click event listeners to headers for sorting
    headers.forEach((header, index) => {
        header.addEventListener("click", () => sortTable(index));
    });

    // Function to filter table by status
    document.getElementById("filterStatus").addEventListener("change", function() {
        const filter = this.value;

        rows.forEach(row => {
            const status = row.cells[2].textContent.trim().toLowerCase();
            row.style.display = (filter === "all" || status === filter) ? "" : "none";
        });
    });
});
