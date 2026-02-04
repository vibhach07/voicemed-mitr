// Medical Symptom Scenarios for Testing

export interface SymptomScenario {
  id: string;
  name: string;
  description: string;
  userInputs: string[];
  expectedRiskLevel: 'MILD' | 'MODERATE' | 'EMERGENCY';
  expectedSymptoms: string[];
  expectedQuestions?: string[];
}

export const SYMPTOM_SCENARIOS: SymptomScenario[] = [
  {
    id: 'mild-headache',
    name: 'Mild Headache',
    description: 'Simple headache scenario with basic symptoms',
    userInputs: [
      'I have a headache',
      'It started this morning',
      'It\'s mild, maybe a 3 out of 10'
    ],
    expectedRiskLevel: 'MILD',
    expectedSymptoms: ['headache'],
    expectedQuestions: ['How severe is the pain?', 'When did it start?']
  },
  
  {
    id: 'moderate-fever',
    name: 'Moderate Fever',
    description: 'Fever with additional symptoms requiring medical attention',
    userInputs: [
      'I have a fever and feel weak',
      'My temperature is 101.5 degrees',
      'I\'ve been feeling this way for two days'
    ],
    expectedRiskLevel: 'MODERATE',
    expectedSymptoms: ['fever', 'weakness'],
    expectedQuestions: ['What is your temperature?', 'How long have you had these symptoms?']
  },
  
  {
    id: 'emergency-chest-pain',
    name: 'Emergency Chest Pain',
    description: 'Severe chest pain requiring immediate medical attention',
    userInputs: [
      'I have severe chest pain',
      'It feels like crushing pressure',
      'I can\'t breathe properly'
    ],
    expectedRiskLevel: 'EMERGENCY',
    expectedSymptoms: ['chest pain', 'shortness of breath'],
    expectedQuestions: []
  },
  
  {
    id: 'ambiguous-symptoms',
    name: 'Ambiguous Symptoms',
    description: 'Vague symptoms requiring clarification',
    userInputs: [
      'I don\'t feel good',
      'Something is wrong',
      'I feel bad all over'
    ],
    expectedRiskLevel: 'MILD',
    expectedSymptoms: [],
    expectedQuestions: ['Can you describe what you\'re feeling?', 'Where do you feel discomfort?']
  },
  
  {
    id: 'stomach-issues',
    name: 'Stomach Issues',
    description: 'Digestive problems with moderate concern',
    userInputs: [
      'My stomach hurts really bad',
      'I\'ve been vomiting since yesterday',
      'The pain is in my upper abdomen'
    ],
    expectedRiskLevel: 'MODERATE',
    expectedSymptoms: ['stomach pain', 'vomiting'],
    expectedQuestions: ['How severe is the pain?', 'When did the vomiting start?']
  },
  
  {
    id: 'respiratory-emergency',
    name: 'Respiratory Emergency',
    description: 'Severe breathing difficulties requiring immediate care',
    userInputs: [
      'I can\'t breathe',
      'My chest feels tight',
      'I\'m having trouble getting air'
    ],
    expectedRiskLevel: 'EMERGENCY',
    expectedSymptoms: ['shortness of breath', 'chest tightness'],
    expectedQuestions: []
  },
  
  {
    id: 'mild-cold',
    name: 'Mild Cold Symptoms',
    description: 'Common cold with mild symptoms',
    userInputs: [
      'I have a runny nose and slight cough',
      'It started yesterday',
      'It\'s not too bad, just annoying'
    ],
    expectedRiskLevel: 'MILD',
    expectedSymptoms: ['runny nose', 'cough'],
    expectedQuestions: ['How long have you had these symptoms?']
  },
  
  {
    id: 'neurological-concern',
    name: 'Neurological Concern',
    description: 'Symptoms that may indicate neurological issues',
    userInputs: [
      'I have a severe headache with vision problems',
      'I feel dizzy and nauseous',
      'This came on suddenly an hour ago'
    ],
    expectedRiskLevel: 'EMERGENCY',
    expectedSymptoms: ['severe headache', 'vision problems', 'dizziness', 'nausea'],
    expectedQuestions: []
  }
];

export function getScenarioById(id: string): SymptomScenario | undefined {
  return SYMPTOM_SCENARIOS.find(scenario => scenario.id === id);
}

export function getScenariosByRiskLevel(riskLevel: 'MILD' | 'MODERATE' | 'EMERGENCY'): SymptomScenario[] {
  return SYMPTOM_SCENARIOS.filter(scenario => scenario.expectedRiskLevel === riskLevel);
}

export function getAllScenarios(): SymptomScenario[] {
  return [...SYMPTOM_SCENARIOS];
}