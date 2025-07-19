document.addEventListener("DOMContentLoaded", function () {
  const sections = document.querySelectorAll(".form-section");
  const viewButtons = document.querySelectorAll(".view-buttons button");
  const resultTable = document.getElementById("result-table");
  const resultBody = document.getElementById("result-body");

  viewButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      sections.forEach((sec) => sec.style.display = "none");
      const target = btn.getAttribute("data-target");
      document.getElementById(target).style.display = "block";
    });
  });

  const handleFormSubmit = async (formId, apiPath, method = "POST") => {
    const form = document.getElementById(formId);
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(form));
      try {
        const response = await fetch(`/api/${apiPath}`, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        const result = await response.json();
        alert(result.message || "Success");
        form.reset();
      } catch (err) {
        console.error(err);
        alert("An error occurred");
      }
    });
  };

  handleFormSubmit("customer-form", "add-customer");
  handleFormSubmit("vehicle-form", "add-vehicle");
  handleFormSubmit("employee-form", "add-employee");
  handleFormSubmit("service-form", "add-service");
  handleFormSubmit("inventory-form", "add-inventory");
  handleFormSubmit("billing-form", "add-billing");
  handleFormSubmit("update-form", "update", "PUT");
  handleFormSubmit("delete-form", "delete", "DELETE");

  document.getElementById("search-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const type = document.getElementById("search-type").value;
    const query = document.getElementById("search-query").value;
    try {
      const response = await fetch(`/api/search?type=${type}&query=${query}`);
      const result = await response.json();
      renderTable(result);
    } catch (err) {
      console.error(err);
      alert("Search failed");
    }
  });

  const renderTable = (data) => {
    resultBody.innerHTML = "";
    if (!data || data.length === 0) {
      resultBody.innerHTML = "<tr><td colspan='10'>No data found</td></tr>";
      return;
    }

    const headers = Object.keys(data[0]);
    resultTable.innerHTML = `
      <thead><tr>${headers.map(h => `<th>${h}</th>`).join("")}</tr></thead>
      <tbody id="result-body">
        ${data.map(row => `
          <tr>${headers.map(h => `<td>${row[h]}</td>`).join("")}</tr>
        `).join("")}
      </tbody>
    `;
  };
});
