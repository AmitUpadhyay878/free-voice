"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Play, Pause, Download, Volume2, Settings, Zap, Globe, Code, MessageCircle, Copy } from "lucide-react"
import { toast } from "@/hooks/use-toast"

// Safe clipboard helper with fallback
async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text)
  } catch (_) {
    const el = document.createElement("textarea")
    el.value = text
    el.style.position = "fixed"
    el.style.top = "-1000px"
    el.style.left = "-1000px"
    document.body.appendChild(el)
    el.focus()
    el.select()
    try {
      document.execCommand("copy")
    } finally {
      document.body.removeChild(el)
    }
  }
}

export default function FreeTTSWebsite() {
  const [text, setText] = useState("Hello, this is a test of the FreeTTS API!")
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const [selectedVoice, setSelectedVoice] = useState<string>("")
  const [rate, setRate] = useState([1])
  const [pitch, setPitch] = useState([1])
  const [volume, setVolume] = useState([1])
  const [isPlaying, setIsPlaying] = useState(false)
  const [isPaused, setIsPaused] = useState(false)

  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = speechSynthesis.getVoices()
      setVoices(availableVoices)
      if (availableVoices.length > 0 && !selectedVoice) {
        setSelectedVoice(availableVoices[0].name)
      }
    }

    loadVoices()
    speechSynthesis.addEventListener("voiceschanged", loadVoices)

    return () => {
      speechSynthesis.removeEventListener("voiceschanged", loadVoices)
    }
  }, [selectedVoice])

  const handleSpeak = () => {
    if (!text.trim()) {
      toast({
        title: "No text to speak",
        description: "Please enter some text first.",
        variant: "destructive",
      })
      return
    }

    if (isPaused) {
      speechSynthesis.resume()
      setIsPaused(false)
      setIsPlaying(true)
      return
    }

    speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    const voice = voices.find((v) => v.name === selectedVoice)

    if (voice) {
      utterance.voice = voice
    }

    utterance.rate = rate[0]
    utterance.pitch = pitch[0]
    utterance.volume = volume[0]

    utterance.onstart = () => {
      setIsPlaying(true)
      setIsPaused(false)
    }

    utterance.onend = () => {
      setIsPlaying(false)
      setIsPaused(false)
    }

    utterance.onerror = () => {
      setIsPlaying(false)
      setIsPaused(false)
      toast({
        title: "Speech Error",
        description: "An error occurred while generating speech.",
        variant: "destructive",
      })
    }

    speechSynthesis.speak(utterance)
  }

  const handlePause = () => {
    if (isPlaying) {
      speechSynthesis.pause()
      setIsPaused(true)
      setIsPlaying(false)
    }
  }

  const handleStop = () => {
    speechSynthesis.cancel()
    setIsPlaying(false)
    setIsPaused(false)
  }

  const generateRealVoiceCurl = () => {
    const curlCmd = `curl -X POST -H "Content-Type: application/json" -d '{"text":"${text.replace(/"/g, '\\"').replace(/\n/g, "\\n")}","voice":"en","rate":${rate[0]}}' --output real-speech.mp3 https://your-domain.com/api/tts-real-voice`

    copyToClipboard(curlCmd)
    toast({
      title: "REAL VOICE cURL Copied!",
      description: "Uses actual TTS services - generates REAL HUMAN SPEECH!",
    })
  }

  const generateGoogleTTSCurl = () => {
    const curlCmd = `curl -X POST -H "Content-Type: application/json" -d '{"text":"${text.replace(/"/g, '\\"').replace(/\n/g, "\\n")}","lang":"en","slow":false}' --output google-speech.mp3 https://your-domain.com/api/tts-gtts`

    copyToClipboard(curlCmd)
    toast({
      title: "Google TTS cURL Copied!",
      description: "Uses Google Translate TTS - guaranteed to work!",
    })
  }

  const generateSystemTTSCurl = () => {
    const curlCmd = `curl -X POST -H "Content-Type: application/json" -d '{"text":"${text.replace(/"/g, '\\"').replace(/\n/g, "\\n")}"}' --output system-speech.wav https://your-domain.com/api/tts-festival`

    copyToClipboard(curlCmd)
    toast({
      title: "System TTS cURL Copied!",
      description: "Uses Festival/eSpeak/gTTS - real speech synthesis!",
    })
  }

  const generateN8nWorkingConfig = () => {
    const n8nConfig = `{
  "method": "POST",
  "url": "https://your-domain.com/api/tts-gtts",
  "headers": {
    "Content-Type": "application/json"
  },
  "body": {
    "text": "{{ $json.text }}",
    "lang": "en",
    "slow": false
  }
}`

    copyToClipboard(n8nConfig)
    toast({
      title: "n8n WORKING Config Copied!",
      description: "Google TTS integration - set Response Format to 'File'!",
    })
  }

  const generateN8nRealVoice = () => {
    const n8nConfig = `{
  "method": "POST",
  "url": "https://your-domain.com/api/tts-voice",
  "headers": {
    "Content-Type": "application/json"
  },
  "body": {
    "text": "{{ $json.text }}",
    "voice": "en-US",
    "rate": ${rate[0]},
    "pitch": ${pitch[0]}
  },
  "options": {
    "response": {
      "dataPropertyName": "data"
    }
  }
}`

    copyToClipboard(n8nConfig)
    toast({
      title: "n8n Real Voice Config Copied!",
      description: "Perfect for n8n - set Response Format to 'File' for real speech!",
    })
  }

  const generateTelegramRealVoice = () => {
    const telegramCurl = `# Step 1: Generate REAL VOICE
curl -X POST -H "Content-Type: application/json" -d '{"text":"${text.replace(/"/g, '\\"')}","voice":"en-US"}' --output real-voice.mp3 https://your-domain.com/api/tts-voice

# Step 2: Send to Telegram
curl -X POST -F "chat_id=YOUR_CHAT_ID" -F "audio=@real-voice.mp3" -F "caption=🎤 Real Voice by FreeTTS" https://api.telegram.org/botYOUR_BOT_TOKEN/sendAudio`

    copyToClipboard(telegramCurl)
    toast({
      title: "Telegram Real Voice Copied!",
      description: "Complete integration with ACTUAL HUMAN VOICE!",
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
              <Volume2 className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              FreeTTS
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-gray-600 hover:text-gray-900">
              Features
            </a>
            <a href="#voices" className="text-gray-600 hover:text-gray-900">
              Voices
            </a>
            <a href="#pricing" className="text-gray-600 hover:text-gray-900">
              Pricing
            </a>
            <Button variant="outline" className="bg-white text-gray-900">
              Sign In
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <Badge className="mb-4 bg-purple-100 text-purple-700 hover:bg-purple-100">🎉 REAL VOICE GENERATION</Badge>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-purple-600 via-blue-600 to-teal-600 bg-clip-text text-transparent">
            Real Human Voice
            <br />
            Not Glitches!
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Generate ACTUAL HUMAN SPEECH using real TTS services. No more glitchy audio - just pure, clear voice
            synthesis.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              <Play className="w-5 h-5 mr-2" />
              Try Real Voice
            </Button>
            <Button size="lg" variant="outline" className="bg-white text-gray-900">
              <Download className="w-5 h-5 mr-2" />
              Download Speech
            </Button>
          </div>
        </div>
      </section>

      {/* Main TTS Interface */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-4xl">
          <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Real Voice Generator</CardTitle>
              <CardDescription>Generate actual human speech - no more glitchy audio files!</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Text Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Your Text</label>
                <Textarea
                  placeholder="Enter the text you want to convert to REAL SPEECH..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="min-h-[120px] resize-none"
                  maxLength={5000}
                />
                <div className="text-xs text-gray-500 text-right">{text.length}/5000 characters</div>
              </div>

              {/* Voice Settings */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Voice</label>
                    <Select value={selectedVoice} onValueChange={setSelectedVoice}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a voice" />
                      </SelectTrigger>
                      <SelectContent>
                        {voices.map((voice) => (
                          <SelectItem key={voice.name} value={voice.name}>
                            {voice.name} ({voice.lang})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Speed: {rate[0].toFixed(1)}x</label>
                    <Slider value={rate} onValueChange={setRate} max={2} min={0.1} step={0.1} className="w-full" />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Pitch: {pitch[0].toFixed(1)}</label>
                    <Slider value={pitch} onValueChange={setPitch} max={2} min={0} step={0.1} className="w-full" />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Volume: {Math.round(volume[0] * 100)}%</label>
                    <Slider value={volume} onValueChange={setVolume} max={1} min={0} step={0.1} className="w-full" />
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="flex flex-wrap gap-3 justify-center pt-4">
                <Button
                  onClick={handleSpeak}
                  disabled={isPlaying && !isPaused}
                  className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                >
                  <Play className="w-4 h-4 mr-2" />
                  {isPaused ? "Resume" : "Play"}
                </Button>

                <Button
                  onClick={handlePause}
                  disabled={!isPlaying}
                  variant="outline"
                  className="bg-white text-gray-900"
                >
                  <Pause className="w-4 h-4 mr-2" />
                  Pause
                </Button>

                <Button
                  onClick={handleStop}
                  disabled={!isPlaying && !isPaused}
                  variant="outline"
                  className="bg-white text-gray-900"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Stop
                </Button>
              </div>

              {/* REAL VOICE cURL Commands */}
              <div className="grid md:grid-cols-2 gap-4 pt-6">
                <Button
                  onClick={generateRealVoiceCurl}
                  variant="outline"
                  className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100 h-auto p-4 flex-col"
                  disabled={!text.trim()}
                >
                  <Volume2 className="w-5 h-5 mb-2" />
                  <div className="text-center">
                    <div className="font-semibold">REAL VOICE cURL</div>
                    <div className="text-xs opacity-75">Multiple TTS services</div>
                  </div>
                </Button>

                <Button
                  onClick={generateGoogleTTSCurl}
                  variant="outline"
                  className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 h-auto p-4 flex-col"
                  disabled={!text.trim()}
                >
                  <Code className="w-5 h-5 mb-2" />
                  <div className="text-center">
                    <div className="font-semibold">Google TTS cURL</div>
                    <div className="text-xs opacity-75">Guaranteed to work!</div>
                  </div>
                </Button>

                <Button
                  onClick={generateSystemTTSCurl}
                  variant="outline"
                  className="bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100 h-auto p-4 flex-col"
                  disabled={!text.trim()}
                >
                  <MessageCircle className="w-5 h-5 mb-2" />
                  <div className="text-center">
                    <div className="font-semibold">System TTS cURL</div>
                    <div className="text-xs opacity-75">Festival/eSpeak/gTTS</div>
                  </div>
                </Button>

                <Button
                  onClick={generateN8nWorkingConfig}
                  variant="outline"
                  className="bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100 h-auto p-4 flex-col"
                  disabled={!text.trim()}
                >
                  <Copy className="w-5 h-5 mb-2" />
                  <div className="text-center">
                    <div className="font-semibold">n8n WORKING</div>
                    <div className="text-xs opacity-75">Google TTS integration</div>
                  </div>
                </Button>
              </div>

              {/* Status */}
              {isPlaying && (
                <div className="text-center">
                  <Badge className="bg-green-100 text-green-700">🎵 Playing...</Badge>
                </div>
              )}
              {isPaused && (
                <div className="text-center">
                  <Badge className="bg-yellow-100 text-yellow-700">⏸️ Paused</Badge>
                </div>
              )}

              {/* Real Voice Instructions */}
              <div className="mt-8 space-y-4">
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <h4 className="font-semibold text-green-900 mb-2">✅ REAL VOICE APIs:</h4>
                  <div className="space-y-2 text-sm text-green-800">
                    <div>
                      <strong>/api/tts-voice:</strong> Uses Google Cloud TTS, ElevenLabs, VoiceRSS
                    </div>
                    <div>
                      <strong>/api/tts-espeak:</strong> High-quality formant synthesis
                    </div>
                    <div>
                      <strong>Result:</strong> ACTUAL HUMAN SPEECH - no more glitches!
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-900 mb-2">🔧 Setup for Premium Quality:</h4>
                  <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800">
                    <li>
                      Set <code>GOOGLE_CLOUD_API_KEY</code> for Google TTS
                    </li>
                    <li>
                      Set <code>ELEVENLABS_API_KEY</code> for ElevenLabs voices
                    </li>
                    <li>Works without API keys using free services</li>
                    <li>Always generates REAL SPEECH, never glitches</li>
                  </ol>
                </div>

                <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <h4 className="font-semibold text-orange-900 mb-2">📱 For n8n Users:</h4>
                  <ol className="list-decimal list-inside space-y-1 text-sm text-orange-800">
                    <li>Use HTTP Request node</li>
                    <li>
                      URL: <code>https://your-domain.com/api/tts-voice</code>
                    </li>
                    <li>
                      Body: <code>{'{"text": "{{ $json.text }}", "voice": "en-US"}'}</code>
                    </li>
                    <li>
                      Response Format: <strong>"File"</strong>
                    </li>
                    <li>Output: Real MP3 voice file!</li>
                  </ol>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-white/50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Real Voice Features</h2>
            <p className="text-xl text-gray-600">Actual human speech generation - no more glitches!</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center border-0 shadow-lg">
              <CardContent className="pt-8">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Volume2 className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Real Human Voice</h3>
                <p className="text-gray-600">Actual speech synthesis using Google Cloud TTS and ElevenLabs</p>
              </CardContent>
            </Card>

            <Card className="text-center border-0 shadow-lg">
              <CardContent className="pt-8">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No More Glitches</h3>
                <p className="text-gray-600">Clear, crisp audio files that work perfectly in all applications</p>
              </CardContent>
            </Card>

            <Card className="text-center border-0 shadow-lg">
              <CardContent className="pt-8">
                <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Globe className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Multiple Services</h3>
                <p className="text-gray-600">Automatic fallback between premium and free TTS services</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                  <Volume2 className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">FreeTTS</span>
              </div>
              <p className="text-gray-400">Real human voice generation - no more glitchy audio files!</p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white">
                    Real Voice
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    API
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Integration
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Services</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white">
                    Google Cloud TTS
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    ElevenLabs
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    eSpeak
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white">
                    Documentation
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    API Keys
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Help
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 FreeTTS. All rights reserved. Real voice generation for everyone.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
