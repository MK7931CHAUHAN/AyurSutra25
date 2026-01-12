// import axios from 'axios';

// const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// export const chatService = {
//   async getAIResponse(userMessage, language, chatHistory = []) {
//     try {
//       const messages = [
//         ...chatHistory.slice(-5).map(msg => ({
//           sender: msg.sender,
//           text: msg.text
//         })),
//         {
//           sender: 'user',
//           text: userMessage
//         }
//       ];

//       const response = await axios.post(`${API_BASE_URL}/chat`, {
//         messages,
//         language
//       });

//       return response.data;
//     } catch (error) {
//       console.error('Chat service error:', error);
//       throw error;
//     }
//   },

//   // Fallback medicine data (in case API fails)
//   getFallbackMedicines(symptom) {
//     const medicineData = {
//       fever: [
//         {
//           name: "Paracetamol",
//           description: "For fever and pain relief",
//           dosage: "500mg every 6 hours",
//           activeIngredient: "Acetaminophen",
//           precautions: "Do not exceed 4g per day",
//           sideEffects: "Liver damage in overdose",
//           storage: "Store at room temperature",
//           relatedSymptom: "fever"
//         }
//       ],
//       vomiting: [
//         {
//           name: "Ondansetron",
//           description: "Anti-nausea medication",
//           dosage: "4-8mg as needed",
//           activeIngredient: "Ondansetron",
//           precautions: "May cause constipation",
//           sideEffects: "Headache, fatigue",
//           storage: "Store below 30°C",
//           relatedSymptom: "vomiting"
//         }
//       ],
//       headache: [
//         {
//           name: "Ibuprofen",
//           description: "For headache relief",
//           dosage: "400mg every 8 hours",
//           activeIngredient: "Ibuprofen",
//           precautions: "Take with food",
//           sideEffects: "Stomach upset",
//           storage: "Protect from light",
//           relatedSymptom: "headache"
//         }
//       ]
//     };

//     return medicineData[symptom] || [];
//   }
// };