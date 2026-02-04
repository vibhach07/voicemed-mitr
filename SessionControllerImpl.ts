// Session Controller Implementation

import { SessionController } from '../interfaces';
import { SessionId, SessionContext, HealthSession, SessionStatus, SymptomEntity, RiskAssessment, ConversationTurn } from '../types';
import { PRIVACY_SETTINGS, SESSION_TIMEOUT_MS, AUTO_END_SESSION_MS } from '../config/constants';
import { v4 as uuidv4 } from 'uuid';

export class SessionControllerImpl implements SessionController {
  private sessions: Map<SessionId, HealthSession>;
  private sessionTimeouts: Map<SessionId, NodeJS.Timeout>;
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.sessions = new Map();
    this.sessionTimeouts = new Map();
    this.startCleanupProcess();
  }

  startSession(): SessionId {
    const sessionId = uuidv4();
    const now = new Date();
    
    const session: HealthSession = {
      id: sessionId,
      startTime: now,
      endTime: null,
      symptoms: [],
      riskAssessment: null,
      conversationHistory: [{
        timestamp: now,
        type: 'system_response',
        content: 'Session started'
      }],
      status: SessionStatus.ACTIVE
    };

    this.sessions.set(sessionId, session);
    this.setupSessionTimeout(sessionId);
    
    console.log(`Session ${sessionId} started at ${now.toISOString()}`);
    return sessionId;
  }

  endSession(sessionId: SessionId): void {
    const session = this.sessions.get(sessionId);
    if (!session) {
      console.warn(`Attempted to end non-existent session: ${sessionId}`);
      return;
    }

    // Update session status
    session.endTime = new Date();
    session.status = SessionStatus.COMPLETED;
    
    // Add final conversation turn
    session.conversationHistory.push({
      timestamp: new Date(),
      type: 'system_response',
      content: 'Session ended'
    });

    console.log(`Session ${sessionId} ended at ${session.endTime.toISOString()}`);
    
    // Clean up session data immediately for privacy
    this.deleteSessionData(sessionId);
  }

  getSessionContext(sessionId: SessionId): SessionContext {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }

    const now = new Date();
    const sessionDuration = now.getTime() - session.startTime.getTime();
    
    // Count questions asked
    const questionsAsked = session.conversationHistory.filter(
      turn => turn.type === 'clarification_question'
    ).length;

    return {
      symptoms: [...session.symptoms], // Return copy for immutability
      questionsAsked,
      riskLevel: session.riskAssessment?.level || null,
      sessionDuration: Math.floor(sessionDuration / 1000) // Convert to seconds
    };
  }

  updateSessionContext(sessionId: SessionId, context: Partial<SessionContext>): void {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }

    // Update symptoms if provided
    if (context.symptoms) {
      session.symptoms = [...context.symptoms];
      
      // Add conversation turn for symptom update
      session.conversationHistory.push({
        timestamp: new Date(),
        type: 'user_input',
        content: `Symptoms updated: ${context.symptoms.map(s => s.symptom).join(', ')}`,
        processedSymptoms: [...context.symptoms]
      });
    }

    // Update risk assessment if risk level is provided
    if (context.riskLevel && !session.riskAssessment) {
      session.riskAssessment = {
        level: context.riskLevel,
        confidence: 0.7, // Default confidence
        reasoning: ['Updated from session context'],
        recommendations: ['See conversation for details']
      };
    }

    console.log(`Session ${sessionId} context updated`);
  }

  cleanupExpiredSessions(): void {
    const now = new Date();
    const expiredSessions: SessionId[] = [];

    for (const [sessionId, session] of this.sessions) {
      const sessionAge = now.getTime() - session.startTime.getTime();
      
      // Mark sessions as expired if they exceed timeout
      if (sessionAge > PRIVACY_SETTINGS.sessionTimeout * 1000) {
        session.status = SessionStatus.EXPIRED;
        expiredSessions.push(sessionId);
      }
    }

    // Delete expired sessions
    expiredSessions.forEach(sessionId => {
      console.log(`Cleaning up expired session: ${sessionId}`);
      this.deleteSessionData(sessionId);
    });

    if (expiredSessions.length > 0) {
      console.log(`Cleaned up ${expiredSessions.length} expired sessions`);
    }
  }

  deleteSessionData(sessionId: SessionId): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      // Clear sensitive data
      session.symptoms = [];
      session.conversationHistory = [];
      session.riskAssessment = null;
      
      // Remove from active sessions
      this.sessions.delete(sessionId);
      
      // Clear any timeouts
      const timeout = this.sessionTimeouts.get(sessionId);
      if (timeout) {
        clearTimeout(timeout);
        this.sessionTimeouts.delete(sessionId);
      }
      
      console.log(`Session data deleted: ${sessionId}`);
    }
  }

  // Additional methods for enhanced session management

  addConversationTurn(sessionId: SessionId, turn: ConversationTurn): void {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }

    session.conversationHistory.push(turn);
    
    // Reset session timeout on activity
    this.resetSessionTimeout(sessionId);
  }

  addSymptoms(sessionId: SessionId, symptoms: SymptomEntity[]): void {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }

    // Add new symptoms, avoiding duplicates
    symptoms.forEach(newSymptom => {
      const exists = session.symptoms.some(existing => 
        existing.symptom === newSymptom.symptom && 
        existing.bodyPart === newSymptom.bodyPart
      );
      
      if (!exists) {
        session.symptoms.push(newSymptom);
      }
    });

    // Add conversation turn
    this.addConversationTurn(sessionId, {
      timestamp: new Date(),
      type: 'user_input',
      content: `Added symptoms: ${symptoms.map(s => s.symptom).join(', ')}`,
      processedSymptoms: symptoms
    });
  }

  setRiskAssessment(sessionId: SessionId, assessment: RiskAssessment): void {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }

    session.riskAssessment = assessment;
    
    // Add conversation turn
    this.addConversationTurn(sessionId, {
      timestamp: new Date(),
      type: 'system_response',
      content: `Risk assessment: ${assessment.level} (confidence: ${Math.round(assessment.confidence * 100)}%)`
    });
  }

  getActiveSessionCount(): number {
    return Array.from(this.sessions.values()).filter(
      session => session.status === SessionStatus.ACTIVE
    ).length;
  }

  getSessionById(sessionId: SessionId): HealthSession | null {
    return this.sessions.get(sessionId) || null;
  }

  getAllActiveSessions(): HealthSession[] {
    return Array.from(this.sessions.values()).filter(
      session => session.status === SessionStatus.ACTIVE
    );
  }

  isSessionActive(sessionId: SessionId): boolean {
    const session = this.sessions.get(sessionId);
    return session?.status === SessionStatus.ACTIVE;
  }

  getSessionDuration(sessionId: SessionId): number {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return 0;
    }

    const endTime = session.endTime || new Date();
    return endTime.getTime() - session.startTime.getTime();
  }

  // Privacy and data protection methods

  anonymizeSessionData(sessionId: SessionId): void {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return;
    }

    // Anonymize symptoms (keep only symptom types, remove personal details)
    session.symptoms = session.symptoms.map(symptom => ({
      ...symptom,
      bodyPart: symptom.bodyPart ? 'anonymized' : null,
      duration: symptom.duration ? { value: 0, unit: 'hours' } : null
    }));

    // Anonymize conversation history
    session.conversationHistory = session.conversationHistory.map(turn => ({
      ...turn,
      content: 'anonymized',
      processedSymptoms: turn.processedSymptoms?.map(s => ({
        ...s,
        bodyPart: null,
        duration: null
      }))
    }));

    console.log(`Session data anonymized: ${sessionId}`);
  }

  exportAnonymizedData(): any[] {
    const anonymizedSessions = [];
    
    for (const session of this.sessions.values()) {
      if (PRIVACY_SETTINGS.anonymizeData) {
        anonymizedSessions.push({
          sessionDuration: this.getSessionDuration(session.id),
          symptomCount: session.symptoms.length,
          riskLevel: session.riskAssessment?.level || null,
          conversationTurns: session.conversationHistory.length
        });
      }
    }
    
    return anonymizedSessions;
  }

  // Private helper methods

  private setupSessionTimeout(sessionId: SessionId): void {
    // Set up automatic session cleanup
    const timeout = setTimeout(() => {
      const session = this.sessions.get(sessionId);
      if (session && session.status === SessionStatus.ACTIVE) {
        console.log(`Session ${sessionId} timed out`);
        session.status = SessionStatus.EXPIRED;
        this.deleteSessionData(sessionId);
      }
    }, PRIVACY_SETTINGS.sessionTimeout * 1000);

    this.sessionTimeouts.set(sessionId, timeout);
  }

  private resetSessionTimeout(sessionId: SessionId): void {
    // Clear existing timeout
    const existingTimeout = this.sessionTimeouts.get(sessionId);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    // Set up new timeout
    this.setupSessionTimeout(sessionId);
  }

  private startCleanupProcess(): void {
    // Run cleanup every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpiredSessions();
    }, 5 * 60 * 1000);
  }

  // Cleanup method for shutdown
  shutdown(): void {
    // Clear all timeouts
    for (const timeout of this.sessionTimeouts.values()) {
      clearTimeout(timeout);
    }
    this.sessionTimeouts.clear();

    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }

    // Delete all session data
    const sessionIds = Array.from(this.sessions.keys());
    sessionIds.forEach(sessionId => this.deleteSessionData(sessionId));

    console.log('SessionController shutdown complete');
  }
}