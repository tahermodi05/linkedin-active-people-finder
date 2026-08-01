const statusElement = document.getElementById("status");
const scanButton = document.getElementById("scanButton");
const captureActivityButton = document.getElementById("captureActivityButton");
const snapshotOutput = document.getElementById("snapshotOutput");

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

captureActivityButton.addEventListener("click", async () => {
  statusElement.textContent = "Capturing...";
  captureActivityButton.disabled = true;

  try {
    const response = await chrome.runtime.sendMessage({
      type: "CAPTURE_ACTIVITY_SNAPSHOT",
    });

    if (!response?.success) {
      throw new Error(response?.message || "Capture failed");
    }

    snapshotOutput.value = response.html || "";

    const blob = new Blob([response.html || ""], {
      type: "text/html;charset=utf-8",
    });

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = response.filename || "activity-page.html";
    anchor.click();
    URL.revokeObjectURL(url);

    statusElement.textContent = "Snapshot captured and download started.";
  } catch (error) {
    console.error(error);
    statusElement.textContent = error.message || "Failed to capture snapshot";
  } finally {
    captureActivityButton.disabled = false;
  }
});
