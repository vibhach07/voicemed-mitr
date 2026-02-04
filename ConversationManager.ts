// Conversation Manager Interface

import { SymptomEntity, SessionContext, RiskAssessment } from '../types';

export interface ConversationManager {
  generateFollowUpQuestions(symptoms: SymptomEntity[]): string[];
  shouldAskFollowUp(context: SessionContext): boolean;
  formatResponse(assessment: RiskAssessment): string;
  addMedicalDisclaimer(response: string): string;
}