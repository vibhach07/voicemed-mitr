// Risk Classification Engine Interface

import { SymptomEntity, RiskAssessment } from '../types';

export interface RiskClassifier {
  classifyRisk(symptoms: SymptomEntity[]): RiskAssessment;
  getEmergencyKeywords(): string[];
  requiresImmediateAttention(symptoms: SymptomEntity[]): boolean;
}