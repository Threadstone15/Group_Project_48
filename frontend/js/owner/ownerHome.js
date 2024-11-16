const memberCount = document.getElementById("memberCount");
const totalCount = document.getElementById("totalCount");
const newSignups = document.getElementById("newSignups");
const dateDisplay = document.getElementById("dateDisplay");

//current gym member count
fetch("get_gym_data.php")
        .then(response => response.json())
        .then(gymData => {
            dateDisplay.textContent = gymData.date;
            memberCount.textContent = `Members Present: ${gymData.members_present}`
    })
    .catch(error => console.error("Error fetching gym data:", error));

//total members present
fetch("get_gym_data.php")
        .then(response => response.json())
        .then(gymData => {
            dateDisplay.textContent = gymData.date;
            totalCount.textContent = `Total Members: ${gymData.total_members}`
    })
    .catch(error => console.error("Error fetching gym data:", error));

//new signups
fetch("get_gym_data.php")
        .then(response => response.json())
        .then(gymData => {
            dateDisplay.textContent = gymData.date;
            newSignups.textContent = `New Sign-ups: ${gymData.new_signups}`
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

function loadCSSFile(url) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = url;
    document.head.appendChild(link);
}

function loadJSFile(url) {
    const script = document.createElement('script');
    script.type = 'module';
    script.src = url;
    document.body.appendChild(script);
}

window.onload = function () {
    loadHTMLFile('/Group_Project_48/frontend/components/calendar/calendar.html', '#calendar-placeholder');
    loadCSSFile('/Group_Project_48/frontend/components/calendar/calendar.css'); 
    loadJSFile('/Group_Project_48/frontend/components/calendar/calendar.js');
};
