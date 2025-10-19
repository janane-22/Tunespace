class BookingManager {
    constructor() {
        this.selectedStudio = null;
        this.bookings = JSON.parse(localStorage.getItem('tuneSpaceBookings') || '[]');
        this.initializeBooking();
    }

    initializeBooking() {
        this.bindEvents();
        Components.setMinDate();
        this.setupModalCloseButtons();
    }

    bindEvents() {
        const bookBtns = document.querySelectorAll('.book-btn');
        const bookingForm = document.getElementById('bookingForm');
        const durationSelect = document.getElementById('duration');
        const downloadReceiptBtn = document.getElementById('downloadReceipt');

        bookBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                if (!window.authManager.isAuthenticated()) {
                    Components.showToast('Error', 'Please login to book a studio.', 'error');
                    return;
                }

                const studioClass = btn.dataset.studio;
                const studioName = btn.dataset.name;
                const studioPrice = parseInt(btn.dataset.price);
                const studioCapacity = parseInt(btn.dataset.capacity);

                this.selectedStudio = {
                    class: studioClass,
                    name: studioName,
                    price: studioPrice,
                    capacity: studioCapacity
                };

                this.showBookingModal();
            });
        });

        if (bookingForm) bookingForm.addEventListener('submit', e => {
            e.preventDefault();
            this.handleBookingSubmission();
        });

        if (durationSelect) durationSelect.addEventListener('change', () => {
            this.updateCostSummary();
        });

        if (downloadReceiptBtn) downloadReceiptBtn.addEventListener('click', () => {
            Components.downloadReceipt();
        });
    }

    setupModalCloseButtons() {
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', () => {
                const modal = btn.closest('.modal');
                if (modal) modal.style.display = 'none';
            });
        });
    }

    showBookingModal() {
        if (!this.selectedStudio) return;

        document.getElementById('bookingTitle').textContent = `Book ${this.selectedStudio.name}`;
        document.getElementById('selectedStudioName').textContent = this.selectedStudio.name;
        document.getElementById('selectedStudioPrice').textContent = `₹${this.selectedStudio.price.toLocaleString('en-IN')} per hour • Up to ${this.selectedStudio.capacity} people`;
        document.getElementById('hourlyRate').textContent = `₹${this.selectedStudio.price.toLocaleString('en-IN')}`;

        const bookingForm = document.getElementById('bookingForm');
        if (bookingForm) bookingForm.reset();

        this.updateCostSummary();
        Components.setMinDate();
        Components.openModal('bookingModal');
    }

    updateCostSummary() {
        if (!this.selectedStudio) return;

        const duration = parseInt(document.getElementById('duration').value) || 0;
        const rate = this.selectedStudio.price;
        const total = duration * rate;

        document.getElementById('hourlyRate').textContent = `₹${rate.toLocaleString('en-IN')}`;
        document.getElementById('durationDisplay').textContent = `${duration} hours`;
        document.getElementById('totalCost').textContent = `₹${total.toLocaleString('en-IN')}`;
    }

    handleBookingSubmission() {
        const date = document.getElementById('bookingDate').value;
        const startTimeRaw = document.getElementById('startTime').value;
        const durationRaw = document.getElementById('duration').value;
        const purpose = document.getElementById('purpose').value;

        if (!date || !startTimeRaw || !durationRaw || !purpose) {
            Components.showToast('Error', 'Please fill in all fields', 'error');
            return;
        }

        const duration = parseInt(durationRaw, 10);

        function addHoursToTime(timeStr, hrs) {
            let [h, m, s] = timeStr.split(':').map(Number);
            if (isNaN(s)) s = 0;
            let endHour = h + hrs;
            if (endHour >= 24) endHour -= 24;
            return `${String(endHour).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
        }

        const startTime = startTimeRaw.length === 5 ? startTimeRaw + ':00' : startTimeRaw;
        const endTime = addHoursToTime(startTime, duration);

        const studioId = window.selectedStudioId || '1';
        const currentUser = window.authManager.getCurrentUser();
        const userId = currentUser?.user_id || currentUser?.id || '1'; // fallback if no user ID

        const payload = {
            studio_id: studioId,
            user_id: userId,
            date: date,
            start_time: startTime,
            end_time: endTime,
            duration: duration,
            purpose: purpose
        };

        console.log('Booking payload:', payload);

        fetch('http://127.0.0.1:5000/bookings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        })
        .then(res => res.json())
        .then(response => {
            console.log('Backend response:', response);
            if (response.success) {
                Components.showToast('Booking Confirmed!', `Your studio has been booked for ${Components.formatDate(new Date(date))}.`);
                this.bookings.push({
                    id: Components.generateBookingId(),
                    studioName: this.selectedStudio.name,
                    studioClass: this.selectedStudio.class,
                    studioPrice: this.selectedStudio.price,
                    date: date,
                    startTime: startTime,
                    duration: duration,
                    purpose: purpose,
                    totalCost: this.selectedStudio.price * duration,
                    bookingTime: new Date(),
                    userId: userId
                });
                localStorage.setItem('tuneSpaceBookings', JSON.stringify(this.bookings));
                Components.closeModal('bookingModal');
                this.showReceipt(this.bookings[this.bookings.length - 1]);
            } else {
                alert('Booking failed: ' + (response.error || 'Unknown error'));
            }
        })
        .catch(error => {
            alert('Error submitting booking: ' + error.message);
        });
    }

    hasConflictingBooking(newBooking) {
        const newStart = new Date(`${newBooking.date}T${newBooking.startTime}`);
        const newEnd = new Date(newStart.getTime() + (newBooking.duration * 60 * 60 * 1000));
        return this.bookings.some(booking => {
            if (booking.studioClass !== this.selectedStudio.class || booking.date !== newBooking.date) {
                return false;
            }
            const existingStart = new Date(`${booking.date}T${booking.startTime}`);
            const existingEnd = new Date(existingStart.getTime() + (booking.duration * 60 * 60 * 1000));
            return newStart < existingEnd && newEnd > existingStart;
        });
    }

    showReceipt(booking) {
        const receiptId = document.getElementById('receiptBookingId');
        const receiptStudio = document.getElementById('receiptStudio');
        const receiptDate = document.getElementById('receiptDate');
        const receiptTime = document.getElementById('receiptTime');
        const receiptDuration = document.getElementById('receiptDuration');
        const receiptPurpose = document.getElementById('receiptPurpose');
        const receiptTotal = document.getElementById('receiptTotal');

        const timeRange = (() => {
            const start = new Date(`1970-01-01T${booking.startTime}`);
            const end = new Date(start.getTime() + booking.duration * 3600000);
            const options = { hour: 'numeric', minute: 'numeric', hour12: true };
            let endDay = false;
            if (end.getDate() !== start.getDate()) endDay = true;
            return { formatted: `${start.toLocaleTimeString('en-US', options)} - ${end.toLocaleTimeString('en-US', options)}${endDay ? ' (+1 day)' : ''}` };
        })();

        receiptId.textContent = booking.id;
        receiptStudio.textContent = booking.studioName;
        receiptDate.textContent = Components.formatDate(new Date(booking.date));
        receiptTime.textContent = timeRange.formatted;
        receiptDuration.textContent = `${booking.duration} hours`;
        receiptPurpose.textContent = booking.purpose;
        receiptTotal.textContent = `₹${booking.totalCost.toLocaleString('en-IN')}`;
        Components.openModal('receiptModal');
    }

    getUserBookings() {
        const user = window.authManager.getCurrentUser();
        return user ? this.bookings.filter(b => b.userId === user.email) : [];
    }

    getAllBookings() {
        return this.bookings;
    }

    getBookingsByDate(date) {
        return this.bookings.filter(b => b.date === date);
    }

    getBookingsByStudio(studioClass) {
        return this.bookings.filter(b => b.studioClass === studioClass);
    }
}

window.bookingManager = new BookingManager();
window.selectedStudioId = null;

document.getElementById('duration').addEventListener('change', () => {
    const durationInput = document.get
