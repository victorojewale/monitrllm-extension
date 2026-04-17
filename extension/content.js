function addButton() {
    const button = document.createElement('button');
    button.textContent = 'Report Bias';
    button.style.position = 'fixed';
    button.style.bottom = '10px';
    button.style.right = '10px';
    button.style.zIndex = '1000';
    button.style.backgroundColor = '#f44336';
    button.style.color = '#fff';
    button.style.border = 'none';
    button.style.padding = '10px';
    button.style.cursor = 'pointer';
    button.style.borderRadius = '5px';
    button.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
  
    button.addEventListener('click', () => {
      // Update this selector to match the actual ChatGPT response element
      let chatResponses = document.querySelectorAll('div[data-message-author-role="assistant"] div.markdown.prose p');
  
      if (chatResponses.length > 0) {
        let responseText = Array.from(chatResponses).map(el => el.innerText).join('\n');
        let userQuery = prompt("Please enter your query:");
        if (userQuery) {
          chrome.storage.sync.get('biasReports', function(data) {
            let reports = data.biasReports || [];
            reports.push({
              feedback: responseText,
              category: 'bias',
              conversation: `User: ${userQuery}\nChatGPT: ${responseText}`,
              timestamp: new Date().toISOString()
            });
            chrome.storage.sync.set({ biasReports: reports }, function() {
              alert('Bias reported!');
            });
          });
        }
      } else {
        alert('No response found to report.');
      }
    });
  
    document.body.appendChild(button);
  }
  
  window.addEventListener('load', addButton);
  