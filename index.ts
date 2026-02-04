// Core data types for Voice-Med-Mitr

export type SessionId = string;

export enum SeverityLevel {
  MILD = "mild",
  MODERATE = "moderate", 
  SEVERE = "severe"
}

export enum UserIntent {
  DESCRIBE_SYMPTOMS = "describe_symptoms",
  ASK_CLARIFICATION = "ask_clarification",
  END_SESSION = "end_session",
  REQUEST_HELP = "request_help",
  UNKNOWN = "unknown"
}

export enum RiskLevel {
  MILD = "mild",
  MODERATE = "moderate",
  EMERGENCY = "emergency"
}

export enum SessionStatus {
  ACTIVE = "active",
  COMPLETED = "completed",
  EXPIRED = "expired",
  TERMINATED = "terminated"
}

export interface Duration {
  value: number;
  unit: 'minutes' | 'hours' | 'days' | 'weeks';
}

export interface SymptomEntity {
  symptom: string;
  bodyPart: string | null;
  severity: SeverityLevel;
  duration: Duration | null;
  confidence: number;
}

export interface RiskAssessment {
  level: RiskLevel;
  confidence: number;
  reasoning: string[];
  recommendations: string[];
}

export interface SessionContext {
  symptoms: SymptomEntity[];
  questionsAsked: number;
  riskLevel: RiskLevel | null;
  sessionDuration: number;
}

export interface ConversationTurn {
  timestamp: Date;
  type: 'user_input' | 'system_response' | 'clarification_question';
  content: string;
  processedSymptoms?: SymptomEntity[];
}

export interface HealthSession {
  id: SessionId;
  startTime: Date;
  endTime: Date | null;
  symptoms: SymptomEntity[];
  riskAssessment: RiskAssessment | null;
  conversationHistory: ConversationTurn[];
  status: SessionStatus;
}

export interface TTSOptions {
  rate: number;
  pitch: number;
  voice: string;
  emphasis: boolean;
}

export interface PrivacySettings {
  sessionTimeout: number; // seconds
  autoDeleteAfter: number; // seconds
  allowDataRetention: boolean;
  anonymizeData: boolean;
}

export interface SafetyConstraints {
  maxSessionDuration: number; // minutes
  maxFollowUpQuestions: number;
  emergencyKeywords: string[];
  prohibitedAdvice: string[];
  requiredDisclaimers: string[];
}

export interface AudioProcessingConfig {
  sampleRate: number;
  channels: number;
  bitDepth: number;
  noiseReduction: boolean;
  voiceActivityDetection: boolean;
}