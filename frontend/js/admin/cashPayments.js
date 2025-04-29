export function initAdmin_cashPayments() {
    console.log("Initializing admin/cashPayments.js");

    // Configuration
    const ITEMS_PER_PAGE = 10;
    let currentPage = 1;
    let totalPages = 1;
    let allPayments = [];
    let filteredPayments = [];

    // DOM Elements
    const paymentsTableBody = document.getElementById('payments-table-body');
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');
    const prevPageBtn = document.getElementById('prev-page');
    const nextPageBtn = document.getElementById('next-page');
    const pageInfo = document.getElementById('page-info');
    const imageModal = document.getElementById('image-modal');
    const closeModal = document.querySelector('.close-modal');
    const evidenceImage = document.getElementById('evidence-image');
    const loadingSpinner = document.getElementById('loading-spinner');

    // Initialize the page
    fetchPayments();
    
    // Event listeners
    searchBtn.addEventListener('click', handleSearch);
    searchInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') handleSearch();
    });
    
    prevPageBtn.addEventListener('click', goToPrevPage);
    nextPageBtn.addEventListener('click', goToNextPage);
    closeModal.addEventListener('click', closeImageModal);
    imageModal.addEventListener('click', (e) => {
        if (e.target === imageModal) closeImageModal();
    });

    // Functions
    function goToPrevPage() {
        if (currentPage > 1) {
            currentPage--;
            renderPayments();
        }
    }

    function goToNextPage() {
        if (currentPage < totalPages) {
            currentPage++;
            renderPayments();
        }
    }

    function closeImageModal() {
        imageModal.classList.add('hidden');
    }

    async function fetchPayments() {
        showLoading(true);
        
        const authToken = localStorage.getItem('authToken');
        if (!authToken) {
            showToast('Not authenticated. Please login again.', 'error');
            window.location.href = '/login';
            return;
        }
        
        try {
            const response = await fetch('http://localhost:8080/Group_Project_48/backend/api/controllers/adminController.php?action=get_cash_payments', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('Payments data:', data , data.success);
            
            if (data.success) {
                allPayments = data.payments;
                filteredPayments = [...allPayments];
                totalPages = Math.ceil(filteredPayments.length / ITEMS_PER_PAGE);
                renderPayments();
            } else {
                showToast(data.message || 'Failed to load payments', 'error');
            }
        } catch (error) {
            console.error('Error fetching payments:', error);
            showToast('Error fetching payments. Please try again.', 'error');
        } finally {
            showLoading(false);
        }
    }

    function renderPayments() {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        const paginatedPayments = filteredPayments.slice(startIndex, endIndex);
        
        paymentsTableBody.innerHTML = '';
        
        if (paginatedPayments.length === 0) {
            const emptyRow = document.createElement('tr');
            emptyRow.innerHTML = `<td colspan="8" style="text-align: center;">No payments found</td>`;
            paymentsTableBody.appendChild(emptyRow);
        } else {
            paginatedPayments.forEach(payment => {
                const row = document.createElement('tr');
                
                // Format date for display
                const paymentDate = new Date(payment.date_time);
                const formattedDate = paymentDate.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });
                
                // Format amount with currency
                const formattedAmount = `${payment.currency} ${parseFloat(payment.amount).toFixed(2)}`;
                
                // Create status badge with appropriate class
                const statusClass = payment.status.toLowerCase();
                
                row.innerHTML = `
                    <td>${payment.payment_record_id}</td>
                    <td>${formattedAmount}</td>
                    <td><span class="status-badge ${statusClass}">${payment.status}</span></td>
                    <td>${payment.method}</td>
                    <td>${formattedDate}</td>
                    <td>${payment.member_id}</td>
                    <td>${payment.full_name}</td>
                    <td>
                        <button class="action-btn view" 
                                data-id="${payment.payment_record_id}"
                                data-image="${payment.evidence_image || ''}">
                            <i class="fas fa-eye"></i> View
                        </button>
                    </td>
                `;
                
                paymentsTableBody.appendChild(row);
            });
            
            // Add event listeners to view buttons
            document.querySelectorAll('.action-btn.view').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const recordId = e.currentTarget.getAttribute('data-id');
                    const imageData = e.currentTarget.getAttribute('data-image');
                    viewEvidenceImage(recordId, imageData);
                });
            });
        }
        
        updatePaginationControls();
    }

    function handleSearch() {
        const searchTerm = searchInput.value.trim().toLowerCase();
        
        if (searchTerm === '') {
            filteredPayments = [...allPayments];
        } else {
            filteredPayments = allPayments.filter(payment => 
                payment.payment_record_id.toString().includes(searchTerm) ||
                payment.payment_id.toLowerCase().includes(searchTerm) ||
                payment.full_name.toLowerCase().includes(searchTerm) ||
                payment.member_id.toLowerCase().includes(searchTerm)
            );
        }
        
        currentPage = 1;
        totalPages = Math.ceil(filteredPayments.length / ITEMS_PER_PAGE);
        renderPayments();
    }

    function updatePaginationControls() {
        pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
        prevPageBtn.disabled = currentPage <= 1;
        nextPageBtn.disabled = currentPage >= totalPages;
    }

    function viewEvidenceImage(recordId, imageData) {
        if (!imageData) {
            showToast('No evidence image available for this payment', 'info');
            return;
        }
        
        try {
            evidenceImage.src = `data:image/jpeg;base64,${imageData}`;
            imageModal.classList.remove('hidden');
        } catch (error) {
            console.error('Error displaying payment image:', error);
            showToast('Error displaying payment image', 'error');
        }
    }

    function showLoading(show) {
        if (show) {
            loadingSpinner.classList.remove('hidden');
        } else {
            loadingSpinner.classList.add('hidden');
        }
    }

    function showToast(message, type = 'success') {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        
        container.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, 4000);
    }
}