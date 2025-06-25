import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({
    status: "online",
    service: "FreeTTS API",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
    features: {
      textToSpeech: true,
      voiceCustomization: true,
      freeUsage: true,
      rateLimits: "none",
    },
    limits: {
      maxTextLength: 5000,
      rateLimit: "unlimited",
      dailyQuota: "unlimited",
    },
  })
}
