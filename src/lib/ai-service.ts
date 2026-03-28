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

export interface AIUsageResult {
  model: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
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
  onComplete: (fullText: string, usage: AIUsageResult) => void,
  onError: (error: Error) => void,
): Promise<void> {
  try {
    const model = createModel(config);
    const modelName = config.provider === 'gemini' ? 'gemini-3-flash-preview' : 'gpt-5';

    const result = streamText({
      model,
      system: systemPrompt,
      messages: messages.map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
    });

    const streamResult = await result;
    let fullText = '';
    for await (const chunk of streamResult.textStream) {
      fullText += chunk;
      onChunk(fullText);
    }

    const usage = await streamResult.usage;
    const inputTokens = usage?.inputTokens ?? 0;
    const outputTokens = usage?.outputTokens ?? 0;
    const usageResult: AIUsageResult = {
      model: modelName,
      promptTokens: inputTokens,
      completionTokens: outputTokens,
      totalTokens: usage?.totalTokens ?? (inputTokens + outputTokens),
    };
    onComplete(fullText, usageResult);
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
  abortSignal?: AbortSignal,
): Promise<string> {
  const model = createModel(config);

  const result = await generateText({
    model,
    system: systemPrompt,
    messages: messages.map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    })),
    abortSignal,
  });

  return result.text;
}
