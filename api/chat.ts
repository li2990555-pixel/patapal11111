import { GoogleGenAI, type Chat } from '@google/genai';
import type { Content } from '@google/genai';

export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  try {
    const { history, message } = (await req.json()) as { history: Content[]; message: string };

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

    const chat: Chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: "你是Pata，一个可爱、治愈系的史莱姆宠物。你的性格温柔、体贴，带一点可爱的孩子气。你的主要功能是作为用户支持性的伙伴。保持你的回答简短（如果可能，在80个字以内）、温暖和鼓励。你也是一个很好的倾听者，当用户想谈论他们的感受或发泄时。你也可以帮助用户完成背诵任务。",
        temperature: 0.9,
        topP: 1,
      },
      history: history,
    });

    const stream = await chat.sendMessageStream({ message });

    const responseStream = new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          const text = chunk.text ?? '';
          // Send data as Server-Sent Events (SSE)
          controller.enqueue(`data: ${JSON.stringify({ text })}\n\n`);
        }
        controller.close();
      },
    });

    return new Response(responseStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Error in chat API:', error);
    return new Response(JSON.stringify({ error: 'Failed to get response from AI' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
