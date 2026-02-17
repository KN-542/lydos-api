import { GoogleGenAI } from '@google/genai'
import Groq from 'groq-sdk'

export type ChatMessage = {
  role: 'user' | 'assistant'
  content: string
}

export type StreamChatResult = {
  content: string
  inputTokens: number
  outputTokens: number
}

const getGeminiClient = () => {
  if (!process.env.GEMINI_API_KEY) throw new Error('GEMINI_API_KEY is not set')
  return new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
}

const getGroqClient = () => {
  if (!process.env.GROQ_API_KEY) throw new Error('GROQ_API_KEY is not set')
  return new Groq({ apiKey: process.env.GROQ_API_KEY })
}

async function streamGemini(
  messages: ChatMessage[],
  modelId: string,
  onToken: (token: string) => Promise<void>
): Promise<StreamChatResult> {
  const ai = getGeminiClient()

  const contents = messages.map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }))

  const response = await ai.models.generateContentStream({ model: modelId, contents })

  let accumulated = ''
  let inputTokens = 0
  let outputTokens = 0

  for await (const chunk of response) {
    const token = chunk.text ?? ''
    if (token) {
      accumulated += token
      await onToken(token)
    }
    if (chunk.usageMetadata) {
      inputTokens = chunk.usageMetadata.promptTokenCount ?? 0
      outputTokens = chunk.usageMetadata.candidatesTokenCount ?? 0
    }
  }

  return { content: accumulated, inputTokens, outputTokens }
}

async function streamGroq(
  messages: ChatMessage[],
  modelId: string,
  onToken: (token: string) => Promise<void>
): Promise<StreamChatResult> {
  const groq = getGroqClient()

  const stream = await groq.chat.completions.create({
    model: modelId,
    messages: messages.map((m) => ({ role: m.role, content: m.content })),
    stream: true,
  })

  let accumulated = ''
  let inputTokens = 0
  let outputTokens = 0

  for await (const chunk of stream) {
    const token = chunk.choices[0]?.delta?.content ?? ''
    if (token) {
      accumulated += token
      await onToken(token)
    }
    const usage = (
      chunk as { x_groq?: { usage?: { prompt_tokens?: number; completion_tokens?: number } } }
    ).x_groq?.usage
    if (usage) {
      inputTokens = usage.prompt_tokens ?? 0
      outputTokens = usage.completion_tokens ?? 0
    }
  }

  return { content: accumulated, inputTokens, outputTokens }
}

// @google/genai の ApiError は message が JSON 文字列のため、人間が読める形に変換する
export function extractErrorMessage(error: Error): string {
  try {
    // outer: {"error":{"message":"...","code":429,...}}
    const outer = JSON.parse(error.message) as { error?: { message?: string; code?: number } }
    const outerMsg = outer?.error?.message
    if (!outerMsg) return error.message
    try {
      // inner message がさらに JSON の場合
      const inner = JSON.parse(outerMsg) as { error?: { message?: string } }
      return inner?.error?.message ?? outerMsg
    } catch {
      return outerMsg
    }
  } catch {
    return error.message
  }
}

export async function streamChat(
  messages: ChatMessage[],
  modelId: string,
  provider: string,
  onToken: (token: string) => Promise<void>
): Promise<StreamChatResult> {
  switch (provider) {
    case 'gemini':
      return streamGemini(messages, modelId, onToken)
    case 'groq':
      return streamGroq(messages, modelId, onToken)
    default:
      throw new Error(`Unknown provider: ${provider}`)
  }
}
