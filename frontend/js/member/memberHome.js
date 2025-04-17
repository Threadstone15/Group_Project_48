export function initMember_home() {


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
        alert("Failed to update attendance");
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

  readCheckbox.addEventListener("change", function() {
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
  function loadHTMLFile(url, targetElement) {
      fetch(url)
          .then(response => response.text())
          .then(data => {
              document.querySelector(targetElement).innerHTML = data;
          })
          .catch(error => console.error('Error loading HTML:', error));
  }

  // Function to load a CSS file dynamically
  function loadCSSFile(url) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = url;
      document.head.appendChild(link);
  }

  // Function to load a JS file dynamically
  function loadJSFile(url) {
      const script = document.createElement('script');
      script.type = 'module';
      script.src = url;
      document.body.appendChild(script);
  }
  updateGymData();
  updateAttendance()
  setInterval(updateAttendance, 5000);
  // Loading the calendar component
  window.onload = function () {
      loadHTMLFile('/Group_Project_48/frontend/components/calendar/calendar.html', '#calendar-placeholder');
      loadCSSFile('/Group_Project_48/frontend/components/calendar/calendar.css'); 
      loadJSFile('/Group_Project_48/frontend/components/calendar/calendar.js');
  };

}