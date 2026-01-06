// // /***********************
//  * CONFIG
//  ***********************/

const fields = [
  'Full_Name','First_Name','Middle_Name','Last_Name','Gender',
  'email','phone','Country_Code',
  'LinkedIn','GitHub','Portfolio',
  'Country','State','City',
  'Address_Line1','Address_Line2','PinCode','Apt_flat',
  'Field_Study','CGPA','Graduation_Year',
  'College_Name','University_Name'
];

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
 * HELPERS
 ***********************/
function readProfile(container) {
  const profile = {};
  fields.forEach(f => {
    const el = container.querySelector(`#${f}`);
    if (el) profile[f] = el.value || "";
  });
  return profile;
}

function loadProfile(container, profile) {
  if (!profile) return;
  fields.forEach(f => {
    const el = container.querySelector(`#${f}`);
    if (el) el.value = profile[f] || "";
  });
}

/***********************
 * LOAD STORED DATA
 ***********************/
document.addEventListener("DOMContentLoaded", () => {
  chrome.storage.local.get(
    ["manualProfile", "resumeProfile"],
    ({ manualProfile, resumeProfile }) => {
      loadProfile(pageIndex, manualProfile);
      loadProfile(pageResume, resumeProfile);
    }
  );
  showIndex();
});

/***********************
 * SAVE BUTTONS
 ***********************/
pageIndex.querySelector(".btn-save").onclick = () => {
  const manualProfile = readProfile(pageIndex);
  chrome.storage.local.set({ manualProfile }, () => alert("Manual profile saved"));
};

pageResume.querySelector(".btn-save").onclick = () => {
  const resumeProfile = readProfile(pageResume);
  chrome.storage.local.set({ resumeProfile }, () => alert("Resume profile saved"));
};

/***********************
 * AUTOFILL BUTTONS
 ***********************/
pageIndex.querySelector(".btn-fill").onclick = () => runAutofill(readProfile(pageIndex));
pageResume.querySelector(".btn-fill").onclick = () => runAutofill(readProfile(pageResume));

/***********************
 * AUTOFILL EXECUTOR
 ***********************/
function runAutofill(profile) {
  chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: fillForm,
      args: [profile]
    });
  });
}

/***********************
 * AUTOFILL LOGIC
 ***********************/
async function fillForm(profile) {
  function delay(ms){ return new Promise(r=>setTimeout(r,ms)); }
  function normalize(str=""){ return str.toLowerCase().replace(/\s+/g,""); }
  function getHumanText(el){
    return normalize(
      (el.labels?.[0]?.innerText||"")+" "+
      (el.placeholder||"")+" "+
      (el.getAttribute("aria-label")||"")+" "+
      (el.name||"")+" "+
      (el.id||"")
    );
  }

  const elements = document.querySelectorAll("input, textarea");

  for(const el of elements){
    if(el.value || el.disabled || el.readOnly) continue;
    const text = getHumanText(el);

    if(text.includes("firstname") || text.includes("givenname")) el.value = profile.First_Name;
    else if(text.includes("middlename")) el.value = profile.Middle_Name;
    else if(text.includes("lastname") || text.includes("surname")) el.value = profile.Last_Name;
    else if(text.includes("fullname") || (text.includes("name") && !text.includes("first") && !text.includes("last"))) el.value = profile.Full_Name;
    else if(text.includes("gender") || text.includes("sex")) el.value = profile.Gender;
    else if(text.includes("email") || el.type==="email") el.value = profile.email;
    else if(text.includes("countrycode")) el.value = profile.Country_Code;
    else if(text.includes("phone") || text.includes("mobile")) el.value = profile.phone;
    else if(text.includes("linkedin")) el.value = profile.LinkedIn;
    else if(text.includes("github")) el.value = profile.GitHub;
    else if(text.includes("portfolio") || text.includes("website")) el.value = profile.Portfolio;
    else if(text.includes("college")) el.value = profile.College_Name;
    else if(text.includes("university")) el.value = profile.University_Name;
    else if(text.includes("cgpa") || text.includes("gpa")) el.value = profile.CGPA;
    else if(text.includes("graduation")) el.value = profile.Graduation_Year;
    else if(text.includes("field") || text.includes("study")) el.value = profile.Field_Study;
    else if(text.includes("addressline1") || (text.includes("address") && !text.includes("line2"))) el.value = profile.Address_Line1;
    else if(text.includes("addressline2") || text.includes("line2")) el.value = profile.Address_Line2;
    else if(text.includes("apt") || text.includes("flat")) el.value = profile.Apt_flat;
    else if(text.includes("city")) el.value = profile.City;
    else if(text.includes("state")) el.value = profile.State;
    else if(text.includes("country")) el.value = profile.Country;
    else if(text.includes("pincode") || text.includes("postal") || text.includes("zip")) el.value = profile.PinCode;

    el.dispatchEvent(new Event("input",{bubbles:true}));
    el.dispatchEvent(new Event("change",{bubbles:true}));

    await delay(120);
  }
}



/***********************
 * RESUME PARSING
 ***********************/
document.getElementById("parse").onclick = async () => {
  const fileInput = document.getElementById("resumeUpload");
  if (!fileInput.files.length) {
    alert("Select a PDF");
    return;
  }

  const file = fileInput.files[0];
  const arrayBuffer = await file.arrayBuffer();

  // 🔥 pdfjsLib is GLOBAL from pdf.min.js
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  let extractedText = "";

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const content = await page.getTextContent();
    const strings = content.items.map(item => item.str);
    extractedText += strings.join(" ") + "\n";
  }

  console.log("PDF TEXT:\n", extractedText);

  processResumeText(extractedText);
};


/***********************
 * EXTRACT AND FILL FIELDS
 ***********************/
function processResumeText(text) {
  const profile = {};
  const lines = text.split("\n").map(l => l.trim()).filter(Boolean);

  // NAME (first reasonable line)
  profile.Full_Name =
    lines.find(l => /^[A-Za-z .'-]{2,40}$/.test(l)) || "";

  // EMAIL
  profile.email =
    (text.match(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i) || [""])[0];

  // PHONE
  profile.phone =
    (text.match(/\+?\d{10,15}/) || [""])[0];

  // LINKEDIN
  profile.LinkedIn =
    (text.match(/https?:\/\/(www\.)?linkedin\.com\/[^\s]+/i) || [""])[0];

  // GITHUB
  profile.GitHub =
    (text.match(/https?:\/\/(www\.)?github\.com\/[^\s]+/i) || [""])[0];

  console.log("PARSED PROFILE:", profile);

  // Fill your UI
  loadProfile(pageResume, profile);
}
