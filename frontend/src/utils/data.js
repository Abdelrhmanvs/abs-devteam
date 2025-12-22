// Dummy AI analysis results for testing
export const dummyAnalysisResults = [
  {
    diagnosis: "Normal Findings",
    confidence: 98.7,
    status: "normal",
    riskLevel: "Low",
    details:
      "No significant abnormalities detected in the cardiac region. Heart size and structure appear normal.",
    recommendations: [
      "Continue regular monitoring",
      "Maintain healthy lifestyle",
      "Follow-up in 6 months",
    ],
  },
  {
    diagnosis: "Mild Cardiomegaly",
    confidence: 96.5,
    status: "abnormal",
    riskLevel: "Moderate",
    details:
      "Slight enlargement of the heart detected. May indicate underlying cardiovascular condition requiring further evaluation.",
    recommendations: [
      "Schedule follow-up with cardiologist",
      "Consider echocardiogram",
      "Monitor blood pressure regularly",
      "Lifestyle modifications recommended",
    ],
  },
  {
    diagnosis: "Moderate Aortic Stenosis",
    confidence: 94.3,
    status: "critical",
    riskLevel: "High",
    details:
      "Significant narrowing of the aortic valve detected. Immediate medical attention and specialist consultation required.",
    recommendations: [
      "Urgent cardiologist consultation",
      "Complete cardiovascular workup",
      "Evaluate for surgical intervention",
      "Close monitoring required",
    ],
  },
  {
    diagnosis: "Pulmonary Edema",
    confidence: 97.8,
    status: "critical",
    riskLevel: "High",
    details:
      "Fluid accumulation in the lungs detected. This requires immediate medical attention and treatment.",
    recommendations: [
      "Immediate emergency care",
      "Diuretic therapy",
      "Address underlying cardiac condition",
      "Intensive monitoring",
    ],
  },
];

// Function to get random analysis result
export const getRandomAnalysisResult = () => {
  const randomIndex = Math.floor(Math.random() * dummyAnalysisResults.length);
  return dummyAnalysisResults[randomIndex];
};
