import { GoogleGenAI } from "@google/genai";

// Define minimal types locally to avoid path issues in serverless environment
interface Task {
  id: number;
  text: string;
}
interface UserDiaryEntry {
  content: string;
}

export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  try {
    const { tasksForYesterday, moodsForYesterday, userDiaryForYesterday } = (await req.json()) as {
      tasksForYesterday: Task[];
      moodsForYesterday: string[];
      userDiaryForYesterday: UserDiaryEntry[];
    };

    const completedTasksText = tasksForYesterday.length > 0
        ? `完成了这些任务：${tasksForYesterday.map(t => `“${t.text}”`).join('，')}。`
        : "好像没有完成什么任务呢。";
    
    const moodsText = moodsForYesterday.length > 0
        ? `心情是这样的：${moodsForYesterday.join('，')}。`
        : "没有记录心情。";
    
    const userThoughtsText = userDiaryForYesterday.length > 0
        ? `他/她还写下了这些想法：${userDiaryForYesterday.map(e => `“${e.content}”`).join('；')}。`
        : "他/她昨天没有留下什么文字。";

    const prompt = `昨天我的好朋友${completedTasksText} ${moodsText} ${userThoughtsText} 根据这些信息，帮我以昨天的视角写一篇日记吧！`;

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            systemInstruction: "你是Pata，一个可爱、治愈系的史莱姆宠物。请你以Pata的第一人称视角，写一篇非常简短（不超过80个字）、温暖、充满关怀的日记，记录下你的好朋友（用户）昨天一天的生活。语气要温柔、体贴，可以带一点点可爱的孩子气。",
            temperature: 0.8,
            topP: 0.9,
        },
    });
    
    const text = response.text ?? '';

    return new Response(JSON.stringify({ content: text.trim() }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error("Error generating diary from Gemini:", error);
    return new Response(JSON.stringify({ error: 'Failed to generate diary' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
