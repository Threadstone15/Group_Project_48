export function initAdmin_systemConfig() {
    console.log("Initializing systemConfig.js");
  
    const spinner = document.getElementById("loading-spinner");
    const popup = document.getElementById("popup");
    const popupTitle = document.getElementById("popup-title");
    const tableHeaders = document.getElementById("table-headers");
    const tableBody = document.getElementById("table-body");
    const searchInput = document.getElementById("search-input");
  
    const tableMeta = {
      "Support Email": {
        headers: ["Config ID", "Email", "Updated Date"],
        type: "supportEmail",
        searchColumns: [1],
      },
      "Phone Number": {
        headers: ["Config ID", "Phone Number", "Updated Date"],
        type: "phoneNumber",
        searchColumns: [1],
      },
      "Physical Address": {
        headers: ["Config ID", "Address", "Updated Date"],
        type: "physicalAddress",
        searchColumns: [1],
      },
      "Default Currency": {
        headers: ["Config ID", "Currency", "Symbol", "Updated Date"],
        type: "defaultCurrency",
        searchColumns: [1],
      },
      "Maintenance Mode": {
        headers: ["Config ID", "Status", "Activated Date", "Deactivated Date"],
        type: "maintenanceMode",
        searchColumns: [1],
      },
      "Notifications": {
        headers: ["Config ID", "Enabled", "Last Toggled"],
        type: "notifications",
        searchColumns: [1],
      },
      "Daily Attendance": {
        headers: ["Date", "Total Present", "Total Absent", "Checked By"],
        type: "dailyAttendance",
        searchColumns: [0, 3],
      },
      "Earnings Summary": {
        headers: ["Date", "Total Earnings", "Source", "Handled By"],
        type: "earningsSummary",
        searchColumns: [0, 2],
      },
      "Session Timeout Duration": {
        headers: ["Config ID", "Timeout Duration (min)", "Updated Date"],
        type: "sessionTimeout",
        searchColumns: [1],
      },
    };
  
    let currentRows = [];
  
    async function openPopup(configType) {
      const { headers, type, searchColumns } = tableMeta[configType];
  
      popupTitle.textContent = configType + " Settings";
      tableHeaders.innerHTML = headers.map((h) => `<th>${h}</th>`).join("");
      searchInput.value = "";
      spinner.classList.remove("hidden");
  
      try {
        const response = await fetch(
          `http://localhost:8080/Group_Project_48/backend/api/controllers/adminController.php?action=get_config&type=${type}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            },
          }
        );
  
        if (!response.ok) {
          throw new Error("Failed to fetch config data");
        }
  
        const data = await response.json();
        spinner.classList.add("hidden");
        currentRows = data;
  
        tableBody.innerHTML = data
          .map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join("")}</tr>`)
          .join("");
  
        popup.dataset.currentTable = configType;
        popup.dataset.searchColumns = JSON.stringify(searchColumns);
        popup.classList.remove("hidden");
  
      } catch (error) {
        console.error(`Error loading ${type} config:`, error);
        spinner.classList.add("hidden");
      }
    }
  
    function closePopup() {
      popup.classList.add("hidden");
    }
  
    function searchTable() {
      const term = searchInput.value.toLowerCase();
      const configType = popup.dataset.currentTable;
      const searchColumns = tableMeta[configType].searchColumns;
  
      const filteredRows = currentRows.filter((row) =>
        searchColumns.some(
          (i) => String(row[i]).toLowerCase().indexOf(term) !== -1
        )
      );
  
      tableBody.innerHTML = filteredRows
        .map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join("")}</tr>`)
        .join("");
    }
  
    // Make functions globally accessible
    window.openPopup = openPopup;
    window.closePopup = closePopup;
    window.searchTable = searchTable;
  }
  