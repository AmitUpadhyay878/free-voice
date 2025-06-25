"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Copy, Terminal, Zap } from "lucide-react"
import { toast } from "@/hooks/use-toast"

export default function ApiDocs() {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied!",
      description: "Code copied to clipboard",
    })
  }

  const curlExamples = {
    basic: `curl -X POST \\
  -H "Content-Type: application/json" \\
  -d '{"text": "Hello, this is a test of the FreeTTS API!"}' \\
  https://your-domain.com/api/tts`,

    advanced: `curl -X POST \\
  -H "Content-Type: application/json" \\
  -d '{
    "text": "Welcome to FreeTTS API",
    "voice": "Google US English",
    "rate": 1.2,
    "pitch": 1.1,
    "volume": 0.9
  }' \\
  https://your-domain.com/api/tts`,

    voices: `curl -X GET \\
  -H "Content-Type: application/json" \\
  https://your-domain.com/api/voices`,

    status: `curl -X GET \\
  -H "Content-Type: application/json" \\
  https://your-domain.com/api/status`,
  }

  const n8nConfig = `{
  "method": "POST",
  "url": "https://your-domain.com/api/tts",
  "headers": {
    "Content-Type": "application/json"
  },
  "body": {
    "text": "{{ $json.text }}",
    "voice": "Google US English",
    "rate": 1.0,
    "pitch": 1.0,
    "volume": 1.0
  }
}`

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-purple-100 text-purple-700">📚 API Documentation</Badge>
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            FreeTTS API Documentation
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Complete guide to integrate FreeTTS with cURL, n8n, and other tools
          </p>
        </div>

        {/* Quick Start */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Quick Start
            </CardTitle>
            <CardDescription>Get started with the FreeTTS API in seconds</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm overflow-x-auto">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400"># Basic TTS Request</span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyToClipboard(curlExamples.basic)}
                  className="text-gray-400 hover:text-white"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
              <pre>{curlExamples.basic}</pre>
            </div>
          </CardContent>
        </Card>

        {/* API Endpoints */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>POST /api/tts</CardTitle>
              <CardDescription>Generate TTS configuration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Parameters:</h4>
                <ul className="space-y-1 text-sm">
                  <li>
                    <code className="bg-gray-100 px-2 py-1 rounded">text</code> - string (required, max 5000 chars)
                  </li>
                  <li>
                    <code className="bg-gray-100 px-2 py-1 rounded">voice</code> - string (optional)
                  </li>
                  <li>
                    <code className="bg-gray-100 px-2 py-1 rounded">rate</code> - number (optional, 0.1-2.0)
                  </li>
                  <li>
                    <code className="bg-gray-100 px-2 py-1 rounded">pitch</code> - number (optional, 0-2.0)
                  </li>
                  <li>
                    <code className="bg-gray-100 px-2 py-1 rounded">volume</code> - number (optional, 0-1.0)
                  </li>
                </ul>
              </div>
              <div className="bg-gray-900 text-green-400 p-3 rounded-lg font-mono text-xs overflow-x-auto">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-gray-400"># Advanced Example</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(curlExamples.advanced)}
                    className="text-gray-400 hover:text-white h-6 w-6 p-0"
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
                <pre className="text-xs">{curlExamples.advanced}</pre>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>GET /api/voices</CardTitle>
              <CardDescription>Get available voices</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Response:</h4>
                <ul className="space-y-1 text-sm">
                  <li>• List of available voices</li>
                  <li>• Voice names and languages</li>
                  <li>• Gender information</li>
                  <li>• Usage instructions</li>
                </ul>
              </div>
              <div className="bg-gray-900 text-green-400 p-3 rounded-lg font-mono text-xs overflow-x-auto">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-gray-400"># Get Voices</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(curlExamples.voices)}
                    className="text-gray-400 hover:text-white h-6 w-6 p-0"
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
                <pre className="text-xs">{curlExamples.voices}</pre>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* n8n Integration */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Terminal className="w-5 h-5" />
              n8n HTTP Node Configuration
            </CardTitle>
            <CardDescription>Ready-to-use configuration for n8n workflows</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm overflow-x-auto">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400"># n8n HTTP Node JSON</span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyToClipboard(n8nConfig)}
                  className="text-gray-400 hover:text-white"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
              <pre>{n8nConfig}</pre>
            </div>
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">n8n Setup Steps:</h4>
              <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800">
                <li>Add an HTTP Request node to your workflow</li>
                <li>Set Method to "POST"</li>
                <li>Enter your FreeTTS API URL</li>
                <li>Add Content-Type: application/json header</li>
                <li>Paste the JSON body configuration above</li>
                <li>Map your input data to the text field</li>
              </ol>
            </div>
          </CardContent>
        </Card>

        {/* Response Examples */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Response Examples</CardTitle>
            <CardDescription>Sample API responses</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Success Response:</h4>
              <div className="bg-gray-100 p-3 rounded-lg font-mono text-sm">
                <pre>{`{
  "success": true,
  "message": "TTS configuration generated successfully",
  "data": {
    "text": "Hello world",
    "voice": "Google US English",
    "rate": 1.0,
    "pitch": 1.0,
    "volume": 1.0,
    "timestamp": "2024-01-01T12:00:00.000Z",
    "id": "abc123def"
  },
  "instructions": {
    "note": "Web Speech API requires browser environment",
    "clientCode": "// JavaScript code for browser execution"
  }
}`}</pre>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Error Response:</h4>
              <div className="bg-gray-100 p-3 rounded-lg font-mono text-sm">
                <pre>{`{
  "error": "Text is required and must be a string"
}`}</pre>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status Check */}
        <Card>
          <CardHeader>
            <CardTitle>GET /api/status</CardTitle>
            <CardDescription>Check API health and limits</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-900 text-green-400 p-3 rounded-lg font-mono text-xs overflow-x-auto mb-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-gray-400"># Check API Status</span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyToClipboard(curlExamples.status)}
                  className="text-gray-400 hover:text-white h-6 w-6 p-0"
                >
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
              <pre className="text-xs">{curlExamples.status}</pre>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">∞</div>
                <div className="text-sm text-green-700">Daily Requests</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">5000</div>
                <div className="text-sm text-blue-700">Max Characters</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">FREE</div>
                <div className="text-sm text-purple-700">Forever</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
