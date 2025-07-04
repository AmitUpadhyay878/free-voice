"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Upload, Settings, Copy, Film, ImageIcon, Monitor } from "lucide-react"
import { toast } from "@/hooks/use-toast"

export default function VideoCreator() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>("")
  const [text, setText] = useState("This video will play in Windows Media Player!")
  const [voice, setVoice] = useState("Microsoft Zira")
  const [duration, setDuration] = useState([8])
  const [animation, setAnimation] = useState("zoom")
  const [filename, setFilename] = useState("windows-compatible-video")
  const [isGenerating, setIsGenerating] = useState(false)
  const [ffmpegStatus, setFFmpegStatus] = useState<"checking" | "available" | "unavailable">("checking")

  useEffect(() => {
    checkFFmpeg()
  }, [])

  const checkFFmpeg = async () => {
    try {
      const response = await fetch("/api/install-ffmpeg")
      const data = await response.json()
      setFFmpegStatus(data.available ? "available" : "unavailable")
    } catch (error) {
      setFFmpegStatus("unavailable")
    }
  }

  const installFFmpeg = async () => {
    try {
      toast({
        title: "Installing FFmpeg...",
        description: "This will enable Windows Media Player compatibility",
      })

      const response = await fetch("/api/install-ffmpeg", { method: "POST" })
      const data = await response.json()

      if (data.success) {
        setFFmpegStatus("available")
        toast({
          title: "FFmpeg Installed!",
          description: "Now generating Windows Media Player compatible videos",
        })
      } else {
        toast({
          title: "Installation Failed",
          description: data.error || "Could not install FFmpeg",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Installation Error",
        description: "Failed to install FFmpeg",
        variant: "destructive",
      })
    }
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedImage(file)
      setFilename(file.name.split(".")[0] + "-windows-compatible")

      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const generateVideo = async () => {
    if (!selectedImage) {
      toast({
        title: "No image selected",
        description: "Please select an image first.",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)

    try {
      console.log("Generating Windows Media Player compatible video...")

      const formData = new FormData()
      formData.append("image", selectedImage)
      formData.append("text", text)
      formData.append("voice", voice)
      formData.append("duration", duration[0].toString())
      formData.append("animation", animation)
      formData.append("filename", filename)

      const response = await fetch("/api/create-video", {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        const blob = await response.blob()
        console.log("Windows-compatible video received, size:", blob.size, "bytes")

        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `${filename}.mp4`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)

        toast({
          title: "Windows Compatible Video Generated! 🎉",
          description: `${filename}.mp4 will now play in Windows Media Player!`,
        })
      } else {
        const errorText = await response.text()
        console.error("Video generation failed:", errorText)

        let errorMessage = "Failed to generate video"
        try {
          const errorJson = JSON.parse(errorText)
          errorMessage = errorJson.error || errorMessage
        } catch {
          errorMessage = errorText || errorMessage
        }

        throw new Error(errorMessage)
      }
    } catch (error) {
      console.error("Video generation error:", error)
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const generateCurl = () => {
    const curlCmd = `# Generate Windows Media Player compatible MP4
curl -X POST \\
  -F "image=@your-image.jpg" \\
  -F "text=${text.replace(/"/g, '\\"')}" \\
  -F "voice=${voice}" \\
  -F "duration=${duration[0]}" \\
  -F "animation=${animation}" \\
  -F "filename=${filename}" \\
  --output ${filename}.mp4 \\
  https://your-domain.com/api/create-video

# This MP4 will play in:
# ✅ Windows Media Player
# ✅ VLC Media Player  
# ✅ QuickTime Player
# ✅ Chrome/Firefox browsers
# ✅ Mobile devices (iOS/Android)`

    navigator.clipboard.writeText(curlCmd)
    toast({
      title: "Windows Compatible cURL Copied!",
      description: "Generates H.264/AAC MP4 files that work everywhere!",
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-blue-100 text-blue-700">🖥️ Windows Compatible</Badge>
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Windows Media Player Compatible Videos
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Creates proper H.264/AAC MP4 files that play in Windows Media Player, VLC, QuickTime, and all browsers
          </p>
        </div>

        {/* Compatibility Status */}
        <Card className="mb-8 border-2 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Monitor className="w-5 h-5 text-blue-500" />
              Video Compatibility Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-semibold text-green-700">✅ Supported Players:</h4>
                <ul className="text-sm space-y-1 text-green-600">
                  <li>• Windows Media Player</li>
                  <li>• VLC Media Player</li>
                  <li>• QuickTime Player</li>
                  <li>• Chrome/Firefox/Safari</li>
                  <li>• iOS/Android devices</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-blue-700">🎯 Technical Specs:</h4>
                <ul className="text-sm space-y-1 text-blue-600">
                  <li>• H.264/AVC Baseline Profile</li>
                  <li>• AAC Audio Codec</li>
                  <li>• MP4 Container Format</li>
                  <li>• 1280x720 Resolution</li>
                  <li>• 30 FPS Frame Rate</li>
                </ul>
              </div>
            </div>

            {ffmpegStatus === "available" && (
              <div className="mt-4 text-green-700 bg-green-50 p-3 rounded-lg">
                <p className="font-semibold">✅ FFmpeg Available - Maximum Compatibility Mode</p>
                <p className="text-sm">Videos will use proper H.264 encoding for Windows Media Player</p>
              </div>
            )}

            {ffmpegStatus === "unavailable" && (
              <div className="mt-4 text-orange-700 bg-orange-50 p-3 rounded-lg">
                <p className="font-semibold">⚠️ FFmpeg Not Available - Using Manual MP4 Structure</p>
                <p className="text-sm mb-2">Videos will still be compatible, but FFmpeg provides better encoding</p>
                <Button onClick={installFFmpeg} variant="outline" size="sm">
                  Install FFmpeg for Best Compatibility
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Panel - Controls */}
          <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Windows Compatible Video Settings
              </CardTitle>
              <CardDescription>Configure your Windows Media Player compatible video</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Image Upload */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Upload Image</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <label htmlFor="image-upload" className="cursor-pointer">
                    <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm text-gray-600">
                      {selectedImage ? selectedImage.name : "Click to upload image"}
                    </p>
                  </label>
                </div>
              </div>

              {/* Text Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Voiceover Text</label>
                <Textarea
                  placeholder="Enter text for voiceover..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="min-h-[100px]"
                  maxLength={500}
                />
                <div className="text-xs text-gray-500 text-right">{text.length}/500 characters</div>
              </div>

              {/* Voice Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Voice (Windows Compatible)</label>
                <Select value={voice} onValueChange={setVoice}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Microsoft Zira">Microsoft Zira (Female US)</SelectItem>
                    <SelectItem value="Microsoft David">Microsoft David (Male US)</SelectItem>
                    <SelectItem value="Microsoft Hazel">Microsoft Hazel (Female UK)</SelectItem>
                    <SelectItem value="Microsoft George">Microsoft George (Male UK)</SelectItem>
                    <SelectItem value="Microsoft Heera">Microsoft Heera (Female Indian)</SelectItem>
                    <SelectItem value="Microsoft Ravi">Microsoft Ravi (Male Indian)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Duration */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Duration: {duration[0]} seconds</label>
                <Slider value={duration} onValueChange={setDuration} max={30} min={1} step={1} className="w-full" />
              </div>

              {/* Animation */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Animation Effect</label>
                <Select value={animation} onValueChange={setAnimation}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fade">Fade In/Out</SelectItem>
                    <SelectItem value="zoom">Zoom Effect</SelectItem>
                    <SelectItem value="pan">Pan Across</SelectItem>
                    <SelectItem value="slide">Slide Transition</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Filename */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Filename</label>
                <input
                  type="text"
                  value={filename}
                  onChange={(e) => setFilename(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="windows-compatible-video"
                />
              </div>

              {/* Generate Button */}
              <Button
                onClick={generateVideo}
                disabled={!selectedImage || isGenerating}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <Settings className="w-4 h-4 mr-2 animate-spin" />
                    Creating Windows Compatible Video...
                  </>
                ) : (
                  <>
                    <Monitor className="w-4 h-4 mr-2" />
                    Generate Windows Compatible Video
                  </>
                )}
              </Button>

              <div className="text-center text-sm text-blue-600 bg-blue-50 p-2 rounded">
                🖥️ Will create H.264/AAC MP4 for Windows Media Player
              </div>
            </CardContent>
          </Card>

          {/* Right Panel - Preview & API */}
          <div className="space-y-6">
            {/* Image Preview */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="w-5 h-5" />
                  Image Preview
                </CardTitle>
              </CardHeader>
              <CardContent>
                {imagePreview ? (
                  <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                    <img
                      src={imagePreview || "/placeholder.svg"}
                      alt="Preview"
                      className="w-full h-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <ImageIcon className="w-12 h-12 mx-auto mb-2" />
                      <p>No image selected</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* API Integration */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Film className="w-5 h-5" />
                  Windows Compatible API
                </CardTitle>
                <CardDescription>Generate Windows Media Player compatible videos via API</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  onClick={generateCurl}
                  variant="outline"
                  className="w-full bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Windows Compatible cURL
                </Button>

                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold mb-2 text-blue-900">🖥️ Windows Media Player Features:</h4>
                  <div className="space-y-1 text-sm text-blue-800">
                    <div>• H.264/AVC Baseline Profile Level 3.0</div>
                    <div>• AAC LC Audio Codec</div>
                    <div>• MP4 Container Format</div>
                    <div>• FastStart for web streaming</div>
                    <div>• Maximum compatibility settings</div>
                  </div>
                </div>

                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-semibold mb-2 text-green-900">✅ Tested Compatible With:</h4>
                  <div className="grid grid-cols-2 gap-1 text-sm text-green-800">
                    <div>• Windows Media Player</div>
                    <div>• VLC Media Player</div>
                    <div>• QuickTime Player</div>
                    <div>• Chrome Browser</div>
                    <div>• Firefox Browser</div>
                    <div>• Safari Browser</div>
                    <div>• iOS Devices</div>
                    <div>• Android Devices</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
