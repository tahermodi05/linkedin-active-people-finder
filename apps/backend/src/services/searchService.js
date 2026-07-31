import {
  setLatestScan,
  getLatestScan as getLatestScanFromStore,
} from "../store/scanStore.js";

export async function searchPeople(data) {
  setLatestScan(data.profiles);

  return {
    totalProfiles: data.profiles.length,
    profiles: data.profiles,
  };
}

export async function getLatestScan() {
  return {
    totalProfiles: getLatestScanFromStore().length,
    profiles: getLatestScanFromStore(),
  };
}