export function initMember_trackProgress() {
    console.log("initialzing trackProgress.js");
    //test function that stimulate the data from the database
    // const testData = [
    //     { date: "2024-11-01", weight: 75 },
    //     { date: "2024-11-02", weight: 76 },
    //     { date: "2024-11-03", weight: 75.5 },
    //     { date: "2024-11-04", weight: 74.8 },
    //     { date: "2024-11-05", weight: 74 },
    //     { date: "2024-11-06", weight: 73.5 },
    //     { date: "2024-11-07", weight: 73.2 },
    // ];

    // const labels = testData.map(entry => entry.date);
    // const weights = testData.map(entry => entry.weight);

    // // the chart
    // const ctx = document.getElementById('weightChart').getContext('2d');
    // new Chart(ctx, {
    //     type: 'line',
    //     data: {
    //         labels: labels,
    //         datasets: [{
    //             label: 'Weight (kg)',
    //             data: weights,
    //             borderColor: 'rgba(255, 95, 0, 1) ',
    //             backgroundColor: 'rgba(245, 245, 245, 1)',

    //             borderWidth: 1
    //         }]
    //     },
    //     options: {
    //         responsive: true,
    //         scales: {
    //             y: {
    //                 beginAtZero: false // Set to false to avoid starting the Y-axis at 0
    //             }
    //         }
    //     }
    // });


    // actual function that fetches data from the database using a PHP API
    {/*}
fetch('path_to_your_php_file.php') // Replace with the correct PHP API path
    .then(response => response.json())
    .then(data => {
        const labels = data.map(entry => entry.date); 
        const weights = data.map(entry => entry.weight); 

        //  the chart
        const ctx = document.getElementById('weightChart').getContext('2d');
        new Chart(ctx, {
            type: 'line', 
            data: {
                labels: labels,
                datasets: [{
                    label: 'Weight',
                    data: weights,
                    borderColor: 'rgba(255, 95, 0, 1) ',
                    backgroundColor: 'rgba(245, 245, 245, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    })
    .catch(error => console.error('Error fetching data:', error));

*/}

    //php api example
    {/*
<?php

$host = "localhost";
$username = "root";
$password = "";
$database = "gym_db";

$conn = new mysqli($host, $username, $password, $database);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Get weight data for the member (can be filtered by member ID, etc.)
$sql = "SELECT date, weight FROM members_weight ORDER BY date DESC";
$result = $conn->query($sql);

$data = [];
if ($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        $data[] = [
            'date' => $row['date'],
            'weight' => $row['weight']
        ];
    }
}

// Return data as JSON
header('Content-Type: application/json');
echo json_encode($data);
$conn->close();
?>
 */}
}