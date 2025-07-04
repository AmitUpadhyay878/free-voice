"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ImageIcon, Download, Copy, Sparkles, Settings, Palette, Monitor } from "lucide-react"
import { toast } from "@/hooks/use-toast"

export default function ImageGenerator() {
  const [prompt, setPrompt] = useState(
    "A beautiful sunset over mountains with a lake reflection, photorealistic, high quality",
  )
  const [resolution, setResolution] = useState("1024x1024")
  const [style, setStyle] = useState("realistic")
  const [quality, setQuality] = useState("standard")
  const [format, setFormat] = useState("png")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImage, setGeneratedImage] = useState<string>("")
  const [imageData, setImageData] = useState<any>(null)

  const generateImage = async () => {
    if (!prompt.trim()) {
      toast({
        title: "No prompt provided",
        description: "Please enter a description for your image.",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)
    setGeneratedImage("")

    try {
      console.log("Generating AI image...")

      const response = await fetch("/api/generate-image-base64", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: prompt,
          resolution: resolution,
          style: style,
          quality: quality,
          format: format,
        }),
      })

      if (response.ok) {
        const result = await response.json()
        const base64Image = result.data.image_base64

        setGeneratedImage(`data:image/${format};base64,${base64Image}`)
        setImageData(result.data)

        toast({
          title: "Image Generated! 🎨",
          description: `Created ${result.data.resolution} ${style} style image`,
        })
      } else {
        const errorText = await response.text()
        throw new Error(errorText)
      }
    } catch (error) {
      console.error("Image generation error:", error)
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const downloadImage = () => {
    if (!generatedImage || !imageData) return

    const link = document.createElement("a")
    link.href = generatedImage
    link.download = imageData.filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast({
      title: "Image Downloaded! 📥",
      description: `Saved as ${imageData.filename}`,
    })
  }

  const generateCurl = () => {
    const curlCmd = `# Generate AI Image
curl -X POST \\
  -H "Content-Type: application/json" \\
  -d '{
    "prompt": "${prompt.replace(/"/g, '\\"')}",
    "resolution": "${resolution}",
    "style": "${style}",
    "quality": "${quality}",
    "format": "${format}"
  }' \\
  --output ai-generated.${format} \\
  https://your-domain.com/api/generate-image

# For base64 JSON response (perfect for n8n):
curl -X POST \\
  -H "Content-Type: application/json" \\
  -d '{
    "prompt": "${prompt.replace(/"/g, '\\"')}",
    "resolution": "${resolution}",
    "style": "${style}"
  }' \\
  https://your-domain.com/api/generate-image-base64`

    navigator.clipboard.writeText(curlCmd)
    toast({
      title: "AI Image cURL Copied! 🎨",
      description: "Ready to use in your applications and n8n workflows!",
    })
  }

  const generateCompleteShortCurl = () => {
    const curlCmd = `# Create Complete Instagram Short (AI Image + Character Voices)
curl -X POST \\
  -H "Content-Type: application/json" \\
  -d '{
    "prompt": "Tell an exciting story about this scene",
    "image_prompt": "${prompt.replace(/"/g, '\\"')}",
    "resolution": "instagram-story",
    "style": "${style}",
    "duration": 15
  }' \\
  --output complete-instagram-short.mp4 \\
  https://your-domain.com/api/create-complete-short`

    navigator.clipboard.writeText(curlCmd)
    toast({
      title: "Complete Short cURL Copied! 🎬",
      description: "Creates Instagram Short with AI image + character voices!",
    })
  }

  const presetPrompts = [
    "A majestic dragon flying over a medieval castle at sunset",
    "Cyberpunk city street with neon lights and flying cars",
    "Peaceful zen garden with cherry blossoms and koi pond",
    "Space station orbiting a colorful nebula",
    "Cozy coffee shop on a rainy day with warm lighting",
    "Underwater coral reef with tropical fish and sea turtles",
    "Snowy mountain peak with aurora borealis in the sky",
    "Steampunk airship floating above Victorian city",
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-blue-100 text-blue-700">🎨 AI Image Generator</Badge>
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            AI Image Generation Studio
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Generate stunning images from text prompts using multiple AI services including DALL-E, Stability AI, and
            more
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Panel - Controls */}
          <div className="space-y-6">
            <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Image Generation Settings
                </CardTitle>
                <CardDescription>Describe your image and customize the generation settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Prompt Input */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Image Description</label>
                  <Textarea
                    placeholder="Describe the image you want to generate..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="min-h-[120px]"
                    maxLength={1000}
                  />
                  <div className="text-xs text-gray-500 text-right">{prompt.length}/1000 characters</div>
                </div>

                {/* Preset Prompts */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Quick Prompts</label>
                  <div className="grid grid-cols-1 gap-2">
                    {presetPrompts.slice(0, 4).map((presetPrompt, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        onClick={() => setPrompt(presetPrompt)}
                        className="text-left justify-start h-auto p-2 text-xs"
                      >
                        {presetPrompt}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Settings Grid */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Resolution</label>
                    <Select value={resolution} onValueChange={setResolution}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="512x512">512×512 (Small)</SelectItem>
                        <SelectItem value="1024x1024">1024×1024 (Square)</SelectItem>
                        <SelectItem value="1792x1024">1792×1024 (Landscape)</SelectItem>
                        <SelectItem value="1024x1792">1024×1792 (Portrait)</SelectItem>
                        <SelectItem value="1920x1080">1920×1080 (HD)</SelectItem>
                        <SelectItem value="instagram">Instagram (1080×1080)</SelectItem>
                        <SelectItem value="instagram-story">Instagram Story (1080×1920)</SelectItem>
                        <SelectItem value="youtube-thumbnail">YouTube (1280×720)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Style</label>
                    <Select value={style} onValueChange={setStyle}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="realistic">Realistic</SelectItem>
                        <SelectItem value="artistic">Artistic</SelectItem>
                        <SelectItem value="cartoon">Cartoon</SelectItem>
                        <SelectItem value="anime">Anime</SelectItem>
                        <SelectItem value="digital_art">Digital Art</SelectItem>
                        <SelectItem value="oil_painting">Oil Painting</SelectItem>
                        <SelectItem value="watercolor">Watercolor</SelectItem>
                        <SelectItem value="sketch">Sketch</SelectItem>
                        <SelectItem value="cyberpunk">Cyberpunk</SelectItem>
                        <SelectItem value="fantasy">Fantasy</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Quality</label>
                    <Select value={quality} onValueChange={setQuality}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="standard">Standard</SelectItem>
                        <SelectItem value="hd">HD (Premium)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Format</label>
                    <Select value={format} onValueChange={setFormat}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="png">PNG</SelectItem>
                        <SelectItem value="jpeg">JPEG</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Generate Button */}
                <Button
                  onClick={generateImage}
                  disabled={!prompt.trim() || isGenerating}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  size="lg"
                >
                  {isGenerating ? (
                    <>
                      <Settings className="w-4 h-4 mr-2 animate-spin" />
                      Generating AI Image...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate AI Image
                    </>
                  )}
                </Button>

                <div className="text-center text-sm text-blue-600 bg-blue-50 p-2 rounded">
                  🎨 Uses multiple AI services for best results
                </div>
              </CardContent>
            </Card>

            {/* API Integration */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Monitor className="w-5 h-5" />
                  API Integration
                </CardTitle>
                <CardDescription>Use the AI Image Generator in your applications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  onClick={generateCurl}
                  variant="outline"
                  className="w-full bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy AI Image cURL
                </Button>

                <Button
                  onClick={generateCompleteShortCurl}
                  variant="outline"
                  className="w-full bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Complete Short cURL
                </Button>

                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-semibold mb-2 text-green-900">🚀 AI Services Used:</h4>
                  <div className="space-y-1 text-sm text-green-800">
                    <div>• OpenAI DALL-E 3 (Premium)</div>
                    <div>• Stability AI SDXL (Premium)</div>
                    <div>• Replicate SDXL (Premium)</div>
                    <div>• Hugging Face (Free tier)</div>
                    <div>• Pollinations AI (Free)</div>
                    <div>• Smart fallback system</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Panel - Generated Image */}
          <div className="space-y-6">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="w-5 h-5" />
                  Generated Image
                </CardTitle>
                {imageData && (
                  <CardDescription>
                    {imageData.resolution} • {style} style • {(imageData.size / 1024).toFixed(1)} KB
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent>
                {generatedImage ? (
                  <div className="space-y-4">
                    <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={generatedImage || "/placeholder.svg"}
                        alt="Generated AI Image"
                        className="w-full h-full object-contain"
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button onClick={downloadImage} className="flex-1 bg-green-600 hover:bg-green-700">
                        <Download className="w-4 h-4 mr-2" />
                        Download Image
                      </Button>
                    </div>

                    {imageData && (
                      <div className="p-3 bg-gray-50 rounded-lg text-sm">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <strong>Resolution:</strong> {imageData.resolution}
                          </div>
                          <div>
                            <strong>Format:</strong> {imageData.format.toUpperCase()}
                          </div>
                          <div>
                            <strong>Size:</strong> {(imageData.size / 1024).toFixed(1)} KB
                          </div>
                          <div>
                            <strong>Style:</strong> {style}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <ImageIcon className="w-12 h-12 mx-auto mb-2" />
                      <p>Generated image will appear here</p>
                      <p className="text-sm">Enter a prompt and click generate</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Features */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="w-5 h-5" />
                  AI Generation Features
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-blue-900">🎨 Styles Available:</h4>
                    <ul className="space-y-1 text-blue-700">
                      <li>• Photorealistic</li>
                      <li>• Digital Art</li>
                      <li>• Cartoon/Anime</li>
                      <li>• Oil Painting</li>
                      <li>• Cyberpunk/Fantasy</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-purple-900">📐 Resolutions:</h4>
                    <ul className="space-y-1 text-purple-700">
                      <li>• Square (1024×1024)</li>
                      <li>• Landscape (1792×1024)</li>
                      <li>• Portrait (1024×1792)</li>
                      <li>• Social Media Formats</li>
                      <li>• Custom Dimensions</li>
                    </ul>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                  <h4 className="font-semibold text-yellow-900 mb-1">💡 Pro Tip:</h4>
                  <p className="text-sm text-yellow-800">
                    Be specific in your prompts! Include details about lighting, colors, mood, and style for best
                    results.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
