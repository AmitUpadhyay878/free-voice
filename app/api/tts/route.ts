import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { text, voice, rate = 1, pitch = 1, volume = 1 } = body

    // Validate required fields
    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Text is required and must be a string" }, { status: 400 })
    }

    if (text.length > 5000) {
      return NextResponse.json({ error: "Text must be less than 5000 characters" }, { status: 400 })
    }

    // Return configuration for client-side TTS
    // Since Web Speech API only works in browser, we return the config
    const ttsConfig = {
      text: text.trim(),
      voice: voice || "default",
      rate: Math.max(0.1, Math.min(2, rate)),
      pitch: Math.max(0, Math.min(2, pitch)),
      volume: Math.max(0, Math.min(1, volume)),
      timestamp: new Date().toISOString(),
      id: Math.random().toString(36).substr(2, 9),
    }

    return NextResponse.json({
      success: true,
      message: "TTS configuration generated successfully",
      data: ttsConfig,
      instructions: {
        note: "Web Speech API requires browser environment. Use the returned config with client-side JavaScript.",
        clientCode: `
// Use this JavaScript code in browser:
const utterance = new SpeechSynthesisUtterance("${text}");
utterance.rate = ${ttsConfig.rate};
utterance.pitch = ${ttsConfig.pitch};
utterance.volume = ${ttsConfig.volume};
speechSynthesis.speak(utterance);
        `,
      },
    })
  } catch (error) {
    console.error("TTS API Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    message: "FreeTTS API",
    version: "1.0.0",
    endpoints: {
      "/api/tts": {
        method: "POST",
        description: "Generate TTS configuration",
        parameters: {
          text: "string (required, max 5000 chars)",
          voice: "string (optional)",
          rate: "number (optional, 0.1-2.0)",
          pitch: "number (optional, 0-2.0)",
          volume: "number (optional, 0-1.0)",
        },
      },
      "/api/voices": {
        method: "GET",
        description: "Get available voices (browser-dependent)",
      },
    },
    usage: {
      curl: 'curl -X POST -H "Content-Type: application/json" -d \'{"text":"Hello world"}\' /api/tts',
    },
  })
}
