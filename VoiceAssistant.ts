// Main Voice Assistant Orchestrator

import { VoiceInputLayerImpl } from './VoiceInputLayerImpl';
import { SpeechEngineImpl } from './SpeechEngineImpl';
import { NLProcessorImpl } from './NLProcessorImpl';
import { RiskClassifierImpl } from './RiskClassifierImpl';
import { ConversationManagerImpl } from './ConversationManagerImpl';
import { SessionControllerImpl } from './SessionControllerImpl';
import { ResponseGeneratorImpl } from './ResponseGenerator';
import { SafetyGuardianImpl } from './SafetyGuardian';
import { SessionId, UserIntent } from '../types';
import { WAKE_WORD } from '../config/constants';

export enum VoiceAssistantState {
  STANDBY = 'standby',
  LISTENING = 'listening',
  PROCESSING = 'processing',
  RESPONDING = 'responding',
  ERROR = 'error'
}

export class VoiceAssistant {
  private voiceInput!: VoiceInputLayerImpl;
  private speechEngine!: SpeechEngineImpl;
  private nlProcessor!: NLProcessorImpl;
  private riskClassifier!: RiskClassifierImpl;
  private conversationManager!: ConversationManagerImpl;
  private sessionController!: SessionControllerImpl;
  private responseGenerator!: ResponseGeneratorImpl;
  private safetyGuardian!: SafetyGuardianImpl;

  private currentState: VoiceAssistantState = VoiceAssistantState.STANDBY;
  private currentSessionId: SessionId | null = null;
  private isInitialized: boolean = false;

  constructor() {
    this.initializeComponents();
    this.setupEventHandlers();
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      console.log('Initializing Voice-Med-Mitr...');
      
      // Start voice input listening
      this.voiceInput.startListening();
      this.currentState = VoiceAssistantState.STANDBY;
      this.isInitialized = true;
      
      console.log('Voice-Med-Mitr initialized and ready');
      console.log(`Say "${WAKE_WORD}" to begin`);
      
    } catch (error) {
      console.error('Failed to initialize Voice Assistant:', error);
      this.currentState = VoiceAssistantState.ERROR;
      throw error;
    }
  }

  async shutdown(): Promise<void> {
    console.log('Shutting down Voice-Med-Mitr...');
    
    try {
      // End current session if active
      if (this.currentSessionId) {
        await this.endCurrentSession();
      }

      // Stop voice input
      this.voiceInput.stopListening();
      
      // Stop speech engine
      this.speechEngine.stopSpeaking();
      
      // Shutdown session controller
      this.sessionController.shutdown();
      
      this.currentState = VoiceAssistantState.STANDBY;
      this.isInitialized = false;
      
      console.log('Voice-Med-Mitr shutdown complete');
      
    } catch (error) {
      console.error('Error during shutdown:', error);
    }
  }

  getCurrentState(): VoiceAssistantState {
    return this.currentState;
  }

  getCurrentSessionId(): SessionId | null {
    return this.currentSessionId;
  }

  isActive(): boolean {
    return this.currentSessionId !== null;
  }

  // Main conversation flow methods

  private async handleWakeWordDetected(): Promise<void> {
    try {
      console.log('Wake word detected, starting new session');
      
      // Start new session
      this.currentSessionId = this.sessionController.startSession();
      this.currentState = VoiceAssistantState.LISTENING;
      
      // Generate and speak greeting
      const greeting = this.conversationManager.generateGreeting();
      await this.speakResponse(greeting);
      
    } catch (error) {
      console.error('Error handling wake word:', error);
      await this.handleError('Failed to start session');
    }
  }

  private async handleSpeechInput(audioBuffer: AudioBuffer): Promise<void> {
    if (!this.currentSessionId) {
      console.warn('Received speech input without active session');
      return;
    }

    try {
      this.currentState = VoiceAssistantState.PROCESSING;
      
      // Convert speech to text
      const speechText = await this.speechEngine.speechToText(audioBuffer);
      console.log('Speech recognized:', speechText);
      
      // Add conversation turn
      this.sessionController.addConversationTurn(this.currentSessionId, {
        timestamp: new Date(),
        type: 'user_input',
        content: speechText
      });

      // Process the input
      await this.processUserInput(speechText);
      
    } catch (error) {
      console.error('Error processing speech input:', error);
      await this.handleError('Sorry, I had trouble understanding that. Please try again.');
    }
  }

  private async processUserInput(text: string): Promise<void> {
    if (!this.currentSessionId) return;

    try {
      // Detect user intent
      const intent = this.nlProcessor.detectIntent(text);
      
      switch (intent) {
        case UserIntent.END_SESSION:
          await this.endCurrentSession();
          break;
          
        case UserIntent.DESCRIBE_SYMPTOMS:
          await this.processSymptomDescription(text);
          break;
          
        case UserIntent.ASK_CLARIFICATION:
          await this.handleClarificationRequest(text);
          break;
          
        case UserIntent.REQUEST_HELP:
          await this.provideGeneralHelp();
          break;
          
        case UserIntent.UNKNOWN:
          await this.handleUnknownResponse(text);
          break;
          
        default:
          await this.processSymptomDescription(text); // Default to symptom processing
      }
      
    } catch (error) {
      console.error('Error processing user input:', error);
      await this.handleError('I encountered an issue processing your request. Please try again.');
    }
  }

  private async processSymptomDescription(text: string): Promise<void> {
    if (!this.currentSessionId) return;

    try {
      // Extract symptoms from text
      const symptoms = this.nlProcessor.extractSymptoms(text);
      
      if (symptoms.length > 0) {
        // Add symptoms to session
        this.sessionController.addSymptoms(this.currentSessionId, symptoms);
        
        // Generate confirmation
        const confirmation = this.conversationManager.generateConfirmation(symptoms);
        await this.speakResponse(confirmation);
        
        // Check if we need more information
        const sessionContext = this.sessionController.getSessionContext(this.currentSessionId);
        const shouldAskFollowUp = this.conversationManager.shouldAskFollowUp(sessionContext);
        
        if (shouldAskFollowUp) {
          // Ask follow-up questions
          const questions = this.conversationManager.generateFollowUpQuestions(symptoms);
          if (questions.length > 0) {
            await this.askFollowUpQuestion(questions[0]);
          }
        } else {
          // Proceed to risk assessment
          await this.performRiskAssessment();
        }
        
      } else {
        // No symptoms detected, ask for clarification
        await this.speakResponse("I didn't catch any specific symptoms. Could you please describe what you're experiencing?");
      }
      
    } catch (error) {
      console.error('Error processing symptom description:', error);
      await this.handleError('I had trouble processing your symptom description. Please try again.');
    }
  }

  private async askFollowUpQuestion(question: string): Promise<void> {
    if (!this.currentSessionId) return;

    try {
      // Add question to conversation history
      this.sessionController.addConversationTurn(this.currentSessionId, {
        timestamp: new Date(),
        type: 'clarification_question',
        content: question
      });

      // Speak the question
      await this.speakResponse(question);
      
    } catch (error) {
      console.error('Error asking follow-up question:', error);
      await this.handleError('I had trouble asking my question. Please continue describing your symptoms.');
    }
  }

  private async performRiskAssessment(): Promise<void> {
    if (!this.currentSessionId) return;

    try {
      const sessionContext = this.sessionController.getSessionContext(this.currentSessionId);
      
      // Classify risk based on symptoms
      const riskAssessment = this.riskClassifier.classifyRisk(sessionContext.symptoms);
      
      // Enforce safety protocols
      const safeAssessment = this.safetyGuardian.enforceEmergencyProtocol(riskAssessment);
      
      // Store assessment in session
      this.sessionController.setRiskAssessment(this.currentSessionId, safeAssessment);
      
      // Generate response
      const response = this.responseGenerator.generateResponse(safeAssessment);
      
      // Ensure response is safe
      const safeResponse = this.safetyGuardian.generateSafeResponse(response, safeAssessment);
      
      // Speak the assessment and recommendations
      await this.speakResponse(safeResponse);
      
      // End session after providing assessment
      setTimeout(() => {
        if (this.currentSessionId) {
          this.endCurrentSession();
        }
      }, 3000); // Give user time to process the information
      
    } catch (error) {
      console.error('Error performing risk assessment:', error);
      await this.handleError('I had trouble assessing your symptoms. Please consult a healthcare professional.');
    }
  }

  private async handleClarificationRequest(_text: string): Promise<void> {
    // Handle requests for clarification or repetition
    if (!this.currentSessionId) return;

    try {
      const sessionContext = this.sessionController.getSessionContext(this.currentSessionId);
      
      if (sessionContext.symptoms.length > 0) {
        const confirmation = this.conversationManager.generateDetailedConfirmation(sessionContext.symptoms);
        await this.speakResponse(confirmation);
      } else {
        await this.speakResponse("I haven't identified any symptoms yet. Please describe what you're experiencing.");
      }
      
    } catch (error) {
      console.error('Error handling clarification request:', error);
      await this.handleError('Let me try to help you. Please describe your symptoms.');
    }
  }

  private async provideGeneralHelp(): Promise<void> {
    const helpMessage = "I'm here to help you understand your health symptoms. Please describe what you're feeling, such as pain, discomfort, or any other symptoms you're experiencing. I'll ask some questions to better understand your situation and provide appropriate guidance.";
    await this.speakResponse(helpMessage);
  }

  private async handleUnknownResponse(text: string): Promise<void> {
    if (!this.currentSessionId) return;

    try {
      const sessionContext = this.sessionController.getSessionContext(this.currentSessionId);
      
      // Check if we have any symptoms collected so far
      if (sessionContext.symptoms.length > 0) {
        // We have some symptoms, try to proceed with what we have
        await this.speakResponse("I understand you might not have all the details. Let me work with what you've told me so far.");
        await this.performRiskAssessment();
      } else {
        // No symptoms yet, provide guidance on how to describe symptoms
        const guidanceMessage = "I understand it can be difficult to describe how you're feeling. Try to tell me about any pain, discomfort, or changes you've noticed in your body. For example, you could say 'I have a headache' or 'my stomach hurts'. Take your time.";
        await this.speakResponse(guidanceMessage);
      }
      
    } catch (error) {
      console.error('Error handling unknown response:', error);
      await this.handleError('Let me try to help you in a different way. Please describe any symptoms you are experiencing.');
    }
  }

  private async endCurrentSession(): Promise<void> {
    if (!this.currentSessionId) return;

    try {
      const sessionContext = this.sessionController.getSessionContext(this.currentSessionId);
      const hadEmergency = sessionContext.riskLevel === 'emergency';
      
      // Generate closing message
      const closing = this.conversationManager.generateClosing(hadEmergency);
      await this.speakResponse(closing);
      
      // End the session (this will delete all data)
      this.sessionController.endSession(this.currentSessionId);
      this.currentSessionId = null;
      this.currentState = VoiceAssistantState.STANDBY;
      
      console.log('Session ended, returning to standby');
      
    } catch (error) {
      console.error('Error ending session:', error);
      // Force cleanup
      if (this.currentSessionId) {
        this.sessionController.deleteSessionData(this.currentSessionId);
        this.currentSessionId = null;
      }
      this.currentState = VoiceAssistantState.STANDBY;
    }
  }

  private async speakResponse(text: string): Promise<void> {
    try {
      this.currentState = VoiceAssistantState.RESPONDING;
      
      console.log('Speaking:', text);
      await this.speechEngine.speakText(text, {
        rate: 1.0,
        pitch: 1.0,
        voice: '',
        emphasis: false
      });
      
      this.currentState = VoiceAssistantState.LISTENING;
      
    } catch (error) {
      console.error('Error speaking response:', error);
      this.currentState = VoiceAssistantState.ERROR;
    }
  }

  private async handleError(errorMessage: string): Promise<void> {
    try {
      this.currentState = VoiceAssistantState.ERROR;
      
      // Speak error message
      await this.speechEngine.speakText(errorMessage, {
        rate: 1.0,
        pitch: 1.0,
        voice: '',
        emphasis: false
      });
      
      // Return to listening state
      this.currentState = VoiceAssistantState.LISTENING;
      
    } catch (error) {
      console.error('Error handling error:', error);
      // Force return to standby if we can't even speak errors
      this.currentState = VoiceAssistantState.STANDBY;
    }
  }

  // Component initialization and setup

  private initializeComponents(): void {
    // Initialize core components
    this.voiceInput = new VoiceInputLayerImpl();
    this.speechEngine = new SpeechEngineImpl();
    this.nlProcessor = new NLProcessorImpl();
    this.riskClassifier = new RiskClassifierImpl();
    this.conversationManager = new ConversationManagerImpl(this.nlProcessor);
    this.sessionController = new SessionControllerImpl();
    this.responseGenerator = new ResponseGeneratorImpl();
    this.safetyGuardian = new SafetyGuardianImpl();
  }

  private setupEventHandlers(): void {
    // Set up wake word detection
    this.voiceInput.onWakeWordDetected(() => {
      this.handleWakeWordDetected();
    });

    // Set up speech input handling
    this.voiceInput.onSpeechDetected((audioBuffer: AudioBuffer) => {
      this.handleSpeechInput(audioBuffer);
    });

    // Set up voice activity detection for session management
    const voiceDetector = this.voiceInput.getVoiceActivityDetector();
    voiceDetector.onSilenceDetected((duration: number) => {
      this.handleSilenceDetected(duration);
    });
  }

  private async handleSilenceDetected(duration: number): Promise<void> {
    if (!this.currentSessionId) return;

    try {
      if (duration >= 30000 && duration < 60000) {
        // 30 seconds of silence - ask if user is still there
        await this.speakResponse("Are you still there? Please let me know if you need more help, or say goodbye to end our session.");
      } else if (duration >= 60000) {
        // 60 seconds of silence - auto-end session
        await this.speakResponse("I haven't heard from you for a while. I'm ending our session now. Take care!");
        await this.endCurrentSession();
      }
    } catch (error) {
      console.error('Error handling silence:', error);
    }
  }

  // Public methods for external control and testing

  async simulateWakeWord(): Promise<void> {
    await this.handleWakeWordDetected();
  }

  async simulateUserInput(text: string): Promise<void> {
    if (this.currentSessionId) {
      await this.processUserInput(text);
    }
  }

  getComponentStatus(): {
    voiceInput: boolean;
    speechEngine: boolean;
    sessionController: boolean;
    currentSession: SessionId | null;
  } {
    return {
      voiceInput: this.voiceInput.isCurrentlyListening(),
      speechEngine: !this.speechEngine.isSpeaking(),
      sessionController: this.sessionController.getActiveSessionCount() > 0,
      currentSession: this.currentSessionId
    };
  }
}