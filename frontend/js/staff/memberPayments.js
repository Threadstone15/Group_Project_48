export function initStaff_memberPayments() {
    console.log("Initializing payment update page");
  
    const spinner = document.getElementById("loading-spinner");
    const authToken = localStorage.getItem("authToken");
    
    if (!authToken) {
      showToast("Not authenticated. Please login again.");
      window.location.href = "/login";
      return;
    }
  
    // DOM Elements
    const membershipPlanSelect = document.getElementById("membership-plan");
    const planDetailsSection = document.getElementById("plan-details");
    const memberIdInput = document.getElementById("member-id");
    const paymentAmountInput = document.getElementById("payment-amount");
    const paymentTypeRadios = document.getElementsByName("payment-type");
    const paymentDateInput = document.getElementById("payment-date");
    const paymentEvidenceInput = document.getElementById("payment-evidence");
    const fileNameSpan = document.getElementById("file-name");
    const imagePreviewSection = document.getElementById("image-preview");
    const previewImage = document.getElementById("preview-image");
    const submitPaymentBtn = document.getElementById("submit-payment");
    const clearFormBtn = document.getElementById("clear-form");
  
    let membershipPlans = [];
  
    // Set default payment date to today
    const today = new Date().toISOString().split('T')[0];
    paymentDateInput.value = today;
  
    // Fetch Membership Plans
    async function fetchPayments() {
      showLoading(true);
      
      const authToken = localStorage.getItem('authToken');
      if (!authToken) {
        showToast('Not authenticated. Please login again.', 'error');
        window.location.href = '/login';
        return;
      }
      
      try {
        const response = await fetch('http://localhost:8080/Group_Project_48/backend/api/controllers/adminController.php?action=getFullPaymentDetailsWithEvidence', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const text = await response.text(); // First get the raw text
        console.log('Raw response:', text);
        
        try {
          const data = JSON.parse(text); // Then try to parse it
          console.log('Parsed data:', data);
          
          if (data.success) {
            allPayments = data.payments;
            filteredPayments = [...allPayments];
            totalPages = Math.ceil(filteredPayments.length / ITEMS_PER_PAGE);
            renderPayments();
          } else {
            showToast(data.message || 'Failed to load payments', 'error');
          }
        } catch (parseError) {
          console.error('JSON parse error:', parseError);
          throw new Error('Invalid JSON response from server');
        }
      } catch (error) {
        console.error('Error fetching payments:', error);
        showToast('Error fetching payments. Please try again.', 'error');
      } finally {
        showLoading(false);
      }
    }
  
    // Populate Membership Plans dropdown
    function populateMembershipPlans(plans) {
      membershipPlanSelect.innerHTML = '<option value="">-- Select a Plan --</option>';
      
      plans.forEach(plan => {
        if (plan.status === 'active') {
          const option = document.createElement('option');
          option.value = plan.membership_plan_id;
          option.textContent = `${plan.plan_name} (${plan.membership_plan_id})`;
          membershipPlanSelect.appendChild(option);
        }
      });
    }
  
    // Display selected plan details
    membershipPlanSelect.addEventListener('change', function() {
      const selectedPlanId = this.value;
      if (!selectedPlanId) {
        planDetailsSection.classList.add("hidden");
        return;
      }
  
      const selectedPlan = membershipPlans.find(plan => plan.membership_plan_id === selectedPlanId);
      if (selectedPlan) {
        document.getElementById("plan-name").textContent = selectedPlan.plan_name;
        document.getElementById("plan-benefits").textContent = selectedPlan.benefits;
        document.getElementById("plan-monthly").textContent = `LKR ${parseFloat(selectedPlan.monthlyPrice).toFixed(2)}`;
        document.getElementById("plan-yearly").textContent = `LKR ${parseFloat(selectedPlan.yearlyPrice).toFixed(2)}`;
        
        // Auto-fill payment amount based on selected type
        const paymentType = document.querySelector('input[name="payment-type"]:checked').value;
        paymentAmountInput.value = paymentType === 'monthly' 
          ? selectedPlan.monthlyPrice 
          : selectedPlan.yearlyPrice;
        
        planDetailsSection.classList.remove("hidden");
      }
    });
  
    // Update payment amount when payment type changes
    document.querySelectorAll('input[name="payment-type"]').forEach(radio => {
      radio.addEventListener('change', function() {
        if (membershipPlanSelect.value) {
          const selectedPlan = membershipPlans.find(plan => plan.membership_plan_id === membershipPlanSelect.value);
          if (selectedPlan) {
            paymentAmountInput.value = this.value === 'monthly' 
              ? selectedPlan.monthlyPrice 
              : selectedPlan.yearlyPrice;
          }
        }
      });
    });
  
    // Handle file upload preview
    paymentEvidenceInput.addEventListener('change', function() {
      if (this.files && this.files[0]) {
        const file = this.files[0];
        fileNameSpan.textContent = file.name;
        
        // Validate file type
        if (!file.type.match('image.*')) {
          showToast("Please select an image file", "error");
          this.value = '';
          fileNameSpan.textContent = 'No file chosen';
          return;
        }
        
        // Validate file size (max 2MB)
        if (file.size > 2 * 1024 * 1024) {
          showToast("Image size should be less than 2MB", "error");
          this.value = '';
          fileNameSpan.textContent = 'No file chosen';
          return;
        }
        
        // Preview image
        const reader = new FileReader();
        reader.onload = function(e) {
          previewImage.src = e.target.result;
          imagePreviewSection.classList.remove("hidden");
        }
        reader.readAsDataURL(file);
      }
    });
  
    // Validate form inputs
    function validateForm() {
      if (!membershipPlanSelect.value) {
        showToast("Please select a membership plan", "error");
        return false;
      }
      
      if (!memberIdInput.value.trim()) {
        showToast("Please enter member ID", "error");
        return false;
      }
      
      if (!paymentAmountInput.value || parseFloat(paymentAmountInput.value) <= 0) {
        showToast("Please enter a valid payment amount", "error");
        return false;
      }
      
      if (!paymentDateInput.value) {
        showToast("Please select payment date", "error");
        return false;
      }
      
      if (!paymentEvidenceInput.files || !paymentEvidenceInput.files[0]) {
        showToast("Please upload payment evidence", "error");
        return false;
      }
      
      return true;
    }
  
    // Submit payment
    submitPaymentBtn.addEventListener('click', function() {
      if (!validateForm()) return;
      
      spinner.classList.remove("hidden");
      
      const formData = new FormData();
      formData.append("action", "record_payment");
      formData.append("membership_plan_id", membershipPlanSelect.value);
      formData.append("member_roll_id", memberIdInput.value.trim());
      formData.append("amount", paymentAmountInput.value);
      formData.append("type", document.querySelector('input[name="payment-type"]:checked').value);
      formData.append("currency", "LKR");
      formData.append("method", "manual");
      formData.append("payment_date", paymentDateInput.value);
      formData.append("evidence_image", paymentEvidenceInput.files[0]);
      
      const requestOptions = {
        method: "POST",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        body: formData,
      };
      
      fetch("http://localhost:8080/Group_Project_48/backend/api/controllers/staffController.php", requestOptions)
        .then(response => {
          if (!response.ok) throw new Error("Payment submission failed");
          return response.json();
        })
        .then(data => {
          spinner.classList.add("hidden");
          if (data.success) {
            showToast("Payment submitted successfully", "success");
            clearForm();
          } else {
            showToast(data.message || "Payment failed", "error");
          }
        })
        .catch(error => {
          console.error("Error submitting payment:", error);
          spinner.classList.add("hidden");
          showToast("Payment submission failed", "error");
        });
    });
  
    // Clear form
    function clearForm() {
      membershipPlanSelect.value = "";
      memberIdInput.value = "";
      paymentAmountInput.value = "";
      document.querySelector('input[name="payment-type"][value="monthly"]').checked = true;
      paymentDateInput.value = today;
      paymentEvidenceInput.value = "";
      fileNameSpan.textContent = "No file chosen";
      imagePreviewSection.classList.add("hidden");
      planDetailsSection.classList.add("hidden");
    }
  
    clearFormBtn.addEventListener('click', clearForm);
  
    // Toast notification function
    function showToast(message, type = 'success') {
      const container = document.getElementById('toast-container');
      const toast = document.createElement('div');
      toast.className = `toast ${type}`;
      toast.innerText = message;
  
      container.appendChild(toast);
  
      setTimeout(() => {
          toast.remove();
      }, 4000);
    }
  
    // Initialize the page
    fetchMembershipPlans();
  }