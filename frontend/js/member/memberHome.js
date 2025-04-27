import { navigate } from "../router.js";
import { runSessionTimedOut } from "../routeConfig.js";
import { verifyMembershipPlan } from "./memberCommonFunc.js";

export function initMember_home() {

  const spinner = document.getElementById("loading-spinner");
  spinner.classList.remove("hidden");
  let isMembershipPlanVerified = false;

  checkMembershipPlan();
  async function checkMembershipPlan() {
    isMembershipPlanVerified = await verifyMembershipPlan();

    if (!isMembershipPlanVerified) {
      showToast("Selected Membership plan verification failed. Redirecting to login", "error");
      setTimeout(() => {
        runSessionTimedOut();
      }, 4000);
      return;
    } else {
      // console.log(isMembershipPlanVerified);
      controlAccessToFeatures();
    }
  }

  function controlAccessToFeatures() {
    const basePlanID = localStorage.getItem("basePlanID");
    const basicPlanFeatures = document.getElementById('MP1FeatureContainer');
    const standardPlanFeatures = document.getElementById('MP2FeatureContainer');
    const standardPlanContentContainer = document.getElementById('MP2ContentContainer');
    const premiumPlanFeatures = document.getElementById('MP3FeatureContainer');

    if (basePlanID === "MP1") {
      //eneabling basic plan features
      basicPlanFeatures.style.display = 'flex';
      //disabling standard and premium plan features
      standardPlanFeatures.style.display = 'none'; 
      standardPlanContentContainer.style.display = 'none';
      premiumPlanFeatures.style.display = 'none';
      //hiding spinner
      spinner.classList.add("hidden");

    } else if (basePlanID === "MP2") {
      //eneabling standard plan features
      standardPlanFeatures.style.display = 'block';
      standardPlanContentContainer.style.display = 'flex';
      //disabling basic and premium plan features
      basicPlanFeatures.style.display = 'none';
      premiumPlanFeatures.style.display = 'none';

      updateGymData();
      updateAttendance();
      //hiding spinner
      spinner.classList.add("hidden");
    } else if (basePlanID === "MP3") {
      //eneabling premium and standard plan features
      premiumPlanFeatures.style.display = 'block';
      standardPlanFeatures.style.display = 'block';
      //disabling basic plan features and standard plan content container
      basicPlanFeatures.style.display = 'none';
      standardPlanContentContainer.style.display = 'none';
      
      updateGymData();
      updateAttendance();
      //hiding spinner
      spinner.classList.add("hidden");
    }
  }

  document.getElementById("createWorkoutBtn").addEventListener("click", () => {
    navigate("member/workoutPlans");
  });
  document.getElementById("createMealBtn").addEventListener("click", () => {
    navigate("member/workoutMealPlans");
  });
  document.getElementById("upgradePlanBtn").addEventListener("click", () => {
    navigate("member/upgradePlan");
  });
  document.getElementById("upgradePlanBtn2").addEventListener("click", () => {
    navigate("member/upgradePlan");
  });



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
        showToast("User token not found in localStorage", "error");
        setTimeout(() => {
          runSessionTimedOut();
        }, 4000);
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

  //setInterval(updateAttendance, 5000);

  window.addEventListener('message', (event) => {
    if (event.data.call === 'SHOW_TOAST') {
      const container = document.getElementById('global-toast-container');
      container.innerHTML = ""; // Clear previous toasts
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