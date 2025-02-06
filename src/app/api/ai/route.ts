import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { rateLimit } from '@/lib/rate-limit'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Initialize rate limiter
const limiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 500
})

// Validation schemas
const optionsSchema = z.object({
  temperature: z.number().min(0).max(2).optional(),
  maxTokens: z.number().min(1).max(4000).optional(),
  model: z.string().optional()
})

const requestSchema = z.object({
  prompt: z.string().min(1),
  systemPrompt: z.string().optional(),
  options: optionsSchema.optional(),
  type: z.enum(['chat', 'enhancement']).default('chat')
})

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    try {
      await limiter.check(request, 10, 'AI_RATE_LIMIT')
    } catch {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      )
    }

    // Parse and validate request
    const body = await request.json()
    const { prompt, systemPrompt, options, type } = requestSchema.parse(body)

    // Initialize OpenAI client
    const { Configuration, OpenAIApi } = require('openai')
    const configuration = new Configuration({
      apiKey: process.env.OPENAI_API_KEY
    })
    const openai = new OpenAIApi(configuration)

    // Prepare messages
    const messages = []
    if (systemPrompt) {
      messages.push({
        role: 'system',
        content: systemPrompt
      })
    }
    messages.push({
      role: 'user',
      content: prompt
    })

    // Call OpenAI API
    const completion = await openai.createChatCompletion({
      model: options?.model || 'gpt-4-turbo-preview',
      messages,
      temperature: options?.temperature ?? (type === 'chat' ? 0.8 : 0.4),
      max_tokens: options?.maxTokens ?? 2000
    })

    const content = completion.data.choices[0].message.content

    // Store interaction in Supabase
    await supabase.from('ai_interactions').insert({
      type,
      prompt,
      system_prompt: systemPrompt,
      response: content,
      model: options?.model,
      temperature: options?.temperature,
      max_tokens: options?.maxTokens
    })

    return NextResponse.json({ content })
  } catch (error: any) {
    console.error('AI API error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: error.status || 500 }
    )
  }
} 