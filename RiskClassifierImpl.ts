// Risk Classification Engine Implementation

import { RiskClassifier } from '../interfaces';
import { SymptomEntity, RiskAssessment, RiskLevel, SeverityLevel } from '../types';
import { SAFETY_CONSTRAINTS } from '../config/constants';

interface RiskRule {
  conditions: SymptomCondition[];
  riskLevel: RiskLevel;
  confidence: number;
  reasoning: string;
  recommendations: string[];
}

interface SymptomCondition {
  symptom: string;
  severity?: SeverityLevel;
  bodyPart?: string;
  duration?: { min: number; max: number; unit: string };
  required: boolean;
}

export class RiskClassifierImpl implements RiskClassifier {
  private riskRules: RiskRule[];
  private emergencyKeywords: string[];
  private symptomSeverityMap: Map<string, RiskLevel>;

  constructor() {
    this.initializeRiskRules();
    this.initializeEmergencyKeywords();
    this.initializeSymptomSeverityMap();
  }

  classifyRisk(symptoms: SymptomEntity[]): RiskAssessment {
    if (symptoms.length === 0) {
      return {
        level: RiskLevel.MILD,
        confidence: 0.3,
        reasoning: ['No specific symptoms identified'],
        recommendations: ['Please describe your symptoms in more detail']
      };
    }

    // Check for emergency conditions first
    const emergencyAssessment = this.checkEmergencyConditions(symptoms);
    if (emergencyAssessment) {
      return emergencyAssessment;
    }

    // Apply risk rules
    const ruleBasedAssessment = this.applyRiskRules(symptoms);
    if (ruleBasedAssessment) {
      return ruleBasedAssessment;
    }

    // Fallback to symptom-based assessment
    return this.assessBySymptomSeverity(symptoms);
  }

  getEmergencyKeywords(): string[] {
    return [...this.emergencyKeywords];
  }

  requiresImmediateAttention(symptoms: SymptomEntity[]): boolean {
    const assessment = this.classifyRisk(symptoms);
    return assessment.level === RiskLevel.EMERGENCY;
  }

  private initializeRiskRules(): void {
    this.riskRules = [
      // Emergency Rules
      {
        conditions: [
          { symptom: 'chest pain', severity: SeverityLevel.SEVERE, required: true }
        ],
        riskLevel: RiskLevel.EMERGENCY,
        confidence: 0.9,
        reasoning: ['Severe chest pain can indicate heart attack or other cardiac emergency'],
        recommendations: ['Contact emergency services immediately', 'Do not drive yourself to hospital']
      },
      {
        conditions: [
          { symptom: 'shortness of breath', severity: SeverityLevel.SEVERE, required: true }
        ],
        riskLevel: RiskLevel.EMERGENCY,
        confidence: 0.9,
        reasoning: ['Severe breathing difficulty requires immediate medical attention'],
        recommendations: ['Call emergency services now', 'Sit upright and try to stay calm']
      },
      {
        conditions: [
          { symptom: 'headache', severity: SeverityLevel.SEVERE, required: true },
          { symptom: 'fever', required: false }
        ],
        riskLevel: RiskLevel.EMERGENCY,
        confidence: 0.8,
        reasoning: ['Severe headache with fever may indicate serious infection'],
        recommendations: ['Seek immediate medical attention', 'Go to emergency room']
      },

      // Moderate Risk Rules
      {
        conditions: [
          { symptom: 'fever', severity: SeverityLevel.MODERATE, required: true },
          { symptom: 'cough', required: false }
        ],
        riskLevel: RiskLevel.MODERATE,
        confidence: 0.7,
        reasoning: ['Moderate fever with respiratory symptoms may indicate infection'],
        recommendations: ['Consult healthcare provider within 24 hours', 'Monitor temperature regularly']
      },
      {
        conditions: [
          { symptom: 'stomach pain', severity: SeverityLevel.MODERATE, required: true },
          { symptom: 'nausea', required: false }
        ],
        riskLevel: RiskLevel.MODERATE,
        confidence: 0.6,
        reasoning: ['Persistent stomach pain with nausea should be evaluated'],
        recommendations: ['Schedule appointment with doctor', 'Avoid solid foods temporarily']
      },
      {
        conditions: [
          { symptom: 'headache', severity: SeverityLevel.MODERATE, required: true },
          { 
            symptom: 'headache', 
            duration: { min: 2, max: 999, unit: 'days' }, 
            required: false 
          }
        ],
        riskLevel: RiskLevel.MODERATE,
        confidence: 0.6,
        reasoning: ['Persistent moderate headache may require medical evaluation'],
        recommendations: ['Consider seeing healthcare provider', 'Keep headache diary']
      },

      // Mild Risk Rules
      {
        conditions: [
          { symptom: 'headache', severity: SeverityLevel.MILD, required: true }
        ],
        riskLevel: RiskLevel.MILD,
        confidence: 0.7,
        reasoning: ['Mild headache is usually manageable with self-care'],
        recommendations: ['Rest and hydration', 'Over-the-counter pain relief if needed']
      },
      {
        conditions: [
          { symptom: 'sore throat', severity: SeverityLevel.MILD, required: true }
        ],
        riskLevel: RiskLevel.MILD,
        confidence: 0.7,
        reasoning: ['Mild sore throat often resolves with home care'],
        recommendations: ['Warm salt water gargle', 'Stay hydrated', 'Rest your voice']
      },
      {
        conditions: [
          { symptom: 'runny nose', required: true }
        ],
        riskLevel: RiskLevel.MILD,
        confidence: 0.8,
        reasoning: ['Runny nose typically indicates minor cold or allergies'],
        recommendations: ['Rest and fluids', 'Saline nasal rinse', 'Monitor for worsening']
      }
    ];
  }

  private initializeEmergencyKeywords(): void {
    this.emergencyKeywords = [
      ...SAFETY_CONSTRAINTS.emergencyKeywords,
      'unconscious', 'can\'t breathe', 'choking', 'severe bleeding',
      'stroke symptoms', 'heart attack', 'allergic reaction',
      'severe pain', 'difficulty swallowing', 'confusion',
      'loss of consciousness', 'severe dizziness', 'fainting'
    ];
  }

  private initializeSymptomSeverityMap(): void {
    this.symptomSeverityMap = new Map([
      // Emergency symptoms
      ['chest pain', RiskLevel.EMERGENCY],
      ['shortness of breath', RiskLevel.EMERGENCY],
      ['difficulty breathing', RiskLevel.EMERGENCY],
      
      // Moderate symptoms
      ['fever', RiskLevel.MODERATE],
      ['stomach pain', RiskLevel.MODERATE],
      ['dizziness', RiskLevel.MODERATE],
      ['fatigue', RiskLevel.MODERATE],
      
      // Mild symptoms
      ['headache', RiskLevel.MILD],
      ['sore throat', RiskLevel.MILD],
      ['runny nose', RiskLevel.MILD],
      ['cough', RiskLevel.MILD],
      ['nausea', RiskLevel.MILD]
    ]);
  }

  private checkEmergencyConditions(symptoms: SymptomEntity[]): RiskAssessment | null {
    // Check for emergency keywords in symptom descriptions
    for (const symptom of symptoms) {
      for (const keyword of this.emergencyKeywords) {
        if (symptom.symptom.toLowerCase().includes(keyword.toLowerCase())) {
          return {
            level: RiskLevel.EMERGENCY,
            confidence: 0.95,
            reasoning: [`Emergency keyword detected: ${keyword}`],
            recommendations: [
              'Contact emergency services immediately',
              'Do not delay seeking medical attention'
            ]
          };
        }
      }
    }

    // Check for severe symptoms in critical areas
    const criticalSymptoms = symptoms.filter(s => 
      (s.symptom.includes('chest') && s.severity === SeverityLevel.SEVERE) ||
      (s.symptom.includes('breath') && s.severity === SeverityLevel.SEVERE) ||
      (s.symptom.includes('heart') && s.severity === SeverityLevel.SEVERE)
    );

    if (criticalSymptoms.length > 0) {
      return {
        level: RiskLevel.EMERGENCY,
        confidence: 0.9,
        reasoning: ['Severe symptoms in critical body systems detected'],
        recommendations: [
          'Seek immediate emergency medical care',
          'Call emergency services or go to nearest emergency room'
        ]
      };
    }

    return null;
  }

  private applyRiskRules(symptoms: SymptomEntity[]): RiskAssessment | null {
    let bestMatch: { rule: RiskRule; matchScore: number } | null = null;

    for (const rule of this.riskRules) {
      const matchScore = this.calculateRuleMatch(symptoms, rule);
      
      if (matchScore > 0.5 && (!bestMatch || matchScore > bestMatch.matchScore)) {
        bestMatch = { rule, matchScore };
      }
    }

    if (bestMatch) {
      const adjustedConfidence = bestMatch.rule.confidence * bestMatch.matchScore;
      return {
        level: bestMatch.rule.riskLevel,
        confidence: adjustedConfidence,
        reasoning: bestMatch.rule.reasoning,
        recommendations: bestMatch.rule.recommendations
      };
    }

    return null;
  }

  private calculateRuleMatch(symptoms: SymptomEntity[], rule: RiskRule): number {
    let totalScore = 0;
    let requiredMatches = 0;
    let requiredConditions = rule.conditions.filter(c => c.required).length;

    for (const condition of rule.conditions) {
      const matchingSymptoms = symptoms.filter(s => 
        s.symptom.toLowerCase().includes(condition.symptom.toLowerCase())
      );

      if (matchingSymptoms.length > 0) {
        const symptom = matchingSymptoms[0];
        let conditionScore = 0.5; // Base match

        // Check severity match
        if (condition.severity && symptom.severity === condition.severity) {
          conditionScore += 0.3;
        }

        // Check body part match
        if (condition.bodyPart && symptom.bodyPart === condition.bodyPart) {
          conditionScore += 0.2;
        }

        // Check duration match
        if (condition.duration && symptom.duration) {
          const durationMatch = this.checkDurationMatch(symptom.duration, condition.duration);
          if (durationMatch) {
            conditionScore += 0.2;
          }
        }

        totalScore += Math.min(conditionScore, 1.0);

        if (condition.required) {
          requiredMatches++;
        }
      } else if (condition.required) {
        return 0; // Required condition not met
      }
    }

    // Must match all required conditions
    if (requiredMatches < requiredConditions) {
      return 0;
    }

    return totalScore / rule.conditions.length;
  }

  private checkDurationMatch(symptomDuration: any, conditionDuration: any): boolean {
    // Convert duration to hours for comparison
    const symptomHours = this.convertToHours(symptomDuration);
    const minHours = this.convertToHours({ 
      value: conditionDuration.min, 
      unit: conditionDuration.unit 
    });
    const maxHours = this.convertToHours({ 
      value: conditionDuration.max, 
      unit: conditionDuration.unit 
    });

    return symptomHours >= minHours && symptomHours <= maxHours;
  }

  private convertToHours(duration: { value: number; unit: string }): number {
    switch (duration.unit) {
      case 'minutes': return duration.value / 60;
      case 'hours': return duration.value;
      case 'days': return duration.value * 24;
      case 'weeks': return duration.value * 24 * 7;
      default: return duration.value;
    }
  }

  private assessBySymptomSeverity(symptoms: SymptomEntity[]): RiskAssessment {
    let maxRiskLevel = RiskLevel.MILD;
    let totalConfidence = 0;
    const reasoning: string[] = [];
    const recommendations: string[] = [];

    for (const symptom of symptoms) {
      // Get base risk level for symptom type
      const baseRisk = this.symptomSeverityMap.get(symptom.symptom) || RiskLevel.MILD;
      
      // Adjust based on severity
      let adjustedRisk = baseRisk;
      if (symptom.severity === SeverityLevel.SEVERE) {
        adjustedRisk = this.escalateRiskLevel(baseRisk);
      } else if (symptom.severity === SeverityLevel.MODERATE && baseRisk === RiskLevel.MILD) {
        adjustedRisk = RiskLevel.MODERATE;
      }

      // Update max risk level
      if (this.getRiskLevelPriority(adjustedRisk) > this.getRiskLevelPriority(maxRiskLevel)) {
        maxRiskLevel = adjustedRisk;
      }

      totalConfidence += symptom.confidence;
      reasoning.push(`${symptom.symptom} (${symptom.severity} severity)`);
    }

    // Generate recommendations based on risk level
    switch (maxRiskLevel) {
      case RiskLevel.EMERGENCY:
        recommendations.push('Seek immediate medical attention');
        recommendations.push('Contact emergency services');
        break;
      case RiskLevel.MODERATE:
        recommendations.push('Consult healthcare provider within 24-48 hours');
        recommendations.push('Monitor symptoms for changes');
        break;
      case RiskLevel.MILD:
        recommendations.push('Self-care measures may be appropriate');
        recommendations.push('Contact healthcare provider if symptoms worsen');
        break;
    }

    return {
      level: maxRiskLevel,
      confidence: Math.min(totalConfidence / symptoms.length, 1.0),
      reasoning,
      recommendations
    };
  }

  private escalateRiskLevel(currentLevel: RiskLevel): RiskLevel {
    switch (currentLevel) {
      case RiskLevel.MILD: return RiskLevel.MODERATE;
      case RiskLevel.MODERATE: return RiskLevel.EMERGENCY;
      case RiskLevel.EMERGENCY: return RiskLevel.EMERGENCY;
      default: return RiskLevel.MODERATE;
    }
  }

  private getRiskLevelPriority(level: RiskLevel): number {
    switch (level) {
      case RiskLevel.MILD: return 1;
      case RiskLevel.MODERATE: return 2;
      case RiskLevel.EMERGENCY: return 3;
      default: return 1;
    }
  }

  // Public methods for testing and configuration
  addRiskRule(rule: RiskRule): void {
    this.riskRules.push(rule);
  }

  getRiskRules(): RiskRule[] {
    return [...this.riskRules];
  }

  addEmergencyKeyword(keyword: string): void {
    if (!this.emergencyKeywords.includes(keyword)) {
      this.emergencyKeywords.push(keyword);
    }
  }

  updateSymptomSeverityMap(symptom: string, riskLevel: RiskLevel): void {
    this.symptomSeverityMap.set(symptom, riskLevel);
  }

  // Method to get detailed risk analysis
  getDetailedRiskAnalysis(symptoms: SymptomEntity[]): {
    assessment: RiskAssessment;
    matchedRules: string[];
    emergencyFlags: string[];
    severityFactors: string[];
  } {
    const assessment = this.classifyRisk(symptoms);
    const matchedRules: string[] = [];
    const emergencyFlags: string[] = [];
    const severityFactors: string[] = [];

    // Check which rules matched
    for (const rule of this.riskRules) {
      const matchScore = this.calculateRuleMatch(symptoms, rule);
      if (matchScore > 0.5) {
        matchedRules.push(`${rule.riskLevel} risk rule (${Math.round(matchScore * 100)}% match)`);
      }
    }

    // Check emergency flags
    for (const symptom of symptoms) {
      for (const keyword of this.emergencyKeywords) {
        if (symptom.symptom.toLowerCase().includes(keyword.toLowerCase())) {
          emergencyFlags.push(keyword);
        }
      }
    }

    // Analyze severity factors
    symptoms.forEach(symptom => {
      if (symptom.severity === SeverityLevel.SEVERE) {
        severityFactors.push(`Severe ${symptom.symptom}`);
      }
      if (symptom.duration && this.convertToHours(symptom.duration) > 24) {
        severityFactors.push(`Prolonged ${symptom.symptom}`);
      }
    });

    return {
      assessment,
      matchedRules,
      emergencyFlags,
      severityFactors
    };
  }
}