export async function parseResumeWithAPI(file) {
  const formData = new FormData();
  formData.append("resume", file);

  const response = await fetch("https://resumeparser-api.p.rapidapi.com/", {
    method: "POST",
    headers: {
      "X-RapidAPI-Key": "bca137110cmsh17e434d08c8738cp119e2cjsne97e53c752f1",
      "X-RapidAPI-Host": "resumeparser-api.p.rapidapi.com"
    },
    body: formData
  });

  console.log("Raw API response:", response); 

  const result = await response.json();
  console.log("Parsed JSON:", result);

  return {
    Full_Name: result.name || "",
    First_Name: result.first_name || "",
    Last_Name: result.last_name || "",
    Middle_Name: result.middle_name || "",
    email: result.email || "",
    phone: result.phone || "",
    LinkedIn: result.linkedin || "",
    GitHub: result.github || "",
    Portfolio: result.portfolio || "",
    College_Name: result.education?.college || "",
    University_Name: result.education?.university || "",
    CGPA: result.education?.cgpa || "",
    Graduation_Year: result.education?.year || "",
    Field_Study: result.education?.field || ""
  };
}
