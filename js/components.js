// UI Components and Utilities

// Toast notification system
function showToast(title, description, type = 'success') {
    const toastContainer = document.getElementById('toastContainer');
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    toast.innerHTML = `
        <div class="toast-title">${title}</div>
        <div class="toast-description">${description}</div>
    `;
    
    toastContainer.appendChild(toast);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        toast.remove();
    }, 5000);
}

// Modal functionality
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('show');
        document.body.style.overflow = 'auto';
    }
}

// Close modal when clicking outside
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        closeModal(e.target.id);
    }
});

// Close modal when clicking close button
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-close')) {
        const modal = e.target.closest('.modal');
        if (modal) {
            closeModal(modal.id);
        }
    }
});

// Generate unique booking ID
function generateBookingId() {
    return `TN${Date.now().toString().slice(-6)}`;
}

// Format date for display
function formatDate(date) {
    return date.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Format time for display
function formatTime(time24) {
    const [hours, minutes] = time24.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
}

// Calculate end time
function calculateEndTime(startTime, duration) {
    const [hours, minutes] = startTime.split(':');
    const startHour = parseInt(hours);
    const endHour = startHour + parseInt(duration);
    
    // Handle day overflow
    const displayEndHour = endHour > 24 ? endHour - 24 : endHour;
    const endTime24 = `${displayEndHour.toString().padStart(2, '0')}:${minutes}`;
    
    return {
        time24: endTime24,
        display: formatTime(endTime24),
        nextDay: endHour > 24
    };
}

// Download receipt functionality
function downloadReceipt() {
    const receiptContent = document.getElementById('receiptContent');
    
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>TuneSpace Booking Receipt</title>
            <style>
                body { 
                    font-family: Arial, sans-serif; 
                    padding: 20px; 
                    max-width: 600px; 
                    margin: 0 auto; 
                }
                .receipt { 
                    border: 1px dashed #333; 
                    padding: 20px; 
                }
                .receipt-header { 
                    text-align: center; 
                    margin-bottom: 20px; 
                    border-bottom: 1px solid #333; 
                    padding-bottom: 10px; 
                }
                .detail-row { 
                    display: flex; 
                    justify-content: space-between; 
                    margin-bottom: 5px; 
                }
                .detail-row.total { 
                    border-top: 1px solid #333; 
                    padding-top: 10px; 
                    font-weight: bold; 
                }
                .receipt-footer { 
                    text-align: center; 
                    font-size: 12px; 
                    margin-top: 20px; 
                    border-top: 1px solid #333; 
                    padding-top: 10px; 
                }
            </style>
        </head>
        <body>
            ${receiptContent.outerHTML}
        </body>
        </html>
    `);
    
    printWindow.document.close();
    printWindow.print();
}

// Initialize Lucide icons
function initializeIcons() {
    // Initialize Lucide icons after DOM content is loaded
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

// Utility function to get today's date in YYYY-MM-DD format
function getTodayDate() {
    return new Date().toISOString().split('T')[0];
}

// Utility function to get minimum date (today)
function setMinDate() {
    const dateInput = document.getElementById('bookingDate');
    if (dateInput) {
        dateInput.min = getTodayDate();
    }
}

// Export functions for use in other files
window.Components = {
    showToast,
    openModal,
    closeModal,
    generateBookingId,
    formatDate,
    formatTime,
    calculateEndTime,
    downloadReceipt,
    initializeIcons,
    getTodayDate,
    setMinDate
};