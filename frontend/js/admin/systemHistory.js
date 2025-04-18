export function initAdmin_systemHistory() {
    console.log("Initializing systemHistory.js");

    const spinner = document.getElementById("loading-spinner");

  
    const popup = document.getElementById("popup");
    const popupTitle = document.getElementById("popup-title");
    const tableHeaders = document.getElementById("table-headers");
    const tableBody = document.getElementById("table-body");
    const searchInput = document.getElementById("search-input");
  
    const tableMeta = {
      Equipments: {
        headers: [ "Equipment", "Purchase Date", "Status", "Maintaince Frequency", "Removed Date"],
        type: "equipments",
        searchColumns: [1, 2],
      },
      Maintenance: {
        headers: ["Record ID", "Equipment", "Maintained Date", "Details", "Next Maintaince Date", "Deleted Date"],
        type: "maintenance",
        searchColumns: [1],
      },
      Applications: {
        headers: ["App ID", "Aplicant Name", "NIC", "Email", "Contact No", "CV Link"],
        type: "applications",
        searchColumns: [1, 2],
      },
      Jobs: {
        headers: ["Career ID", "Job Role", "Requirements", "Removed Date"],
        type: "jobs",
        searchColumns: [2],
      },
      Attendance: {
        headers: ["Member ID", "Full Name", "Date", "Time", "Status"],
        type: "attendance",
        searchColumns: [2,3],
      },
    };
  
    let currentRows = [];
  
    async function openPopup(tableType) {
        const { headers, type, searchColumns } = tableMeta[tableType];
      
        popupTitle.textContent = tableType + " Table";
        tableHeaders.innerHTML = headers.map((h) => `<th>${h}</th>`).join("");
        searchInput.value = "";
      
        spinner.classList.remove("hidden");
      
        try {
          const response = await fetch(
            `http://localhost:8080/Group_Project_48/backend/api/controllers/adminController.php?action=get_history&type=${type}`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("authToken")}`,
              },
            }
          );
      
          if (!response.ok) {
            throw new Error("Failed to fetch data");
          }
      
          const data = await response.json();
          // Hide spinner
          spinner.classList.add("hidden");
          currentRows = data;
      
          tableBody.innerHTML = data
            .map(
              (row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join("")}</tr>`
            )
            .join("");
      
          popup.dataset.currentTable = tableType;
          popup.dataset.searchColumns = JSON.stringify(searchColumns);
          popup.classList.remove("hidden");
      
        } catch (error) {
          console.error(`Error loading ${type} history:`, error);
          spinner.classList.add("hidden");
        } 
      }
      
  
    function closePopup() {
      popup.classList.add("hidden");
    }
  
    function searchTable() {
      const term = searchInput.value.toLowerCase();
      const tableType = popup.dataset.currentTable;
      const searchColumns = tableMeta[tableType].searchColumns;
  
      const filteredRows = currentRows.filter((row) =>
        searchColumns.some(
          (i) => String(row[i]).toLowerCase().indexOf(term) !== -1
        )
      );
  
      tableBody.innerHTML = filteredRows
        .map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join("")}</tr>`)
        .join("");
    }
  
    // 🌐 Expose functions globally for use in HTML
    window.openPopup = openPopup;
    window.closePopup = closePopup;
    window.searchTable = searchTable;
  }
  