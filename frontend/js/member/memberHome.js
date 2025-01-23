export function initMember_home() {
    const noticeContent = document.getElementById("noticeContent");
    const readCheckbox = document.getElementById("readCheckbox");
    let notices = [];
    let currentNoticeIndex = 0;

    const crowdStatus = document.getElementById("crowdStatus");
    const memberCount = document.getElementById("memberCount");
    const crowdIndicator = document.getElementById("crowdIndicator");
    const dateDisplay = document.getElementById("dateDisplay");

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

    fetch("get_gym_data.php")
        .then(response => response.json())
        .then(gymData => {
            dateDisplay.textContent = gymData.date;
            memberCount.textContent = `Members Present: ${gymData.members_present}`;
            crowdStatus.textContent = `Crowd Level: ${gymData.crowd_level}`;

            if (gymData.crowd_level === "Low") {
                crowdIndicator.classList.add("low");
            } else if (gymData.crowd_level === "Moderate") {
                crowdIndicator.classList.add("moderate");
            } else if (gymData.crowd_level === "High") {
                crowdIndicator.classList.add("high");
            }
        })
        .catch(error => console.error("Error fetching gym data:", error));

    //loading task-calendar component
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

    // Loading the calendar component
    window.onload = function () {
        loadHTMLFile('/Group_Project_48/frontend/components/calendar/calendar.html', '#calendar-placeholder');
        loadCSSFile('/Group_Project_48/frontend/components/calendar/calendar.css');
        loadJSFile('/Group_Project_48/frontend/components/calendar/calendar.js');
    };

}