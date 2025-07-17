# S2 Stream Reader

A generic TypeScript library for reading from S2 StreamStore with ProtoBuf support.

## Features

- **Generic Type Support**: Stream reader accepts a generic type `T` for type-safe record handling
- **ProtoBuf Support**: Handles ProtoBuf serialized JSON data automatically
- **Retry Logic**: Built-in exponential backoff retry mechanism
- **Error Handling**: Comprehensive error handling with custom error types
- **Health Monitoring**: Connection health checking and status monitoring
- **Environment Configuration**: Easy configuration from environment variables

## Usage

### Basic Usage

```typescript
import { createS2StreamReader, S2StreamConfig } from "@/lib/streams";

// Define your data type
interface PackageData {
  name: string;
  version: string;
  ecosystem: string;
}

// Create configuration
const config: S2StreamConfig = {
  accessToken: "your-access-token",
  basin: "your-basin",
  stream: "your-stream",
};

// Create stream reader
const reader = createS2StreamReader<PackageData>(config);

// Read from stream
for await (const record of reader.readStream()) {
  console.log("Received:", record.data);
  console.log("Metadata:", record.metadata);
}
```

### Configuration from Environment

```typescript
import { createS2ConfigFromEnv, createS2StreamReader } from "@/lib/streams";

// Create config from environment variables
const config = createS2ConfigFromEnv();
if (!config) {
  throw new Error("S2 configuration not available");
}

const reader = createS2StreamReader<MyDataType>(config);
```

### With Custom Options

```typescript
import { createS2StreamReader, S2StreamOptions } from "@/lib/streams";

const options: S2StreamOptions = {
  maxRetries: 5,
  baseRetryDelay: 2000,
  timeout: 60000,
};

const reader = createS2StreamReader<MyDataType>(config, options);
```

### Health Monitoring

```typescript
// Check connection health
const health = await reader.getHealthStatus();
console.log("Stream healthy:", health.healthy);
console.log("Status message:", health.message);

// Test connection
const isConnected = await reader.testConnection();
```

### Single Record Reading

```typescript
// Read a single record
const record = await reader.readSingleRecord();
if (record) {
  console.log("Single record:", record.data);
}
```

## Environment Variables

The library supports the following environment variables:

### Required

- `S2_ACCESS_TOKEN`: Your S2 access token
- `S2_BASIN`: The basin name
- `S2_STREAM`: The stream name

### Optional

- `S2_MAX_RETRIES`: Maximum number of retry attempts (default: 3)
- `S2_BASE_RETRY_DELAY`: Base delay for retry backoff in ms (default: 1000)
- `S2_TIMEOUT`: Request timeout in ms (default: 30000)

## Error Handling

The library provides custom error types:

```typescript
import { S2StreamError, S2ParseError } from "@/lib/streams";

try {
  for await (const record of reader.readStream()) {
    // Process record
  }
} catch (error) {
  if (error instanceof S2StreamError) {
    console.error("Stream error:", error.message);
    console.error("Retryable:", error.retryable);
  } else if (error instanceof S2ParseError) {
    console.error("Parse error:", error.message);
    console.error("Raw data:", error.rawData);
  }
}
```

## Utility Functions

### Configuration Validation

```typescript
import { validateS2Config, isS2ConfigAvailable } from "@/lib/streams";

// Check if config is valid
if (validateS2Config(config)) {
  // Config is valid
}

// Check if environment has required variables
if (isS2ConfigAvailable()) {
  // Environment is configured
}
```

### Missing Environment Variables

```typescript
import { getMissingS2EnvVars } from "@/lib/streams";

const missing = getMissingS2EnvVars();
if (missing.length > 0) {
  console.error("Missing environment variables:", missing);
}
```

## Data Format

The stream reader handles ProtoBuf serialized JSON data and returns records in the following format:

```typescript
interface S2StreamRecord<T> {
  data: T; // Your deserialized data
  metadata?: {
    timestamp?: string;
    sequenceNumber?: number;
    [key: string]: unknown;
  };
}
```

## Integration Example

Here's how to integrate with a Next.js API route:

```typescript
// pages/api/stream/route.ts
import { createS2ConfigFromEnv, createS2StreamReader } from "@/lib/streams";

export async function GET() {
  const config = createS2ConfigFromEnv();
  if (!config) {
    return new Response("S2 not configured", { status: 500 });
  }

  const reader = createS2StreamReader<YourDataType>(config);

  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const record of reader.readStream()) {
          controller.enqueue(JSON.stringify(record.data));
        }
      } catch (error) {
        controller.error(error);
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
```
