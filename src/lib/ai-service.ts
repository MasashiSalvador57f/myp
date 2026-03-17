/**
 * AI Service — Vercel AI SDK を使った AI API 呼び出し
 *
 * OpenAI (gpt-5) / Google Gemini に対応。
 * プロバイダーとAPIキーを設定で切り替える。
 */

import { streamText, generateText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';

export type AIProvider = 'openai' | 'gemini';

export interface AIServiceConfig {
  provider: AIProvider;
  apiKey: string;
}

export interface AIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

/**
 * プロバイダーに応じたモデルを作成
 * - OpenAI: gpt-5
 * - Gemini: gemini-2.5-pro
 */
function createModel(config: AIServiceConfig) {
  if (config.provider === 'gemini') {
    const google = createGoogleGenerativeAI({ apiKey: config.apiKey });
    return google('gemini-3-flash-preview');
  }
  // デフォルト: OpenAI
  const openai = createOpenAI({ apiKey: config.apiKey });
  return openai('gpt-5');
}

/**
 * ストリーミングでAIにメッセージを送信
 */
export async function streamChatMessage(
  config: AIServiceConfig,
  systemPrompt: string,
  messages: AIMessage[],
  onChunk: (chunk: string) => void,
  onComplete: (fullText: string) => void,
  onError: (error: Error) => void,
): Promise<void> {
  try {
    const model = createModel(config);

    const result = streamText({
      model,
      system: systemPrompt,
      messages: messages.map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
    });

    let fullText = '';
    for await (const chunk of (await result).textStream) {
      fullText += chunk;
      onChunk(fullText);
    }
    onComplete(fullText);
  } catch (e) {
    onError(e instanceof Error ? e : new Error(String(e)));
  }
}

/**
 * 非ストリーミングでAIにメッセージを送信
 */
export async function sendChatMessage(
  config: AIServiceConfig,
  systemPrompt: string,
  messages: AIMessage[],
): Promise<string> {
  const model = createModel(config);

  const result = await generateText({
    model,
    system: systemPrompt,
    messages: messages.map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    })),
  });

  return result.text;
}
