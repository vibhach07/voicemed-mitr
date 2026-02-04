// Session Controller Interface

import { SessionId, SessionContext } from '../types';

export interface SessionController {
  startSession(): SessionId;
  endSession(sessionId: SessionId): void;
  getSessionContext(sessionId: SessionId): SessionContext;
  updateSessionContext(sessionId: SessionId, context: Partial<SessionContext>): void;
  cleanupExpiredSessions(): void;
  deleteSessionData(sessionId: SessionId): void;
}