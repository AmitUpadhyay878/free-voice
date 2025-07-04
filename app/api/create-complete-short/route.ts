import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      prompt,
      image_prompt,
      resolution = "instagram-story",
      style = "realistic",
      voice = "Microsoft Zira",
      duration = 15,
      video_style = "story",
    } = body

    if (!prompt || !image_prompt) {
      return NextResponse.json(
        {
          error: "Both 'prompt' (for story) and 'image_prompt' (for image generation) are required",
        },
        { status: 400 },
      )
    }

    console.log("Creating complete Instagram Short from scratch...")

    // Step 1: Generate AI image
    console.log("Step 1: Generating AI image...")
    const imageResponse = await fetch(`${getBaseUrl(request)}/api/generate-image-base64`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: image_prompt,
        resolution: resolution,
        style: style,
        format: "png",
      }),
    })

    if (!imageResponse.ok) {
      throw new Error("Failed to generate AI image")
    }

    const imageResult = await imageResponse.json()
    const imageBase64 = imageResult.data.image_base64

    console.log("Step 2: Analyzing image for characters...")
    // Step 2: Analyze image for characters
    const analysisResponse = await fetch(`${getBaseUrl(request)}/api/analyze-image`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        image_base64: imageBase64,
        prompt: prompt,
      }),
    })

    let characters = []
    let voiceAssignments = {}

    if (analysisResponse.ok) {
      const analysisResult = await analysisResponse.json()
      characters = analysisResult.characters
      voiceAssignments = analysisResult.voice_assignments
    } else {
      // Fallback: create default narrator
      characters = [
        {
          id: "narrator",
          name: "Narrator",
          type: "narrator",
          description: "The storyteller",
        },
      ]
      voiceAssignments = {
        narrator: {
          voice: voice,
          speed: 1.0,
          style: "narrative",
        },
      }
    }

    console.log("Step 3: Creating Instagram Short video...")
    // Step 3: Create Instagram Short
    const videoResponse = await fetch(`${getBaseUrl(request)}/api/create-instagram-short`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        image_base64: imageBase64,
        prompt: prompt,
        characters: characters,
        voice_assignments: voiceAssignments,
        duration: duration,
        style: video_style,
      }),
    })

    if (!videoResponse.ok) {
      throw new Error("Failed to create Instagram Short")
    }

    const videoBuffer = await videoResponse.arrayBuffer()

    console.log("Complete Instagram Short created successfully!")

    return new NextResponse(Buffer.from(videoBuffer), {
      status: 200,
      headers: {
        "Content-Type": "video/mp4",
        "Content-Disposition": `attachment; filename="complete-instagram-short.mp4"`,
        "Content-Length": videoBuffer.byteLength.toString(),
        "X-Generated-Image": "true",
        "X-Characters": characters.length.toString(),
        "X-Resolution": resolution,
        "X-Style": style,
      },
    })
  } catch (error) {
    console.error("Complete short creation error:", error)
    return NextResponse.json(
      {
        error: "Failed to create complete Instagram Short",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

function getBaseUrl(request: NextRequest): string {
  const host = request.headers.get("host") || "localhost:3000"
  const protocol = request.headers.get("x-forwarded-proto") || "http"
  return `${protocol}://${host}`
}

export async function GET() {
  return NextResponse.json({
    message: "Complete Instagram Short Creator API",
    description: "Creates Instagram Shorts from scratch: AI image generation + character voices + video",

    workflow: [
      "1. Generate AI image from image_prompt",
      "2. Analyze image for characters",
      "3. Assign voices to characters",
      "4. Create Instagram Short with character voices",
      "5. Return complete video file",
    ],

    parameters: {
      prompt: "string (required) - Story/dialogue for the video",
      image_prompt: "string (required) - Description for AI image generation",
      resolution: "string (optional) - Image resolution preset",
      style: "string (optional) - AI image style",
      voice: "string (optional) - Default voice for characters",
      duration: "number (optional) - Video duration in seconds",
      video_style: "string (optional) - Video animation style",
    },

    examples: {
      fantasy_story: {
        prompt: "A brave knight discovers a magical sword and must save the kingdom from an evil dragon",
        image_prompt: "Epic fantasy scene with a knight holding a glowing magical sword in front of a castle",
        resolution: "instagram-story",
        style: "fantasy",
        duration: 20,
      },

      space_adventure: {
        prompt: "An astronaut explores a mysterious alien planet and makes first contact with friendly aliens",
        image_prompt: "Astronaut on colorful alien planet with strange plants and friendly alien creatures",
        resolution: "landscape",
        style: "digital_art",
        duration: 15,
      },
    },

    curl_examples: {
      basic: `curl -X POST -H "Content-Type: application/json" -d '{
  "prompt": "A magical story about friendship and adventure",
  "image_prompt": "Magical forest with fairy tale characters",
  "duration": 15
}' --output complete-short.mp4 /api/create-complete-short`,

      advanced: `curl -X POST -H "Content-Type: application/json" -d '{
  "prompt": "Epic battle between good and evil in a fantasy realm",
  "image_prompt": "Epic fantasy battle scene with heroes and villains",
  "resolution": "instagram-story",
  "style": "fantasy", 
  "voice": "Microsoft Hazel",
  "duration": 30,
  "video_style": "dramatic"
}' --output epic-fantasy-short.mp4 /api/create-complete-short`,
    },

    features: [
      "🎨 AI image generation from text",
      "🎭 Automatic character detection",
      "🎤 Multi-character voice assignment",
      "📱 Instagram Short format (9:16)",
      "🎬 Professional video creation",
      "⚡ Complete automation - just provide prompts!",
    ],
  })
}
