// Application constants

export const WAKE_WORD = "Hey Mitr";
export const SPEECH_TIMEOUT_MS = 3000;
export const SESSION_TIMEOUT_MS = 30000;
export const AUTO_END_SESSION_MS = 60000;
export const MAX_FOLLOW_UP_QUESTIONS = 5;

export const PRIVACY_SETTINGS = {
  sessionTimeout: 1800, // 30 minutes
  autoDeleteAfter: 0, // immediate deletion
  allowDataRetention: false,
  anonymizeData: true
};

export const SAFETY_CONSTRAINTS = {
  maxSessionDuration: 30, // minutes
  maxFollowUpQuestions: 5,
  emergencyKeywords: [
    "chest pain", "difficulty breathing", "severe bleeding", 
    "unconscious", "stroke", "heart attack", "allergic reaction",
    "severe headache", "can't breathe", "choking"
  ],
  prohibitedAdvice: [
    "take medication", "dosage", "prescription", "drug",
    "medicine name", "pills", "tablets"
  ],
  requiredDisclaimers: [
    "This system does not provide medical diagnosis",
    "Please consult a healthcare professional for medical advice",
    "In case of emergency, contact emergency services immediately"
  ]
};

export const AUDIO_CONFIG = {
  sampleRate: 44100,
  channels: 1,
  bitDepth: 16,
  noiseReduction: true,
  voiceActivityDetection: true
};