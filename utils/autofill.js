export async function fillForm(profile) {
  const elements = document.querySelectorAll("input, textarea");

  for (const el of elements) {
    if (el.disabled || el.readOnly || el.value) continue;
    
    const label = (
      (el.labels?.[0]?.innerText || "") +
      " " + (el.placeholder || "") +
      " " + (el.name || "") +
      " " + (el.id || "")
    ).toLowerCase();

    if(label.includes("firstname")) el.value = profile.First_Name || "";
    else if(label.includes("middlename")) el.value = profile.Middle_Name || "";
    else if(label.includes("lastname") || label.includes("surname")) el.value = profile.Last_Name || "";
    else if(label.includes("fullname") || (label.includes("name") && !label.includes("first") && !label.includes("last"))) el.value = profile.Full_Name || "";
    else if(label.includes("email")) el.value = profile.email || "";
    else if(label.includes("phone") || label.includes("mobile")) el.value = profile.phone || "";
    else if(label.includes("linkedin")) el.value = profile.LinkedIn || "";
    else if(label.includes("github")) el.value = profile.GitHub || "";
    else if(label.includes("portfolio") || label.includes("website")) el.value = profile.Portfolio || "";
    else if(label.includes("college")) el.value = profile.College_Name || "";
    else if(label.includes("cgpa") || label.includes("gpa")) el.value = profile.CGPA || "";
    else if(label.includes("graduation")) el.value = profile.Graduation_Year || "";
    else if(label.includes("field") || label.includes("study")) el.value = profile.Field_Study || "";

    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
  }
}

