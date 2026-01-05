---
category: setup
tags: ["setup", "configuration", "getting-started"]
source: kiro-cli-knowledge-base
indexed: 2026-01-04T22:49:42Z
---

# AWS Kiro CLI: Custom Agents & MCP Utilization

*Advanced integration patterns for enterprise development workflows*

## Beyond Basic Agentic Development

While Kiro CLI provides powerful out-of-the-box capabilities, enterprise development requires custom integrations, specialized knowledge bases, and seamless cloud connectivity. This guide explores advanced patterns using Model Context Protocol (MCP) servers and custom agent development.

## MCP Architecture: Extending Agent Capabilities

> "MCP, the model context protocol. It's a protocol that gives your LLMs, your coding assistance, your agentic IDEs. That's a little bit more information. That little bit more control that helps you do things so much better."
> *- MCP Server Setup Tutorial*

### Understanding MCP Servers

MCP servers act as specialized knowledge and capability providers for your agents:

- **AWS API Server**: Direct cloud resource management
- **Knowledge Server**: Documentation and best practices integration  
- **Database Servers**: Direct database query and manipulation
- **Custom Servers**: Domain-specific business logic

## AWS Integration: Cloud-Native Agent Workflows

### 1. AWS MCP Server Setup

Following the official Kiro documentation at [kiro.dev/docs/cli/mcp/](https://kiro.dev/docs/cli/mcp/), configure AWS integration:

```bash
# Install AWS MCP servers
npm install @aws/mcp-server-api @aws/mcp-server-knowledge

# Configure AWS credentials
aws configure

# Add to Kiro CLI configuration
kiro-cli config add-mcp-server aws-api \
  --command "npx @aws/mcp-server-api" \
  --args "--region us-east-1"

kiro-cli config add-mcp-server aws-knowledge \
  --command "npx @aws/mcp-server-knowledge" \
  --args "--include-services ec2,lambda,s3"
```

### 2. AWS Resource Management Through Agents

> "With the AWS MCP servers, we have two new ones... we've got the API one. This makes it really easy to interact with AWS, query your resources, potentially make changes to your resources. And then we have the Knowledge One, which brings in documentation, things from the Builder Center."
> *- Extending Kiro with MCP*

**Practical Example**: Infrastructure as Code with Agents

```bash
# Agent-driven AWS resource creation
kiro-cli chat "Create a Lambda function that processes video uploads from S3, with proper IAM roles and CloudWatch logging"

# The agent will:
# 1. Query existing AWS resources via MCP
# 2. Generate CDK/CloudFormation templates
# 3. Create IAM policies with least privilege
# 4. Set up monitoring and logging
# 5. Deploy and verify the infrastructure
```

### 3. OTEL Tracing for AWS Workflows

In our video processing project, we implemented comprehensive observability:

```typescript
// OTEL configuration for AWS MCP workflows
import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';

const sdk = new NodeSDK({
  instrumentations: [getNodeAutoInstrumentations()],
  serviceName: 'kiro-aws-mcp-workflow',
  traceExporter: new OTLPTraceExporter({
    url: 'http://localhost:4317',
  }),
});

// Trace AWS operations
const tracer = trace.getTracer('aws-mcp-operations');

async function processVideoWithTracing(videoUrl: string) {
  return tracer.startActiveSpan('video-processing-workflow', async (span) => {
    span.setAttributes({
      'video.url': videoUrl,
      'mcp.server': 'aws-api',
      'operation': 'video-processing'
    });
    
    // Agent workflow with full tracing
    const result = await kiroAgent.process(videoUrl);
    
    span.setStatus({ code: SpanStatusCode.OK });
    span.end();
    return result;
  });
}
```

## Custom MCP Server Development

### 1. Building Domain-Specific MCP Servers

**Video Processing MCP Server** (from our project):

```typescript
// video-processing-mcp-server/src/index.ts
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

class VideoProcessingMCPServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      { name: 'video-processing-server', version: '1.0.0' },
      { capabilities: { tools: {} } }
    );
    
    this.setupTools();
  }

  private setupTools() {
    // Transcription tool
    this.server.setRequestHandler('tools/call', async (request) => {
      if (request.params.name === 'transcribe_video') {
        return this.transcribeVideo(request.params.arguments);
      }
      
      if (request.params.name === 'extract_frames') {
        return this.extractFrames(request.params.arguments);
      }
      
      throw new Error(`Unknown tool: ${request.params.name}`);
    });
  }

  private async transcribeVideo(args: any) {
    const tracer = trace.getTracer('video-mcp-server');
    
    return tracer.startActiveSpan('transcribe-video', async (span) => {
      span.setAttributes({
        'video.url': args.url,
        'video.model': args.model || 'base'
      });
      
      // Implement transcription logic with Whisper
      const result = await this.processWithWhisper(args.url, args.model);
      
      span.setAttributes({
        'transcription.words': result.wordCount,
        'transcription.duration': result.processingTime
      });
      
      return {
        content: [{
          type: 'text',
          text: `Transcription completed: ${result.wordCount} words in ${result.processingTime}s`
        }]
      };
    });
  }
}

// Server startup
const server = new VideoProcessingMCPServer();
const transport = new StdioServerTransport();
await server.connect(transport);
```

### 2. Docker Deployment for MCP Servers

```dockerfile
# Dockerfile for custom MCP server
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY dist/ ./dist/
COPY config/ ./config/

# Health check for MCP server
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node dist/health-check.js

EXPOSE 3000
CMD ["node", "dist/index.js"]
```

```yaml
# docker-compose.yml for MCP server ecosystem
version: '3.8'
services:
  video-processing-mcp:
    build: ./video-processing-server
    environment:
      - OTEL_EXPORTER_OTLP_ENDPOINT=http://jaeger:14268/api/traces
      - OTEL_SERVICE_NAME=video-processing-mcp
    volumes:
      - ./data:/app/data
    
  aws-integration-mcp:
    image: aws/mcp-server:latest
    environment:
      - AWS_REGION=us-east-1
      - OTEL_EXPORTER_OTLP_ENDPOINT=http://jaeger:14268/api/traces
    
  jaeger:
    image: jaegertracing/all-in-one:latest
    ports:
      - "16686:16686"
      - "14268:14268"
```

### 3. MCP Server Registration in Kiro CLI

```bash
# Register custom MCP servers
kiro-cli config add-mcp-server video-processing \
  --command "docker run --rm -i video-processing-mcp" \
  --description "Video transcription and frame extraction"

kiro-cli config add-mcp-server database-ops \
  --command "node ./mcp-servers/database/index.js" \
  --args "--connection-string postgresql://localhost:5432/mydb"

# Verify MCP server connectivity
kiro-cli mcp list
kiro-cli mcp test video-processing
```

## Advanced Agent Patterns

### 1. Multi-MCP Workflows

**Payment Integration Example** (inspired by Stripe integration video):

```bash
# Agent orchestrates multiple MCP servers
kiro-cli chat "Set up a subscription billing system using Stripe MCP for payments, Database MCP for user management, and AWS MCP for serverless deployment"

# Workflow involves:
# 1. Stripe MCP: Create products and pricing
# 2. Database MCP: User and subscription models  
# 3. AWS MCP: Lambda functions and API Gateway
# 4. Monitoring MCP: CloudWatch dashboards
```

### 2. Knowledge Integration Patterns

> "And then we have the Knowledge One, which brings in documentation, things from the Builder Center."
> *- AWS MCP Integration*

```typescript
// Knowledge-enhanced agent workflows
const knowledgeEnhancedWorkflow = async (userQuery: string) => {
  // 1. Query knowledge MCP for relevant documentation
  const docs = await kiroAgent.queryMCP('aws-knowledge', {
    query: userQuery,
    services: ['lambda', 'apigateway', 's3']
  });
  
  // 2. Use documentation context for better code generation
  const implementation = await kiroAgent.generateCode({
    query: userQuery,
    context: docs,
    constraints: ['security-best-practices', 'cost-optimization']
  });
  
  // 3. Validate against AWS best practices
  const validation = await kiroAgent.validateImplementation(implementation);
  
  return { implementation, validation, documentation: docs };
};
```

### 3. Autonomous Agent Workflows

> "You're already using the power of AI in your development environment but most AI coding tools only work while you're actively in a session. The moment you switch tasks or pick up long running work, everything slows down."
> *- Autonomous Agent Development Flow*

```bash
# Set up autonomous development workflows
kiro-cli agent create video-processor \
  --mcp-servers "video-processing,aws-api,database-ops" \
  --schedule "0 2 * * *" \
  --workflow "process-pending-videos"

# Agent runs independently, processing queued videos
# with full observability and error recovery
```

## Production Deployment Patterns

### 1. MCP Server Scaling

```yaml
# Kubernetes deployment for MCP servers
apiVersion: apps/v1
kind: Deployment
metadata:
  name: video-processing-mcp
spec:
  replicas: 3
  selector:
    matchLabels:
      app: video-processing-mcp
  template:
    metadata:
      labels:
        app: video-processing-mcp
    spec:
      containers:
      - name: mcp-server
        image: video-processing-mcp:latest
        env:
        - name: OTEL_EXPORTER_OTLP_ENDPOINT
          value: "http://jaeger-collector:14268/api/traces"
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "1Gi"
            cpu: "500m"
```

### 2. Security & Access Control

```bash
# MCP server authentication
kiro-cli config set mcp-auth-token $(aws secretsmanager get-secret-value \
  --secret-id kiro-mcp-auth --query SecretString --output text)

# Network security for MCP servers
kiro-cli config set mcp-network-policy restricted
kiro-cli config set mcp-allowed-hosts "*.internal.company.com"
```

## Monitoring & Observability

### OTEL Integration Across MCP Ecosystem

```typescript
// Comprehensive tracing setup
const setupTracing = () => {
  const sdk = new NodeSDK({
    instrumentations: [
      getNodeAutoInstrumentations(),
      new MCPInstrumentation(), // Custom MCP instrumentation
      new KiroAgentInstrumentation() // Custom Kiro instrumentation
    ],
    resource: new Resource({
      [SemanticResourceAttributes.SERVICE_NAME]: 'kiro-mcp-ecosystem',
      [SemanticResourceAttributes.SERVICE_VERSION]: '1.0.0',
    }),
  });
  
  sdk.start();
};

// Custom metrics for MCP operations
const meterProvider = new MeterProvider();
const meter = meterProvider.getMeter('kiro-mcp-metrics');

const mcpRequestCounter = meter.createCounter('mcp_requests_total', {
  description: 'Total number of MCP requests'
});

const mcpRequestDuration = meter.createHistogram('mcp_request_duration', {
  description: 'Duration of MCP requests in milliseconds'
});
```

## Reader Setup Guide

### Environment Setup Checklist

1. **Install Prerequisites**:
```bash
# Node.js 18+
node --version

# Docker for MCP servers
docker --version

# AWS CLI for cloud integration
aws --version

# Kiro CLI
npm install -g @kiro/cli
```

2. **Configure MCP Servers**:
```bash
# Clone our reference implementation
git clone https://github.com/your-org/kiro-mcp-servers
cd kiro-mcp-servers

# Build and deploy MCP servers
docker-compose up -d

# Register with Kiro CLI
./scripts/register-mcp-servers.sh
```

3. **Enable Observability**:
```bash
# Start Jaeger for tracing
docker run -d --name jaeger \
  -p 16686:16686 \
  -p 14268:14268 \
  jaegertracing/all-in-one:latest

# Configure OTEL in your environment
export OTEL_EXPORTER_OTLP_ENDPOINT="http://localhost:14268/api/traces"
export OTEL_SERVICE_NAME="my-kiro-workflow"
```

## Conclusion

Advanced Kiro CLI usage with custom MCP servers enables enterprise-grade agentic development. By combining AWS integration, custom domain logic, and comprehensive observability, teams can build sophisticated AI-powered development workflows that scale with their needs.

The key is understanding MCP as an extensibility layer that allows agents to access any external system or knowledge base, while OTEL tracing provides the observability needed for production deployments.

**Next Steps**: Implement these patterns in your environment and explore our SDLC integration guide for complete workflow automation.

---

*Reference Implementation: [Video Processing MCP Server](https://github.com/your-org/video-processing-mcp) • Official Docs: [kiro.dev/docs/cli/mcp/](https://kiro.dev/docs/cli/mcp/)*
