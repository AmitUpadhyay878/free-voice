"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Upload, Video, Settings, Copy, Instagram, ImageIcon, Users, Mic, Sparkles } from "lucide-react"
import { toast } from "@/hooks/use-toast"

export default function InstagramShortsCreator() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>("")
  const [prompt, setPrompt] = useState(
    "Create an exciting adventure story about a brave hero who discovers a magical world hidden behind an ordinary door. The hero meets friendly creatures and learns about courage and friendship.",
  )
  const [duration, setDuration] = useState([15])
  const [style, setStyle] = useState("story")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [analysis, setAnalysis] = useState<any>(null)
  const [characters, setCharacters] = useState<any[]>([])
  const [voiceAssignments, setVoiceAssignments] = useState<any>({})

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedImage(file)
      setAnalysis(null) // Reset analysis when new image is uploaded

      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const analyzeImage = async () => {
    if (!selectedImage || !prompt.trim()) {
      toast({
        title: "Missing Requirements",
        description: "Please upload an image and enter a prompt.",
        variant: "destructive",
      })
      return
    }

    setIsAnalyzing(true)

    try {
      const reader = new FileReader()
      reader.onload = async (e) => {
        const base64 = (e.target?.result as string).split(",")[1]

        const response = await fetch("/api/analyze-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            image_base64: base64,
            prompt: prompt,
          }),
        })

        if (response.ok) {
          const result = await response.json()
          setAnalysis(result.analysis)
          setCharacters(result.characters)
          setVoiceAssignments(result.voice_assignments)

          toast({
            title: "Image Analyzed! 🎭",
            description: `Found ${result.characters.length} characters for your story`,
          })
        } else {
          throw new Error("Failed to analyze image")
        }
      }
      reader.readAsDataURL(selectedImage)
    } catch (error) {
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  const generateInstagramShort = async () => {
    if (!selectedImage || !analysis) {
      toast({
        title: "Analysis Required",
        description: "Please analyze the image first.",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)

    try {
      const reader = new FileReader()
      reader.onload = async (e) => {
        const base64 = (e.target?.result as string).split(",")[1]

        const response = await fetch("/api/create-instagram-short", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            image_base64: base64,
            prompt: prompt,
            characters: characters,
            voice_assignments: voiceAssignments,
            duration: duration[0],
            style: style,
          }),
        })

        if (response.ok) {
          const blob = await response.blob()
          console.log("Instagram Short created, size:", blob.size, "bytes")

          const url = URL.createObjectURL(blob)
          const a = document.createElement("a")
          a.href = url
          a.download = "instagram-short.mp4"
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
          URL.revokeObjectURL(url)

          toast({
            title: "Instagram Short Created! 📱",
            description: "Your character-voiced short is ready for Instagram!",
          })
        } else {
          const errorText = await response.text()
          throw new Error(errorText)
        }
      }
      reader.readAsDataURL(selectedImage)
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const generateCurl = () => {
    const curlCmd = `# Create Instagram Short with Character Voices
curl -X POST \\
  -H "Content-Type: application/json" \\
  -d '{
    "image_base64": "$(base64 -w 0 your-image.jpg)",
    "prompt": "${prompt.replace(/"/g, '\\"')}",
    "duration": ${duration[0]},
    "style": "${style}"
  }' \\
  --output instagram-short.mp4 \\
  https://your-domain.com/api/create-instagram-short

# Perfect for Instagram Shorts (9:16 format)!`

    navigator.clipboard.writeText(curlCmd)
    toast({
      title: "Instagram Shorts cURL Copied! 📱",
      description: "Creates 9:16 format videos with character voices!",
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-pink-100 text-pink-700">📱 Instagram Shorts Creator</Badge>
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
            AI Character Voice Instagram Shorts
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Upload an image, write a story prompt, and create Instagram Shorts with AI-generated character voices
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Panel - Input */}
          <div className="space-y-6">
            <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="w-5 h-5" />
                  Upload Image & Story Prompt
                </CardTitle>
                <CardDescription>Upload your image and describe the story you want to create</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Image Upload */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Upload Image</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-pink-400 transition-colors">
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

                {/* Story Prompt */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Story Prompt</label>
                  <Textarea
                    placeholder="Describe your story, characters, and what should happen..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="min-h-[120px]"
                    maxLength={1000}
                  />
                  <div className="text-xs text-gray-500 text-right">{prompt.length}/1000 characters</div>
                </div>

                {/* Analyze Button */}
                <Button
                  onClick={analyzeImage}
                  disabled={!selectedImage || !prompt.trim() || isAnalyzing}
                  className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700"
                >
                  {isAnalyzing ? (
                    <>
                      <Settings className="w-4 h-4 mr-2 animate-spin" />
                      Analyzing Characters...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Analyze Image & Extract Characters
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Video Settings */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Instagram Short Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Duration: {duration[0]} seconds</label>
                  <Slider value={duration} onValueChange={setDuration} max={60} min={5} step={5} className="w-full" />
                  <div className="text-xs text-gray-500">Instagram Shorts: 5-60 seconds</div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Style</label>
                  <Select value={style} onValueChange={setStyle}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="story">Story Narration</SelectItem>
                      <SelectItem value="dramatic">Dramatic Scene</SelectItem>
                      <SelectItem value="energetic">Energetic/Fun</SelectItem>
                      <SelectItem value="introduction">Character Introduction</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={generateInstagramShort}
                  disabled={!analysis || isGenerating}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  size="lg"
                >
                  {isGenerating ? (
                    <>
                      <Video className="w-4 h-4 mr-2 animate-spin" />
                      Creating Instagram Short...
                    </>
                  ) : (
                    <>
                      <Instagram className="w-4 h-4 mr-2" />
                      Generate Instagram Short
                    </>
                  )}
                </Button>

                <div className="text-center text-sm text-purple-600 bg-purple-50 p-2 rounded">
                  📱 Creates 9:16 format perfect for Instagram Shorts
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Panel - Analysis & Preview */}
          <div className="space-y-6">
            {/* Image Preview */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Image Preview</CardTitle>
              </CardHeader>
              <CardContent>
                {imagePreview ? (
                  <div className="aspect-[9/16] bg-gray-100 rounded-lg overflow-hidden max-w-xs mx-auto">
                    <img
                      src={imagePreview || "/placeholder.svg"}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="aspect-[9/16] bg-gray-100 rounded-lg flex items-center justify-center max-w-xs mx-auto">
                    <div className="text-center text-gray-500">
                      <Instagram className="w-12 h-12 mx-auto mb-2" />
                      <p>9:16 Instagram Format</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Character Analysis */}
            {analysis && (
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Character Analysis
                  </CardTitle>
                  <CardDescription>AI-detected characters and voice assignments</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-1">Scene: {analysis.scene_description}</h4>
                    <p className="text-sm text-blue-700">Mood: {analysis.mood}</p>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Mic className="w-4 h-4" />
                      Characters & Voices:
                    </h4>
                    {characters.map((character, index) => (
                      <div key={character.id} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h5 className="font-medium">{character.name}</h5>
                            <p className="text-sm text-gray-600">{character.description}</p>
                          </div>
                          <Badge variant="outline">{character.type}</Badge>
                        </div>
                        {voiceAssignments[character.id] && (
                          <div className="text-sm text-purple-600 bg-purple-50 p-2 rounded">
                            🎤 Voice: {voiceAssignments[character.id].voice}
                            <br />
                            Style: {voiceAssignments[character.id].style}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {analysis.story_suggestions && (
                    <div>
                      <h4 className="font-semibold mb-2">💡 Story Suggestions:</h4>
                      <ul className="text-sm space-y-1">
                        {analysis.story_suggestions.map((suggestion: string, index: number) => (
                          <li key={index} className="text-gray-600">
                            • {suggestion}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* API Integration */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>API Integration</CardTitle>
                <CardDescription>Use the Instagram Shorts API</CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={generateCurl}
                  variant="outline"
                  className="w-full bg-pink-50 text-pink-700 border-pink-200 hover:bg-pink-100"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Instagram Shorts cURL
                </Button>

                <div className="mt-4 p-4 bg-pink-50 rounded-lg">
                  <h4 className="font-semibold mb-2 text-pink-900">📱 Instagram Shorts Features:</h4>
                  <div className="space-y-1 text-sm text-pink-800">
                    <div>• Perfect 9:16 aspect ratio</div>
                    <div>• AI character voice generation</div>
                    <div>• Story-based dialogue splitting</div>
                    <div>• Multiple character voices</div>
                    <div>• Instagram-optimized encoding</div>
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
