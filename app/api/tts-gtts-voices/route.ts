import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({
    message: "Complete Voice List for Google TTS API",
    microsoft_voices: {
      us_english: [
        {
          name: "Microsoft David - English (United States)",
          code: "Microsoft David",
          short: "david",
          language: "en-US",
          gender: "Male",
        },
        {
          name: "Microsoft Mark - English (United States)",
          code: "Microsoft Mark",
          short: "mark",
          language: "en-US",
          gender: "Male",
        },
        {
          name: "Microsoft Zira - English (United States)",
          code: "Microsoft Zira",
          short: "zira",
          language: "en-US",
          gender: "Female",
        },
      ],
      uk_english: [
        {
          name: "Microsoft Hazel - English (United Kingdom)",
          code: "Microsoft Hazel",
          short: "hazel",
          language: "en-GB",
          gender: "Female",
        },
        {
          name: "Microsoft Susan - English (United Kingdom)",
          code: "Microsoft Susan",
          short: "susan",
          language: "en-GB",
          gender: "Female",
        },
        {
          name: "Microsoft George - English (United Kingdom)",
          code: "Microsoft George",
          short: "george",
          language: "en-GB",
          gender: "Male",
        },
      ],
      indian_english: [
        {
          name: "Microsoft Heera - English (India)",
          code: "Microsoft Heera",
          short: "heera",
          language: "en-IN",
          gender: "Female",
        },
        {
          name: "Microsoft Ravi - English (India)",
          code: "Microsoft Ravi",
          short: "ravi",
          language: "en-IN",
          gender: "Male",
        },
      ],
    },
    google_voices: [
      {
        name: "Google US English",
        code: "Google US English",
        short: "google us",
        language: "en-US",
        gender: "Neutral",
      },
      {
        name: "Google UK English Female",
        code: "Google UK English Female",
        short: "google uk female",
        language: "en-GB",
        gender: "Female",
      },
      {
        name: "Google हिन्दी",
        code: "Google हिन्दी",
        short: "google hindi",
        language: "hi-IN",
        gender: "Neutral",
      },
    ],
    usage_guide: {
      full_name: 'Use full name: {"voice": "Microsoft David"}',
      short_name: 'Use short name: {"voice": "david"}',
      case_insensitive: "Voice names are case-insensitive",
      with_hyphens: 'Also works: {"voice": "microsoft-david"}',
    },
    curl_examples: {
      microsoft_voices: {
        david:
          'curl -X POST -H "Content-Type: application/json" -d \'{"text":"Hello, I am Microsoft David","voice":"Microsoft David"}\' --output david.mp3 /api/tts-gtts',
        hazel:
          'curl -X POST -H "Content-Type: application/json" -d \'{"text":"Hello, I am Microsoft Hazel","voice":"Microsoft Hazel"}\' --output hazel.mp3 /api/tts-gtts',
        heera:
          'curl -X POST -H "Content-Type: application/json" -d \'{"text":"Hello, I am Microsoft Heera","voice":"Microsoft Heera"}\' --output heera.mp3 /api/tts-gtts',
        susan:
          'curl -X POST -H "Content-Type: application/json" -d \'{"text":"Hello, I am Microsoft Susan","voice":"susan"}\' --output susan.mp3 /api/tts-gtts',
        ravi: 'curl -X POST -H "Content-Type: application/json" -d \'{"text":"Hello, I am Microsoft Ravi","voice":"ravi"}\' --output ravi.mp3 /api/tts-gtts',
        george:
          'curl -X POST -H "Content-Type: application/json" -d \'{"text":"Hello, I am Microsoft George","voice":"george"}\' --output george.mp3 /api/tts-gtts',
        mark: 'curl -X POST -H "Content-Type: application/json" -d \'{"text":"Hello, I am Microsoft Mark","voice":"mark"}\' --output mark.mp3 /api/tts-gtts',
        zira: 'curl -X POST -H "Content-Type: application/json" -d \'{"text":"Hello, I am Microsoft Zira","voice":"zira"}\' --output zira.mp3 /api/tts-gtts',
      },
      google_voices: {
        us_english:
          'curl -X POST -H "Content-Type: application/json" -d \'{"text":"Hello from Google US","voice":"Google US English"}\' --output google-us.mp3 /api/tts-gtts',
        uk_female:
          'curl -X POST -H "Content-Type: application/json" -d \'{"text":"Hello from Google UK","voice":"Google UK English Female"}\' --output google-uk.mp3 /api/tts-gtts',
        hindi:
          'curl -X POST -H "Content-Type: application/json" -d \'{"text":"नमस्ते, मैं गूगल हिंदी हूं","voice":"Google हिन्दी"}\' --output hindi.mp3 /api/tts-gtts',
      },
    },
    n8n_configurations: {
      veronica_personality: {
        description: "Perfect for AI personality like Veronica",
        config: {
          method: "POST",
          url: "https://your-domain.com/api/tts-gtts",
          body: {
            text: "{{ $json.text }}",
            voice: "Microsoft Zira", // Female US voice
            speed: 0.9,
          },
        },
      },
      british_character: {
        description: "For British AI characters",
        config: {
          method: "POST",
          url: "https://your-domain.com/api/tts-gtts",
          body: {
            text: "{{ $json.text }}",
            voice: "Microsoft Hazel", // Female UK voice
            speed: 1.0,
          },
        },
      },
      indian_assistant: {
        description: "For Indian English AI assistant",
        config: {
          method: "POST",
          url: "https://your-domain.com/api/tts-gtts",
          body: {
            text: "{{ $json.text }}",
            voice: "Microsoft Heera", // Female Indian voice
            speed: 0.8,
          },
        },
      },
    },
  })
}
