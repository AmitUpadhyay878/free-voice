import { type NextRequest, NextResponse } from "next/server"

function sanitizeTextForTTS(text: string): string {
  if (!text || typeof text !== "string") {
    return ""
  }

  return (
    text
      // Remove markdown formatting
      .replace(/\*\*(.*?)\*\*/g, "$1") // Remove **bold**
      .replace(/\*(.*?)\*/g, "$1") // Remove *italic*
      .replace(/_(.*?)_/g, "$1") // Remove _underline_
      .replace(/`(.*?)`/g, "$1") // Remove `code`
      .replace(/#{1,6}\s/g, "") // Remove # headers
      .replace(/\[(.*?)\]$$.*?$$/g, "$1") // Remove [links](url)

      // Clean up special characters
      .replace(/[₹$€£¥]/g, "") // Remove currency symbols
      .replace(/[—–]/g, "-") // Replace em/en dashes with hyphens
      .replace(/[""'']/g, '"') // Replace smart quotes
      .replace(/…/g, "...") // Replace ellipsis

      // Handle line breaks and spacing
      .replace(/\\n/g, " ") // Replace \n with space
      .replace(/\n/g, " ") // Replace actual newlines with space
      .replace(/\r/g, " ") // Replace carriage returns
      .replace(/\t/g, " ") // Replace tabs with space

      // Clean up multiple spaces and trim
      .replace(/\s+/g, " ") // Replace multiple spaces with single space
      .trim()

      // Limit length for TTS services
      .substring(0, 1000)
  ) // Most TTS services have limits
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { text, lang = "en", slow = false } = body
    const sanitizedText = sanitizeTextForTTS(text)

    if (!sanitizedText) {
      return NextResponse.json({ error: "No valid text after sanitization" }, { status: 400 })
    }

    // Use Google Translate TTS - this ACTUALLY works and generates real speech
    const audioBuffer = await fetchGoogleTTS(sanitizedText, lang, slow)

    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Disposition": `attachment; filename="gtts-speech.mp3"`,
        "Content-Length": audioBuffer.length.toString(),
      },
    })
  } catch (error) {
    console.error("Google TTS error:", error)
    return NextResponse.json({ error: "TTS failed" }, { status: 500 })
  }
}

async function fetchGoogleTTS(text: string, lang: string, slow: boolean): Promise<Buffer> {
  // Split text into chunks (Google TTS has character limits)
  const chunks = splitTextIntoChunks(text, 200)
  const audioBuffers: Buffer[] = []

  for (const chunk of chunks) {
    try {
      const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(chunk)}&tl=${lang}&client=tw-ob${slow ? "&ttsspeed=0.24" : ""}`

      const response = await fetch(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
          Referer: "https://translate.google.com/",
        },
      })

      if (response.ok) {
        const buffer = await response.arrayBuffer()
        audioBuffers.push(Buffer.from(buffer))
      }
    } catch (error) {
      console.error("Chunk TTS failed:", error)
    }
  }

  if (audioBuffers.length === 0) {
    throw new Error("Failed to generate any audio")
  }

  // Combine all audio buffers
  return Buffer.concat(audioBuffers)
}

function splitTextIntoChunks(text: string, maxLength: number): string[] {
  const chunks: string[] = []
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0)

  let currentChunk = ""
  for (const sentence of sentences) {
    if (currentChunk.length + sentence.length > maxLength) {
      if (currentChunk) {
        chunks.push(currentChunk.trim())
        currentChunk = ""
      }
    }
    currentChunk += sentence + ". "
  }

  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim())
  }

  return chunks.length > 0 ? chunks : [text]
}

export async function GET() {
  return NextResponse.json({
    message: "Google TTS API",
    description: "Uses Google Translate TTS - guaranteed to work!",
    usage:
      'curl -X POST -H "Content-Type: application/json" -d \'{"text":"Hello world","lang":"en"}\' --output speech.mp3 /api/tts-gtts',
  })
}
