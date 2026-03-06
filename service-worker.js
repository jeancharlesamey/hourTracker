// Open side panel when the extension icon is clicked
chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true })
  .catch((err) => console.error('setPanelBehavior failed:', err));

// Fallback: explicitly open the panel on action click
chrome.action.onClicked.addListener(async (tab) => {
  try {
    await chrome.sidePanel.open({ tabId: tab.id });
  } catch (err) {
    console.error('sidePanel.open failed:', err);
  }
});
