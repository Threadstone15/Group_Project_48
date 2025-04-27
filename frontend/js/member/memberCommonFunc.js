export function verifyMembershipPlan() {
    return new Promise((resolve, reject) => {
      const authToken = localStorage.getItem("authToken");
      const basePlanID = localStorage.getItem("basePlanID");
  
      if (!authToken || !basePlanID) {
        return resolve(false); // No auth token or base plan ID, return false
      }
  
      const payload = {
        "base_plan_id": basePlanID
      };
  
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
        .then(response => response.json())
        .then(data => {
            console.log(data);
          if (data.error && data.error === "Token expired") {
            throw new Error("Token expired");
          }
          if (!data || data.message !== "membership plan verified") {
            return resolve(false); // If verification failed
          }
          resolve(true); // If membership plan is verified
        })
        .catch(error => {
          console.error("Error verifying membership plan:", error);
          resolve(false); // Return false in case of error
        });
    });
  }
  