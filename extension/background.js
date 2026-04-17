import { CONFIG } from './config.js';

// Generate and store a unique ID upon installation
chrome.runtime.onInstalled.addListener(function () {
  console.log("Extension installed");

  // Generate a unique ID if it doesn’t exist
  chrome.storage.sync.get("uniqueUserId", function (result) {
    if (!result.uniqueUserId) {

      const uniqueUserId = crypto.randomUUID();  // Generate a UUID for each user


      chrome.storage.sync.set({ uniqueUserId }, function () {
        console.log("Unique User ID generated and saved:", uniqueUserId);
        chrome.tabs.create({ url: chrome.runtime.getURL("welcome.html") });
      });
    } else {
      console.log("Unique User ID already exists:", result.uniqueUserId);
      // Optional: Open welcome page on update if desired, or just log
      // chrome.tabs.create({ url: chrome.runtime.getURL("welcome.html") });
    }
  });
});

// Listen for extension icon click to open popup
chrome.action.onClicked.addListener(function () {
  console.log("Extension icon clicked");

  chrome.windows.create({
    url: chrome.runtime.getURL("popup.html"),
    type: "popup",
    width: 600,
    height: 800,
  });
});
