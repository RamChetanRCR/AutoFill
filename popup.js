import { saveProfile, loadProfile } from './utils/storage.js';
import { fillForm } from './utils/autofill.js';
import { parseResumeWithAPI } from './utils/resumeAPI.js';

/***********************
 * PAGE CONTAINERS
 ***********************/
const pageIndex  = document.querySelector("#index");
const pageResume = document.querySelector("#resume");

/***********************
 * PAGE SWITCHING
 ***********************/
function showIndex() { pageIndex.style.display = "block"; pageResume.style.display = "none"; }
function showResume(){ pageIndex.style.display = "none"; pageResume.style.display = "block"; }

document.querySelectorAll(".btn-index").forEach(btn => btn.onclick = showIndex);
document.querySelectorAll(".btn-resume").forEach(btn => btn.onclick = showResume);

/***********************
 * LOAD STORED DATA
 ***********************/
document.addEventListener("DOMContentLoaded", async () => {
  try {
    const manualProfile = await loadProfile("manualProfile");
    const resumeProfile = await loadProfile("resumeProfile");

    loadProfileIntoPage(pageIndex, manualProfile);
    loadProfileIntoPage(pageResume, resumeProfile);

    showIndex();
  } catch (err) {
    console.error("Failed to load profiles:", err);
  }
});

function loadProfileIntoPage(container, profile) {
  if(!profile) return;
  Object.keys(profile).forEach(key => {
    const el = container.querySelector(`#${key}`);
    if(el) el.value = profile[key] || "";
  });
}

/***********************
 * READ AND SAVE
 ***********************/
function readProfileFromPage(container) {
  const profile = {};
  container.querySelectorAll("input, textarea").forEach(el => {
    if(el.id) profile[el.id] = el.value;
  });
  return profile;
}

pageIndex.querySelector(".btn-save").onclick = () => {
  const profile = readProfileFromPage(pageIndex);
  saveProfile("manualProfile", profile);
  alert("Manual profile saved!");
};

pageResume.querySelector(".btn-save").onclick = () => {
  const profile = readProfileFromPage(pageResume);
  saveProfile("resumeProfile", profile);
  alert("Resume profile saved!");
};

/***********************
 * AUTOFILL BUTTONS
 ***********************/
pageIndex.querySelector(".btn-fill").onclick = async () => {
  const profile = await loadProfile("manualProfile");
  autofillCurrentPage(profile);
};

pageResume.querySelector(".btn-fill").onclick = async () => {
  const profile = await loadProfile("resumeProfile");
  autofillCurrentPage(profile);
};

function autofillCurrentPage(profile) {
  chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: fillForm,
      args: [profile]
    });
  });
}

/***********************
 * RESUME PARSING BUTTON
 ***********************/
document.getElementById("parse").onclick = async () => {
  const fileInput = document.getElementById("resumeUpload");
  if (!fileInput.files.length) {
    alert("Select a resume PDF");
    return;
  }

  try {
    const profile = await parseResumeWithAPI(fileInput.files[0]);

    console.log("Parsed profile:", profile);

    loadProfileIntoPage(pageResume, profile);
    saveProfile("resumeProfile", profile);

    alert("Resume parsed successfully!");
  } catch (err) {
    console.error(err);
    alert("Resume parsing failed. Check console.");
  }
};

