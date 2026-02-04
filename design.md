# Voice-Med-Mitr System Design

## System Architecture

### Overview
Voice-Med-Mitr follows a modular, pipeline-based architecture designed for voice-first interaction. The system processes audio input through multiple specialized components, each handling a specific aspect of the voice-to-guidance pipeline.

### Architecture Diagram
```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Voice Input   │───▶│  Speech Engine   │───▶│ NL Processor    │
│     Layer       │    │                  │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│ Voice Activity  │    │ Audio Output     │    │ Risk Classifier │
│   Detector      │    │    Manager       │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│ Session         │───▶│ Conversation     │◀───│ Response        │
│ Controller      │    │    Manager       │    │  Generator      │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│ Privacy         │    │ Safety Guardian  │    │ Ambiguity       │
│ Controller      │    │                  │    │  Detector       │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### Core Components

#### 1. Voice Input Layer
- **Purpose**: Continuous audio monitoring and wake word detection
- **Technologies**: Web Audio API, MediaRecorder API
- **Key Features**: 
  - Wake word detection ("Hey Mitr")
  - Audio buffer management
  - Noise filtering
  - Microphone access management

#### 2. Speech Processing Engine
- **Purpose**: Bidirectional speech conversion (speech↔text)
- **Technologies**: Web Speech API, SpeechSynthesis API
- **Key Features**:
  - Real-time speech-to-text (3-second constraint)
  - High-quality text-to-speech output
  - Language configuration
  - Audio quality optimization

#### 3. Natural Language Processor
- **Purpose**: Extract medical information from natural language
- **Technologies**: Custom NLP algorithms, keyword matching
- **Key Features**:
  - Symptom entity extraction
  - Severity and duration parsing
  - Intent classification
  - Confidence scoring

#### 4. Risk Classification Engine
- **Purpose**: Assess medical urgency and provide appropriate guidance
- **Technologies**: Rule-based expert system, medical knowledge base
- **Key Features**:
  - Three-tier risk classification (Mild/Moderate/Emergency)
  - Medical knowledge base
  - Emergency keyword detection
  - Confidence-based recommendations

#### 5. Conversation Manager
- **Purpose**: Orchestrate dialog flow and manage user interactions
- **Technologies**: State machine, template engine
- **Key Features**:
  - Follow-up question generation
  - Conversation state tracking
  - Medical disclaimer injection
  - Response formatting

#### 6. Session Controller
- **Purpose**: Manage session lifecycle and privacy
- **Technologies**: In-memory session storage, timeout management
- **Key Features**:
  - Session creation and termination
  - Automatic cleanup and data deletion
  - Timeout handling
  - Privacy enforcement

## Data Flow

### Primary Interaction Flow
```
1. User says "Hey Mitr" → Wake Word Detection
2. System activates → Audio Greeting
3. User describes symptoms → Speech-to-Text
4. NLP extracts symptom entities → Confidence scoring
5. If ambiguous → Generate clarifying questions
6. Risk classifier assesses urgency → Generate recommendations
7. Response generator creates appropriate guidance → Text-to-Speech
8. User ends session → Data deletion and cleanup
```

### Data Processing Pipeline
```
Audio Input → Speech Recognition → Text Analysis → Entity Extraction → 
Risk Assessment → Response Generation → Speech Synthesis → Audio Output
```

### Session Data Lifecycle
```
Session Start → Data Collection → Processing → Response → Data Deletion
     ↓              ↓              ↓           ↓            ↓
  Create ID    Store Symptoms   Analyze Risk  Send Response  Cleanup
```

## Tech Stack

### Core Technologies
- **Language**: TypeScript 5.0+
- **Runtime**: Browser (Web APIs)
- **Build Tool**: TypeScript Compiler (tsc)
- **Package Manager**: npm

### Audio Processing
- **Speech Recognition**: Web Speech API (webkitSpeechRecognition)
- **Speech Synthesis**: SpeechSynthesis API
- **Audio Processing**: Web Audio API
- **Media Capture**: MediaRecorder API

### Testing Framework
- **Test Runner**: Vitest
- **Property-Based Testing**: fast-check
- **Coverage**: @vitest/coverage-v8
- **Mocking**: Vitest built-in mocks

### Development Tools
- **Linting**: ESLint with TypeScript rules
- **Formatting**: Prettier
- **Type Checking**: TypeScript strict mode
- **Development Server**: ts-node

### Browser APIs Used
- **AudioContext**: Audio processing and analysis
- **MediaDevices**: Microphone access
- **SpeechRecognition**: Voice-to-text conversion
- **SpeechSynthesis**: Text-to-voice conversion
- **Web Workers**: Background processing (future enhancement)

## Folder Structure Explanation

```
voice-med-mitr/
├── .kiro/                          # Kiro IDE configuration
│   └── specs/voice-med-mitr/       # Project specifications
│       ├── requirements.md         # Detailed requirements
│       ├── design.md              # System design document
│       └── tasks.md               # Implementation tasks
├── src/                           # Source code
│   ├── core/                      # Core business logic
│   │   ├── VoiceInputLayerImpl.ts # Voice input and wake word detection
│   │   ├── SpeechEngineImpl.ts    # Speech processing (STT/TTS)
│   │   ├── NLProcessorImpl.ts     # Natural language processing
│   │   ├── RiskClassifierImpl.ts  # Medical risk assessment
│   │   ├── ResponseGenerator.ts   # Response generation
│   │   ├── AmbiguityDetector.ts   # Ambiguity detection and clarification
│   │   ├── VoiceActivityDetector.ts # Voice activity detection
│   │   └── AudioOutputManager.ts  # Audio output management
│   ├── interfaces/                # TypeScript interfaces
│   │   ├── VoiceInputLayer.ts     # Voice input interface
│   │   ├── SpeechEngine.ts        # Speech processing interface
│   │   ├── NLProcessor.ts         # NLP interface
│   │   ├── RiskClassifier.ts      # Risk classification interface
│   │   ├── ConversationManager.ts # Conversation management interface
│   │   ├── SessionController.ts   # Session management interface
│   │   └── index.ts               # Interface exports
│   ├── types/                     # Type definitions
│   │   └── index.ts               # Core data types and enums
│   ├── config/                    # Configuration
│   │   └── constants.ts           # Application constants
│   ├── tests/                     # Test files
│   │   ├── properties/            # Property-based tests
│   │   │   ├── wake-word-activation.test.ts
│   │   │   ├── speech-processing-performance.test.ts
│   │   │   ├── audio-only-output.test.ts
│   │   │   ├── symptom-extraction.test.ts
│   │   │   ├── ambiguity-detection.test.ts
│   │   │   └── risk-classification-completeness.test.ts
│   │   ├── integration/           # Integration tests
│   │   │   └── voice-io-integration.test.ts
│   │   ├── setup.ts               # Test utilities and generators
│   │   ├── basic.test.ts          # Basic functionality tests
│   │   ├── voice-activity-detection.test.ts
│   │   ├── text-to-speech.test.ts
│   │   ├── intent-detection.test.ts
│   │   └── checkpoint-voice-io.test.ts
│   ├── demo/                      # Demo applications
│   │   └── voice-io-demo.ts       # Voice I/O demonstration
│   └── index.ts                   # Main entry point
├── dist/                          # Compiled JavaScript (generated)
├── node_modules/                  # Dependencies (generated)
├── package.json                   # Project configuration
├── tsconfig.json                  # TypeScript configuration
├── vitest.config.ts              # Test configuration
├── .eslintrc.js                  # ESLint configuration
├── .prettierrc                   # Prettier configuration
├── README.md                     # Project documentation
├── requirements.md               # This requirements document
└── design.md                     # This design document
```

### Folder Structure Rationale

#### `/src/core/`
Contains the main business logic implementations. Each file represents a major system component with clear separation of concerns. This modular approach enables:
- Independent testing of components
- Easy maintenance and updates
- Clear dependency management
- Scalable architecture

#### `/src/interfaces/`
Defines TypeScript interfaces for all major components. This provides:
- Type safety across the application
- Clear contracts between components
- Easy mocking for testing
- Documentation through code

#### `/src/types/`
Central location for shared data types, enums, and type definitions. Benefits:
- Consistent data structures
- Single source of truth for types
- Easy refactoring and updates
- Clear data model documentation

#### `/src/tests/`
Comprehensive testing structure with multiple test types:
- **Properties/**: Property-based tests for universal correctness
- **Integration/**: End-to-end workflow testing
- **Unit tests**: Component-specific functionality testing
- **Setup utilities**: Shared test helpers and generators

#### `/src/demo/`
Demonstration applications for testing and showcasing functionality:
- Interactive demos for development
- Integration testing platforms
- User experience validation
- Development debugging tools

### Design Patterns Used

#### 1. Interface Segregation
Each component implements focused interfaces, ensuring:
- Single responsibility principle
- Easy testing and mocking
- Clear component boundaries
- Flexible implementation swapping

#### 2. Dependency Injection
Components receive dependencies through constructors:
- Loose coupling between components
- Easy unit testing with mocks
- Flexible configuration
- Clear dependency relationships

#### 3. Strategy Pattern
Multiple implementations for different environments:
- Browser vs. testing environments
- Different speech engines
- Fallback implementations
- Platform-specific optimizations

#### 4. Observer Pattern
Event-driven communication between components:
- Voice activity detection callbacks
- Session lifecycle events
- Error handling and recovery
- Asynchronous operation coordination

#### 5. Template Method Pattern
Structured response generation:
- Risk-level specific templates
- Consistent response formatting
- Easy customization and extension
- Maintainable content management

### Security Considerations

#### Data Privacy
- No persistent storage of voice data
- Session-based data lifecycle
- Automatic data deletion
- Local processing where possible

#### Input Validation
- Speech input sanitization
- Timeout protection
- Rate limiting for requests
- Error boundary implementation

#### Browser Security
- Same-origin policy compliance
- Secure context requirements (HTTPS)
- Permission-based microphone access
- Content Security Policy headers

### Performance Optimizations

#### Audio Processing
- Efficient buffer management
- Real-time processing constraints
- Memory usage optimization
- Background processing where possible

#### Response Generation
- Template caching
- Lazy loading of components
- Efficient string operations
- Minimal DOM manipulation

#### Testing Performance
- Parallel test execution
- Property-based test optimization
- Mock implementation efficiency
- Coverage report generation