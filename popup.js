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
// changing small thigns 


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

  function normalize(str = "") {
    return str.toLowerCase().replace(/\s+/g, "");
  }

  function getHumanText(el) {
    return normalize(
      (el.labels?.[0]?.innerText || "") +
      " " +
      (el.placeholder || "") +
      " " +
      (el.getAttribute("aria-label") || "") +
      " " +
      (el.name || "") +
      " " +
      (el.id || "")
    );
  }

  document.querySelectorAll("input, textarea").forEach(el => {
    if (el.value) return;

    const text = getHumanText(el);

    /* ---------- NAME ---------- */
    if (text.includes("firstname") || text.includes("givenname"))
      el.value = profile.First_Name;

    else if (text.includes("middlename"))
      el.value = profile.Middle_Name;

    else if (text.includes("lastname") || text.includes("surname"))
      el.value = profile.Last_Name;

    else if (
      text.includes("fullname") ||
      (text.includes("name") && !text.includes("first") && !text.includes("last"))
    )
      el.value = profile.Full_Name;

    /* ---------- EMAIL ---------- */
    else if (
      text.includes("email") ||
      el.type === "email" ||
      el.autocomplete === "email"
    )
      el.value = profile.email;

    /* ---------- PHONE ---------- */
    else if (text.includes("countrycode"))
      el.value = profile.Country_Code;

    else if (
      text.includes("phone") ||
      text.includes("mobile") ||
      el.type === "tel" ||
      el.autocomplete === "tel"
    )
      el.value = profile.phone;

    /* ---------- LINKS ---------- */
    else if (text.includes("linkedin"))
      el.value = profile.LinkedIn;

    else if (text.includes("github"))
      el.value = profile.GitHub;

    else if (text.includes("portfolio") || text.includes("website"))
      el.value = profile.Portfolio;

    /* ---------- EDUCATION ---------- */
    else if (text.includes("college"))
      el.value = profile.College_Name;

    else if (text.includes("university"))
      el.value = profile.University_Name;

    else if (text.includes("cgpa") || text.includes("gpa"))
      el.value = profile.CGPA;

    else if (text.includes("graduation"))
      el.value = profile.Graduation_Year;

    else if (text.includes("field") || text.includes("study"))
      el.value = profile.Field_Study;

    /* ---------- ADDRESS ---------- */
    else if (
      text.includes("addressline1") ||
      (text.includes("address") && !text.includes("line2"))
    )
      el.value = profile.Address_Line1;

    else if (
      text.includes("addressline2") ||
      text.includes("line2")
    )
      el.value = profile.Address_Line2;

    else if (text.includes("apt") || text.includes("flat"))
      el.value = profile.Apt_flat;

    else if (text.includes("city"))
      el.value = profile.City;

    else if (text.includes("state"))
      el.value = profile.State;

    else if (text.includes("country"))
      el.value = profile.Country;

    else if (text.includes("pincode") || text.includes("postal") || text.includes("zip"))
      el.value = profile.PinCode;
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
  });
}