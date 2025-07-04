import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { image_base64, prompt } = body

    if (!image_base64) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 })
    }

    // Analyze the image and create character descriptions
    const analysis = await analyzeImageForCharacters(image_base64, prompt)

    return NextResponse.json({
      success: true,
      analysis: analysis,
      characters: analysis.characters,
      story_suggestions: analysis.story_suggestions,
      voice_assignments: analysis.voice_assignments,
    })
  } catch (error) {
    console.error("Image analysis error:", error)
    return NextResponse.json(
      {
        error: "Failed to analyze image",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

async function analyzeImageForCharacters(imageBase64: string, prompt: string) {
  // Simulate AI image analysis (in production, you'd use OpenAI Vision, Google Vision, etc.)
  const analysis = {
    scene_description: "",
    characters: [] as any[],
    story_suggestions: [] as string[],
    voice_assignments: {} as any,
    mood: "",
    setting: "",
  }

  // Basic image analysis based on common patterns
  const imageBuffer = Buffer.from(imageBase64, "base64")
  const imageSize = imageBuffer.length

  // Analyze prompt for story elements
  const promptLower = prompt.toLowerCase()

  // Determine scene type
  if (promptLower.includes("story") || promptLower.includes("tale")) {
    analysis.scene_description = "Story narration scene"
    analysis.mood = "narrative"
  } else if (promptLower.includes("introduction") || promptLower.includes("intro")) {
    analysis.scene_description = "Character introduction scene"
    analysis.mood = "welcoming"
  } else if (promptLower.includes("adventure") || promptLower.includes("journey")) {
    analysis.scene_description = "Adventure scene"
    analysis.mood = "exciting"
  } else {
    analysis.scene_description = "General scene"
    analysis.mood = "neutral"
  }

  // Extract potential characters from prompt
  const characters = extractCharactersFromPrompt(prompt)
  analysis.characters = characters

  // Assign voices to characters
  analysis.voice_assignments = assignVoicesToCharacters(characters, analysis.mood)

  // Generate story suggestions
  analysis.story_suggestions = generateStorySuggestions(prompt, characters, analysis.mood)

  return analysis
}

function extractCharactersFromPrompt(prompt: string): any[] {
  const characters = []
  const promptLower = prompt.toLowerCase()

  // Common character types
  const characterPatterns = [
    { pattern: /\b(hero|protagonist|main character)\b/i, type: "hero", gender: "neutral" },
    { pattern: /\b(princess|queen|lady|girl|woman)\b/i, type: "female_lead", gender: "female" },
    { pattern: /\b(prince|king|man|boy|guy)\b/i, type: "male_lead", gender: "male" },
    { pattern: /\b(villain|enemy|bad guy|antagonist)\b/i, type: "villain", gender: "neutral" },
    { pattern: /\b(narrator|storyteller)\b/i, type: "narrator", gender: "neutral" },
    { pattern: /\b(child|kid|baby)\b/i, type: "child", gender: "neutral" },
    { pattern: /\b(old man|elder|grandfather)\b/i, type: "elder_male", gender: "male" },
    { pattern: /\b(old woman|grandmother)\b/i, type: "elder_female", gender: "female" },
    { pattern: /\b(robot|ai|android)\b/i, type: "robot", gender: "neutral" },
    { pattern: /\b(animal|pet|dog|cat)\b/i, type: "animal", gender: "neutral" },
  ]

  characterPatterns.forEach((pattern, index) => {
    if (pattern.pattern.test(prompt)) {
      characters.push({
        id: `character_${index}`,
        name: pattern.type.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase()),
        type: pattern.type,
        gender: pattern.gender,
        description: `A ${pattern.type.replace("_", " ")} character in the story`,
        personality: getPersonalityForType(pattern.type),
      })
    }
  })

  // If no specific characters found, create default ones
  if (characters.length === 0) {
    characters.push({
      id: "narrator",
      name: "Narrator",
      type: "narrator",
      gender: "neutral",
      description: "The storyteller who guides the audience",
      personality: "wise and engaging",
    })

    // Add a main character based on prompt context
    if (promptLower.includes("adventure") || promptLower.includes("journey")) {
      characters.push({
        id: "adventurer",
        name: "Adventurer",
        type: "hero",
        gender: "neutral",
        description: "The brave adventurer on a quest",
        personality: "brave and determined",
      })
    }
  }

  return characters
}

function getPersonalityForType(type: string): string {
  const personalities: { [key: string]: string } = {
    hero: "brave and noble",
    female_lead: "graceful and strong",
    male_lead: "confident and charismatic",
    villain: "cunning and dramatic",
    narrator: "wise and storytelling",
    child: "innocent and curious",
    elder_male: "wise and experienced",
    elder_female: "nurturing and wise",
    robot: "logical and precise",
    animal: "playful and loyal",
  }
  return personalities[type] || "unique and interesting"
}

function assignVoicesToCharacters(characters: any[], mood: string): any {
  const voiceAssignments: any = {}

  const voiceOptions = {
    female: ["Microsoft Zira", "Microsoft Hazel", "Microsoft Heera"],
    male: ["Microsoft David", "Microsoft George", "Microsoft Ravi"],
    neutral: ["Microsoft Zira", "Microsoft David"],
    child: ["Microsoft Zira"], // Higher pitch female voice for children
    elder_male: ["Microsoft David", "Microsoft George"],
    elder_female: ["Microsoft Hazel", "Microsoft Heera"],
    villain: ["Microsoft George", "Microsoft Ravi"], // Deeper voices
    robot: ["Microsoft David"], // More monotone
    narrator: ["Microsoft Hazel", "Microsoft Zira"], // Clear storytelling voices
  }

  characters.forEach((character, index) => {
    let voicePool = voiceOptions[character.type] || voiceOptions[character.gender] || voiceOptions.neutral

    // Adjust for mood
    if (mood === "exciting" && character.type === "hero") {
      voicePool = ["Microsoft David", "Microsoft George"] // More energetic
    } else if (mood === "narrative" && character.type === "narrator") {
      voicePool = ["Microsoft Hazel", "Microsoft Heera"] // Better for storytelling
    }

    voiceAssignments[character.id] = {
      voice: voicePool[index % voicePool.length],
      pitch: getVoicePitch(character.type),
      speed: getVoiceSpeed(character.type, mood),
      style: getVoiceStyle(character.type),
    }
  })

  return voiceAssignments
}

function getVoicePitch(type: string): number {
  const pitchMap: { [key: string]: number } = {
    child: 1.3,
    female_lead: 1.1,
    elder_male: 0.9,
    elder_female: 1.0,
    villain: 0.8,
    robot: 1.0,
    hero: 1.0,
    narrator: 1.0,
  }
  return pitchMap[type] || 1.0
}

function getVoiceSpeed(type: string, mood: string): number {
  let baseSpeed = 1.0

  if (mood === "exciting") baseSpeed = 1.1
  else if (mood === "narrative") baseSpeed = 0.9

  const speedAdjustments: { [key: string]: number } = {
    child: 1.1,
    elder_male: 0.9,
    elder_female: 0.9,
    villain: 0.8,
    robot: 0.9,
    narrator: 0.9,
  }

  return baseSpeed * (speedAdjustments[type] || 1.0)
}

function getVoiceStyle(type: string): string {
  const styles: { [key: string]: string } = {
    hero: "confident and inspiring",
    villain: "dramatic and menacing",
    narrator: "clear and engaging",
    child: "innocent and energetic",
    elder_male: "wise and measured",
    elder_female: "warm and nurturing",
    robot: "precise and mechanical",
  }
  return styles[type] || "natural"
}

function generateStorySuggestions(prompt: string, characters: any[], mood: string): string[] {
  const suggestions = []

  // Base suggestions on prompt content
  if (prompt.toLowerCase().includes("introduction")) {
    suggestions.push("Character introduction with background music")
    suggestions.push("Meet the characters one by one")
    suggestions.push("Welcome message with character showcase")
  } else if (prompt.toLowerCase().includes("story")) {
    suggestions.push("Dramatic storytelling with character voices")
    suggestions.push("Interactive story with multiple characters")
    suggestions.push("Narrative with background music and effects")
  } else if (prompt.toLowerCase().includes("adventure")) {
    suggestions.push("Epic adventure with heroic music")
    suggestions.push("Journey story with multiple scenes")
    suggestions.push("Action-packed adventure narrative")
  } else {
    suggestions.push("Engaging short video with character voices")
    suggestions.push("Creative storytelling with visual elements")
    suggestions.push("Character-driven narrative")
  }

  // Add character-specific suggestions
  if (characters.some((c) => c.type === "villain")) {
    suggestions.push("Good vs evil confrontation scene")
  }
  if (characters.some((c) => c.type === "child")) {
    suggestions.push("Family-friendly story with life lessons")
  }

  return suggestions.slice(0, 5) // Return top 5 suggestions
}

export async function GET() {
  return NextResponse.json({
    message: "Instagram Shorts Image Analysis API",
    description: "Analyzes images and creates character voice assignments for Instagram Shorts",
    usage: 'POST with {"image_base64": "...", "prompt": "Create a story about..."}',
    features: [
      "Character extraction from prompts",
      "Voice assignment based on character types",
      "Story suggestions for Instagram Shorts",
      "Mood and scene analysis",
      "Personality-based voice matching",
    ],
  })
}
