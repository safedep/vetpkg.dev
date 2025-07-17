import { NextRequest } from "next/server";
import { PackageStreamItem } from "../../types";
import { createS2StreamReader, createS2ConfigFromEnv } from "@/lib/streams";

export async function GET(request: NextRequest) {
  // Set up SSE headers
  const headers = new Headers({
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
    "Access-Control-Allow-Origin": "http://localhost:3000, https://vetpkg.dev",
    Vary: "Origin",
    "Access-Control-Allow-Headers": "Cache-Control",
  });

  // Create a readable stream
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();

      // Send initial connection message
      controller.enqueue(encoder.encode('data: {"type": "connected"}\n\n'));

      try {
        const config = createS2ConfigFromEnv(
          "S2_ACCESS_TOKEN",
          "S2_BASIN",
          "S2_OSS_PACKAGE_READER_STREAM",
        );
        const s2Reader = createS2StreamReader<PackageStreamItem>(config!);

        // Check for fromSequence query parameter
        const { searchParams } = new URL(request.url);
        const fromSequence = searchParams.get("fromSequence");

        let startSeqNum: number;
        if (fromSequence) {
          startSeqNum = parseInt(fromSequence, 10) + 1; // Start from next sequence number
          console.log(`SSE: Resuming from sequence number: ${startSeqNum}`);
        } else {
          const tailPosition = await s2Reader.getStreamTail();
          console.log("SSE: Tail position: ", tailPosition);

          startSeqNum = Math.max(1, tailPosition.seqNum - 10);
          console.log(`SSE: Starting from recent position: ${startSeqNum}`);
        }

        while (!request.signal.aborted) {
          const recentReader = createS2StreamReader<PackageStreamItem>({
            ...config!,
            startSeqNum,

            // When batch size is not set, S2 SDK should be in tail mode
            //batchSize: 10,
          });

          for await (const record of recentReader.readStream()) {
            if (request.signal.aborted) {
              break;
            }

            const packageData: PackageStreamItem = {
              ...record.data,
              timestamp: record.metadata?.timestamp,
              sequenceNumber: record.metadata?.seqNum,
            };

            const data = JSON.stringify(packageData);
            controller.enqueue(encoder.encode(`data: ${data}\n\n`));

            startSeqNum = (record.metadata?.seqNum ?? startSeqNum) + 1;
          }
        }
      } catch (error) {
        console.error("Stream error:", error);
        controller.enqueue(
          encoder.encode(
            'data: {"type": "error", "message": "Stream error"}\n\n',
          ),
        );
      } finally {
        controller.close();
      }
    },

    cancel() {
      console.log("Stream cancelled");
    },
  });

  return new Response(stream, { headers });
}
