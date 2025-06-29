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

// Enhanced voice mapping with Microsoft and Google voices
const VOICE_MAPPING = {
  // Microsoft Voices - US English
  "microsoft david": "en",
  "microsoft-david": "en",
  david: "en",
  "microsoft mark": "en",
  "microsoft-mark": "en",
  mark: "en",
  "microsoft zira": "en",
  "microsoft-zira": "en",
  zira: "en",

  // Microsoft Voices - UK English
  "microsoft hazel": "en-gb",
  "microsoft-hazel": "en-gb",
  hazel: "en-gb",
  "microsoft susan": "en-gb",
  "microsoft-susan": "en-gb",
  susan: "en-gb",
  "microsoft george": "en-gb",
  "microsoft-george": "en-gb",
  george: "en-gb",

  // Microsoft Voices - Indian English
  "microsoft heera": "en-in",
  "microsoft-heera": "en-in",
  heera: "en-in",
  "microsoft ravi": "en-in",
  "microsoft-ravi": "en-in",
  ravi: "en-in",

  // Google Voices
  "google us english": "en",
  "google-us-english": "en",
  "google us": "en",
  "google uk english female": "en-gb",
  "google-uk-english-female": "en-gb",
  "google uk female": "en-gb",
  "google uk": "en-gb",
  "google hindi": "hi",
  "google हिन्दी": "hi",

  // Standard language codes
  "en-us": "en",
  "en-gb": "en-gb",
  "en-in": "en-in",
  "hi-in": "hi",
  hi: "hi",

  // Generic voice types
  en: "en",
  english: "en",
  american: "en",
  british: "en-gb",
  uk: "en-gb",
  indian: "en-in",
  india: "en-in",
  hindi: "hi",

  // Gender-based (mapped to different accents)
  female: "en-gb", // UK female
  male: "en", // US male
  woman: "en-gb",
  man: "en",

  // Other languages
  es: "es",
  fr: "fr",
  de: "de",
  it: "it",
  pt: "pt",
  ru: "ru",
  ja: "ja",
  ko: "ko",
  zh: "zh",
  ar: "ar",
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

    // Use Google Translate TTS with voice selection
    const audioBuffer = await fetchGoogleTTS(sanitizedText, selectedVoice, slow, speed)

    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Disposition": `attachment; filename="gtts-${voiceKey.replace(/\s+/g, "-")}.mp3"`,
        "Content-Length": audioBuffer.length.toString(),
        "Cache-Control": "no-cache",
      },
    })
  } catch (error) {
    console.error("Google TTS error:", error)
    return NextResponse.json({ error: "TTS failed" }, { status: 500 })
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
      const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(chunk)}&tl=${voice}&client=tw-ob&ttsspeed=${speedParam}`

      const response = await fetch(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
          Referer: "https://translate.google.com/",
          Accept: "audio/mpeg, audio/*, */*",
          "Accept-Language": "en-US,en;q=0.9",
        },
      })

      if (response.ok && response.headers.get("content-type")?.includes("audio")) {
        const buffer = await response.arrayBuffer()
        if (buffer.byteLength > 100) {
          // Valid audio file
          audioBuffers.push(Buffer.from(buffer))
        }
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
    message: "Google TTS API with Microsoft & Google Voice Selection",
    description: "Uses Google Translate TTS with Microsoft and Google voice mapping",
    microsoft_voices: {
      us_english: {
        "Microsoft David": "david",
        "Microsoft Mark": "mark",
        "Microsoft Zira": "zira",
      },
      uk_english: {
        "Microsoft Hazel": "hazel",
        "Microsoft Susan": "susan",
        "Microsoft George": "george",
      },
      indian_english: {
        "Microsoft Heera": "heera",
        "Microsoft Ravi": "ravi",
      },
    },
    google_voices: {
      "Google US English": "google us english",
      "Google UK English Female": "google uk english female",
      "Google हिन्दी": "google hindi",
    },
    voice_parameters: {
      text: "string (required) - Text to convert to speech",
      voice: "string (optional) - Voice name (see examples below)",
      lang: "string (optional) - Language code fallback",
      slow: "boolean (optional) - Slow speech mode",
      speed: "number (optional) - Speech speed 0.1-1.0",
    },
    examples: {
      microsoft_david:
        'curl -X POST -H "Content-Type: application/json" -d \'{"text":"Hello, I am David","voice":"Microsoft David"}\' --output david.mp3 /api/tts-gtts',
      microsoft_hazel:
        'curl -X POST -H "Content-Type: application/json" -d \'{"text":"Hello, I am Hazel","voice":"Microsoft Hazel"}\' --output hazel.mp3 /api/tts-gtts',
      microsoft_heera:
        'curl -X POST -H "Content-Type: application/json" -d \'{"text":"Hello, I am Heera","voice":"Microsoft Heera"}\' --output heera.mp3 /api/tts-gtts',
      google_us:
        'curl -X POST -H "Content-Type: application/json" -d \'{"text":"Hello from Google US","voice":"Google US English"}\' --output google-us.mp3 /api/tts-gtts',
      google_uk_female:
        'curl -X POST -H "Content-Type: application/json" -d \'{"text":"Hello from Google UK","voice":"Google UK English Female"}\' --output google-uk.mp3 /api/tts-gtts',
      google_hindi:
        'curl -X POST -H "Content-Type: application/json" -d \'{"text":"नमस्ते","voice":"Google हिन्दी"}\' --output hindi.mp3 /api/tts-gtts',
    },
    n8n_examples: {
      microsoft_zira: {
        method: "POST",
        url: "https://your-domain.com/api/tts-gtts",
        body: {
          text: "{{ $json.text }}",
          voice: "Microsoft Zira",
          speed: 0.9,
        },
      },
      google_uk_female: {
        method: "POST",
        url: "https://your-domain.com/api/tts-gtts",
        body: {
          text: "{{ $json.text }}",
          voice: "Google UK English Female",
          slow: false,
        },
      },
      microsoft_ravi: {
        method: "POST",
        url: "https://your-domain.com/api/tts-gtts",
        body: {
          text: "{{ $json.text }}",
          voice: "Microsoft Ravi",
          speed: 1.0,
        },
      },
    },
  })
}
