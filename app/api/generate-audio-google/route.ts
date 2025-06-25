import { type NextRequest, NextResponse } from "next/server"

// This endpoint uses Google Cloud Text-to-Speech API
// You'll need to set up Google Cloud TTS and add your credentials

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { text, voice, rate = 1, pitch = 1, volume = 1, format = "mp3" } = body

    // Validate required fields
    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Text is required and must be a string" }, { status: 400 })
    }

    if (text.length > 5000) {
      return NextResponse.json({ error: "Text must be less than 5000 characters" }, { status: 400 })
    }

    // Google Cloud TTS API call
    const googleTTSResponse = await fetch("https://texttospeech.googleapis.com/v1/text:synthesize", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GOOGLE_CLOUD_API_KEY}`, // Add your Google Cloud API key
      },
      body: JSON.stringify({
        input: { text: text },
        voice: {
          languageCode: "en-US",
          name: voice || "en-US-Standard-A",
          ssmlGender: "NEUTRAL",
        },
        audioConfig: {
          audioEncoding: format.toUpperCase() === "WAV" ? "LINEAR16" : "MP3",
          speakingRate: rate,
          pitch: pitch,
          volumeGainDb: (volume - 1) * 20, // Convert to dB
        },
      }),
    })

    if (!googleTTSResponse.ok) {
      throw new Error(`Google TTS API error: ${googleTTSResponse.statusText}`)
    }

    const ttsResult = await googleTTSResponse.json()
    const audioBuffer = Buffer.from(ttsResult.audioContent, "base64")

    // Return binary audio data
    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        "Content-Type": format === "wav" ? "audio/wav" : "audio/mpeg",
        "Content-Disposition": `attachment; filename="tts-audio.${format}"`,
        "Content-Length": audioBuffer.length.toString(),
      },
    })
  } catch (error) {
    console.error("Google TTS Error:", error)
    return NextResponse.json(
      {
        error: "Failed to generate audio with Google TTS",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
