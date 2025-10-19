// NotFound.js - Vanilla JavaScript version for non-React project

function showNotFound(pathname = window.location.pathname) {
  // Log the error to console
  console.error(
    "404 Error: User attempted to access non-existent route:",
    pathname
  );

  // Return the HTML content for the 404 page
  return `
    <div class="min-h-screen flex items-center justify-center bg-gray-100">
      <div class="text-center">
        <h1 class="text-4xl font-bold mb-4">404</h1>
        <p class="text-xl text-gray-600 mb-4">Oops! Page not found</p>
        <a href="/" class="text-blue-500 hover:text-blue-700 underline">
          Return to Home
        </a>
      </div>
    </div>
  `;
}

// If you want to automatically display the 404 page, you can call this function
function displayNotFound(containerId = 'app', pathname = window.location.pathname) {
  const container = document.getElementById(containerId);
  if (container) {
    container.innerHTML = showNotFound(pathname);
  }
}

// Export for use in other files
if (typeof window !== 'undefined') {
  window.NotFound = {
    show: showNotFound,
    display: displayNotFound
  };
}
