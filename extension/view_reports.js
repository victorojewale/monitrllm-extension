import { CONFIG } from './config.js';

async function getUniqueId() {
  return new Promise((resolve) => {
    chrome.storage.sync.get("uniqueUserId", (data) => {
      if (data.uniqueUserId) {
        resolve(data.uniqueUserId);
      } else {
        const newUserId = `user_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
        chrome.storage.sync.set({ uniqueUserId: newUserId }, () => {
          resolve(newUserId);
        });
      }
    });
  });
}

document.addEventListener("DOMContentLoaded", async function () {
  let user_id = await getUniqueId();
  console.log("User ID during retrieval:", user_id); // Log the unique ID for debugging

  fetch(`${CONFIG.API_BASE_URL}/reports/?user_id=${user_id}`, {
    credentials: "include",
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((data) => {
      console.log("Fetched data:", data); // Log fetched data to ensure it's correct
      let reportsContainer = document.getElementById("reports");

      if (data.length === 0) {
        reportsContainer.innerHTML = "<p>No reports found.</p>";
      } else {
        data.forEach((report) => {
          let reportDiv = document.createElement("div");
          reportDiv.className = "report";
          reportDiv.innerHTML = `
            <p><strong>Feedback:</strong> ${report.feedback}</p>
            <p><strong>Purpose:</strong> ${report.purpose || "N/A"}</p>
            <p><strong>Outcome:</strong> ${report.outcome || "N/A"}</p>
            <p><strong>Conversation Link:</strong> <a href="${report.conversation_link}" target="_blank">${report.conversation_link}</a></p>
            <p><strong>Rating:</strong> ${report.rating || "N/A"}</p>
            <p class="timestamp">Reported on: ${new Date(report.timestamp).toLocaleString()}</p>
            <button class="delete-button" data-report-id="${report.id}">Delete</button>
          `;
          reportsContainer.appendChild(reportDiv);
        });

        // Attach delete functionality to each delete button
        const deleteButtons = document.querySelectorAll(".delete-button");
        deleteButtons.forEach((button) => {
          button.addEventListener("click", function () {
            const reportId = this.getAttribute("data-report-id");
            deleteReport(reportId);
          });
        });
      }
    })
    .catch((error) => {
      console.error("Error loading reports:", error);
      let reportsContainer = document.getElementById("reports");
      reportsContainer.innerHTML = "<p>Error loading reports.</p>";
    });
});

// Function to send DELETE request to backend
function deleteReport(reportId) {
  if (confirm("Are you sure you want to delete this report?")) {
    fetch(`${CONFIG.API_BASE_URL}/reports/${reportId}/`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to delete the report.");
        }
        return response.json();
      })
      .then(() => {
        alert("Report deleted successfully.");
        location.reload(); // Refresh the page to show updated reports
      })
      .catch((error) => {
        console.error("Error deleting report:", error);
        alert("Error deleting the report. Please try again.");
      });
  }
}
