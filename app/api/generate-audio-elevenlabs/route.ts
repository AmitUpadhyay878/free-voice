import { type NextRequest, NextResponse } from "next/server"

// This endpoint mimics ElevenLabs API but uses free alternatives
// You can integrate with actual ElevenLabs API if you have credits

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { text, voice_id, model_id = "eleven_monolingual_v1", voice_settings } = body

    // Validate required fields
    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Text is required and must be a string" }, { status: 400 })
    }

    if (text.length > 5000) {
      return NextResponse.json({ error: "Text must be less than 5000 characters" }, { status: 400 })
    }

    // ElevenLabs-style API call (replace with actual ElevenLabs endpoint if you have API key)
    const elevenLabsResponse = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice_id || "default"}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": process.env.ELEVENLABS_API_KEY || "demo-key", // Add your ElevenLabs API key
      },
      body: JSON.stringify({
        text: text,
        model_id: model_id,
        voice_settings: voice_settings || {
          stability: 0.5,
          similarity_boost: 0.5,
        },
      }),
    })

    if (!elevenLabsResponse.ok) {
      // Fallback to free alternative if ElevenLabs fails
      return await generateFreeAlternative(text)
    }

    const audioBuffer = await elevenLabsResponse.arrayBuffer()

    // Return binary audio data
    return new NextResponse(Buffer.from(audioBuffer), {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Disposition": 'attachment; filename="elevenlabs-audio.mp3"',
        "Content-Length": audioBuffer.byteLength.toString(),
      },
    })
  } catch (error) {
    console.error("ElevenLabs TTS Error:", error)
    // Fallback to free alternative
    return await generateFreeAlternative(request.body?.text || "Hello")
  }
}

async function generateFreeAlternative(text: string) {
  // Use a free TTS service as fallback
  try {
    // Example using ResponsiveVoice API (free tier available)
    const freeResponse = await fetch("https://responsivevoice.org/responsivevoice/getvoice.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        t: text,
        tl: "en",
        sv: "g1",
        vn: "US English Female",
        pitch: "0.5",
        rate: "0.5",
        vol: "1",
      }),
    })

    if (freeResponse.ok) {
      const audioBuffer = await freeResponse.arrayBuffer()
      return new NextResponse(Buffer.from(audioBuffer), {
        status: 200,
        headers: {
          "Content-Type": "audio/mpeg",
          "Content-Disposition": 'attachment; filename="free-tts-audio.mp3"',
        },
      })
    }
  } catch (error) {
    console.error("Free TTS fallback failed:", error)
  }

  // Final fallback - return error
  return NextResponse.json(
    {
      error: "All TTS services unavailable",
      suggestion: "Please try again later or use the web interface",
    },
    { status: 503 },
  )
}
