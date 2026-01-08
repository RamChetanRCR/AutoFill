// utils/resumeAPI.js
// Frontend ONLY sends the PDF to backend

export async function parseResumeWithAPI(file) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("http://localhost:3000/parse-resume", {
    method: "POST",
    body: formData
  });

  if (!response.ok) {
    throw new Error("Resume parsing failed");
  }

  return await response.json();
}
