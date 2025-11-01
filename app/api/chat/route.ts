import { google } from '@ai-sdk/google';
import { generateText } from 'ai';
import { NextResponse } from 'next/server';

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages, userId } = await req.json();

    // Verify API key is available
    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      console.error('GOOGLE_GENERATIVE_AI_API_KEY is not configured');
      return NextResponse.json(
        { 
          error: 'AI service is not configured',
          message: 'Sorry, the AI service is not configured. Please add your Gemini API key to .env.local'
        },
        { status: 500 }
      );
    }

    // Get the last user message
    const lastMessage = messages[messages.length - 1];
    
    // Build context from previous messages
    const conversationHistory = messages
      .slice(0, -1)
      .map((msg: any) => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
      .join('\n');

    // System prompt with context about the fitness app
    const systemPrompt = `You are a helpful AI fitness assistant for Fitelier, a comprehensive fitness tracking application. 

Your capabilities:
- Provide personalized workout recommendations based on user goals
- Create detailed workout plans with exercises, sets, and reps
- Suggest schedules for workouts
- Give fitness and nutrition advice
- Help users track their progress
- Motivate and encourage users on their fitness journey

When creating workout plans:
- Consider the user's fitness level (beginner, intermediate, advanced)
- Suggest appropriate exercises with proper form instructions
- Include warm-up and cool-down routines
- Provide realistic duration estimates (in minutes)
- Be specific with sets, reps, and rest periods

Available workout types:
- Strength Training (weight lifting, bodyweight exercises)
- Cardio (running, cycling, HIIT)
- Flexibility (stretching, yoga)

Available difficulty levels:
- Beginner (new to fitness)
- Intermediate (consistent exercise for 6+ months)
- Advanced (years of experience)

Be encouraging, motivating, and provide practical advice. Format your responses clearly with:
- Bullet points for lists
- Clear exercise names
- Specific instructions
- Appropriate emoji for engagement 💪🏋️‍♂️🔥

${conversationHistory ? `Previous conversation:\n${conversationHistory}\n` : ''}`;

    const result = await generateText({
      model: google('gemini-2.5-flash'),
      prompt: `${systemPrompt}\n\nUser: ${lastMessage.content}`,
      temperature: 0.7,
    });

    return NextResponse.json({
      message: result.text,
      success: true,
    });

  } catch (error: any) {
    console.error('Chat API error:', error);
    
    // Better error messages
    let errorMessage = 'Sorry, I encountered an error. Please try again.';
    
    if (error?.message?.includes('API key')) {
      errorMessage = 'The AI service is not properly configured. Please check your API key.';
    } else if (error?.message?.includes('quota')) {
      errorMessage = 'API quota exceeded. Please try again later.';
    } else if (error?.message?.includes('network')) {
      errorMessage = 'Network error. Please check your connection.';
    }
    
    return NextResponse.json(
      { 
        error: error?.message || 'Failed to process request',
        message: errorMessage,
        success: false,
      },
      { status: 500 }
    );
  }
}
