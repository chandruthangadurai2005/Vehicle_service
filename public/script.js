document.addEventListener("DOMContentLoaded", function() {
  // UI Setup
  const sections = document.querySelectorAll(".form-section");
  const viewButtons = document.querySelectorAll(".view-buttons button");
  
  viewButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      sections.forEach(sec => sec.style.display = "none");
      document.getElementById(btn.dataset.target).style.display = "block";
    });
  });

  // Form Handler
  const handleForm = async (formId, endpoint, method = "POST") => {
    const form = document.getElementById(formId);
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      try {
        const data = Object.fromEntries(new FormData(form));
        const res = await fetch(`/api/${endpoint}`, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data)
        });
        const result = await res.json();
        showAlert(result.message || "Operation successful");
        form.reset();
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
      const res = await fetch(`/api/${table}`);
      const data = await res.json();
      renderTable(data);
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
  function renderTable(data) {
    const table = document.getElementById("result-table");
    const tbody = document.getElementById("result-body");
    
    if (!data || data.length === 0) {
      tbody.innerHTML = "<tr><td colspan='10'>No data found</td></tr>";
      return;
    }

    const headers = Object.keys(data[0]);
    table.innerHTML = `
      <thead><tr>${headers.map(h => `<th>${h}</th>`).join("")}</tr></thead>
      <tbody>${data.map(row => 
        `<tr>${headers.map(h => `<td>${row[h]}</td>`).join("")}</tr>`
      ).join("")}</tbody>
    `;
  }

  function showAlert(message, type = "success") {
    const alert = document.createElement("div");
    alert.className = `alert ${type}`;
    alert.textContent = message;
    document.body.appendChild(alert);
    setTimeout(() => alert.remove(), 3000);
  }
});