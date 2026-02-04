# Voice-Med-Mitr 🎤

A voice-first AI health companion designed specifically for visually impaired users. Voice-Med-Mitr provides accessible health guidance through natural voice interactions, helping users understand their symptoms and receive appropriate care recommendations.

## 🌟 Features

### Core Capabilities
- **100% Voice-First Interface** - No visual dependency for core functionality
- **Wake Word Activation** - Say "Hey Mitr" to begin consultations
- **Natural Language Processing** - Understands symptoms described in natural language
- **Risk Assessment** - Categorizes symptoms as mild, moderate, or emergency
- **Medical Safety Guardrails** - Built-in safety constraints and medical disclaimers
- **Privacy-First Design** - Automatic data deletion after sessions

### Accessibility Features
- **Screen-Free Operation** - Designed for visually impaired users
- **Clear Voice Feedback** - Human-like speech synthesis
- **Guided Conversations** - Structured dialog flow with clarifying questions
- **Error Recovery** - Graceful handling of unclear or incomplete input

### Safety & Compliance
- **No Medical Diagnosis** - Provides guidance, not diagnosis
- **Emergency Detection** - Immediate escalation for critical symptoms
- **Medical Disclaimers** - Clear limitations and professional care recommendations
- **Data Protection** - Session-based data retention with automatic cleanup

## 🚀 Quick Start

### Demo Applications

1. **Web Demo** - Interactive browser-based demo
   ```bash
   # Open src/demo/index.html in your browser
   ```

2. **Command Line Demo** - Terminal-based interaction
   ```bash
   # Run the demo runner (requires Node.js)
   npm run dev
   ```

3. **Scenario Testing** - Pre-built symptom scenarios
   ```bash
   # Test various symptom scenarios
   npm run test:scenarios
   ```

### Basic Usage

```typescript
import { VoiceAssistant } from './src/core/VoiceAssistant';

const assistant = new VoiceAssistant();

// Initialize the system
await assistant.initialize();

// Simulate wake word detection
await assistant.simulateWakeWord();

// Process user input
await assistant.simulateUserInput('I have a headache and feel dizzy');

// Shutdown when done
await assistant.shutdown();
```

## 🏗️ Architecture

### Core Components

- **VoiceAssistant** - Main orchestrator coordinating all components
- **VoiceInputLayer** - Handles microphone input and wake word detection
- **SpeechEngine** - Speech-to-text and text-to-speech processing
- **NLProcessor** - Natural language understanding and symptom extraction
- **RiskClassifier** - Medical risk assessment and categorization
- **ConversationManager** - Dialog flow and question generation
- **SessionController** - Session lifecycle and data management
- **SafetyGuardian** - Medical safety constraints and compliance

### Data Flow

1. **Wake Word Detection** → Session Creation
2. **Speech Input** → Text Conversion → Symptom Extraction
3. **Risk Assessment** → Response Generation → Safety Validation
4. **Voice Output** → Session Management → Data Cleanup

## 📋 Example Scenarios

### Mild Symptoms
```
User: "I have a slight headache"
System: "I understand you have a headache. When did it start?"
User: "This morning"
System: "For a mild headache, try resting in a quiet, dark room..."
```

### Emergency Symptoms
```
User: "I have severe chest pain and trouble breathing"
System: "This sounds like a medical emergency. Please call 911 immediately..."
```

## 🧪 Testing

The system includes comprehensive testing:

- **Unit Tests** - Individual component testing
- **Property-Based Tests** - Universal correctness properties
- **Integration Tests** - End-to-end workflow validation
- **Scenario Tests** - Real-world symptom scenarios

Run tests:
```bash
npm test                    # All tests
npm run test:integration   # Integration tests only
npm run test:scenarios     # Scenario-based tests
```

## 🔧 Development

### Installation
```bash
npm install
```

### Development Commands
```bash
npm run build              # Build the project
npm run dev               # Run in development mode
npm test                  # Run all tests
npm run test:coverage     # Run tests with coverage
npm run lint              # Lint code
npm run format            # Format code
```

### Project Structure
```
src/
├── core/              # Core system components
├── interfaces/        # TypeScript interfaces
├── types/            # Type definitions
├── config/           # Configuration constants
├── demo/             # Demo applications
└── tests/            # Test suites
```

### Key Files
- `src/core/VoiceAssistant.ts` - Main orchestrator
- `src/demo/index.html` - Web demo interface
- `src/demo/scenario-demo.ts` - Scenario testing
- `src/test-runner.ts` - Integration test runner

## 🛡️ Safety & Privacy

### Medical Safety
- No diagnosis or prescription recommendations
- Clear medical disclaimers on all responses
- Emergency symptom detection and escalation
- Professional care recommendations for serious symptoms

### Privacy Protection
- No permanent data storage
- Automatic session cleanup
- Voice-confirmed data deletion
- Session-based data retention only

### Compliance
- Follows medical AI safety guidelines
- Includes appropriate disclaimers
- Limits scope to guidance, not diagnosis
- Encourages professional medical consultation

## 🎯 Use Cases

### Primary Users
- Visually impaired individuals seeking health guidance
- Elderly users with limited digital literacy
- Caregivers supporting blind users
- Users in low-resource healthcare settings

### Typical Interactions
- Initial symptom assessment
- Urgency level determination
- Care pathway recommendations
- Emergency situation identification

## 🔮 Future Enhancements

- Multi-language support
- Offline operation capability
- Integration with healthcare providers
- Wearable device compatibility
- Advanced symptom pattern recognition

## 📄 License

MIT License - See LICENSE file for details.

## ⚠️ Medical Disclaimer

Voice-Med-Mitr is an assistive health guidance system and does not replace medical professionals. It is designed to support health awareness and decision-making, not to provide medical diagnosis or treatment recommendations. Always consult qualified healthcare providers for medical concerns.

---

**Voice-Med-Mitr** - Empowering accessible healthcare through voice-first AI technology.