// Basic tests to verify project structure

import { describe, it, expect } from './test-framework';
import { VoiceMedMitr } from '../index';
import { SeverityLevel, RiskLevel, UserIntent, SessionStatus } from '../types';
import { WAKE_WORD, MAX_FOLLOW_UP_QUESTIONS } from '../config/constants';

describe('Voice-Med-Mitr Project Structure', () => {
  it('should create VoiceMedMitr instance', () => {
    const app = new VoiceMedMitr();
    expect(app).toBeDefined();
  });

  it('should have correct constants defined', () => {
    expect(WAKE_WORD).toBe('Hey Mitr');
    expect(MAX_FOLLOW_UP_QUESTIONS).toBe(5);
  });

  it('should have all required enums', () => {
    expect(SeverityLevel.MILD).toBe('mild');
    expect(SeverityLevel.MODERATE).toBe('moderate');
    expect(SeverityLevel.SEVERE).toBe('severe');

    expect(RiskLevel.MILD).toBe('mild');
    expect(RiskLevel.MODERATE).toBe('moderate');
    expect(RiskLevel.EMERGENCY).toBe('emergency');

    expect(UserIntent.DESCRIBE_SYMPTOMS).toBe('describe_symptoms');
    expect(UserIntent.END_SESSION).toBe('end_session');

    expect(SessionStatus.ACTIVE).toBe('active');
    expect(SessionStatus.COMPLETED).toBe('completed');
  });
});