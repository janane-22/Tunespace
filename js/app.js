class TuneSpaceApp {
    constructor() {
        this.init();
    }

    init() {
        // Wait for DOM to be fully loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.onDOMReady();
            });
        } else {
            this.onDOMReady();
        }
    }

    onDOMReady() {
        // Initialize Lucide icons
        Components.initializeIcons();
        
        // Initialize smooth scrolling for navigation
        this.initializeNavigation();
        
        // Initialize keyboard shortcuts
        this.initializeKeyboardShortcuts();
        
        // Initialize responsive behavior
        this.initializeResponsive();
        
        // Log application start
        console.log('TuneSpace application initialized successfully');
    }

    initializeNavigation() {
        const navLinks = document.querySelectorAll('.nav-link');
        
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const section = link.dataset.section;
                
                if (section === 'studios') {
                    e.preventDefault();
                    document.getElementById('studios').scrollIntoView({ 
                        behavior: 'smooth' 
                    });
                } else if (section === 'bookings') {
                    this.showUserBookings();
                } else if (section === 'admin') {
                    this.showAdminPanel();
                }
            });
        });

        // Brand logo click - scroll to top
        const navBrand = document.querySelector('.nav-brand');
        navBrand.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    initializeKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // ESC key to close modals
            if (e.key === 'Escape') {
                const openModals = document.querySelectorAll('.modal.show');
                openModals.forEach(modal => {
                    Components.closeModal(modal.id);
                });
            }
            
            // Ctrl/Cmd + K to open login modal
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                if (!window.authManager.isAuthenticated()) {
                    window.authManager.showAuthModal('login');
                }
            }
        });
    }

    initializeResponsive() {
        // Handle mobile menu if needed
        // Add responsive behavior for smaller screens
        this.handleViewportChanges();
        
        window.addEventListener('resize', () => {
            this.handleViewportChanges();
        });
    }

    handleViewportChanges() {
        const isMobile = window.innerWidth < 768;
        
        // Adjust modal sizes for mobile
        const modals = document.querySelectorAll('.modal-content');
        modals.forEach(modal => {
            if (isMobile) {
                modal.style.width = '95%';
                modal.style.margin = '1rem';
            } else {
                modal.style.width = '';
                modal.style.margin = '';
            }
        });
    }

    showUserBookings() {
        const userBookings = window.bookingManager.getUserBookings();
        
        if (userBookings.length === 0) {
            Components.showToast('No Bookings', 'You haven\'t made any bookings yet.', 'info');
            return;
        }

        // Create bookings display modal
        this.createBookingsModal(userBookings, 'My Bookings');
    }

    showAdminPanel() {
        if (!window.authManager.isAdmin()) {
            Components.showToast('Access Denied', 'Admin access required.', 'error');
            return;
        }

        const allBookings = window.bookingManager.getAllBookings();
        this.createBookingsModal(allBookings, 'Admin Panel - All Bookings');
    }

    createBookingsModal(bookings, title) {
        // Remove existing bookings modal if present
        const existingModal = document.getElementById('bookingsModal');
        if (existingModal) {
            existingModal.remove();
        }

        // Create new modal
        const modal = document.createElement('div');
        modal.id = 'bookingsModal';
        modal.className = 'modal show';
        
        const bookingsList = bookings.map(booking => {
            const endTime = Components.calculateEndTime(booking.startTime, booking.duration);
            const timeDisplay = `${Components.formatTime(booking.startTime)} - ${endTime.display}${endTime.nextDay ? ' (+1 day)' : ''}`;
            
            return `
                <div class="booking-item" style="border: 1px solid hsl(var(--border)); border-radius: 0.5rem; padding: 1rem; margin-bottom: 1rem;">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem;">
                        <h4 style="margin: 0;">${booking.studioName}</h4>
                        <span style="font-weight: bold; color: hsl(var(--primary));">
  ₹${booking.totalCost != null ? booking.totalCost.toLocaleString('en-IN') : 'N/A'}
</span>

                    </div>
                    <div style="color: hsl(var(--muted-foreground)); font-size: 0.875rem;">
                        <p><strong>ID:</strong> ${booking.id}</p>
                        <p><strong>Date:</strong> ${Components.formatDate(new Date(booking.date))}</p>
                        <p><strong>Time:</strong> ${timeDisplay}</p>
                        <p><strong>Duration:</strong> ${booking.duration} hours</p>
                        <p><strong>Purpose:</strong> ${booking.purpose}</p>
                        ${window.authManager.isAdmin() ? `<p><strong>User:</strong> ${booking.userId}</p>` : ''}
                    </div>
                </div>
            `;
        }).join('');

        modal.innerHTML = `
            <div class="modal-content modal-lg">
                <div class="modal-header">
                    <h3>${title}</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    ${bookings.length === 0 ? 
                        '<p style="text-align: center; color: hsl(var(--muted-foreground));">No bookings found.</p>' : 
                        bookingsList
                    }
                </div>
                <div class="modal-footer">
                    <button class="btn btn-primary" onclick="Components.closeModal('bookingsModal')">Close</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Add close functionality
        modal.addEventListener('click', (e) => {
            if (e.target === modal || e.target.classList.contains('modal-close')) {
                modal.remove();
            }
        });
    }

    // Utility methods
    scrollToTop() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    scrollToSection(sectionId) {
        const section = document.getElementById(sectionId);
        if (section) {
            section.scrollIntoView({ behavior: 'smooth' });
        }
    }
}

// Initialize the application
window.tuneSpaceApp = new TuneSpaceApp();

// Global error handler
window.addEventListener('error', (e) => {
    console.error('TuneSpace Application Error:', e.error);
    Components.showToast('Error', 'Something went wrong. Please refresh the page.', 'error');
});

// Global unhandled promise rejection handler
window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled Promise Rejection:', e.reason);
    Components.showToast('Error', 'Something went wrong. Please try again.', 'error');
});
fetch('http://127.0.0.1:5000/studios')
  .then(response => response.json())
  .then(data => {
    // Use received data to update your UI dynamically
    console.log(data);
    // Code to insert studios data into your page
  })
  .catch(error => {
    console.error('Error fetching data:', error);
  });
  //if prob this is the thig you have to clear 
  window.onload = function() {
  fetch('http://127.0.0.1:5000/studios')
    .then(response => response.json())
    .then(data => {
        const featuresList = [
  [ // 1st Class
    "Neumann U87 Ai (Microphones)",
    "Universal Audio Apollo x8 (Audio Interface / Mixer)",
    "Focal Trio6 Be (Studio Monitors)",
    "Nord Stage 3 (Keyboard / Synth)",
    "DW Collector’s Drum Kit"
  ],
  [ // 2nd Class
    "Shure SM7B (Microphones)",
    "Focusrite Scarlett 18i20 (Audio Interface / Mixer)",
    "Yamaha HS8 (Studio Monitors)",
    "Roland Juno-DS61 (Keyboard / Synth)",
    "Pearl Export Series (Drum Kit)"
  ],
  [ // 3rd Class
    "Audio-Technica AT2020 (Microphones)",
    "Behringer UMC404HD (Audio Interface / Mixer)",
    "KRK Rokit 5 (Studio Monitors)",
    "Casio CT-X700 (Keyboard / Synth)",
    "Tama Imperialstar (Drum Kit)"
  ]
];

      // Assuming data is an array of studios matching your static cards
      data.forEach((studio, index) => {
  const card = document.querySelectorAll('.studio-card')[index];
  if (!card) return;

  // Set names and prices as you desire
  let displayName = '';
  let displayPrice = '';

  if (index === 0) {
    displayName = '1st Class Studio';
    displayPrice = '1500.00';
  } else if (index === 1) {
    displayName = '2nd Class Studio';
    displayPrice = '800.00';
  } else if (index === 2) {
    displayName = '3rd Class Studio';
    displayPrice = '500.00';
  }

  // Name
  const nameEl = card.querySelector('h3');
  if (nameEl) nameEl.textContent = displayName;

  // Price
  const priceEl = card.querySelector('.studio-price');
  if (priceEl) priceEl.innerHTML = `₹${displayPrice}<span>/hour</span>`;

  // Facilities/features as before
  const featuresEl = card.querySelector('.studio-features');
if (featuresEl) {
  featuresEl.innerHTML = '';
  featuresList[index].forEach(feature => {
    const li = document.createElement('li');
    li.innerHTML = `<i data-lucide="check"></i> ${feature}`;
    featuresEl.appendChild(li);
  });
}



        // Update image src and alt
        const imgEl = card.querySelector('.studio-image img');
        if (imgEl) {
          imgEl.src = studio.image_url || imgEl.src;
          imgEl.alt = studio.name || imgEl.alt;
        }

        // Update badge text (optional)
        const badgeEl = card.querySelector('.studio-badge');
        if (badgeEl && studio.badge) {
          badgeEl.textContent = studio.badge;
          badgeEl.className = `studio-badge ${studio.badge.toLowerCase()}`;
        }

        // Update data attributes on Book Now button
        const btn = card.querySelector('.book-btn');
        if (btn) {
          btn.setAttribute('data-studio', studio.class || '');
          btn.setAttribute('data-name', studio.name || '');
          btn.setAttribute('data-price', studio.hourly_rate || '0');
          btn.setAttribute('data-capacity', studio.capacity || '');
        }
      });

      // Refresh lucide icons for check marks
      if (window.lucide) {
        window.lucide.createIcons();
      }
    })
    .catch(error => {
      console.error('Error loading studios:', error);
    });
};

