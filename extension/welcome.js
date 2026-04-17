document.addEventListener("DOMContentLoaded", () => {
    chrome.storage.sync.get("uniqueUserId", (data) => {
      const userId = data.uniqueUserId;
      const codeEl = document.getElementById("userId");
      codeEl.textContent = userId;
  
      const copyBtn = document.getElementById("copyBtn");
      const statusEl = document.getElementById("copyStatus");
  
      copyBtn.addEventListener("click", async () => {
        try {
          await navigator.clipboard.writeText(userId);
          statusEl.style.display = "block";
        } catch (err) {
          console.error("Failed to copy:", err);
          alert("Failed to copy. Please copy it manually.");
        }
      });
    });
  });
  