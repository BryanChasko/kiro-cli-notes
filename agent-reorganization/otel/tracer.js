// OpenTelemetry Tracer Configuration
const { NodeSDK } = require('@opentelemetry/sdk-node');
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');
const { JaegerExporter } = require('@opentelemetry/exporter-jaeger');
const { ConsoleSpanExporter } = require('@opentelemetry/sdk-trace-node');

const sdk = new NodeSDK({
  traceExporter: process.env.NODE_ENV === 'production' 
    ? new JaegerExporter({ endpoint: 'http://localhost:14268/api/traces' })
    : new ConsoleSpanExporter(),
  instrumentations: [getNodeAutoInstrumentations()],
});

sdk.start();

module.exports = sdk;
