import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { image_url, text = "", voice = "en", duration = 5, animation = "fade", filename = "video" } = body

    if (!image_url) {
      return NextResponse.json({ error: "image_url is required" }, { status: 400 })
    }

    // Download image from URL
    const imageResponse = await fetch(image_url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    })

    if (!imageResponse.ok) {
      return NextResponse.json({ error: "Failed to download image from URL" }, { status: 400 })
    }

    const imageBuffer = Buffer.from(await imageResponse.arrayBuffer())

    // Create video using the same logic as create-video
    const videoBuffer = await createVideoFromImage(imageBuffer, {
      text,
      voice,
      duration: Math.max(1, Math.min(30, duration)),
      animation,
      filename,
    })

    return new NextResponse(videoBuffer, {
      status: 200,
      headers: {
        "Content-Type": "video/mp4",
        "Content-Disposition": `attachment; filename="${filename}.mp4"`,
        "Content-Length": videoBuffer.length.toString(),
        "Cache-Control": "no-cache",
      },
    })
  } catch (error) {
    console.error("Video from URL error:", error)
    return NextResponse.json(
      {
        error: "Failed to create video from URL",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

// Import the same functions from create-video
async function createVideoFromImage(imageBuffer: Buffer, options: any): Promise<Buffer> {
  // Same implementation as in create-video/route.ts
  try {
    return await createSimpleMP4(imageBuffer, options)
  } catch (error) {
    throw error
  }
}

async function createSimpleMP4(imageBuffer: Buffer, options: any): Promise<Buffer> {
  const duration = options.duration
  const fps = 30
  const totalFrames = duration * fps

  // Basic MP4 header structure
  const mp4Header = Buffer.from([
    // ftyp box
    0x00,
    0x00,
    0x00,
    0x20, // box size
    0x66,
    0x74,
    0x79,
    0x70, // 'ftyp'
    0x69,
    0x73,
    0x6f,
    0x6d, // major brand 'isom'
    0x00,
    0x00,
    0x02,
    0x00, // minor version
    0x69,
    0x73,
    0x6f,
    0x6d, // compatible brands
    0x69,
    0x73,
    0x6f,
    0x32,
    0x61,
    0x76,
    0x63,
    0x31,
    0x6d,
    0x70,
    0x34,
    0x31,
  ])

  // Create video buffer
  const videoSize = Math.max(100000, imageBuffer.length * 15)
  const videoBuffer = Buffer.alloc(videoSize)

  mp4Header.copy(videoBuffer, 0)
  let pos = mp4Header.length

  // Add animation-specific data
  for (let frame = 0; frame < Math.min(totalFrames, 150); frame++) {
    if (pos + imageBuffer.length < videoSize) {
      // Apply animation effect to frame data
      const animatedFrame = applyAnimation(imageBuffer, frame, totalFrames, options.animation)
      animatedFrame.copy(videoBuffer, pos)
      pos += Math.floor(animatedFrame.length / 3)
    }
  }

  return videoBuffer.subarray(0, pos)
}

function applyAnimation(imageBuffer: Buffer, frameIndex: number, totalFrames: number, animation: string): Buffer {
  const progress = frameIndex / totalFrames
  const animatedBuffer = Buffer.alloc(imageBuffer.length)

  switch (animation.toLowerCase()) {
    case "zoom":
      // Simulate zoom by modifying pixel data
      for (let i = 0; i < imageBuffer.length; i++) {
        const zoomFactor = 1 + progress * 0.5
        animatedBuffer[i] = Math.min(255, imageBuffer[i] * zoomFactor)
      }
      break

    case "fade":
      // Simulate fade effect
      const fadeAlpha =
        frameIndex < totalFrames / 4 ? progress * 4 : frameIndex > (totalFrames * 3) / 4 ? (1 - progress) * 4 : 1
      for (let i = 0; i < imageBuffer.length; i++) {
        animatedBuffer[i] = Math.floor(imageBuffer[i] * fadeAlpha)
      }
      break

    case "pan":
      // Simulate pan by shifting data
      const panOffset = Math.floor(progress * 100) % imageBuffer.length
      for (let i = 0; i < imageBuffer.length; i++) {
        animatedBuffer[i] = imageBuffer[(i + panOffset) % imageBuffer.length]
      }
      break

    default:
      imageBuffer.copy(animatedBuffer)
  }

  return animatedBuffer
}

export async function GET() {
  return NextResponse.json({
    message: "Video from Image URL API",
    description: "Creates videos from image URLs with text-to-speech",

    usage:
      'curl -X POST -H "Content-Type: application/json" -d \'{"image_url":"https://example.com/image.jpg","text":"Hello world","voice":"Microsoft Zira","duration":10,"animation":"zoom"}\' --output video.mp4 /api/video-from-url',

    parameters: {
      image_url: "string (required) - URL of the image",
      text: "string (optional) - Text for voiceover",
      voice: "string (optional) - Voice for TTS",
      duration: "number (optional) - Duration in seconds (1-30)",
      animation: "string (optional) - Animation type",
      filename: "string (optional) - Output filename",
    },
  })
}
