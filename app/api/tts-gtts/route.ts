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

// WORKING voice mapping - Google TTS only supports these actual language codes
const VOICE_MAPPING = {
  // Microsoft voices mapped to closest Google TTS equivalent
  "microsoft david": "en",
  "microsoft-david": "en",
  david: "en",
  "microsoft mark": "en",
  "microsoft-mark": "en",
  mark: "en",
  "microsoft zira": "en",
  "microsoft-zira": "en",
  zira: "en",

  // UK voices
  "microsoft hazel": "en-gb",
  "microsoft-hazel": "en-gb",
  hazel: "en-gb",
  "microsoft susan": "en-gb",
  "microsoft-susan": "en-gb",
  susan: "en-gb",
  "microsoft george": "en-gb",
  "microsoft-george": "en-gb",
  george: "en-gb",

  // Indian voices
  "microsoft heera": "en-in",
  "microsoft-heera": "en-in",
  heera: "en-in",
  "microsoft ravi": "en-in",
  "microsoft-ravi": "en-in",
  ravi: "en-in",

  // Google voices (these are just language codes)
  "google us english": "en",
  "google-us-english": "en",
  "google us": "en",
  "google uk english female": "en-gb",
  "google-uk-english-female": "en-gb",
  "google uk female": "en-gb",
  "google uk": "en-gb",
  "google hindi": "hi",
  "google हिन्दी": "hi",

  // Standard codes that actually work with Google TTS
  en: "en",
  "en-us": "en",
  "en-gb": "en-gb",
  "en-au": "en-au",
  "en-ca": "en-ca",
  "en-in": "en-in",
  hi: "hi",
  "hi-in": "hi",

  // Generic mappings
  english: "en",
  american: "en",
  british: "en-gb",
  uk: "en-gb",
  australian: "en-au",
  canadian: "en-ca",
  indian: "en-in",
  india: "en-in",
  hindi: "hi",
  female: "en-gb", // UK tends to sound more feminine
  male: "en", // US tends to sound more masculine
  woman: "en-gb",
  man: "en",

  // Other languages that actually work
  es: "es",
  spanish: "es",
  fr: "fr",
  french: "fr",
  de: "de",
  german: "de",
  it: "it",
  italian: "it",
  pt: "pt",
  portuguese: "pt",
  ru: "ru",
  russian: "ru",
  ja: "ja",
  japanese: "ja",
  ko: "ko",
  korean: "ko",
  zh: "zh",
  chinese: "zh",
  ar: "ar",
  arabic: "ar",
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { text, lang = "en", voice = "en", slow = false, speed = 1 } = body
    const sanitizedText = sanitizeTextForTTS(text)

    if (!sanitizedText) {
      return NextResponse.json({ error: "No valid text after sanitization" }, { status: 400 })
    }

    // Determine the voice/language to use
    const voiceKey = voice.toLowerCase().trim()
    const selectedVoice = VOICE_MAPPING[voiceKey] || VOICE_MAPPING[lang.toLowerCase()] || "en"

    console.log(`Voice requested: "${voice}" -> Mapped to: "${selectedVoice}"`)

    // Use Google Translate TTS with the mapped language code
    const audioBuffer = await fetchGoogleTTS(sanitizedText, selectedVoice, slow, speed)

    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Disposition": `attachment; filename="gtts-${voiceKey.replace(/\s+/g, "-")}.mp3"`,
        "Content-Length": audioBuffer.length.toString(),
        "Cache-Control": "no-cache",
        "X-Voice-Requested": voice,
        "X-Voice-Used": selectedVoice,
      },
    })
  } catch (error) {
    console.error("Google TTS error:", error)
    return NextResponse.json(
      {
        error: "TTS failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

async function fetchGoogleTTS(text: string, voice: string, slow: boolean, speed = 1): Promise<Buffer> {
  // Split text into chunks (Google TTS has character limits)
  const chunks = splitTextIntoChunks(text, 200)
  const audioBuffers: Buffer[] = []

  // Calculate speed parameter
  const speedParam = slow ? 0.24 : Math.max(0.1, Math.min(1.0, speed))

  for (const chunk of chunks) {
    try {
      // Use the correct Google Translate TTS URL format
      const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(chunk)}&tl=${voice}&client=tw-ob&ttsspeed=${speedParam}&total=1&idx=0`

      console.log(`Fetching TTS for chunk: "${chunk.substring(0, 50)}..." with voice: ${voice}`)

      const response = await fetch(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          Referer: "https://translate.google.com/",
          Accept: "audio/mpeg, audio/*, */*",
          "Accept-Language": "en-US,en;q=0.9",
          "Accept-Encoding": "identity",
        },
      })

      console.log(`Response status: ${response.status}, Content-Type: ${response.headers.get("content-type")}`)

      if (response.ok) {
        const contentType = response.headers.get("content-type") || ""
        if (contentType.includes("audio") || contentType.includes("mpeg")) {
          const buffer = await response.arrayBuffer()
          if (buffer.byteLength > 100) {
            // Valid audio file
            audioBuffers.push(Buffer.from(buffer))
            console.log(`Successfully got audio chunk: ${buffer.byteLength} bytes`)
          } else {
            console.log(`Audio chunk too small: ${buffer.byteLength} bytes`)
          }
        } else {
          console.log(`Invalid content type: ${contentType}`)
        }
      } else {
        console.log(`HTTP error: ${response.status} ${response.statusText}`)
      }
    } catch (error) {
      console.error("Chunk TTS failed:", error)
    }
  }

  if (audioBuffers.length === 0) {
    throw new Error("Failed to generate any audio - Google TTS may be blocked or rate limited")
  }

  console.log(`Successfully generated ${audioBuffers.length} audio chunks`)

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
    message: "WORKING Google TTS API with Voice Mapping",
    description: "Maps Microsoft/Google voice names to actual Google TTS language codes",
    important_note: "Google TTS only supports language/region codes, not specific voice names",

    working_voices: {
      us_english: {
        codes: ["en", "en-us"],
        mapped_from: ["Microsoft David", "Microsoft Mark", "Microsoft Zira", "Google US English"],
        example: '{"voice": "Microsoft Zira"}' + " -> uses 'en' (US English)",
      },
      uk_english: {
        codes: ["en-gb"],
        mapped_from: ["Microsoft Hazel", "Microsoft Susan", "Microsoft George", "Google UK English Female"],
        example: '{"voice": "Microsoft Hazel"}' + " -> uses 'en-gb' (UK English)",
      },
      indian_english: {
        codes: ["en-in"],
        mapped_from: ["Microsoft Heera", "Microsoft Ravi"],
        example: '{"voice": "Microsoft Heera"}' + " -> uses 'en-in' (Indian English)",
      },
      hindi: {
        codes: ["hi"],
        mapped_from: ["Google हिन्दी", "Google Hindi"],
        example: '{"voice": "Google हिन्दी"}' + " -> uses 'hi' (Hindi)",
      },
    },

    working_examples: {
      microsoft_zira:
        'curl -X POST -H "Content-Type: application/json" -d \'{"text":"Hello, I am Zira","voice":"Microsoft Zira"}\' --output zira.mp3 /api/tts-gtts',
      microsoft_hazel:
        'curl -X POST -H "Content-Type: application/json" -d \'{"text":"Hello, I am Hazel","voice":"Microsoft Hazel"}\' --output hazel.mp3 /api/tts-gtts',
      microsoft_heera:
        'curl -X POST -H "Content-Type: application/json" -d \'{"text":"Hello, I am Heera","voice":"Microsoft Heera"}\' --output heera.mp3 /api/tts-gtts',
      direct_language:
        'curl -X POST -H "Content-Type: application/json" -d \'{"text":"Hello world","voice":"en-gb"}\' --output uk.mp3 /api/tts-gtts',
    },

    n8n_working_config: {
      method: "POST",
      url: "https://your-domain.com/api/tts-gtts",
      body: {
        text: "{{ $json.text }}",
        voice: "Microsoft Zira", // Will map to 'en'
        speed: 0.9,
      },
      note: "Set Response Format to 'File' in n8n HTTP Request node",
    },

    troubleshooting: {
      if_no_audio: "Google TTS may be rate limited - try again in a few minutes",
      if_error: "Check the response headers X-Voice-Requested and X-Voice-Used",
      alternative: "Use /api/tts-real-voice for more reliable TTS services",
    },
  })
}
