#  Job Application Auto-Fill Chrome Extension

A Chrome extension that helps users fill job application forms faster by automatically entering repetitive information such as personal details, contact information, and commonly reused fields.

The extension uses the **GroqCloud API** to parse resumes (**PDF / DOCX**) and extract structured data, which is then mapped to job application form fields for quick and accurate auto-fill.

##  Features

-  Auto-fills job application forms  
-  Resume parsing using GroqCloud API  
-  Supports PDF and DOCX resumes  
-  Extracts personal, contact, and education details  
-  Reduces manual data entry and saves time  

##  GroqCloud API Setup

1. Create an account on **GroqCloud**  
2. Generate an **API key** from the dashboard  
3. Add the API key to the project configuration:

```js
const GROQ_API_KEY = "your_api_key_here";
```
## Tech Stack

JavaScript
Chrome Extensions API (Manifest v3)
GroqCloud API
HTML / CSS

##Run Locally

Clone the repository
Open chrome://extensions/
Enable Developer Mode
Click Load unpacked and select the project folder
