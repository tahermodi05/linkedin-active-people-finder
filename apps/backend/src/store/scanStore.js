let latestScan = [];

export function setLatestScan(profiles) {
  latestScan = [...profiles];
}

export function getLatestScan() {
  return latestScan;
}

export function clearLatestScan() {
  latestScan = [];
}