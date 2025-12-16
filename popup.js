const fields = [
  'Full_Name','First_Name','Middle_Name','Last_Name',
  'email','phone','Country_Code','LinkedIn','GitHub','Portfolio',
  'Country','State','City',
  'Field_Study','CGPA','Graduation_Year',
  'College_Name','University_Name','Address_Line1','Address_Line2','PinCode','Apt_flat'
];

/* ---------------- LOAD STORED DATA ---------------- */
function loadProfile() {
  chrome.storage.local.get('profile', (data) => {
    if (!data.profile) return;

    fields.forEach(f => {
      const el = document.getElementById(f);
      if (el) el.value = data.profile[f] || "";
    });
  });
}

// Load when popup opens
document.addEventListener("DOMContentLoaded", loadProfile);

/* ---------------- SAVE DATA ---------------- */
document.getElementById("save").onclick = () => {
  const profile = {};
  fields.forEach(f => {
    profile[f] = document.getElementById(f).value;
  });

  chrome.storage.local.set({ profile }, () => {
    alert("Profile Saved");
  });
};

/* ---------------- AUTOFILL ---------------- */
document.getElementById('fill').onclick = () => {
  chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
    chrome.storage.local.get('profile', ({ profile }) => {
      if (!profile) return;

      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: fillForm,
        args: [profile]
      });
    });
  });
};

/* ---------------- CONTENT SCRIPT FUNCTION ---------------- */
function fillForm(profile) {
  document.querySelectorAll('input, textarea').forEach(el => {
    const text = (el.name + el.id + el.placeholder).toLowerCase();
    // names
    if (text.includes('firstname')) el.value = profile.First_Name;
    else if (text.includes('middlename')) el.value = profile.Middle_Name;
    else if (text.includes('lastname')) el.value = profile.Last_Name;
    else if (text.includes('name')) el.value = profile.Full_Name;
    //email
    else if (text.includes('email')) el.value = profile.email;
    //phone number + country code
    else if (text.includes('countrycode')) el.value = profile.Country_Code;
    else if (text.includes('phone') || text.includes('mobile')) el.value = profile.phone;

    //linkedin & github & protfolio
    else if (text.includes('linkedin')) el.value = profile.LinkedIn;
    else if (text.includes('github')) el.value = profile.GitHub;
    else if (text.includes('portfolio') || text.includes('website')) el.value = profile.Portfolio;
    //college & university name
    else if (text.includes('college')) el.value = profile.College_Name;
    else if (text.includes('university')) el.value = profile.University_Name;
    //location 
    else if (text.includes('country')) el.value = profile.Country;
    else if (text.includes('state')) el.value = profile.State;
    else if (text.includes('city')) el.value = profile.City;
    else if (text.includes('addressline1')) el.value = profile.Address_Line1;
    else if (text.includes('addressline1')) el.value = profile.Address_Line2;
    else if (text.includes('pincode')) el.value = profile.PinCode;
    else if (text.includes('apt_flat')||text.includes('apt')||text.includes('flat')) el.value = profile.Apt_flat;
    //college details(cgpa graduation year & field of study)
    else if (text.includes('cgpa')) el.value = profile.CGPA;
    else if (text.includes('graduation')) el.value = profile.Graduation_Year;
    else if (text.includes('field')) el.value = profile.Field_Study;

    el.dispatchEvent(new Event("input", { bubbles: true }));
  });
}
