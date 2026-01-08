
export function saveProfile(key, profile) {
  chrome.storage.local.set({ [key]: profile }, () => {
    console.log(`${key} saved`);
  });
}


export function loadProfile(key) {
  return new Promise(resolve => {
    chrome.storage.local.get([key], (result) => resolve(result[key] || {}));
  });
}
