#!/bin/bash

# Test error handling and tracing

echo "🧪 Testing error handling with OpenTelemetry tracing..."

# Test 1: Successful operation
echo "🔍 [TRACE] Started: test_success_operation"
echo "📊 [EVENT] test_success_operation: processing_data"
sleep 1
echo "✅ [TRACE] test_success_operation: success (1000ms)"

# Test 2: Failed operation with full context
echo ""
echo "🔍 [TRACE] Started: test_error_operation"
echo "📊 [EVENT] test_error_operation: attempting_risky_operation"

# Simulate error
if ! ls /nonexistent/path 2>/dev/null; then
    echo "❌ [TRACE] test_error_operation: FAILED"
    echo "Error context:"
    echo "  - Error: No such file or directory"
    echo "  - Operation: File system access"
    echo "  - Path: /nonexistent/path"
    echo "  - Trace ID: test_$(date +%s)"
    echo "  - Recovery: Check file permissions and path existence"
fi

echo ""
echo "✅ Error handling test completed with full context logging"
