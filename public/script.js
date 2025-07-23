// Global variables for session management
let sessionId = null;
let userRole = 'visitor'; // default

document.addEventListener("DOMContentLoaded", function() {
  // Get session ID from URL or localStorage
  const urlParams = new URLSearchParams(window.location.search);
  sessionId = urlParams.get('session') || localStorage.getItem('sessionId');
  
  // Fetch user info and setup UI
  if (sessionId) {
    fetch('/api/user', {
      headers: { 'x-session-id': sessionId }
    })
    .then(res => res.json())
    .then(data => {
      if (data.role) {
        userRole = data.role;
        setupRoleBasedUI(userRole);
        updateUserInfo(data.username, data.role);
      } else {
        setupRoleBasedUI('visitor');
      }
    })
    .catch(err => {
      console.error('Failed to get user info:', err);
      // Redirect to login if session is invalid
      window.location.href = '/login.html';
    });
  } else {
    window.location.href = '/login.html';
  }
  
  // UI Setup
  const sections = document.querySelectorAll(".form-section");
  const viewButtons = document.querySelectorAll(".view-buttons button");
  
  viewButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      // Hide all sections
      sections.forEach(sec => sec.style.display = "none");
      
      // Reset all button styles
      viewButtons.forEach(b => b.style.backgroundColor = "");
      
      // Show target section and highlight button
      const targetSection = document.getElementById(btn.dataset.target);
      if (targetSection) {
        targetSection.style.display = "block";
        btn.style.backgroundColor = "#0353e9";
      }
    });
  });

  // Show the first section by default and highlight the first button
  if (sections.length > 0) {
    sections[0].style.display = "block";
  }
  if (viewButtons.length > 0) {
    viewButtons[0].style.backgroundColor = "#0353e9";
  }



  // Form Handler with session authentication
  const handleForm = async (formId, endpoint, method = "POST") => {
    const form = document.getElementById(formId);
    if (!form) return; // Form might be hidden for visitor role
    
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      try {
        const data = Object.fromEntries(new FormData(form));
        const res = await fetch(`/api/${endpoint}`, {
          method,
          headers: { 
            "Content-Type": "application/json",
            "x-session-id": sessionId
          },
          body: JSON.stringify(data)
        });
        const result = await res.json();
        
        if (res.status === 403) {
          showAlert("Access denied. You don't have permission for this action.", "error");
        } else {
          showAlert(result.message || "Operation successful");
          form.reset();
        }
      } catch (err) {
        showAlert("Operation failed", "error");
        console.error(err);
      }
    });
  };

  // Register forms
  handleForm("customer-form", "add-customer");
  handleForm("vehicle-form", "add-vehicle");
  handleForm("employee-form", "add-employee");
  handleForm("service-form", "add-service");
  handleForm("inventory-form", "add-inventory");
  handleForm("billing-form", "add-billing");
  handleForm("update-form", "update-service", "PUT");
  handleForm("delete-form", "delete-vehicle", "DELETE");

  // View Data Functions
  async function viewData(table) {
    try {
      const res = await fetch(`/api/${table}`, {
        headers: { "x-session-id": sessionId }
      });
      const data = await res.json();
      
      if (res.status === 403) {
        showAlert("Access denied. You don't have permission to view this data.", "error");
        return;
      }
      
      renderTable(data, userRole);
    } catch (err) {
      showAlert(`Failed to load ${table}`, "error");
      console.error(err);
    }
  }

  // Search Functionality
  document.getElementById("search-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const type = document.getElementById("search-type").value;
    const query = document.getElementById("search-query").value;
    
    try {
      const res = await fetch(`/api/search-${type}?field=name&query=${query}`);
      const data = await res.json();
      renderTable(data);
    } catch (err) {
      showAlert("Search failed", "error");
      console.error(err);
    }
  });

  // Helper Functions
  function renderTable(data, role = 'visitor') {
    const table = document.getElementById("result-table");
    const tbody = document.getElementById("result-body");
    
    if (!data || data.length === 0) {
      tbody.innerHTML = "<tr><td colspan='10'>No data found</td></tr>";
      return;
    }

    const headers = Object.keys(data[0]);
    const isAdmin = role === 'admin';
    
    // Add actions column header if admin
    const headerRow = headers.map(h => `<th>${h}</th>`).join("") + 
                      (isAdmin ? "<th>Actions</th>" : "");
    
    const bodyRows = data.map(row => {
      const rowData = headers.map(h => `<td>${row[h]}</td>`).join("");
      const actions = isAdmin ? 
        `<td>
          <button class="update-btn" onclick="editRow(this)">Edit</button>
          <button class="delete-btn" onclick="deleteRow(this)">Delete</button>
        </td>` : "";
      return `<tr>${rowData}${actions}</tr>`;
    }).join("");
    
    table.innerHTML = `
      <thead><tr>${headerRow}</tr></thead>
      <tbody>${bodyRows}</tbody>
    `;
  }
  
  // Role-based UI setup
  function setupRoleBasedUI(role) {
    const adminOnlyElements = document.querySelectorAll('.admin-only');
    const visitorOnlyElements = document.querySelectorAll('.visitor-only');
    
    if (role === 'admin') {
      // Show admin elements, hide visitor elements
      adminOnlyElements.forEach(el => {
        el.classList.remove('hidden');
      });
      visitorOnlyElements.forEach(el => {
        el.classList.add('hidden');
      });
    } else {
      // Hide admin elements, show visitor elements
      adminOnlyElements.forEach(el => {
        el.classList.add('hidden');
      });
      visitorOnlyElements.forEach(el => {
        el.classList.remove('hidden');
      });
    }
  }
  
  // Update user info display
  function updateUserInfo(username, role) {
    const userInfo = document.getElementById('user-info');
    if (userInfo) {
      userInfo.innerHTML = `<span>Welcome, ${username} (${role})</span>`;
    }
  }
  
  // Logout function
  window.logout = async function() {
    try {
      await fetch('/api/logout', {
        method: 'POST',
        headers: { 'x-session-id': sessionId }
      });
      localStorage.removeItem('sessionId');
      window.location.href = '/login.html';
    } catch (err) {
      console.error('Logout failed:', err);
      // Still redirect even if logout fails
      localStorage.removeItem('sessionId');
      window.location.href = '/login.html';
    }
  };
  
  // Global functions for table actions (admin only)
  window.editRow = function(button) {
    if (userRole !== 'admin') {
      showAlert("Access denied. Only admins can edit records.", "error");
      return;
    }
    
    const row = button.closest('tr');
    const cells = row.querySelectorAll('td:not(:last-child)');
    
    cells.forEach(cell => {
      if (!cell.hasAttribute('contenteditable')) {
        cell.setAttribute('contenteditable', 'true');
        cell.style.backgroundColor = '#3a3a3a';
      }
    });
    
    button.textContent = 'Save';
    button.onclick = () => saveRow(button);
  };
  
  window.saveRow = function(button) {
    const row = button.closest('tr');
    const cells = row.querySelectorAll('td:not(:last-child)');
    
    cells.forEach(cell => {
      cell.removeAttribute('contenteditable');
      cell.style.backgroundColor = '';
    });
    
    button.textContent = 'Edit';
    button.onclick = () => editRow(button);
    showAlert("Row updated successfully");
  };
  
  window.deleteRow = function(button) {
    if (userRole !== 'admin') {
      showAlert("Access denied. Only admins can delete records.", "error");
      return;
    }
    
    if (confirm('Are you sure you want to delete this record?')) {
      button.closest('tr').remove();
      showAlert("Record deleted successfully");
    }
  };

  function showAlert(message, type = "success") {
    const alert = document.createElement("div");
    alert.className = `alert ${type}`;
    alert.textContent = message;
    document.body.appendChild(alert);
    setTimeout(() => alert.remove(), 3000);
  }
});