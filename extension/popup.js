import { CONFIG } from './config.js';

// Function to generate and retrieve a unique user ID
async function getUniqueId() {
  return new Promise((resolve) => {
    chrome.storage.sync.get("uniqueUserId", (data) => {
      if (data.uniqueUserId) {
        resolve(data.uniqueUserId); // If the unique ID exists, return it
      } else {
        const newUserId = `user_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
        chrome.storage.sync.set({ uniqueUserId: newUserId }, () => {
          resolve(newUserId);
        });
      }
    });
  });
}

// When the popup loads, check if a submission was made today; if not, display a reminder.
document.addEventListener("DOMContentLoaded", () => {
  const today = new Date().toISOString().split("T")[0];
  chrome.storage.sync.get("lastSubmissionDate", (data) => {
    if (data.lastSubmissionDate !== today) {
      const reminder = document.createElement("p");
      reminder.textContent = "You haven't submitted any conversation link today.";
      reminder.style.color = "red";
      reminder.style.fontWeight = "bold";
      reminder.style.textAlign = "center";
      reminder.style.marginBottom = "10px";

      // Insert reminder into the designated container
      const container = document.getElementById("dailyReminder");
      if (container) {
        container.appendChild(reminder);
      }
    }
  });
});


// Function to validate ChatGPT-specific share links
function isValidChatGPTLink(url) {
  const pattern = /^https:\/\/chatgpt\.com\/share\/[a-f0-9\-]+$/; // Regex for ChatGPT share links
  return pattern.test(url);
}

document.getElementById("submit").addEventListener("click", async function () {
  let feedback = document.getElementById("feedback").value;
  let purpose = document.getElementById("purpose").value;
  let outcome = document.getElementById("outcome").value;
  let conversationLink = document.getElementById("conversationLink").value.trim(); // Trim whitespaces
  let ratingValue = document.getElementById("rating").value;
  let rating = ratingValue ? parseInt(ratingValue, 10) : null;


  // Retrieve the unique user ID
  let user_id = await getUniqueId();
  console.log("User ID during submission:", user_id); // Log the unique ID

  // Validate ChatGPT-specific conversation link
  if (!isValidChatGPTLink(conversationLink)) {
    document.getElementById("status").textContent = "Conversation link must be a valid ChatGPT share link (e.g., https://chatgpt.com/share/<uuid>).";
    document.getElementById("status").className = "error";
    return;
  }

  // Validate rating
  if (rating && (isNaN(rating) || rating < 1 || rating > 5)) {
    document.getElementById("status").textContent = "Rating must be a number between 1 and 5.";
    document.getElementById("status").className = "error";
    return;
  }

  // Ensure a conversation link is provided
  if (!conversationLink) {
    document.getElementById("status").textContent = "Conversation link is required.";
    document.getElementById("status").className = "error";
    return;
  }

  // Data payload
  let data = {
    feedback: feedback,
    purpose: purpose,
    outcome: outcome,
    conversation_link: conversationLink,
    rating: rating,
    user_id: user_id, // Attach user_id to submission data
  };

  fetch(`${CONFIG.API_BASE_URL}/submit/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
    .then((response) => {
      if (!response.ok) {
        // If server returns an error, display the message
        throw new Error("Network response was not ok");
      }
      return response.json();
    })

    .then((data) => {
      if (data.status === "success") {
        // Update the lastSubmissionDate in storage
        const today = new Date().toISOString().split("T")[0];
        chrome.storage.sync.set({ lastSubmissionDate: today }, () => {
          console.log("Last submission date updated to", today);
          // Clear the daily reminder so it no longer appears
          const reminderContainer = document.getElementById("dailyReminder");
          if (reminderContainer) {
            reminderContainer.innerHTML = "";
          }
        });
        document.getElementById("status").textContent = "Feedback submitted successfully!";
        document.getElementById("status").className = "success";
        document.getElementById("feedback-form").style.display = "none"; // Hide the form after submission
      } else if (data.status === "error" && data.message === "Duplicate conversation link") {
        document.getElementById("status").textContent = "This conversation link has already been submitted.";
        document.getElementById("status").className = "error";
      } else {
        document.getElementById("status").textContent = "Error submitting feedback.";
        document.getElementById("status").className = "error";
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      document.getElementById("status").textContent = "Error submitting feedback.";
      document.getElementById("status").className = "error";
    });
});

// Generate and store a unique ID upon installation
chrome.runtime.onInstalled.addListener(function () {
  console.log("Extension installed");

  // Generate a unique ID if it doesn’t exist
  chrome.storage.sync.get("uniqueUserId", function (result) {
    if (!result.uniqueUserId) {
      const uniqueUserId = crypto.randomUUID(); // Generate a UUID for each user
      chrome.storage.sync.set({ uniqueUserId }, function () {
        console.log("Unique User ID generated and saved:", uniqueUserId);
      });
    } else {
      console.log("Unique User ID already exists:", result.uniqueUserId);
    }
  });

  chrome.contextMenus.create({
    id: "reportBias",
    title: "Report Bias",
    contexts: ["selection"],
  });

  console.log("Context menu created");
});

// Listen for context menu clicks
chrome.contextMenus.onClicked.addListener(function (info) {
  console.log("Context menu item clicked");

  if (info.menuItemId === "reportBias" && info.selectionText) {
    chrome.storage.sync.get(["biasReports", "uniqueUserId"], function (data) {
      let reports = data.biasReports || [];
      const uniqueUserId = data.uniqueUserId;

      reports.push({
        uniqueUserId: uniqueUserId, // Add the unique ID to the report
        feedback: info.selectionText,
        category: "bias",
        conversation: info.selectionText,
        timestamp: new Date().toISOString(),
      });

      chrome.storage.sync.set({ biasReports: reports }, function () {
        alert("Interaction reported!");
        console.log("Report added with Unique User ID:", uniqueUserId);
      });
    });
  }
});

document.getElementById("rating").addEventListener("input", function () {
  const ratingInput = this;
  if (!ratingInput.validity.valid) {
    ratingInput.value = '';
  }
});
