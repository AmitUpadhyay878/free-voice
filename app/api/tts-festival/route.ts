import { type NextRequest, NextResponse } from "next/server"
import { exec } from "child_process"
import { writeFileSync, readFileSync, unlinkSync } from "fs"
import { join } from "path"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { text } = body

    if (!text) {
      return NextResponse.json({ error: "Text required" }, { status: 400 })
    }

    // Try Festival TTS (if available) or use Python gTTS
    const audioBuffer = await generateWithSystemTTS(text)

    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        "Content-Type": "audio/wav",
        "Content-Disposition": `attachment; filename="festival-speech.wav"`,
        "Content-Length": audioBuffer.length.toString(),
      },
    })
  } catch (error) {
    console.error("System TTS error:", error)
    return NextResponse.json({ error: "System TTS failed" }, { status: 500 })
  }
}

async function generateWithSystemTTS(text: string): Promise<Buffer> {
  const tempDir = "/tmp"
  const textFile = join(tempDir, `tts-${Date.now()}.txt`)
  const audioFile = join(tempDir, `tts-${Date.now()}.wav`)

  try {
    // Write text to file
    writeFileSync(textFile, text)

    // Try different TTS systems
    const commands = [
      // Festival TTS
      `echo "${text}" | festival --tts --otype wav > ${audioFile}`,
      // eSpeak
      `espeak -w ${audioFile} "${text}"`,
      // Python gTTS
      `python3 -c "
import gtts
import io
tts = gtts.gTTS('${text}', lang='en')
tts.save('${audioFile}')
"`,
      // macOS say command
      `say -o ${audioFile} "${text}"`,
    ]

    for (const command of commands) {
      try {
        await execCommand(command)
        if (require("fs").existsSync(audioFile)) {
          const buffer = readFileSync(audioFile)
          // Clean up
          try {
            unlinkSync(textFile)
            unlinkSync(audioFile)
          } catch {}
          return buffer
        }
      } catch (error) {
        console.log(`Command failed: ${command}`)
      }
    }

    throw new Error("No TTS system available")
  } catch (error) {
    // Clean up on error
    try {
      unlinkSync(textFile)
      unlinkSync(audioFile)
    } catch {}
    throw error
  }
}

function execCommand(command: string): Promise<void> {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(error)
      } else {
        resolve()
      }
    })
  })
}

export async function GET() {
  return NextResponse.json({
    message: "System TTS API",
    description: "Uses system TTS tools like Festival, eSpeak, or Python gTTS",
    usage:
      'curl -X POST -H "Content-Type: application/json" -d \'{"text":"Hello world"}\' --output speech.wav /api/tts-festival',
  })
}
