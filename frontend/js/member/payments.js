export async function initMember_payments() {
    console.log("Initializing payments.js");
  
    const paymentList = document.getElementById('paymentHistoryList');
    const iconUrl = 'https://cdn.builder.io/api/v1/image/assets/TEMP/ac58bc182abb457871439b9b65b2f6ea5ba64f82b7b4681906f421fbb22c192e?apiKey=015e1c54eb5347dfb8c175d60fbc5fdf';
  
    async function getSubscriptionListOfMember() {
      try {
        console.log("Fetching membership plan ID of member");
  
        const authToken = localStorage.getItem("authToken");
        if (!authToken) {
          throw new Error("Auth token not found. Please log in.");
        }
  
        const requestOptions = {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${authToken}` },
          redirect: 'follow'
        };
  
        const response = await fetch("http://localhost:8080/Group_Project_48/backend/api/controllers/memberController.php?action=payment_list", requestOptions);
  
        if (!response.ok) throw new Error("Failed to fetch subscription of the member");
  
        const subscription = await response.json();
        console.log("Fetched Payments:", subscription);
        return subscription;
      } catch (error) {
        console.error("Error fetching subscription of the member:", error);
        return [];
      }
    }
  
    const payments = await getSubscriptionListOfMember();
  
    if (payments && payments.length > 0) {
      payments.forEach(payment => {
        const listItem = document.createElement('li');
        listItem.className = 'payment-history__item';
  
        const paymentDate = new Date(payment.date_time);
        const displayDate = paymentDate.toLocaleDateString('en-US', {
          day: 'numeric', month: 'short', year: 'numeric'
        });
  
        const displayTime = paymentDate.toLocaleTimeString('en-US', {
          hour: '2-digit', minute: '2-digit'
        });
  
        listItem.innerHTML = `
          <article class="payment-record">
            <img src="${iconUrl}" alt="Payment icon" class="payment-record__icon" />
            <div class="payment-record__details">
              <h3 class="payment-record__status">${payment.status || 'Payment Done'}</h3>
              <div class="payment-record__meta">
                <time class="payment-record__date" datetime="${payment.date}">${displayDate}</time>
                <span class="payment-record__time">at ${displayTime}</span>
              </div>
            </div>
            <span class="payment-record__amount">$ ${payment.amount}</span>
          </article>
        `;
        paymentList.appendChild(listItem);
      });
    } else {
      paymentList.innerHTML = "<p>No payment history available.</p>";
    }
  }
  