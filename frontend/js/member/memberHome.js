import { navigate } from "../router.js";
import { runSessionTimedOut } from "../routeConfig.js";
import { verifyMembershipPlan } from "./memberCommonFunc.js";

export function initMember_home() {
  const spinner = document.getElementById("loading-spinner");
  spinner.classList.remove("hidden");
  let isMembershipPlanVerified = false;

  // Notice-related variables
  let notices = [];
  let currentNoticeIndex = 0;
  const noticeModal = document.getElementById("noticeModal");
  const noticeCountText = document.getElementById("noticeCount");

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
      // Enabling basic plan features
      basicPlanFeatures.style.display = 'flex';
      // Disabling standard and premium plan features
      standardPlanFeatures.style.display = 'none'; 
      standardPlanContentContainer.style.display = 'none';
      premiumPlanFeatures.style.display = 'none';
      // Hiding spinner
      spinner.classList.add("hidden");

    } else if (basePlanID === "MP2") {
      // Enabling standard plan features
      standardPlanFeatures.style.display = 'block';
      standardPlanContentContainer.style.display = 'flex';
      // Disabling basic and premium plan features
      basicPlanFeatures.style.display = 'none';
      premiumPlanFeatures.style.display = 'none';

      updateGymData();
      updateAttendance();
      fetchAndDisplayNotices(); // Added notices for standard plan
      // Hiding spinner
      spinner.classList.add("hidden");
    } else if (basePlanID === "MP3") {
      // Enabling premium and standard plan features
      premiumPlanFeatures.style.display = 'block';
      standardPlanFeatures.style.display = 'block';
      // Disabling basic plan features and standard plan content container
      basicPlanFeatures.style.display = 'none';
      standardPlanContentContainer.style.display = 'none';
      
      updateGymData();
      updateAttendance();
      fetchAndDisplayNotices(); // Added notices for premium plan
      // Hiding spinner
      spinner.classList.add("hidden");
    }
  }

  // Notice-related functions
  function fetchAndDisplayNotices() {
    console.log("Fetching notices...");
    spinner.classList.remove("hidden");

    const formData = new FormData();
    formData.append("action", "get_personal_notices");

    const authToken = localStorage.getItem("authToken");
    if (!authToken) {
      console.error("Auth token not found. Please log in.");
      spinner.classList.add("hidden");
      return;
    }

    fetch("http://localhost:8080/Group_Project_48/backend/api/controllers/memberController.php", {
      method: "POST",
      headers: { 'Authorization': `Bearer ${authToken}` },
      body: formData
    })
      .then(response => response.json())
      .then(data => {
        const today = new Date();
        notices = data.filter(notice => {
          const publishDate = new Date(notice.PublishDate);
          const expiryDate = new Date(publishDate);
          const duration = parseInt(notice.duration) || 0;
          expiryDate.setDate(publishDate.getDate() + duration);

          return publishDate <= today && expiryDate >= today;
        });

        currentNoticeIndex = 0;
        noticeCountText.textContent = `Notices Available: ${notices.length}`;
      })
      .catch(error => {
        console.error("Failed to load notices:", error);
        showToast("Failed to fetch notices.", "error");
      })
      .finally(() => {
        spinner.classList.add("hidden");
      });
  }

  function displayNotice() {
    const total = notices.length;

    if (total === 0) {
      document.getElementById("modalNoticeTitle").textContent = "No Notices Available";
      document.getElementById("modalNoticeDescription").textContent = "";
      document.getElementById("markAsReadBtn").style.display = "none";
      document.getElementById("prevNoticeBtn").style.display = "none";
      document.getElementById("nextNoticeBtn").style.display = "none";
      document.getElementById("noticeIndexDisplay").style.display = "none";
    } else {
      const currentNotice = notices[currentNoticeIndex];
      document.getElementById("modalNoticeTitle").textContent = currentNotice.title;
      document.getElementById("modalNoticeDescription").textContent = currentNotice.description;

      document.getElementById("noticeIndexDisplay").textContent = `${currentNoticeIndex + 1} of ${total}`;
      document.getElementById("prevNoticeBtn").disabled = currentNoticeIndex === 0;
      document.getElementById("nextNoticeBtn").disabled = currentNoticeIndex === total - 1;

      const markBtn = document.getElementById("markAsReadBtn");
      markBtn.style.display = "inline-block";
      markBtn.onclick = function () {
        markNoticeAsRead(currentNotice.notice_id);
      };
    }

    noticeModal.style.display = "flex";
  }

  function markNoticeAsRead(noticeId) {
    console.log("Marking notice as read... ", noticeId);

    const authToken = localStorage.getItem("authToken");
    if (!authToken) {
      console.error("Auth token not found. Please log in.");
      showToast("Authentication error. Please log in.", "error");
      return;
    }

    spinner.classList.remove("hidden");

    fetch("http://localhost:8080/Group_Project_48/backend/api/controllers/memberController.php?action=mark_notice_as_read", {
      method: "POST",
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ notice_id: noticeId })
    })
      .then(res => res.json())
      .then(data => {
        if (data.message) {
          showToast("Marked as read!");
          if (notices.length > 1) {
            currentNoticeIndex++;
            noticeCountText.textContent = `Notices Available: ${notices.length - currentNoticeIndex}`;
            displayNotice();             
          }
        } else {
          console.error("Failed to mark notice as read.", data);
          showToast("Failed to mark as read.", "error");
        }
      })
      .catch(err => {
        console.error("Error marking notice as read:", err);
      })
      .finally(() => {
        spinner.classList.add("hidden");
      });
  }

  // Event listeners for notice modal
  document.getElementById("viewNoticesBtn")?.addEventListener("click", displayNotice);
  document.getElementById("prevNoticeBtn")?.addEventListener("click", function() {
    if (currentNoticeIndex > 0) {
      currentNoticeIndex--;
      displayNotice();
    }
  });
  document.getElementById("nextNoticeBtn")?.addEventListener("click", function() {
    if (currentNoticeIndex < notices.length - 1) {
      currentNoticeIndex++;
      displayNotice();
    }
  });
  document.getElementById("closeModal")?.addEventListener("click", function() {
    noticeModal.style.display = "none";
  });

  // Rest of your existing functions (updateGymData, updateAttendance, etc.)
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

        const progressBar = document.getElementById('gymProgress');
        progressBar.value = percentagePresent;

        const memberCountText = document.getElementById('memberCount');
        memberCountText.textContent = `Members Present: ${totalMembers} (${Math.round(percentagePresent)}%)`;
      })
      .catch(error => console.error("Error fetching gym data:", error));
  }

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

        if (result && typeof result.arrived !== "undefined") {
          const toggleCheckbox = document.getElementById("toggle");
          toggleCheckbox.checked = result.arrived == 1;
        }
      })
      .catch(error => {
        console.error("Error updating attendance:", error);
      });
  }

  // Existing event listeners
  document.getElementById("createWorkoutBtn")?.addEventListener("click", () => {
    navigate("member/workoutPlans");
  });
  document.getElementById("createMealBtn")?.addEventListener("click", () => {
    navigate("member/workoutMealPlans");
  });
  document.getElementById("upgradePlanBtn")?.addEventListener("click", () => {
    navigate("member/upgradePlan");
  });
  document.getElementById("upgradePlanBtn2")?.addEventListener("click", () => {
    navigate("member/upgradePlan");
  });

  // QR Code functionality
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

      qrCodeDiv.innerHTML = "";
      qrModal.style.display = "flex";

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

  window.addEventListener('message', (event) => {
    if (event.data.call === 'SHOW_TOAST') {
      const container = document.getElementById('global-toast-container');
      container.innerHTML = "";
      const toast = document.createElement('div');
      toast.className = `global-toast ${event.data.toastType}`;
      toast.innerHTML = event.data.message;
      container.appendChild(toast);

      setTimeout(() => {
        toast.remove();
      }, 4000);
    }
  });
}