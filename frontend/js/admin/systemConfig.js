export async function initAdmin_systemConfig() {
  console.log("Initializing systemConfig.js");

  const configList = document.getElementById("config-list");
  const spinner = document.getElementById("loading-spinner");
  spinner.classList.remove("hidden");

  try {
    const res = await fetch("http://localhost:8080/Group_Project_48/backend/api/controllers/adminController.php?action=get_all_system_configs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("authToken")}`
      },
      body: JSON.stringify({
        action: "get_all_system_configs"
      })
    });

    const data = await res.json();
    console.log("Response data:", data);

    if (res.ok && data.success) {
      const configs = data.configs; // should be a key-value object
      Object.keys(configs).forEach(key => {
        renderConfigField(key, configs[key]);
      });
    } else {
      console.warn("Failed to fetch system configs:", data);
      alert("Could not load configuration settings.");
    }
  } catch (error) {
    console.error("Error fetching configs:", error);
    alert("An error occurred while loading settings.");
  }

  spinner.classList.add("hidden");

  function renderConfigField(key, value) {
    const wrapper = document.createElement("div");
    wrapper.className = "form-group mb-3";

    const label = document.createElement("label");
    label.textContent = key.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());

    const input = document.createElement("input");
    input.type = "text";
    input.name = key;
    input.value = value;
    input.className = "form-control";

    const button = document.createElement("button");
    button.textContent = "Update";
    button.className = "btn btn-primary mt-2";

    button.addEventListener("click", () => {
      updateConfigValue(key, input.value);
    });

    wrapper.appendChild(label);
    wrapper.appendChild(input);
    wrapper.appendChild(button);
    configList.appendChild(wrapper);
  }

  async function updateConfigValue(key, value) {
    const payload = {
      action: "update_system_config",
      key,
      value
    };

    try {
      const res = await fetch("http://localhost:8080/Group_Project_48/backend/api/controllers/adminController.php?action=update_system_config", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("authToken")}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (res.ok && data.success) {
        alert("Configuration updated successfully!");
      } else {
        console.warn("Update failed:", data);
        alert(data.message || "Failed to update configuration.");
      }
    } catch (err) {
      console.error("Network or server error during update:", err);
      alert("An error occurred while updating configuration.");
    }
  }
}
