import { NextResponse } from "next/server"

export async function GET() {
  // Since voices are browser-dependent, we return common voice patterns
  const commonVoices = [
    {
      name: "Google US English",
      lang: "en-US",
      gender: "female",
      description: "Standard US English voice",
    },
    {
      name: "Google UK English Male",
      lang: "en-GB",
      gender: "male",
      description: "British English male voice",
    },
    {
      name: "Microsoft Zira",
      lang: "en-US",
      gender: "female",
      description: "Microsoft English voice",
    },
    {
      name: "Microsoft David",
      lang: "en-US",
      gender: "male",
      description: "Microsoft English male voice",
    },
  ]

  return NextResponse.json({
    success: true,
    message: "Available voices (browser-dependent)",
    data: {
      voices: commonVoices,
      note: "Actual available voices depend on the user's browser and system. Use the web interface to see real-time available voices.",
      totalCount: commonVoices.length,
    },
    instructions: {
      webInterface: "Visit the main page to see actual available voices in your browser",
      apiUsage: "Use voice names in the /api/tts endpoint",
    },
  })
}
