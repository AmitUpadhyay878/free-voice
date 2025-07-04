import { type NextRequest, NextResponse } from "next/server"
import { exec } from "child_process"

export async function POST(request: NextRequest) {
  try {
    console.log("Attempting to install FFmpeg...")

    // Try to install FFmpeg
    const installCommand = "apt-get update && apt-get install -y ffmpeg"

    return new Promise((resolve) => {
      exec(installCommand, (error, stdout, stderr) => {
        if (error) {
          console.error("FFmpeg installation failed:", error)
          resolve(
            NextResponse.json({
              success: false,
              error: "Failed to install FFmpeg",
              details: error.message,
              stdout,
              stderr,
            }),
          )
        } else {
          console.log("FFmpeg installation successful")
          resolve(
            NextResponse.json({
              success: true,
              message: "FFmpeg installed successfully",
              stdout,
              stderr,
            }),
          )
        }
      })
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: "Installation failed",
      details: error instanceof Error ? error.message : "Unknown error",
    })
  }
}

export async function GET() {
  try {
    // Check if FFmpeg is available
    return new Promise((resolve) => {
      exec("ffmpeg -version", (error, stdout, stderr) => {
        if (error) {
          resolve(
            NextResponse.json({
              available: false,
              error: "FFmpeg not found",
              install_commands: {
                ubuntu: "sudo apt-get install ffmpeg",
                macos: "brew install ffmpeg",
                windows: "Download from https://ffmpeg.org/download.html",
              },
            }),
          )
        } else {
          const version = stdout.split("\n")[0]
          resolve(
            NextResponse.json({
              available: true,
              version: version,
              message: "FFmpeg is available and ready for video generation",
            }),
          )
        }
      })
    })
  } catch (error) {
    return NextResponse.json({
      available: false,
      error: "Failed to check FFmpeg",
      details: error instanceof Error ? error.message : "Unknown error",
    })
  }
}
