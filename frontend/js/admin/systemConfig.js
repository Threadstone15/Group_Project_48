export async function initAdmin_systemConfig() {
  console.log("Initializing systemConfig.js");

  const configKeys = [
    "currency",
    "gym_address",
    "gym_capacity",
    "gym_email",
    "gym_no",
    "maintaince_mode",
    "notifications",
    "session_time"
  ];

  const configList = document.getElementById("config-list");
  const spinner = document.getElementById("spinner");

  spinner?.classList.remove("hidden");

  for (const key of configKeys) {
    try {
      const res = await fetch(`http://localhost:8080/Group_Project_48/backend/api/controllers/adminController.php?action=get_system_config&key=${key}`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("authToken")}`
        }
      });

      const data = await res.json();

      if (res.ok && data.success) {
        renderConfigField(key, data.value);
      } else {
        console.warn(`Missing config for ${key}:`, data);
        renderConfigField(key, "", true);
      }
    } catch (error) {
      console.error(`Error fetching config for ${key}:`, error);
      renderConfigField(key, "", true);
    }
  }

  spinner?.classList.add("hidden");

  function renderConfigField(key, value, error = false) {
    const wrapper = document.createElement("div");
    wrapper.className = "form-group mb-3";

    const label = document.createElement("label");
    label.textContent = key.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());

    const input = document.createElement("input");
    input.type = "text";
    input.name = key;
    input.value = value;
    input.className = "form-control";
    if (error) input.disabled = true;

    const button = document.createElement("button");
    button.textContent = "Update";
    button.className = "btn btn-primary mt-2";
    if (error) button.disabled = true;

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
      const res = await fetch("http://localhost:8080/Group_Project_48/backend/api/controllers/adminController.php", {
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
