import { navigate } from "../router.js";
import { runSessionTimedOut } from "../routeConfig.js";

export function initMember_home() {
  let isMembershipPlanVerified = false;

  // Load QRCode.js library (optional, only if not in HTML already)
  const qrScript = document.createElement('script');
  qrScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js';
  qrScript.onload = () => console.log('QRCode library loaded');
  qrScript.onerror = () => console.error('Failed to load QRCode library');
  document.head.appendChild(qrScript);

  // QR Modal logic
  const qrModal = document.getElementById("qrModal");
  const qrCodeDiv = document.getElementById("qrCode");
  const markAttendanceBtn = document.getElementById("markAttendanceBtn");
  const closeBtn = document.querySelector(".close-btn");

  if (markAttendanceBtn) {
    markAttendanceBtn.addEventListener("click", () => {
      console.log("Mark attendance button clicked");
      const token = localStorage.getItem('authToken');

      if (!token) {
        alert("User token not found in localStorage.");
        return;
      }

      // Clear any previous QR code
      qrCodeDiv.innerHTML = "";

      // Show QR modal
      qrModal.style.display = "flex";

      // Generate QR with token
      new QRCode(qrCodeDiv, {
        text: token,
        width: 200,
        height: 200
      });
    });
  }

  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      qrModal.style.display = "none";
    });
  }

  window.addEventListener("click", (e) => {
    if (e.target === qrModal) {
      qrModal.style.display = "none";
    }
  });

  const noticeContent = document.getElementById("noticeContent");
  const readCheckbox = document.getElementById("readCheckbox");
  let notices = [];
  let currentNoticeIndex = 0;

  const dateDisplay = document.getElementById("dateDisplay");
  const progressBar = document.getElementById('gymProgress');


  const today = new Date();
  const options = { weekday: 'long' };
  const dayOfWeek = today.toLocaleDateString('en-US', options);
  const formattedDate = `${dayOfWeek}, ${today.toLocaleDateString()}`;
  dateDisplay.textContent = formattedDate;

  function updateAttendance() {
    const formData = new FormData();
    formData.append("action", "update_attendance");

    const authToken = localStorage.getItem("authToken");

    if (!authToken) {
      console.error("Auth token not found. Please log in.");
      return;
    }

    fetch("http://localhost:8080/Group_Project_48/backend/api/controllers/memberController.php", {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${authToken}` },
      body: formData,
      redirect: 'follow'
    })
      .then(response => {
        if (!response.ok) throw new Error("Failed to update attendance");
        return response.json();
      })
      .then(result => {
        console.log("Attendance updated successfully:", result);

        // ✅ Update toggle based on result
        if (result && typeof result.arrived !== "undefined") {
          const toggleCheckbox = document.getElementById("toggle");
          toggleCheckbox.checked = result.arrived == 1;
        } else {
          // fallback fetch
          fetchAttendanceStatus();
        }
      })
      .catch(error => {
        console.error("Error updating attendance:", error);
      });
  }
  fetch("get_notices.php")
    .then(response => response.json())
    .then(data => {
      notices = data;
      displayNotice();
    });

  function displayNotice() {
    if (currentNoticeIndex < notices.length) {
      noticeContent.textContent = notices[currentNoticeIndex].content;
      readCheckbox.checked = false;
    } else {
      noticeContent.textContent = "No more notices.";
      readCheckbox.style.display = "none";
    }
  }

  readCheckbox.addEventListener("change", function () {
    if (this.checked && currentNoticeIndex < notices.length) {
      const noticeId = notices[currentNoticeIndex].id;

      // Mark the notice as read in the backend
      fetch("mark_notice_read.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: noticeId })
      })
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            currentNoticeIndex++;
            displayNotice();
          }
        });
    }
  });

  function updateGymData() {
    console.log("Updating gym data...");
    const formData = new FormData();
    formData.append("action", "get_gym_crowd");

    const authToken = localStorage.getItem("authToken");

    if (!authToken) {
      console.error("Auth token not found. Please log in.");
      return;
    }

    const requestOptions = {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${authToken}` },
      body: formData,
      redirect: 'follow'
    };

    fetch("http://localhost:8080/Group_Project_48/backend/api/controllers/memberController.php", requestOptions)
      .then(response => response.json())
      .then(gymData => {
        const totalMembers = gymData.count;
        const percentagePresent = gymData.percentage;

        console.log("Total Members:", totalMembers);
        console.log("Percentage Present:", percentagePresent);

        progressBar.value = percentagePresent;

        const memberCountText = document.getElementById('memberCount');
        memberCountText.textContent = `Members Present: ${totalMembers} (${Math.round(percentagePresent)}%)`;

      })
      .catch(error => console.error("Error fetching gym data:", error));
  }

  function verifyMembershipPlan() {
    const authToken = localStorage.getItem("authToken");
    const basePlanID = localStorage.getItem("basePlanID");

    if (!authToken || !basePlanID) {
      showToast("An error has occurred. Please log in again", "error");
      navigate("login");
      return;
    }

    const payload = {
      "base_plan_id": basePlanID
    }

    const requestOptions = {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      redirect: 'follow'
    };

    fetch("http://localhost:8080/Group_Project_48/backend/api/controllers/memberController.php?action=verify_membership_plan", requestOptions)
      .then(response => {
        return response.json().then(data => {
          if (data.error && data.error === "Token expired") {
            throw new Error("Token expired");
          }
          if (!response.ok) throw new Error("Failed to verify the membership plan");
          return data;
        });
      })
      .then(data => {
        if (data.message && data.message === "membership plan verified") {
          isMembershipPlanVerified = true;
          controlAccessToFeatures();
        } else if (data.error) {
          showToast("An error has occurred. Please log in again", "error");
          setTimeout(() => {
            //logging out -> this func does the same
            runSessionTimedOut();
          }, 4000);
        }
      })
      .catch(error => {
        console.error("API Error:", error.message);
        if (error.message === "Token expired") {
          showToast("Your session has timed out. Please log in again", "error");
          setTimeout(() => {
            runSessionTimedOut();
          }, 4000);
        } else {
          showToast(error.message, "error");
        }
      });
  }
  function controlAccessToFeatures() {
    const basePlanID = localStorage.getItem("basePlanID");
    if (isMembershipPlanVerified) {
      const noticesFeature = document.getElementById('noticesFeature');
      const gymCrowdFeature = document.getElementById('gymCrowdFeature');
      const attendanceFeature = document.getElementById('attendanceFeature');
      const calendarFeature = document.getElementById('calendarFeature');
      const upgradePlanPopup = document.getElementById("planUpgradePopup");

      if (basePlanID === "MP1") {
        noticesFeature?.classList.add("disabled-feature");
        gymCrowdFeature?.classList.add("disabled-feature");
        attendanceFeature?.classList.add("disabled-feature");
        calendarFeature?.classList.add("disabled-feature");

        //showing upgrade plan popup
        upgradePlanPopup.querySelector(".upgrade-message").textContent = '';
        upgradePlanPopup.querySelector(".upgrade-message").textContent = "Upgrade your plan to get access to these exclusive features!";
        upgradePlanPopup.style.display = 'block';

      } else if (basePlanID === "MP2") {
        noticesFeature?.classList.remove("disabled-feature");
        gymCrowdFeature?.classList.remove("disabled-feature");
        attendanceFeature?.classList.remove("disabled-feature");
        calendarFeature?.classList.add("disabled-feature");
        //closing the upgrade plan popup
        upgradePlanPopup.style.display = 'none';

        document.getElementById('calendarFeatureContainer').onclick = () => {
          //showing upgrade plan popup
          upgradePlanPopup.querySelector(".upgrade-message").textContent = '';
          upgradePlanPopup.querySelector(".upgrade-message").textContent = "Upgrade your plan to enroll in trainer sessions!";
          upgradePlanPopup.style.display = 'block';
        };

        updateGymData();
        updateAttendance();
      } else if (basePlanID === "MP3") {
        noticesFeature?.classList.remove("disabled-feature");
        gymCrowdFeature?.classList.remove("disabled-feature");
        attendanceFeature?.classList.remove("disabled-feature");
        calendarFeature?.classList.remove("disabled-feature");
        //closing the upgrade plan popup
        upgradePlanPopup.style.display = 'none';

        updateGymData();
        updateAttendance();
      }
    }
  }

  document.getElementById("close-planUpgradePopup").onclick = () => {
    document.getElementById("planUpgradePopup").style.display = "none";
  };

  document.getElementById("upgradePlanBtn").onclick = () => {
    navigate('member/upgradePlan');
  };

  verifyMembershipPlan();

  //setInterval(updateAttendance, 5000);
  
  window.addEventListener('message', (event) => {
    if (event.data.call === 'SHOW_TOAST') {
      const container = document.getElementById('global-toast-container');
      const toast = document.createElement('div');
      toast.className = `global-toast ${event.data.toastType}`;
      toast.innerHTML = event.data.message;
      container.appendChild(toast);

      setTimeout(() => {
        toast.remove();
      }, 4000);
    }
  });

  function showToast(message, type) {
    const container = document.getElementById('global-toast-container');
    const toast = document.createElement('div');
    toast.className = `global-toast ${type}`;
    toast.innerHTML = message;

    container.appendChild(toast);

    setTimeout(() => {
      toast.remove();
    }, 4000);
  }

}