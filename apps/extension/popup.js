const statusElement = document.getElementById("status");
const scanButton = document.getElementById("scanButton");

scanButton.addEventListener("click", async () => {
  statusElement.textContent = "Scanning...";
  scanButton.disabled = true;

  try {
    const response = await chrome.runtime.sendMessage({
      type: "START_SCAN",
    });

    statusElement.textContent = response.message;
  } catch (error) {
    console.error(error);

    statusElement.textContent = "Failed to contact background";
  } finally {
    scanButton.disabled = false;
  }
});