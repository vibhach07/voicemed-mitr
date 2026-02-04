// Safety Guardian for Medical Compliance

import { RiskAssessment, RiskLevel } from '../types';
import { SAFETY_CONSTRAINTS } from '../config/constants';

export interface SafetyGuardian {
  validateResponse(response: string): { isValid: boolean; violations: string[] };
  addMedicalDisclaimer(response: string): string;
  filterProhibitedContent(text: string): string;
  enforceEmergencyProtocol(assessment: RiskAssessment): RiskAssessment;
}

export class SafetyGuardianImpl implements SafetyGuardian {
  private prohibitedTerms: Set<string>;
  private medicalDisclaimers: string[];
  private emergencyKeywords: Set<string>;

  constructor() {
    this.initializeProhibitedTerms();
    this.initializeMedicalDisclaimers();
    this.initializeEmergencyKeywords();
  }

  validateResponse(response: string): { isValid: boolean; violations: string[] } {
    const violations: string[] = [];
    const lowerResponse = response.toLowerCase();

    // Check for prohibited medical advice
    for (const term of this.prohibitedTerms) {
      if (lowerResponse.includes(term.toLowerCase())) {
        violations.push(`Contains prohibited medical term: ${term}`);
      }
    }

    // Check for diagnosis language
    const diagnosisPatterns = [
      /you have [a-z\s]+ disease/i,
      /you are diagnosed with/i,
      /this is definitely/i,
      /you suffer from/i,
      /you are sick with/i
    ];

    for (const pattern of diagnosisPatterns) {
      if (pattern.test(response)) {
        violations.push('Contains diagnostic language');
        break;
      }
    }

    // Check for prescription language
    const prescriptionPatterns = [
      /take \d+.*mg/i,
      /prescribed? medication/i,
      /dosage of/i,
      /take.*pills?/i,
      /medication.*times? per day/i
    ];

    for (const pattern of prescriptionPatterns) {
      if (pattern.test(response)) {
        violations.push('Contains prescription advice');
        break;
      }
    }

    // Check for medical disclaimer presence
    const hasDisclaimer = SAFETY_CONSTRAINTS.requiredDisclaimers.some(disclaimer =>
      lowerResponse.includes(disclaimer.toLowerCase().substring(0, 20))
    );

    if (!hasDisclaimer && response.length > 50) {
      violations.push('Missing required medical disclaimer');
    }

    return {
      isValid: violations.length === 0,
      violations
    };
  }

  addMedicalDisclaimer(response: string): string {
    // Check if disclaimer already present
    const hasDisclaimer = SAFETY_CONSTRAINTS.requiredDisclaimers.some(disclaimer =>
      response.toLowerCase().includes(disclaimer.toLowerCase().substring(0, 20))
    );

    if (hasDisclaimer) {
      return response;
    }

    // Select appropriate disclaimer based on response content
    let selectedDisclaimer = '';
    const lowerResponse = response.toLowerCase();

    if (lowerResponse.includes('emergency') || lowerResponse.includes('urgent')) {
      selectedDisclaimer = 'This guidance is for informational purposes only. In emergency situations, contact emergency services immediately.';
    } else if (lowerResponse.includes('recommend') || lowerResponse.includes('suggest')) {
      selectedDisclaimer = 'This system provides general guidance only and cannot replace professional medical advice.';
    } else {
      // Use random disclaimer from configured set
      const disclaimers = SAFETY_CONSTRAINTS.requiredDisclaimers;
      selectedDisclaimer = disclaimers[Math.floor(Math.random() * disclaimers.length)];
    }

    return `${response} ${selectedDisclaimer}`;
  }

  filterProhibitedContent(text: string): string {
    let filteredText = text;

    // Replace prohibited terms with safe alternatives
    const replacements = new Map([
      ['take medication', 'consider consulting a healthcare provider about treatment options'],
      ['dosage', 'appropriate treatment'],
      ['prescription', 'medical treatment'],
      ['drug', 'treatment'],
      ['pills', 'medication'],
      ['tablets', 'treatment'],
      ['you have', 'your symptoms suggest'],
      ['diagnosed with', 'symptoms consistent with'],
      ['definitely', 'possibly'],
      ['certainly', 'likely']
    ]);

    for (const [prohibited, replacement] of replacements) {
      const regex = new RegExp(prohibited, 'gi');
      filteredText = filteredText.replace(regex, replacement);
    }

    // Remove specific medication names (basic filtering)
    const medicationPatterns = [
      /\b\w+cillin\b/gi, // Antibiotics ending in -cillin
      /\b\w+prazole\b/gi, // Proton pump inhibitors
      /\bibuprofen\b/gi,
      /\bacetaminophen\b/gi,
      /\baspirin\b/gi,
      /\btylenol\b/gi,
      /\badvil\b/gi
    ];

    for (const pattern of medicationPatterns) {
      filteredText = filteredText.replace(pattern, 'appropriate medication');
    }

    return filteredText;
  }

  enforceEmergencyProtocol(assessment: RiskAssessment): RiskAssessment {
    if (assessment.level !== RiskLevel.EMERGENCY) {
      return assessment;
    }

    // Ensure emergency assessments have appropriate urgency
    const enhancedRecommendations = [...assessment.recommendations];
    
    // Add emergency contact information if not present
    const hasEmergencyContact = enhancedRecommendations.some(rec =>
      rec.toLowerCase().includes('911') || 
      rec.toLowerCase().includes('emergency services') ||
      rec.toLowerCase().includes('call emergency')
    );

    if (!hasEmergencyContact) {
      enhancedRecommendations.unshift('Contact emergency services immediately by calling 911');
    }

    // Ensure "do not delay" messaging
    const hasUrgencyMessage = enhancedRecommendations.some(rec =>
      rec.toLowerCase().includes('immediately') ||
      rec.toLowerCase().includes('do not delay') ||
      rec.toLowerCase().includes('urgent')
    );

    if (!hasUrgencyMessage) {
      enhancedRecommendations.push('Do not delay seeking medical attention');
    }

    // Boost confidence for clear emergency cases
    const enhancedConfidence = Math.max(assessment.confidence, 0.85);

    return {
      ...assessment,
      confidence: enhancedConfidence,
      recommendations: enhancedRecommendations,
      reasoning: [
        ...assessment.reasoning,
        'Emergency protocol enforced by safety guardian'
      ]
    };
  }

  // Additional safety methods

  checkForEmergencyKeywords(text: string): boolean {
    const lowerText = text.toLowerCase();
    return Array.from(this.emergencyKeywords).some(keyword =>
      lowerText.includes(keyword.toLowerCase())
    );
  }

  generateSafeResponse(originalResponse: string, assessment: RiskAssessment): string {
    // Filter prohibited content
    let safeResponse = this.filterProhibitedContent(originalResponse);
    
    // Add medical disclaimer
    safeResponse = this.addMedicalDisclaimer(safeResponse);
    
    // Validate the response
    const validation = this.validateResponse(safeResponse);
    
    if (!validation.isValid) {
      console.warn('Response validation failed:', validation.violations);
      
      // Generate fallback safe response
      safeResponse = this.generateFallbackResponse(assessment);
    }

    return safeResponse;
  }

  private generateFallbackResponse(assessment: RiskAssessment): string {
    let fallback = '';
    
    switch (assessment.level) {
      case RiskLevel.EMERGENCY:
        fallback = 'Based on your symptoms, this appears to be a serious condition requiring immediate medical attention. Please contact emergency services right away.';
        break;
      case RiskLevel.MODERATE:
        fallback = 'Your symptoms suggest you should consult with a healthcare professional for proper evaluation and guidance.';
        break;
      case RiskLevel.MILD:
        fallback = 'Your symptoms appear to be mild. Consider rest and monitoring your condition, but consult a healthcare provider if symptoms worsen.';
        break;
      default:
        fallback = 'Please consult with a healthcare professional for proper medical evaluation of your symptoms.';
    }

    return this.addMedicalDisclaimer(fallback);
  }

  // Configuration methods

  addProhibitedTerm(term: string): void {
    this.prohibitedTerms.add(term.toLowerCase());
  }

  removeProhibitedTerm(term: string): void {
    this.prohibitedTerms.delete(term.toLowerCase());
  }

  addMedicalDisclaimerText(disclaimer: string): void {
    if (!this.medicalDisclaimers.includes(disclaimer)) {
      this.medicalDisclaimers.push(disclaimer);
    }
  }

  getProhibitedTerms(): string[] {
    return Array.from(this.prohibitedTerms);
  }

  getMedicalDisclaimers(): string[] {
    return [...this.medicalDisclaimers];
  }

  // Private initialization methods

  private initializeProhibitedTerms(): void {
    this.prohibitedTerms = new Set([
      ...SAFETY_CONSTRAINTS.prohibitedAdvice,
      // Additional prohibited terms
      'diagnosis', 'diagnose', 'disease', 'condition',
      'prescription', 'prescribe', 'medication dosage',
      'take pills', 'drug name', 'medicine name',
      'treatment plan', 'medical treatment',
      'cure', 'heal', 'fix', 'solve',
      'definitely have', 'certainly have', 'you have',
      'suffering from', 'infected with', 'sick with'
    ]);
  }

  private initializeMedicalDisclaimers(): void {
    this.medicalDisclaimers = [
      ...SAFETY_CONSTRAINTS.requiredDisclaimers,
      'This system provides general health information only and is not a substitute for professional medical advice.',
      'Always consult with qualified healthcare professionals for medical concerns and treatment decisions.',
      'In case of medical emergency, contact emergency services immediately.',
      'This guidance is for informational purposes only and should not replace professional medical consultation.'
    ];
  }

  private initializeEmergencyKeywords(): void {
    this.emergencyKeywords = new Set([
      ...SAFETY_CONSTRAINTS.emergencyKeywords,
      'heart attack', 'stroke', 'seizure', 'overdose',
      'severe allergic reaction', 'anaphylaxis',
      'loss of consciousness', 'severe trauma',
      'major bleeding', 'compound fracture',
      'severe burns', 'poisoning'
    ]);
  }

  // Audit and logging methods

  logSafetyViolation(violation: string, originalText: string): void {
    console.warn(`Safety violation detected: ${violation}`);
    console.warn(`Original text: ${originalText.substring(0, 100)}...`);
  }

  generateSafetyReport(): {
    totalValidations: number;
    violations: string[];
    emergencyDetections: number;
  } {
    // This would be implemented with actual tracking in a production system
    return {
      totalValidations: 0,
      violations: [],
      emergencyDetections: 0
    };
  }
}