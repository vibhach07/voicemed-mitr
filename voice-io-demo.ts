// Voice I/O Demo - Integration test with VoiceAssistant

import { VoiceAssistant } from '../core/VoiceAssistant';
import { WAKE_WORD } from '../config/constants';

export class VoiceIODemo {
  private voiceAssistant: VoiceAssistant;
  private isActive: boolean = false;

  constructor() {
    this.voiceAssistant = new VoiceAssistant();
  }

  async start(): Promise<void> {
    console.log('🎤 Starting Voice I/O Demo...');
    console.log(`📢 Say "${WAKE_WORD}" to activate`);
    
    try {
      await this.voiceAssistant.initialize();
      this.isActive = true;
      
      console.log('✅ Voice-Med-Mitr demo started successfully');
      console.log('🎯 Try saying "Hey Mitr" to begin a health consultation');
      
      // Monitor the assistant state
      this.monitorAssistantState();
      
    } catch (error) {
      console.error('❌ Failed to start demo:', error);
      throw error;
    }
  }

  async stop(): Promise<void> {
    console.log('🛑 Stopping Voice I/O Demo...');
    this.isActive = false;
    
    try {
      await this.voiceAssistant.shutdown();
      console.log('✅ Demo stopped successfully');
    } catch (error) {
      console.error('❌ Error stopping demo:', error);
    }
  }

  private monitorAssistantState(): void {
    const interval = setInterval(() => {
      if (!this.isActive) {
        clearInterval(interval);
        return;
      }

      const state = this.voiceAssistant.getCurrentState();
      const sessionId = this.voiceAssistant.getCurrentSessionId();
      
      // Log state changes (you might want to make this less verbose)
      if (state !== 'standby') {
        console.log(`🔄 State: ${state}, Session: ${sessionId || 'None'}`);
      }
    }, 2000);
  }

  // Test methods for verification
  async testWakeWordDetection(): Promise<void> {
    console.log('🧪 Testing Wake Word Detection...');
    
    if (!this.isActive) {
      throw new Error('Demo not started');
    }
    
    await this.voiceAssistant.simulateWakeWord();
    console.log('✅ Wake word simulation completed');
  }

  async testSymptomInput(symptomText: string): Promise<void> {
    console.log(`🧪 Testing Symptom Input: "${symptomText}"`);
    
    if (!this.voiceAssistant.isActive()) {
      console.log('⚠️  No active session, simulating wake word first...');
      await this.voiceAssistant.simulateWakeWord();
      
      // Wait for session to start
      await this.wait(2000);
    }
    
    await this.voiceAssistant.simulateUserInput(symptomText);
    console.log('✅ Symptom input simulation completed');
  }

  async testCompleteFlow(): Promise<void> {
    console.log('🧪 Testing Complete Conversation Flow...');
    
    // Step 1: Wake word
    console.log('1. Simulating wake word...');
    await this.voiceAssistant.simulateWakeWord();
    await this.wait(2000);
    
    // Step 2: Initial symptom description
    console.log('2. Describing symptoms...');
    await this.voiceAssistant.simulateUserInput('I have a headache and feel dizzy');
    await this.wait(3000);
    
    // Step 3: Follow-up response
    console.log('3. Providing more details...');
    await this.voiceAssistant.simulateUserInput('It started this morning and it\'s getting worse');
    await this.wait(5000);
    
    console.log('✅ Complete flow test completed');
  }

  async testEmergencyScenario(): Promise<void> {
    console.log('🧪 Testing Emergency Scenario...');
    
    // Wake word
    await this.voiceAssistant.simulateWakeWord();
    await this.wait(2000);
    
    // Emergency symptoms
    await this.voiceAssistant.simulateUserInput('I have severe chest pain and trouble breathing');
    await this.wait(5000);
    
    console.log('✅ Emergency scenario test completed');
  }

  async testMildScenario(): Promise<void> {
    console.log('🧪 Testing Mild Scenario...');
    
    // Wake word
    await this.voiceAssistant.simulateWakeWord();
    await this.wait(2000);
    
    // Mild symptoms
    await this.voiceAssistant.simulateUserInput('I have a slight cough');
    await this.wait(3000);
    
    // Additional details
    await this.voiceAssistant.simulateUserInput('It\'s been going on for a day but it\'s not too bad');
    await this.wait(5000);
    
    console.log('✅ Mild scenario test completed');
  }

  async testUnknownResponse(): Promise<void> {
    console.log('🧪 Testing Unknown Response Handling...');
    
    // Wake word
    await this.voiceAssistant.simulateWakeWord();
    await this.wait(2000);
    
    // Unknown/unclear response
    await this.voiceAssistant.simulateUserInput('I don\'t know, I just feel weird');
    await this.wait(3000);
    
    console.log('✅ Unknown response test completed');
  }

  // Public wait method (fixed the private access issue)
  async wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Status methods
  isRunning(): boolean {
    return this.isActive;
  }

  getCurrentState(): string {
    return this.voiceAssistant.getCurrentState();
  }

  hasActiveSession(): boolean {
    return this.voiceAssistant.isActive();
  }

  getComponentStatus(): any {
    return this.voiceAssistant.getComponentStatus();
  }
}

// Convenience function for quick testing
export async function runQuickDemo(): Promise<void> {
  const demo = new VoiceIODemo();
  
  try {
    await demo.start();
    
    console.log('Running quick demo scenarios...');
    
    // Test basic flow
    await demo.testCompleteFlow();
    await demo.wait(2000);
    
    // Test emergency scenario
    await demo.testEmergencyScenario();
    await demo.wait(2000);
    
    console.log('✅ Quick demo completed successfully');
    
  } catch (error) {
    console.error('❌ Demo failed:', error);
  } finally {
    await demo.stop();
  }
}

// Export for use in tests and manual testing
export default VoiceIODemo;