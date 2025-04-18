export function initAdmin_home() {
    console.log("initialzing adminHome.js");

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
    
          fetch("http://localhost:8080/Group_Project_48/backend/api/controllers/adminController.php", requestOptions)
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


      updateGymData();

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
}