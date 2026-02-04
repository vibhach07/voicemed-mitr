// Conversation Manager Implementation

import { ConversationManager } from '../interfaces';
import { SymptomEntity, SessionContext, RiskAssessment, RiskLevel } from '../types';
import { MAX_FOLLOW_UP_QUESTIONS, SAFETY_CONSTRAINTS } from '../config/constants';
import { AmbiguityDetectorImpl } from './AmbiguityDetector';
import { NLProcessorImpl } from './NLProcessorImpl';

export class ConversationManagerImpl implements ConversationManager {
  private nlProcessor: NLProcessorImpl;
  private ambiguityDetector: AmbiguityDetectorImpl;
  private questionTemplates: Map<string, string[]>;
  private responseTemplates: Map<string, string[]>;

  constructor(nlProcessor: NLProcessorImpl) {
    this.nlProcessor = nlProcessor;
    this.ambiguityDetector = new AmbiguityDetectorImpl(nlProcessor);
    this.initializeTemplates();
  }

  generateFollowUpQuestions(symptoms: SymptomEntity[]): string[] {
    if (symptoms.length === 0) {
      return ["Could you please describe what you're feeling or experiencing?"];
    }

    const questions: string[] = [];
    const mainSymptom = symptoms[0];

    // Use ambiguity detector to generate contextual questions
    const ambiguityQuestions = this.ambiguityDetector.generateClarificationQuestions(
      mainSymptom.symptom, 
      symptoms
    );
    
    questions.push(...ambiguityQuestions);

    // Add symptom-specific follow-up questions
    const specificQuestions = this.getSymptomSpecificQuestions(mainSymptom);
    questions.push(...specificQuestions);

    // Remove duplicates and limit to reasonable number
    const uniqueQuestions = Array.from(new Set(questions));
    return uniqueQuestions.slice(0, 2); // Limit to 2 questions at a time
  }

  shouldAskFollowUp(context: SessionContext): boolean {
    // Don't ask more questions if we've reached the limit
    if (context.questionsAsked >= MAX_FOLLOW_UP_QUESTIONS) {
      return false;
    }

    // Don't ask questions if we already have a high-confidence assessment
    if (context.riskLevel === RiskLevel.EMERGENCY) {
      return false; // Emergency cases should proceed immediately
    }

    // Ask follow-up if symptoms are ambiguous or incomplete
    if (context.symptoms.length === 0) {
      return true;
    }

    const mainSymptom = context.symptoms[0];
    const needsClarification = this.ambiguityDetector.isAmbiguous(
      mainSymptom.symptom, 
      context.symptoms
    );

    return needsClarification;
  }

  formatResponse(assessment: RiskAssessment): string {
    let response = '';

    // Add assessment summary
    response += this.generateAssessmentSummary(assessment);
    response += ' ';

    // Add risk-specific recommendations
    response += this.generateRiskSpecificGuidance(assessment);
    response += ' ';

    // Add medical disclaimer
    response += this.addMedicalDisclaimer('');

    return response.trim();
  }

  addMedicalDisclaimer(response: string): string {
    const disclaimers = SAFETY_CONSTRAINTS.requiredDisclaimers;
    const randomDisclaimer = disclaimers[Math.floor(Math.random() * disclaimers.length)];
    
    if (response.trim().length > 0) {
      return `${response} ${randomDisclaimer}`;
    }
    return randomDisclaimer;
  }

  private initializeTemplates(): void {
    // Question templates for different scenarios
    this.questionTemplates = new Map([
      ['severity', [
        'How would you describe the intensity - is it mild, moderate, or severe?',
        'On a scale from mild to severe, how would you rate this?',
        'Is this bothering you a little or a lot?'
      ]],
      ['duration', [
        'How long have you been experiencing this?',
        'When did this start?',
        'Has this been going on for minutes, hours, or days?'
      ]],
      ['location', [
        'Where exactly do you feel this?',
        'Can you tell me which part of your body is affected?',
        'Is this in a specific area or more general?'
      ]],
      ['associated', [
        'Are you experiencing anything else along with this?',
        'Do you have any other symptoms?',
        'Is there anything else that\'s bothering you?'
      ]],
      ['triggers', [
        'Did anything specific trigger this?',
        'Do you notice if anything makes it better or worse?',
        'Have you done anything that seemed to help or hurt?'
      ]]
    ]);

    // Response templates for different risk levels
    this.responseTemplates = new Map([
      ['mild_intro', [
        'Based on what you\'ve described, this appears to be a mild condition.',
        'Your symptoms suggest a minor health concern.',
        'This seems to be a mild issue that may be manageable at home.'
      ]],
      ['moderate_intro', [
        'Your symptoms indicate a moderate health concern that should be evaluated.',
        'Based on your description, this appears to be a condition that warrants medical attention.',
        'Your symptoms suggest you should consider seeing a healthcare professional.'
      ]],
      ['emergency_intro', [
        'Your symptoms indicate a potentially serious condition requiring immediate attention.',
        'Based on what you\'ve described, this appears to be an urgent medical situation.',
        'Your symptoms suggest you need immediate medical care.'
      ]],
      ['confidence_high', [
        'I\'m quite confident in this assessment.',
        'This evaluation is based on clear symptom patterns.',
        'The symptoms you\'ve described provide a clear picture.'
      ]],
      ['confidence_low', [
        'While I have some concerns, more information would be helpful.',
        'Based on the available information, here\'s my assessment.',
        'Given what you\'ve shared, this is my current evaluation.'
      ]]
    ]);
  }

  private getSymptomSpecificQuestions(symptom: SymptomEntity): string[] {
    const questions: string[] = [];
    const symptomType = symptom.symptom.toLowerCase();

    // Symptom-specific question logic
    if (symptomType.includes('headache') || symptomType.includes('head')) {
      questions.push('Is the headache throbbing, sharp, or more of a dull ache?');
      if (!symptom.duration) {
        questions.push('Did the headache come on suddenly or gradually?');
      }
    }

    if (symptomType.includes('chest') || symptomType.includes('heart')) {
      questions.push('Does the pain get worse when you breathe or move?');
      questions.push('Are you experiencing any shortness of breath?');
    }

    if (symptomType.includes('stomach') || symptomType.includes('abdominal')) {
      questions.push('Is the pain cramping, sharp, or burning?');
      questions.push('Have you had any nausea or vomiting?');
    }

    if (symptomType.includes('fever') || symptomType.includes('temperature')) {
      questions.push('Have you taken your temperature? What was it?');
      questions.push('Are you experiencing chills or sweating?');
    }

    if (symptomType.includes('cough')) {
      questions.push('Is it a dry cough or are you bringing up mucus?');
      questions.push('Does coughing make your chest hurt?');
    }

    return questions;
  }

  private generateAssessmentSummary(assessment: RiskAssessment): string {
    const confidenceLevel = assessment.confidence > 0.8 ? 'high' : 
                           assessment.confidence > 0.5 ? 'moderate' : 'low';
    
    let intro = '';
    switch (assessment.level) {
      case RiskLevel.MILD:
        intro = this.getRandomTemplate('mild_intro');
        break;
      case RiskLevel.MODERATE:
        intro = this.getRandomTemplate('moderate_intro');
        break;
      case RiskLevel.EMERGENCY:
        intro = this.getRandomTemplate('emergency_intro');
        break;
    }

    const confidenceStatement = confidenceLevel === 'high' ? 
      this.getRandomTemplate('confidence_high') : 
      this.getRandomTemplate('confidence_low');

    return `${intro} ${confidenceStatement}`;
  }

  private generateRiskSpecificGuidance(assessment: RiskAssessment): string {
    const recommendations = assessment.recommendations.slice(0, 3); // Limit recommendations
    
    switch (assessment.level) {
      case RiskLevel.MILD:
        return `Here's what I recommend: ${recommendations.join('. ')}. However, if your symptoms worsen or don't improve in a few days, please consider consulting a healthcare professional.`;
        
      case RiskLevel.MODERATE:
        return `I recommend the following: ${recommendations.join('. ')}. Please monitor your symptoms closely and seek immediate care if they worsen significantly.`;
        
      case RiskLevel.EMERGENCY:
        return `This is urgent: ${recommendations.join('. ')}. Do not delay seeking medical attention as time may be critical.`;
        
      default:
        return recommendations.join('. ');
    }
  }

  private getRandomTemplate(category: string): string {
    const templates = this.responseTemplates.get(category) || [''];
    return templates[Math.floor(Math.random() * templates.length)];
  }

  // Enhanced conversation flow methods
  generateGreeting(): string {
    const greetings = [
      'Hello! I\'m here to help you understand your health symptoms. Please describe what you\'re experiencing.',
      'Hi there! I can help you assess your symptoms and provide guidance. What\'s bothering you today?',
      'Welcome! I\'m your voice health companion. Please tell me about any symptoms you\'re experiencing.'
    ];
    
    const greeting = greetings[Math.floor(Math.random() * greetings.length)];
    const disclaimer = 'Please remember that I provide guidance only and cannot diagnose medical conditions.';
    
    return `${greeting} ${disclaimer}`;
  }

  generateClosing(hadEmergency: boolean = false): string {
    if (hadEmergency) {
      return 'Please take care of yourself and seek the medical attention we discussed. Stay safe!';
    }
    
    const closings = [
      'Thank you for using Voice-Med-Mitr. I hope you feel better soon. Take care!',
      'I hope this guidance was helpful. Remember to consult healthcare professionals for ongoing concerns. Goodbye!',
      'Take care of yourself and don\'t hesitate to seek professional medical advice when needed. Goodbye!'
    ];
    
    return closings[Math.floor(Math.random() * closings.length)];
  }

  generateConfirmation(symptoms: SymptomEntity[]): string {
    if (symptoms.length === 0) {
      return 'I haven\'t identified any specific symptoms yet. Could you please describe what you\'re experiencing?';
    }

    const mainSymptom = symptoms[0];
    let confirmation = `Let me confirm what I understand: you have ${mainSymptom.symptom}`;
    
    if (mainSymptom.severity && mainSymptom.severity !== 'mild') {
      confirmation += ` that is ${mainSymptom.severity}`;
    }
    
    if (mainSymptom.bodyPart) {
      confirmation += ` in your ${mainSymptom.bodyPart}`;
    }
    
    if (mainSymptom.duration) {
      confirmation += ` for ${mainSymptom.duration.value} ${mainSymptom.duration.unit}`;
    }

    if (symptoms.length > 1) {
      const otherSymptoms = symptoms.slice(1).map(s => s.symptom);
      confirmation += `, along with ${otherSymptoms.join(' and ')}`;
    }

    confirmation += '. Is this correct?';
    
    return confirmation;
  }

  // Enhanced confirmation with repetition for clarity
  generateDetailedConfirmation(symptoms: SymptomEntity[]): string {
    const basicConfirmation = this.generateConfirmation(symptoms);
    
    if (symptoms.length === 0) {
      return basicConfirmation;
    }

    // Add repetition for important information (accessibility requirement)
    const mainSymptom = symptoms[0];
    let repetition = `To repeat: your main concern is ${mainSymptom.symptom}`;
    
    if (mainSymptom.severity === SeverityLevel.SEVERE) {
      repetition += ` which you describe as severe`;
    }
    
    if (mainSymptom.bodyPart) {
      repetition += ` affecting your ${mainSymptom.bodyPart}`;
    }

    return `${basicConfirmation} ${repetition}.`;
  }

  // Method to repeat important recommendations
  generateRepeatedRecommendations(assessment: RiskAssessment): string {
    const primaryRecommendations = assessment.recommendations.slice(0, 2);
    
    let response = `Here are my recommendations: ${primaryRecommendations.join('. ')}.`;
    
    // Repeat the most important recommendation for clarity
    if (assessment.level === RiskLevel.EMERGENCY && primaryRecommendations.length > 0) {
      response += ` Let me repeat the most important point: ${primaryRecommendations[0]}.`;
    } else if (assessment.level === RiskLevel.MODERATE && primaryRecommendations.length > 0) {
      response += ` To emphasize: ${primaryRecommendations[0]}.`;
    }
    
    return response;
  }

  generateProgressUpdate(questionsAsked: number, maxQuestions: number): string {
    if (questionsAsked >= maxQuestions - 1) {
      return 'I have enough information to provide you with guidance now.';
    }
    
    return `I'd like to ask ${maxQuestions - questionsAsked} more question${maxQuestions - questionsAsked > 1 ? 's' : ''} to better understand your situation.`;
  }

  // Public methods for testing and configuration
  addQuestionTemplate(category: string, templates: string[]): void {
    const existing = this.questionTemplates.get(category) || [];
    this.questionTemplates.set(category, [...existing, ...templates]);
  }

  addResponseTemplate(category: string, templates: string[]): void {
    const existing = this.responseTemplates.get(category) || [];
    this.responseTemplates.set(category, [...existing, ...templates]);
  }

  getQuestionTemplates(): Map<string, string[]> {
    return new Map(this.questionTemplates);
  }

  getResponseTemplates(): Map<string, string[]> {
    return new Map(this.responseTemplates);
  }

  getAmbiguityDetector(): AmbiguityDetectorImpl {
    return this.ambiguityDetector;
  }

  // Method to analyze conversation state
  analyzeConversationState(context: SessionContext): {
    needsMoreInfo: boolean;
    canProceed: boolean;
    suggestedAction: string;
    confidence: number;
  } {
    const needsMoreInfo = this.shouldAskFollowUp(context);
    const canProceed = !needsMoreInfo || context.questionsAsked >= MAX_FOLLOW_UP_QUESTIONS;
    
    let suggestedAction = '';
    if (context.riskLevel === RiskLevel.EMERGENCY) {
      suggestedAction = 'provide_emergency_guidance';
    } else if (canProceed) {
      suggestedAction = 'provide_assessment';
    } else {
      suggestedAction = 'ask_follow_up';
    }

    // Calculate conversation confidence based on information completeness
    let confidence = 0.5;
    if (context.symptoms.length > 0) {
      const avgSymptomConfidence = context.symptoms.reduce((sum, s) => sum + s.confidence, 0) / context.symptoms.length;
      confidence += avgSymptomConfidence * 0.3;
    }
    
    if (context.questionsAsked > 0) {
      confidence += Math.min(context.questionsAsked * 0.1, 0.2);
    }

    return {
      needsMoreInfo,
      canProceed,
      suggestedAction,
      confidence: Math.min(confidence, 1.0)
    };
  }
}