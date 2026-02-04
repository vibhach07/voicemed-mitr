// Simple Demo for Voice-Med-Mitr
// Basic demonstration without complex dependencies

import { VoiceAssistant } from '../core/VoiceAssistant';

export class SimpleDemo {
  private voiceAssistant: VoiceAssistant;

  constructor() {
    this.voiceAssistant = new VoiceAssistant();
  }

  async runDemo(): Promise<void> {
    console.log('🎤 Voice-Med-Mitr Simple Demo');
    console.log('=============================');
    
    try {
      // Initialize the assistant
      await this.voiceAssistant.initialize();
      console.log('✅ Voice Assistant initialized');
      
      // Test basic functionality
      console.log('🧪 Testing basic functionality...');
      
      // Simulate wake word
      await this.voiceAssistant.simulateWakeWord();
      console.log('✅ Wake word simulation completed');
      
      // Simulate user input
      await this.voiceAssistant.simulateUserInput('I have a headache');
      console.log('✅ User input simulation completed');
      
      // Get current state
      const state = this.voiceAssistant.getCurrentState();
      console.log(`📊 Current state: ${state}`);
      
      // Shutdown
      await this.voiceAssistant.shutdown();
      console.log('✅ Demo completed successfully');
      
    } catch (error) {
      console.error('❌ Demo failed:', error);
    }
  }
}

// Export for easy use
export async function runSimpleDemo(): Promise<void> {
  const demo = new SimpleDemo();
  await demo.runDemo();
}