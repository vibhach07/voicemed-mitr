// Ambiguity Detection and Handling

import { SymptomEntity, UserIntent } from '../types';
import { NLProcessorImpl } from './NLProcessorImpl';

export interface AmbiguityDetector {
  isAmbiguous(text: string, symptoms: SymptomEntity[]): boolean;
  generateClarificationQuestions(text: string, symptoms: SymptomEntity[]): string[];
  getAmbiguityScore(text: string, symptoms: SymptomEntity[]): number;
}

export class AmbiguityDetectorImpl implements AmbiguityDetector {
  private nlProcessor: NLProcessorImpl;
  private clarificationTemplates: Map<string, string[]>;

  constructor(nlProcessor: NLProcessorImpl) {
    this.nlProcessor = nlProcessor;
    this.clarificationTemplates = new Map();
    this.initializeClarificationTemplates();
  }

  isAmbiguous(text: string, symptoms: SymptomEntity[]): boolean {
    const ambiguityScore = this.getAmbiguityScore(text, symptoms);
    return ambiguityScore > 0.5; // Threshold for ambiguity
  }

  generateClarificationQuestions(text: string, symptoms: SymptomEntity[]): string[] {
    const questions: string[] = [];
    const analysis = this.nlProcessor.analyzeTextComplexity(text);

    // No symptoms detected
    if (!analysis.hasSymptoms || symptoms.length === 0) {
      questions.push("Could you describe what you're feeling or experiencing?");
      return questions;
    }

    const mainSymptom = symptoms[0];

    // Missing body part information
    if (!analysis.hasBodyPart && !mainSymptom.bodyPart) {
      questions.push(this.getBodyPartQuestion(mainSymptom.symptom));
    }

    // Missing severity information
    if (!analysis.hasSeverity && mainSymptom.severity === 'mild') {
      questions.push(this.getSeverityQuestion(mainSymptom.symptom));
    }

    // Missing duration information
    if (!analysis.hasDuration && !mainSymptom.duration) {
      questions.push(this.getDurationQuestion(mainSymptom.symptom));
    }

    // Vague symptom description
    if (mainSymptom.confidence < 0.6) {
      questions.push(this.getSpecificityQuestion(mainSymptom.symptom));
    }

    // Multiple symptoms need prioritization
    if (symptoms.length > 2) {
      questions.push("Which of these symptoms is bothering you the most?");
    }

    return questions.slice(0, 2); // Limit to 2 questions at a time
  }

  getAmbiguityScore(text: string, symptoms: SymptomEntity[]): number {
    let ambiguityScore = 0;

    // No symptoms detected
    if (symptoms.length === 0) {
      ambiguityScore += 0.8;
    }

    // Low confidence symptoms
    const avgConfidence = symptoms.reduce((sum, s) => sum + s.confidence, 0) / symptoms.length;
    if (avgConfidence < 0.5) {
      ambiguityScore += 0.4;
    }

    // Missing key information
    const analysis = this.nlProcessor.analyzeTextComplexity(text);
    if (!analysis.hasBodyPart) ambiguityScore += 0.2;
    if (!analysis.hasSeverity) ambiguityScore += 0.2;
    if (!analysis.hasDuration) ambiguityScore += 0.1;

    // Very short or vague descriptions
    if (text.trim().split(' ').length < 3) {
      ambiguityScore += 0.3;
    }

    // Contains uncertainty markers
    const uncertaintyMarkers = ['maybe', 'might', 'could be', 'not sure', 'think', 'possibly'];
    if (uncertaintyMarkers.some(marker => text.toLowerCase().includes(marker))) {
      ambiguityScore += 0.2;
    }

    return Math.min(ambiguityScore, 1.0);
  }

  private initializeClarificationTemplates(): void {
    this.clarificationTemplates = new Map([
      ['bodyPart', [
        'Where exactly do you feel the {symptom}?',
        'Can you tell me which part of your body has the {symptom}?',
        'Is the {symptom} in a specific area?'
      ]],
      ['severity', [
        'How would you rate the {symptom} - mild, moderate, or severe?',
        'On a scale of mild to severe, how bad is the {symptom}?',
        'Is the {symptom} bothering you a lot or just a little?'
      ]],
      ['duration', [
        'How long have you had this {symptom}?',
        'When did the {symptom} start?',
        'Has the {symptom} been going on for hours, days, or longer?'
      ]],
      ['specificity', [
        'Can you describe the {symptom} in more detail?',
        'What does the {symptom} feel like exactly?',
        'Is there anything specific about how the {symptom} feels?'
      ]]
    ]);
  }

  private getBodyPartQuestion(symptom: string): string {
    const templates = this.clarificationTemplates.get('bodyPart') || [];
    const template = templates[Math.floor(Math.random() * templates.length)];
    return template.replace('{symptom}', symptom);
  }

  private getSeverityQuestion(symptom: string): string {
    const templates = this.clarificationTemplates.get('severity') || [];
    const template = templates[Math.floor(Math.random() * templates.length)];
    return template.replace('{symptom}', symptom);
  }

  private getDurationQuestion(symptom: string): string {
    const templates = this.clarificationTemplates.get('duration') || [];
    const template = templates[Math.floor(Math.random() * templates.length)];
    return template.replace('{symptom}', symptom);
  }

  private getSpecificityQuestion(symptom: string): string {
    const templates = this.clarificationTemplates.get('specificity') || [];
    const template = templates[Math.floor(Math.random() * templates.length)];
    return template.replace('{symptom}', symptom);
  }

  // Public methods for testing and configuration
  addClarificationTemplate(category: string, templates: string[]): void {
    const existing = this.clarificationTemplates.get(category) || [];
    this.clarificationTemplates.set(category, [...existing, ...templates]);
  }

  getClarificationTemplates(): Map<string, string[]> {
    return new Map(this.clarificationTemplates);
  }
}

// Enhanced Intent Detection
export class IntentDetectorImpl {
  private nlProcessor: NLProcessorImpl;
  private contextHistory: string[] = [];

  constructor(nlProcessor: NLProcessorImpl) {
    this.nlProcessor = nlProcessor;
  }

  detectIntent(text: string, conversationContext?: string[]): UserIntent {
    // Update context history
    if (conversationContext) {
      this.contextHistory = conversationContext;
    }

    const normalizedText = text.toLowerCase().trim();
    
    // Use NLProcessor's basic intent detection
    const baseIntent = this.nlProcessor.detectIntent(text);

    // Enhance with context-aware detection
    return this.refineIntentWithContext(baseIntent, normalizedText);
  }

  private refineIntentWithContext(baseIntent: UserIntent, text: string): UserIntent {
    // Check for context-specific patterns
    
    // If previous context suggests we were asking for clarification
    if (this.contextHistory.some(msg => msg.includes('?'))) {
      if (this.isAnsweringQuestion(text)) {
        return UserIntent.DESCRIBE_SYMPTOMS;
      }
    }

    // Check for confirmation responses
    if (this.isConfirmationResponse(text)) {
      return UserIntent.ASK_CLARIFICATION;
    }

    // Check for help-seeking behavior
    if (this.isSeekingHelp(text)) {
      return UserIntent.REQUEST_HELP;
    }

    return baseIntent;
  }

  private isAnsweringQuestion(text: string): boolean {
    const answerPatterns = [
      /^(yes|no|maybe|i think|probably)/i,
      /^(it's|it is|the pain is|it feels)/i,
      /^(since|for|about|around)/i, // Duration answers
      /^(mild|moderate|severe|bad|terrible)/i // Severity answers
    ];

    return answerPatterns.some(pattern => pattern.test(text));
  }

  private isConfirmationResponse(text: string): boolean {
    const confirmationPatterns = [
      /(yes|yeah|correct|right|exactly)/i,
      /(no|not really|that's not right)/i,
      /(can you repeat|what do you mean|i don't understand)/i
    ];

    return confirmationPatterns.some(pattern => pattern.test(text));
  }

  private isSeekingHelp(text: string): boolean {
    const helpPatterns = [
      /(what should i do|what do you recommend|help me)/i,
      /(is this serious|should i be worried|do i need)/i,
      /(what could this be|what might cause)/i
    ];

    return helpPatterns.some(pattern => pattern.test(text));
  }

  updateContext(message: string): void {
    this.contextHistory.push(message);
    // Keep only recent context (last 5 messages)
    if (this.contextHistory.length > 5) {
      this.contextHistory = this.contextHistory.slice(-5);
    }
  }

  clearContext(): void {
    this.contextHistory = [];
  }

  getContext(): string[] {
    return [...this.contextHistory];
  }
}

// Export alias for test compatibility
export const AmbiguityDetector = AmbiguityDetectorImpl;