// Risk-Appropriate Response Generation

import { RiskAssessment, RiskLevel } from '../types';

export interface ResponseGenerator {
  generateResponse(assessment: RiskAssessment): string;
  generateSelfCareGuidance(assessment: RiskAssessment): string[];
  generateProfessionalConsultationAdvice(assessment: RiskAssessment): string[];
  generateEmergencyAdvice(assessment: RiskAssessment): string[];
}

export class ResponseGeneratorImpl implements ResponseGenerator {
  private selfCareTemplates: Map<string, string[]>;
  private consultationTemplates: Map<string, string[]>;
  private emergencyTemplates: Map<string, string[]>;
  private medicalDisclaimers: string[];

  constructor() {
    this.selfCareTemplates = new Map();
    this.consultationTemplates = new Map();
    this.emergencyTemplates = new Map();
    this.medicalDisclaimers = [];
    this.initializeTemplates();
    this.initializeDisclaimers();
  }

  generateResponse(assessment: RiskAssessment): string {
    let response = '';

    // Add assessment summary
    response += this.generateAssessmentSummary(assessment);
    response += ' ';

    // Add risk-specific guidance
    switch (assessment.level) {
      case RiskLevel.MILD:
        response += this.generateMildRiskResponse(assessment);
        break;
      case RiskLevel.MODERATE:
        response += this.generateModerateRiskResponse(assessment);
        break;
      case RiskLevel.EMERGENCY:
        response += this.generateEmergencyResponse(assessment);
        break;
    }

    // Add medical disclaimer
    response += ' ' + this.getRandomDisclaimer();

    return response;
  }

  generateSelfCareGuidance(assessment: RiskAssessment): string[] {
    const guidance: string[] = [];
    
    // Get general self-care recommendations
    const generalGuidance = this.selfCareTemplates.get('general') || [];
    guidance.push(...generalGuidance);

    // Add specific recommendations from assessment
    guidance.push(...assessment.recommendations.filter(rec => 
      rec.toLowerCase().includes('rest') ||
      rec.toLowerCase().includes('hydration') ||
      rec.toLowerCase().includes('home') ||
      rec.toLowerCase().includes('self-care')
    ));

    // Add symptom-specific guidance
    const reasoning = assessment.reasoning.join(' ').toLowerCase();
    if (reasoning.includes('headache')) {
      guidance.push(...(this.selfCareTemplates.get('headache') || []));
    }
    if (reasoning.includes('fever')) {
      guidance.push(...(this.selfCareTemplates.get('fever') || []));
    }
    if (reasoning.includes('cough')) {
      guidance.push(...(this.selfCareTemplates.get('cough') || []));
    }

    return this.removeDuplicates(guidance);
  }

  generateProfessionalConsultationAdvice(assessment: RiskAssessment): string[] {
    const advice: string[] = [];
    
    // Get consultation templates
    const consultationAdvice = this.consultationTemplates.get('general') || [];
    advice.push(...consultationAdvice);

    // Add assessment-specific recommendations
    advice.push(...assessment.recommendations.filter(rec => 
      rec.toLowerCase().includes('doctor') ||
      rec.toLowerCase().includes('healthcare') ||
      rec.toLowerCase().includes('professional') ||
      rec.toLowerCase().includes('consult')
    ));

    // Add urgency-based advice
    if (assessment.confidence > 0.7) {
      advice.push(...(this.consultationTemplates.get('urgent') || []));
    } else {
      advice.push(...(this.consultationTemplates.get('routine') || []));
    }

    return this.removeDuplicates(advice);
  }

  generateEmergencyAdvice(assessment: RiskAssessment): string[] {
    const advice: string[] = [];
    
    // Get emergency templates
    const emergencyAdvice = this.emergencyTemplates.get('general') || [];
    advice.push(...emergencyAdvice);

    // Add assessment-specific emergency recommendations
    advice.push(...assessment.recommendations.filter(rec => 
      rec.toLowerCase().includes('emergency') ||
      rec.toLowerCase().includes('immediate') ||
      rec.toLowerCase().includes('call') ||
      rec.toLowerCase().includes('911')
    ));

    // Add specific emergency guidance based on reasoning
    const reasoning = assessment.reasoning.join(' ').toLowerCase();
    if (reasoning.includes('chest') || reasoning.includes('heart')) {
      advice.push(...(this.emergencyTemplates.get('cardiac') || []));
    }
    if (reasoning.includes('breath') || reasoning.includes('breathing')) {
      advice.push(...(this.emergencyTemplates.get('respiratory') || []));
    }
    if (reasoning.includes('severe') && reasoning.includes('headache')) {
      advice.push(...(this.emergencyTemplates.get('neurological') || []));
    }

    return this.removeDuplicates(advice);
  }

  private generateAssessmentSummary(assessment: RiskAssessment): string {
    const confidenceLevel = assessment.confidence > 0.8 ? 'high' : 
                           assessment.confidence > 0.5 ? 'moderate' : 'low';
    
    switch (assessment.level) {
      case RiskLevel.MILD:
        return `Based on your symptoms, this appears to be a mild condition with ${confidenceLevel} confidence.`;
      case RiskLevel.MODERATE:
        return `Your symptoms suggest a moderate health concern that should be evaluated with ${confidenceLevel} confidence.`;
      case RiskLevel.EMERGENCY:
        return `Your symptoms indicate a potentially serious condition requiring immediate attention with ${confidenceLevel} confidence.`;
      default:
        return 'I have assessed your symptoms.';
    }
  }

  private generateMildRiskResponse(assessment: RiskAssessment): string {
    const selfCareGuidance = this.generateSelfCareGuidance(assessment);
    const mainGuidance = selfCareGuidance.slice(0, 2).join(' ');
    
    return `${mainGuidance} However, if your symptoms worsen or persist for more than a few days, please consider consulting a healthcare professional.`;
  }

  private generateModerateRiskResponse(assessment: RiskAssessment): string {
    const consultationAdvice = this.generateProfessionalConsultationAdvice(assessment);
    const mainAdvice = consultationAdvice.slice(0, 2).join(' ');
    
    return `${mainAdvice} In the meantime, monitor your symptoms closely and seek immediate care if they worsen significantly.`;
  }

  private generateEmergencyResponse(assessment: RiskAssessment): string {
    const emergencyAdvice = this.generateEmergencyAdvice(assessment);
    const mainAdvice = emergencyAdvice.slice(0, 2).join(' ');
    
    return `${mainAdvice} Do not delay seeking medical attention. Time is critical in emergency situations.`;
  }

  private initializeTemplates(): void {
    // Self-care templates
    this.selfCareTemplates = new Map([
      ['general', [
        'Rest and get adequate sleep to help your body recover.',
        'Stay well hydrated by drinking plenty of fluids.',
        'Monitor your symptoms and note any changes.',
        'Avoid strenuous activities until you feel better.'
      ]],
      ['headache', [
        'Apply a cold or warm compress to your head or neck.',
        'Rest in a quiet, dark room.',
        'Gentle neck and shoulder stretches may help.',
        'Ensure you are getting enough sleep and staying hydrated.'
      ]],
      ['fever', [
        'Rest and drink plenty of fluids to prevent dehydration.',
        'Dress lightly and keep your environment cool.',
        'Monitor your temperature regularly.',
        'Get plenty of sleep to help your immune system.'
      ]],
      ['cough', [
        'Stay hydrated to help thin mucus.',
        'Use a humidifier or breathe steam from a hot shower.',
        'Avoid irritants like smoke or strong odors.',
        'Honey may help soothe throat irritation.'
      ]]
    ]);

    // Consultation templates
    this.consultationTemplates = new Map([
      ['general', [
        'I recommend scheduling an appointment with your healthcare provider.',
        'A medical professional can properly evaluate your symptoms.',
        'Consider contacting your doctor\'s office for guidance.',
        'Keep track of your symptoms to discuss with your healthcare provider.'
      ]],
      ['urgent', [
        'You should contact your healthcare provider within the next 24 hours.',
        'Consider calling your doctor\'s office today for advice.',
        'If symptoms worsen, seek medical attention promptly.',
        'This condition may require professional medical evaluation soon.'
      ]],
      ['routine', [
        'Schedule a routine appointment with your healthcare provider.',
        'This can typically be addressed during a regular office visit.',
        'Consider discussing this at your next scheduled appointment.',
        'A non-urgent consultation would be appropriate.'
      ]]
    ]);

    // Emergency templates
    this.emergencyTemplates = new Map([
      ['general', [
        'Contact emergency services immediately by calling 911.',
        'Seek immediate medical attention at the nearest emergency room.',
        'Do not drive yourself - call for emergency transportation.',
        'Time is critical - do not delay seeking help.'
      ]],
      ['cardiac', [
        'Call 911 immediately for suspected heart problems.',
        'Sit down and try to remain calm while waiting for help.',
        'Do not drive yourself to the hospital.',
        'If you have prescribed heart medication, take it as directed.'
      ]],
      ['respiratory', [
        'Call emergency services immediately for severe breathing problems.',
        'Sit upright and try to stay calm.',
        'Loosen any tight clothing around your neck or chest.',
        'If you have a rescue inhaler, use it as prescribed.'
      ]],
      ['neurological', [
        'Severe headache requires immediate emergency evaluation.',
        'Call 911 or go to the emergency room immediately.',
        'Note the time symptoms started for medical personnel.',
        'Do not take any medication unless prescribed by a doctor.'
      ]]
    ]);
  }

  private initializeDisclaimers(): void {
    this.medicalDisclaimers = [
      'Please remember that this guidance is not a substitute for professional medical advice.',
      'This assessment is for informational purposes only and does not replace medical consultation.',
      'Always consult with a qualified healthcare professional for medical concerns.',
      'This system provides general guidance only and cannot diagnose medical conditions.',
      'When in doubt about your health, always seek professional medical advice.'
    ];
  }

  private getRandomDisclaimer(): string {
    const randomIndex = Math.floor(Math.random() * this.medicalDisclaimers.length);
    return this.medicalDisclaimers[randomIndex];
  }

  private removeDuplicates(items: string[]): string[] {
    return Array.from(new Set(items));
  }

  // Public methods for testing and configuration
  addSelfCareTemplate(category: string, templates: string[]): void {
    const existing = this.selfCareTemplates.get(category) || [];
    this.selfCareTemplates.set(category, [...existing, ...templates]);
  }

  addConsultationTemplate(category: string, templates: string[]): void {
    const existing = this.consultationTemplates.get(category) || [];
    this.consultationTemplates.set(category, [...existing, ...templates]);
  }

  addEmergencyTemplate(category: string, templates: string[]): void {
    const existing = this.emergencyTemplates.get(category) || [];
    this.emergencyTemplates.set(category, [...existing, ...templates]);
  }

  addMedicalDisclaimer(disclaimer: string): void {
    if (!this.medicalDisclaimers.includes(disclaimer)) {
      this.medicalDisclaimers.push(disclaimer);
    }
  }

  getSelfCareTemplates(): Map<string, string[]> {
    return new Map(this.selfCareTemplates);
  }

  getConsultationTemplates(): Map<string, string[]> {
    return new Map(this.consultationTemplates);
  }

  getEmergencyTemplates(): Map<string, string[]> {
    return new Map(this.emergencyTemplates);
  }

  getMedicalDisclaimers(): string[] {
    return [...this.medicalDisclaimers];
  }
}
// Export alias for test compatibility
export const ResponseGenerator = ResponseGeneratorImpl;