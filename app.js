// Application State
let appState = {
    currentStep: 1,
    selectedInsurer: null,
    selectedClaimCategory: null,
    selectedClaimType: null,
    claimOption: 'Full Claim',
    uploadedDocuments: {},
    requiredDocuments: [],
};

// Insurer data with accepted documents per insurer 
const applicationData = {
  insurers: [
    {
      name: "HDFC ERGO General Insurance",
      type: "Health & General",
      headquarters: "Mumbai",
      founded: 2002,
      network_hospitals: "13000+",
      accepted_documents: {
        "Identity Proof": ["Aadhaar Card", "PAN Card", "Passport", "Driving License", "Voter ID"],
        "Address Proof": ["Utility Bill", "Aadhaar Card", "Passport", "Voter ID", "Rental Agreement"],
        "Policy Document": ["Original Policy Copy", "Digital Policy PDF"],
        "Financial Documents": ["Bank Statement", "Cancelled Cheque"]
      }
    },
    {
      name: "ICICI Lombard",
      type: "Health & General",
      headquarters: "Mumbai",
      founded: 2001,
      network_hospitals: "7000+",
      accepted_documents: {
        "Identity Proof": ["Aadhaar Card", "PAN Card", "Passport", "Driving License"],
        "Address Proof": ["Utility Bill", "Aadhaar Card", "Passport", "Driving License"],
        "Policy Document": ["Original Policy Copy", "Digital Policy PDF"],
        "Financial Documents": ["Bank Statement", "Cancelled Cheque", "Passbook"]
      }
    },
    {
      name: "Star Health Insurance",
      type: "Health",
      headquarters: "Chennai",
      founded: 2006,
      network_hospitals: "14000+",
      accepted_documents: {
        "Identity Proof": ["Aadhaar Card", "PAN Card", "Passport", "Driving License", "Voter ID"],
        "Address Proof": ["Utility Bill", "Aadhaar Card", "Passport", "Voter ID", "Bank Statement"],
        "Policy Document": ["Original Policy Copy", "Digital Policy PDF"],
        "Financial Documents": ["Bank Statement", "Cancelled Cheque", "NEFT Details"]
      }
    },
    // Add other insurers similarly...
  ],
  claim_types: {
    "Health Insurance Claims": {
      "Hospitalization": [
        "Duly filled and signed claim form (Part A & B)",
        "Original hospital bills and receipts",
        "Discharge summary",
        "Medical certificates and diagnosis reports",
        "Investigation reports (X-rays, CT scans, blood tests, etc.)",
        "Medicine bills with prescriptions",
        "Identity proof (Aadhaar/PAN/Passport)",
        "Address proof",
        "Policy copy/Health card",
        "Cancelled cheque/Bank statement",
        "NEFT details"
      ],
      "Critical Illness": [
        "Completely filled claim form",
        "Consultant's certificate with diagnosis",
        "Investigation reports confirming diagnosis",
        "Original medical bills and receipts",
        "Hospital admission and discharge certificates",
        "Identity proof of patient",
        "PAN card of insured",
        "Cancelled cheque (CTS 2010 format)",
        "Policy copy"
      ],
      "Pre/Post Hospitalization": [
        "Claim form (Part A)",
        "OPD consultation papers",
        "Consultation bills/receipts",
        "Prescription for medicines",
        "Pharmacy bills",
        "Investigation reports",
        "Cash bills for investigations",
        "Reference letters",
        "NEFT details"
      ],
      "Domiciliary Hospitalization": [
        "Signed claim form",
        "Doctor's first prescription",
        "Treatment papers with prescriptions",
        "Investigation reports",
        "Medical bills and receipts",
        "Certificate from attending doctor",
        "Documentary proof of hospital unavailability",
        "Identity proof",
        "PAN card"
      ]
    }
  },
  claim_settlement_options: ["Full Claim", "Partial Claim"],
  processing_timeline: {
    "document_submission": "Within 15 days of discharge/incident",
    "initial_processing": "7-15 days",
    "investigation_if_needed": "15-30 days",
    "settlement": "7-21 days after approval"
  }
};

// Utility to change steps
function showStep(stepNum) {
  appState.currentStep = stepNum;
  document.querySelectorAll(".step-content").forEach((sec) => {
    sec.classList.remove("active");
  });
  document.querySelector(`section[data-step='${stepNum}']`).classList.add("active");

  // Update wizard steps UI
  document.querySelectorAll(".step").forEach((el) => {
    el.classList.toggle("active", parseInt(el.dataset.step) === stepNum);
  });
}

// Populate insurer list with search filter
function updateInsurerList() {
  const search = document.getElementById("insurer-search").value.toLowerCase();
  const select = document.getElementById("insurer-select");
  select.innerHTML = "";

  applicationData.insurers.forEach((insurer) => {
    if (insurer.name.toLowerCase().includes(search)) {
      const option = document.createElement("option");
      option.value = insurer.name;
      option.textContent = insurer.name;
      select.appendChild(option);
    }
  });
}

// Display selected insurer details
function displayInsurerInfo(name) {
  const infoDiv = document.getElementById("insurer-info");
  const insurer = applicationData.insurers.find((i) => i.name === name);
  if (!insurer) {
    infoDiv.innerHTML = "";
    return;
  }
  infoDiv.innerHTML = `
    <strong>Type:</strong> ${insurer.type}<br/>
    <strong>Headquarters:</strong> ${insurer.headquarters}<br/>
    <strong>Founded:</strong> ${insurer.founded}<br/>
    <strong>Network Hospitals:</strong> ${insurer.network_hospitals}
  `;
}

// Populate claim categories and types for selected insurer
function populateClaimTypes() {
  const categorySelect = document.getElementById("claim-category-select");
  const typeSelect = document.getElementById("claim-type-select");
  categorySelect.innerHTML = "";
  typeSelect.innerHTML = "";

  // For demo, use keys of claim_types object as categories
  Object.keys(applicationData.claim_types).forEach((category) => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    categorySelect.appendChild(option);
  });

  // Populate claim types based on first category by default
  updateClaimTypesForCategory(categorySelect.value);

  categorySelect.onchange = () => {
    updateClaimTypesForCategory(categorySelect.value);
  };

  function updateClaimTypesForCategory(category) {
    typeSelect.innerHTML = "";
    let types = Object.keys(applicationData.claim_types[category]);
    types.forEach((t) => {
      let opt = document.createElement("option");
      opt.value = t;
      opt.textContent = t;
      typeSelect.appendChild(opt);
    });
  }
}

// Display documents required with accepted document details for selected insurer and claim type
function showRequiredDocuments() {
  const div = document.getElementById("documents-list");
  div.innerHTML = "";

  const insurer = applicationData.insurers.find(
    (i) => i.name === appState.selectedInsurer
  );
  if (!insurer) return;

  const category = appState.selectedClaimCategory;
  const claimType = appState.selectedClaimType;

  if (!applicationData.claim_types[category]) {
    div.textContent = "No claim types available for this category.";
    return;
  }
  if (!applicationData.claim_types[category][claimType]) {
    div.textContent = "No documents defined for this claim type.";
    return;
  }

  const documents = applicationData.claim_types[category][claimType];
  appState.requiredDocuments = documents;

  documents.forEach((doc) => {
    // Identify main document type category for accepted documents display by keyword matching
    // Example: 'Identity proof' or 'Address proof' word in doc title
    let docCategory = null;
    const lowerDoc = doc.toLowerCase();
    if (lowerDoc.includes("identity proof")) docCategory = "Identity Proof";
    else if (lowerDoc.includes("address proof")) docCategory = "Address Proof";
    else if (lowerDoc.includes("policy")) docCategory = "Policy Document";
    else if (
      lowerDoc.includes("cancelled cheque") ||
      lowerDoc.includes("bank statement") ||
      lowerDoc.includes("neft") ||
      lowerDoc.includes("financial")
    )
      docCategory = "Financial Documents";

    const acceptedList = docCategory
      ? insurer.accepted_documents[docCategory] || []
      : [];

    const docDiv = document.createElement("div");
    docDiv.className = "document-item";
    docDiv.innerHTML = `<strong>${doc}</strong>`;

    if (acceptedList.length > 0) {
      const acceptedSpan = document.createElement("span");
      acceptedSpan.className = "accepted-documents";
      acceptedSpan.textContent = " (Accepted documents - Click to view)";
      acceptedSpan.style.color = "#007bff";
      acceptedSpan.style.cursor = "pointer";
      acceptedSpan.onclick = () => {
        alert(
          `Accepted ${docCategory} for ${insurer.name}:\n- ` +
            acceptedList.join("\n- ")
        );
      };
      docDiv.appendChild(acceptedSpan);
    }
    div.appendChild(docDiv);
  });
}

// Populate document upload fields dynamically
function populateUploadFields() {
  const form = document.getElementById("upload-form");
  form.innerHTML = "";

  appState.requiredDocuments.forEach((doc) => {
    const wrapper = document.createElement("div");
    const label = document.createElement("label");
    label.textContent = doc;
    label.setAttribute("for", encodeURIComponent(doc));
    wrapper.appendChild(label);

    const input = document.createElement("input");
    input.type = "file";
    input.id = encodeURIComponent(doc);
    input.name = encodeURIComponent(doc);
    input.accept = ".pdf,.jpg,.png,.doc,.docx";
    input.onchange = (e) => {
      appState.uploadedDocuments[doc] = e.target.files[0];
    };

    wrapper.appendChild(input);
    form.appendChild(wrapper);
  });
}

// Simple validation for uploaded documents completeness
function validateUploads() {
  return appState.requiredDocuments.every((doc) =>
    appState.uploadedDocuments.hasOwnProperty(doc)
  );
}

// Show assessment results with readiness and recommendations
function showAssessment() {
  const div = document.getElementById("assessment-results");
  const total = appState.requiredDocuments.length;
  const uploadedCount = Object.keys(appState.uploadedDocuments).length;
  const readiness = Math.round((uploadedCount / total) * 100);

  let rec = "";
  if (readiness === 100)
    rec = "You have uploaded all required documents. Your claim readiness is excellent.";
  else
    rec = `You have uploaded ${uploadedCount} out of ${total} required documents. Please upload the missing ones for better claim approval chances.`;

  div.innerHTML = `<p><strong>Claim Readiness Score:</strong> ${readiness}%</p>
    <p>${rec}</p>
    <div class="progress-bar">
        <div class="progress-bar-fill" style="width: ${readiness}%;"></div>
    </div>
    <p><strong>Note:</strong> Final reimbursement depends on insurer's policy, document authenticity, and claim review outcomes.</p>`;
}

// Event Listeners Setup
function setupEventListeners() {
  document.getElementById("next-btn-step-1").onclick = () => showStep(2);

  document.getElementById("prev-btn-step-2").onclick = () => showStep(1);
  document.getElementById("next-btn-step-2").onclick = () => {
    appState.selectedInsurer = document.getElementById("insurer-select").value;
    displayInsurerInfo(appState.selectedInsurer);
    populateClaimTypes();
    showStep(3);
  };

  document.getElementById("insurer-search").oninput = updateInsurerList;

  document.getElementById("insurer-select").onchange = (e) => {
    displayInsurerInfo(e.target.value);
    document.getElementById("next-btn-step-2").disabled = !e.target.value;
  };

  document.getElementById("prev-btn-step-3").onclick = () => showStep(2);
  document.getElementById("next-btn-step-3").onclick = () => {
    const catSelect = document.getElementById("claim-category-select");
    const typeSelect = document.getElementById("claim-type-select");
    appState.selectedClaimCategory = catSelect.value;
    appState.selectedClaimType = typeSelect.value;
    showRequiredDocuments();
    showStep(4);
  };

  document.getElementById("claim-category-select").onchange = (e) => {
    populateClaimTypes();
  };

  document.getElementById("prev-btn-step-4").onclick = () => showStep(3);
  document.getElementById("next-btn-step-4").onclick = () => {
    populateUploadFields();
    showStep(5);
  };

  document.getElementById("prev-btn-step-5").onclick = () => showStep(4);
  document.getElementById("next-btn-step-5").onclick = () => {
    if (!validateUploads()) {
      alert("Please upload all required documents before proceeding.");
      return;
    }
    showAssessment();
    showStep(6);
  };

  document.getElementById("prev-btn-step-6").onclick = () => showStep(5);
  document.getElementById("finish-btn").onclick = () => {
    alert("Thank you for using the Insurance Claim Validator. Please save or print this page for your records.");
  };

  // Claim option radio buttons
  document.querySelectorAll("#claim-option-section input[name='claimOption']").forEach((radio) => {
    radio.onchange = (e) => {
      appState.claimOption = e.target.value;
    };
  });
}

// Initialize App
function init() {
  updateInsurerList();
  setupEventListeners();
  showStep(1);
}

window.onload = init;
