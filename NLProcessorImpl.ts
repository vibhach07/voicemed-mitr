// Natural Language Processor Implementation

import { NLProcessor } from '../interfaces';
import { SymptomEntity, Duration, SeverityLevel, UserIntent } from '../types';

export class NLProcessorImpl implements NLProcessor {
  private symptomKeywords!: Map<string, string[]>;
  private bodyPartKeywords!: Map<string, string[]>;
  private severityKeywords!: Map<SeverityLevel, string[]>;
  private durationPatterns!: RegExp[];
  private intentPatterns!: Map<UserIntent, RegExp[]>;

  constructor() {
    this.initializeKeywords();
    this.initializePatterns();
  }

  extractSymptoms(text: string): SymptomEntity[] {
    const normalizedText = text.toLowerCase().trim();
    const symptoms: SymptomEntity[] = [];

    // Extract symptoms using keyword matching
    for (const [symptom, keywords] of this.symptomKeywords) {
      for (const keyword of keywords) {
        if (normalizedText.includes(keyword)) {
          const entity: SymptomEntity = {
            symptom,
            bodyPart: this.extractBodyPart(normalizedText, symptom),
            severity: this.extractSeverity(normalizedText),
            duration: this.extractDuration(normalizedText),
            confidence: this.calculateConfidence(normalizedText, keyword, symptom)
          };
          
          // Avoid duplicates
          if (!symptoms.some(s => s.symptom === symptom)) {
            symptoms.push(entity);
          }
          break;
        }
      }
    }

    // If no specific symptoms found, try to extract general health indicators
    if (symptoms.length === 0) {
      const generalSymptom = this.extractGeneralSymptom(normalizedText);
      if (generalSymptom) {
        symptoms.push(generalSymptom);
      }
    }

    return symptoms;
  }

  extractDuration(text: string): Duration | null {
    const normalizedText = text.toLowerCase();
    
    // Pattern matching for duration expressions
    const patterns: Array<{ regex: RegExp; unit: 'minutes' | 'hours' | 'days' | 'weeks' } | { regex: RegExp; value: number; unit: 'minutes' | 'hours' | 'days' | 'weeks' }> = [
      { regex: /(\d+)\s*(minute|min)s?/i, unit: 'minutes' },
      { regex: /(\d+)\s*(hour|hr)s?/i, unit: 'hours' },
      { regex: /(\d+)\s*(day)s?/i, unit: 'days' },
      { regex: /(\d+)\s*(week)s?/i, unit: 'weeks' },
      { regex: /(yesterday|1 day)/i, value: 1, unit: 'days' },
      { regex: /(this morning|today)/i, value: 1, unit: 'hours' },
      { regex: /(last night)/i, value: 8, unit: 'hours' },
      { regex: /(few days)/i, value: 3, unit: 'days' },
      { regex: /(couple days)/i, value: 2, unit: 'days' },
      { regex: /(few hours)/i, value: 3, unit: 'hours' },
      { regex: /(all day)/i, value: 12, unit: 'hours' },
      { regex: /(since morning)/i, value: 6, unit: 'hours' }
    ];

    for (const pattern of patterns) {
      const match = normalizedText.match(pattern.regex);
      if (match) {
        if ('value' in pattern) {
          return { value: pattern.value, unit: pattern.unit };
        } else {
          const value = parseInt(match[1]);
          if (!isNaN(value) && value > 0) {
            return { value, unit: pattern.unit };
          }
        }
      }
    }

    return null;
  }

  extractSeverity(text: string): SeverityLevel {
    const normalizedText = text.toLowerCase();
    
    // Check for severity indicators
    for (const [severity, keywords] of this.severityKeywords) {
      for (const keyword of keywords) {
        if (normalizedText.includes(keyword)) {
          return severity;
        }
      }
    }

    // Default to mild if no severity indicators found
    return SeverityLevel.MILD;
  }

  detectIntent(text: string): UserIntent {
    const normalizedText = text.toLowerCase().trim();

    // Check for "I don't know" type responses
    const unknownPatterns = [
      /i don't know/i,
      /not sure/i,
      /don't understand/i,
      /confused/i,
      /unclear/i,
      /can't tell/i,
      /hard to say/i,
      /not certain/i,
      /maybe/i,
      /i think/i,
      /possibly/i,
      /unsure/i
    ];

    for (const pattern of unknownPatterns) {
      if (pattern.test(normalizedText)) {
        return UserIntent.UNKNOWN;
      }
    }

    // Check each intent pattern
    for (const [intent, patterns] of this.intentPatterns) {
      for (const pattern of patterns) {
        if (pattern.test(normalizedText)) {
          return intent;
        }
      }
    }

    // Default intent based on content
    if (this.containsSymptomKeywords(normalizedText)) {
      return UserIntent.DESCRIBE_SYMPTOMS;
    }

    return UserIntent.REQUEST_HELP;
  }

  private initializeKeywords(): void {
    // Symptom keywords mapping
    this.symptomKeywords = new Map([
      ['headache', ['headache', 'head pain', 'head ache', 'migraine', 'head hurts']],
      ['fever', ['fever', 'temperature', 'hot', 'burning up', 'feverish', 'chills']],
      ['cough', ['cough', 'coughing', 'hacking', 'throat clearing']],
      ['stomach pain', ['stomach pain', 'stomach ache', 'belly pain', 'abdominal pain', 'tummy ache']],
      ['nausea', ['nausea', 'nauseous', 'sick to stomach', 'queasy', 'feel like vomiting']],
      ['dizziness', ['dizzy', 'dizziness', 'lightheaded', 'spinning', 'vertigo']],
      ['fatigue', ['tired', 'fatigue', 'exhausted', 'weak', 'no energy']],
      ['sore throat', ['sore throat', 'throat pain', 'throat hurts', 'scratchy throat']],
      ['runny nose', ['runny nose', 'stuffy nose', 'congestion', 'blocked nose']],
      ['shortness of breath', ['shortness of breath', 'hard to breathe', 'difficulty breathing', 'breathless']]
    ]);

    // Body part keywords
    this.bodyPartKeywords = new Map([
      ['head', ['head', 'skull', 'forehead', 'temple']],
      ['chest', ['chest', 'lung', 'heart', 'breast']],
      ['stomach', ['stomach', 'belly', 'abdomen', 'tummy']],
      ['throat', ['throat', 'neck']],
      ['back', ['back', 'spine', 'lower back', 'upper back']],
      ['arm', ['arm', 'shoulder', 'elbow', 'wrist', 'hand']],
      ['leg', ['leg', 'thigh', 'knee', 'ankle', 'foot']]
    ]);

    // Severity keywords
    this.severityKeywords = new Map([
      [SeverityLevel.MILD, ['mild', 'slight', 'little', 'minor', 'barely', 'somewhat']],
      [SeverityLevel.MODERATE, ['moderate', 'medium', 'noticeable', 'bothering', 'uncomfortable']],
      [SeverityLevel.SEVERE, ['severe', 'intense', 'extreme', 'terrible', 'unbearable', 'excruciating', 'sharp', 'stabbing']]
    ]);
  }

  private initializePatterns(): void {
    this.intentPatterns = new Map([
      [UserIntent.DESCRIBE_SYMPTOMS, [
        /i (have|feel|am experiencing|got)/i,
        /my (head|chest|stomach|throat|back) (hurts|aches|feels)/i,
        /i've been (feeling|having|experiencing)/i,
        /there's (pain|ache|discomfort)/i
      ]],
      [UserIntent.END_SESSION, [
        /(goodbye|bye|end|stop|quit|exit|done|finished)/i,
        /that's all/i,
        /thank you/i
      ]],
      [UserIntent.REQUEST_HELP, [
        /(help|assist|what should i do|what do you recommend)/i,
        /(can you help|need help|don't know)/i
      ]],
      [UserIntent.ASK_CLARIFICATION, [
        /(what do you mean|can you repeat|i don't understand)/i,
        /(clarify|explain|what)/i
      ]]
    ]);
  }

  private extractBodyPart(text: string, symptom: string): string | null {
    // Look for body part mentions near the symptom
    for (const [bodyPart, keywords] of this.bodyPartKeywords) {
      for (const keyword of keywords) {
        if (text.includes(keyword)) {
          return bodyPart;
        }
      }
    }

    // Infer body part from symptom type
    const symptomBodyPartMap: Record<string, string> = {
      'headache': 'head',
      'sore throat': 'throat',
      'stomach pain': 'stomach',
      'shortness of breath': 'chest'
    };

    return symptomBodyPartMap[symptom] || null;
  }

  private calculateConfidence(text: string, keyword: string, symptom: string): number {
    let confidence = 0.5; // Base confidence

    // Increase confidence for exact matches
    if (text.includes(symptom)) {
      confidence += 0.3;
    }

    // Increase confidence for multiple related keywords
    const relatedKeywords = this.symptomKeywords.get(symptom) || [];
    const matchCount = relatedKeywords.filter(k => text.includes(k)).length;
    confidence += Math.min(matchCount * 0.1, 0.3);

    // Increase confidence for severity indicators
    if (this.extractSeverity(text) !== SeverityLevel.MILD) {
      confidence += 0.1;
    }

    // Increase confidence for duration indicators
    if (this.extractDuration(text)) {
      confidence += 0.1;
    }

    return Math.min(confidence, 1.0);
  }

  private extractGeneralSymptom(text: string): SymptomEntity | null {
    // Look for general health-related terms
    const generalHealthTerms = [
      'pain', 'ache', 'hurt', 'discomfort', 'problem', 'issue',
      'sick', 'unwell', 'not feeling good', 'feel bad'
    ];

    for (const term of generalHealthTerms) {
      if (text.includes(term)) {
        return {
          symptom: 'general discomfort',
          bodyPart: null,
          severity: this.extractSeverity(text),
          duration: this.extractDuration(text),
          confidence: 0.3 // Lower confidence for general terms
        };
      }
    }

    return null;
  }

  private containsSymptomKeywords(text: string): boolean {
    for (const keywords of this.symptomKeywords.values()) {
      for (const keyword of keywords) {
        if (text.includes(keyword)) {
          return true;
        }
      }
    }
    return false;
  }

  // Public methods for testing and configuration
  getSymptomKeywords(): Map<string, string[]> {
    return new Map(this.symptomKeywords);
  }

  getSeverityKeywords(): Map<SeverityLevel, string[]> {
    return new Map(this.severityKeywords);
  }

  addSymptomKeywords(symptom: string, keywords: string[]): void {
    const existing = this.symptomKeywords.get(symptom) || [];
    this.symptomKeywords.set(symptom, [...existing, ...keywords]);
  }

  // Method to analyze text complexity for ambiguity detection
  analyzeTextComplexity(text: string): {
    hasSymptoms: boolean;
    hasBodyPart: boolean;
    hasSeverity: boolean;
    hasDuration: boolean;
    isAmbiguous: boolean;
  } {
    const symptoms = this.extractSymptoms(text);
    const hasSymptoms = symptoms.length > 0;
    const hasBodyPart = symptoms.some(s => s.bodyPart !== null);
    const hasSeverity = this.extractSeverity(text) !== SeverityLevel.MILD;
    const hasDuration = this.extractDuration(text) !== null;
    
    // Consider text ambiguous if it has symptoms but lacks detail
    const isAmbiguous = hasSymptoms && (!hasBodyPart && !hasSeverity && !hasDuration);

    return {
      hasSymptoms,
      hasBodyPart,
      hasSeverity,
      hasDuration,
      isAmbiguous
    };
  }

  // Enhanced method for comprehensive symptom analysis
  analyzeSymptomDescription(text: string): {
    symptoms: SymptomEntity[];
    intent: UserIntent;
    complexity: {
      hasSymptoms: boolean;
      hasBodyPart: boolean;
      hasSeverity: boolean;
      hasDuration: boolean;
      isAmbiguous: boolean;
    };
    confidence: number;
  } {
    const symptoms = this.extractSymptoms(text);
    const intent = this.detectIntent(text);
    const complexity = this.analyzeTextComplexity(text);
    
    // Calculate overall confidence based on extracted information
    const confidence = this.calculateOverallConfidence(text, symptoms, complexity);

    return {
      symptoms,
      intent,
      complexity,
      confidence
    };
  }

  private calculateOverallConfidence(text: string, symptoms: SymptomEntity[], complexity: any): number {
    let confidence = 0.5; // Base confidence

    // Boost confidence for clear symptom identification
    if (symptoms.length > 0) {
      const avgSymptomConfidence = symptoms.reduce((sum, s) => sum + s.confidence, 0) / symptoms.length;
      confidence += avgSymptomConfidence * 0.3;
    }

    // Boost confidence for detailed descriptions
    if (complexity.hasBodyPart) confidence += 0.1;
    if (complexity.hasSeverity) confidence += 0.1;
    if (complexity.hasDuration) confidence += 0.1;

    // Reduce confidence for very short descriptions
    const wordCount = text.trim().split(' ').length;
    if (wordCount < 3) {
      confidence -= 0.2;
    } else if (wordCount > 10) {
      confidence += 0.1;
    }

    return Math.max(0.1, Math.min(1.0, confidence));
  }

  // Method to check if text needs clarification
  needsClarification(text: string): boolean {
    const analysis = this.analyzeSymptomDescription(text);
    return analysis.complexity.isAmbiguous || analysis.confidence < 0.6;
  }

  // Method to suggest what information is missing
  getMissingInformation(text: string): string[] {
    const missing: string[] = [];
    const complexity = this.analyzeTextComplexity(text);
    const symptoms = this.extractSymptoms(text);

    if (!complexity.hasSymptoms || symptoms.length === 0) {
      missing.push('symptom description');
    }

    if (symptoms.length > 0) {
      if (!complexity.hasBodyPart && !symptoms[0].bodyPart) {
        missing.push('location');
      }
      if (!complexity.hasSeverity) {
        missing.push('severity');
      }
      if (!complexity.hasDuration) {
        missing.push('duration');
      }
    }

    return missing;
  }
}