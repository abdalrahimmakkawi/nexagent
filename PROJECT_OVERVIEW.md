# 🚀 NEXAGENT PROJECT STRUCTURE & CODE OVERVIEW

## 📁 PROJECT STRUCTURE

```
nexagent/
├── 📄 package.json                    # Dependencies & scripts
├── 📄 next.config.js                  # Next.js configuration
├── 📄 tailwind.config.js              # Tailwind CSS config
├── 📄 tsconfig.json                   # TypeScript config
├── 📄 vercel.json                     # Vercel deployment config
├── 📄 .env.local                      # Local environment variables
├── 📄 .env.example                    # Environment variables template
├── 📄 server.ts                       # Express server (alternative)
├── 
├── 📁 public/                         # Static assets
│   ├── 📄 widget.js                   # Chat widget script
│   ├── 📄 favicon.svg                 # Favicon
│   └── 📄 og-image.png                # Social preview image
│
├── 📁 src/                            # Source code
│   ├── 📁 components/                 # React components
│   │   ├── 📄 AgentGenerator.tsx       # AI agent generator
│   │   ├── 📄 ChatWidget.tsx           # Chat widget component
│   │   ├── 📄 DashboardLayout.tsx      # Admin dashboard layout
│   │   ├── 📄 SmartOnboarding.tsx      # Smart onboarding flow
│   │   └── 📄 ...other components
│   │
│   ├── 📁 pages/                       # Next.js pages
│   │   ├── 📄 index.tsx                # Landing page
│   │   ├── 📄 onboarding.tsx           # Onboarding flow
│   │   ├── 📄 dashboard.tsx            # Main dashboard
│   │   ├── 📄 dashboard/agent.tsx      # Agent settings page
│   │   ├── 📄 dashboard/collective-brain.tsx # Collective brain
│   │   ├── 📄 admin/index.tsx         # Admin dashboard
│   │   └── 📁 api/                    # API routes
│   │       ├── 📄 chat.ts              # Chat API
│   │       ├── 📄 onboarding/submit.ts # Onboarding submission
│   │       ├── 📄 collective-brain.ts  # Collective brain API
│   │       └── 📄 ...other APIs
│   │
│   ├── 📁 lib/                         # Utility libraries
│   │   ├── 📄 agent-generator.ts       # AI agent generation (NVIDIA + DeepSeek)
│   │   ├── 📄 multi-agent.ts           # Multi-agent system
│   │   ├── 📄 supabase.ts              # Database client
│   │   ├── 📄 ai-router.ts             # AI routing logic
│   │   └── 📄 ...other utilities
│   │
│   └── 📁 hooks/                       # React hooks
│       └── 📄 useChat.ts               # Chat functionality
│
└── 📁 supabase/                       # Database schemas
    ├── 📄 schema.sql                   # Main database schema
    ├── 📄 multi-agent-schema.sql       # Multi-agent tables
    └── 📄 product-schema.sql           # Product configuration
```

## 🔧 KEY TECHNOLOGIES

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Supabase Database
- **AI**: NVIDIA API (agent generation), DeepSeek (live chat)
- **Deployment**: Vercel
- **Database**: PostgreSQL via Supabase
- **UI**: Framer Motion, Lucide Icons, Radix UI

## 🎯 CORE FEATURES

### 1. **AI Agent Generation**
- Uses NVIDIA API for high-quality agent configuration
- Fallback to DeepSeek for reliability
- Smart routing based on API key availability

### 2. **Multi-Agent System**
- Support for multiple AI agents per client
- Agent teams and collaboration
- Specialized agent types (support, sales, etc.)

### 3. **Live Chat Widget**
- Embeddable chat widget
- Real-time conversations with AI agents
- Lead capture and escalation

### 4. **Admin Dashboard**
- Agent management and review
- Performance analytics
- User management

### 5. **Onboarding Flow**
- Step-by-step agent creation
- Business information collection
- AI-powered configuration

## 🧠 AI INTEGRATION ARCHITECTURE

### **Agent Generation (NVIDIA + DeepSeek)**
```typescript
// Smart routing for agent generation
const generationClient = process.env.NVIDIA_API_KEY 
  ? nvidia  // High-quality generation
  : deepseek  // Fallback

const generationModel = process.env.NVIDIA_API_KEY
  ? 'nvidia/llama-3.1-nemotron-ultra-253b-v1'
  : 'deepseek-chat'
```

### **Live Chat (DeepSeek Only)**
- Faster response times
- Cost-effective for real-time conversations
- Optimized for customer support

## 🗄️ DATABASE STRUCTURE

### **Core Tables**
- `clients` - Client information and billing
- `agents` - AI agent configurations
- `agent_teams` - Agent collaboration groups
- `conversations` - Chat conversations
- `messages` - Individual chat messages
- `onboarding_submissions` - Onboarding data

### **Key Relationships**
- Clients → Agents (1:many)
- Agents → Conversations (1:many)
- Conversations → Messages (1:many)
- Agents → Agent Teams (many:many)

## 🔐 SECURITY FEATURES

- API key encryption in environment variables
- CSRF protection
- Rate limiting
- Input validation
- SQL injection prevention
- Authentication middleware

## 🚀 DEPLOYMENT CONFIGURATION

### **Environment Variables**
```bash
# NVIDIA API (Agent Generation)
NVIDIA_API_KEY=nvapi-***
NVIDIA_BASE_URL=https://integrate.api.nvidia.com/v1
NVIDIA_MODEL=nvidia/llama-3.1-nemotron-ultra-253b-v1

# DeepSeek API (Live Chat)
DEEPSEEK_API_KEY=sk-***
DEEPSEEK_BASE_URL=https://api.deepseek.com
DEEPSEEK_MODEL=deepseek-chat

# Supabase Database
NEXT_PUBLIC_SUPABASE_URL=***
NEXT_PUBLIC_SUPABASE_ANON_KEY=***
SUPABASE_SERVICE_ROLE_KEY=***

# Application
NEXT_PUBLIC_APP_URL=https://nexagent-one.vercel.app
NEXT_PUBLIC_APP_NAME=NexAgent
```

## 🎯 BUSINESS LOGIC

### **Agent Creation Flow**
1. User completes onboarding form
2. AI generates agent configuration using NVIDIA API
3. Agent is saved to database
4. Widget code is generated for embedding
5. Agent becomes available for live chat

### **Chat Flow**
1. User interacts with widget
2. Message routed to DeepSeek API
3. Response delivered in real-time
4. Conversation logged for analytics
5. Leads captured and escalated if needed

### **Admin Review Process**
1. New agents submitted for review
2. Admin reviews configuration
3. Agent approved/rejected
4. Status updated and notified

## 📊 ANALYTICS & MONITORING

- Conversation analytics
- Agent performance metrics
- User engagement tracking
- Lead conversion rates
- System health monitoring

## 🔧 DEVELOPMENT WORKFLOW

### **Local Development**
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
```

### **Deployment**
```bash
git push origin main  # Push to GitHub
vercel --prod         # Deploy to Vercel
```

## 🎨 UI/UX DESIGN

- Modern, clean interface
- Responsive design
- Dark/light mode support
- Smooth animations (Framer Motion)
- Accessibility compliance

## 🔄 INTEGRATION POINTS

- **Supabase**: Database and authentication
- **NVIDIA API**: Agent generation
- **DeepSeek API**: Live chat
- **Stripe**: Payment processing
- **Vercel**: Hosting and deployment
- **n8n**: Workflow automation

## 📈 SCALABILITY CONSIDERATIONS

- Serverless architecture
- Database connection pooling
- API rate limiting
- Caching strategies
- CDN optimization

---

This is a comprehensive AI-powered customer service platform that enables businesses to create and deploy custom AI agents with advanced natural language capabilities.
