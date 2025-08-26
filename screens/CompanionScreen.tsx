import React, { useState, useEffect, useRef, useCallback } from 'react';
import PataSlime from '../components/PataSlime';
import SendIcon from '../components/icons/SendIcon';
import MicrophoneIcon from '../components/icons/MicrophoneIcon';
import KeyboardIcon from '../components/icons/KeyboardIcon';
import { ChatMessage } from '../types';
import PermissionGuideModal from '../components/PermissionGuideModal';
import { GoogleGenAI, Chat } from "@google/genai";

// Check for browser support for SpeechRecognition API
const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
const isSpeechRecognitionSupported = !!SpeechRecognitionAPI;

const ChatBubble: React.FC<{ message: string; from: 'user' | 'pata'; pataBackground: string | null; }> = ({ message, from, pataBackground }) => {
    const isPata = from === 'pata';
    const pataDefaultBg = 'linear-gradient(to bottom right, #818cf8, #a855f7)';
    
    const bubbleStyle = isPata ? { background: pataBackground || pataDefaultBg } : {};

    return (
        <div className={`flex items-end gap-2 ${isPata ? 'justify-start' : 'justify-end'}`}>
            {isPata && (
              <div className="flex-shrink-0">
                 <PataSlime size="xs" background={pataBackground} />
              </div>
            )}
            <div 
                className={`max-w-xs md:max-w-sm px-4 py-2 rounded-2xl shadow-sm ${
                    isPata 
                    ? 'text-white rounded-bl-none' 
                    : 'bg-violet-500 text-white rounded-br-none'
                }`}
                style={bubbleStyle}
            >
                 {(message === '...' || (isPata && message === '')) ? (
                    <div className="flex items-center gap-1.5 py-1">
                        <span className="w-1.5 h-1.5 bg-white/70 rounded-full animate-pulse" style={{animationDelay: '0s'}}></span>
                        <span className="w-1.5 h-1.5 bg-white/70 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></span>
                        <span className="w-1.5 h-1.5 bg-white/70 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></span>
                    </div>
                ) : (
                    <p className="whitespace-pre-wrap">{message}</p>
                )}
            </div>
        </div>
    );
}

interface CompanionScreenProps {
  pataBackground: string | null;
  chatMessages: ChatMessage[];
  setChatMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  currentUser: string | null;
}

const CompanionScreen: React.FC<CompanionScreenProps> = ({ pataBackground, chatMessages, setChatMessages, currentUser }) => {
    const [chatInput, setChatInput] = useState('');
    const [isPataReplying, setIsPataReplying] = useState(false);
    const [inputMode, setInputMode] = useState<'text' | 'voice'>('text');
    const [isListening, setIsListening] = useState(false);
    const [showPermissionGuide, setShowPermissionGuide] = useState(false);
    
    const recognitionRef = useRef<any | null>(null);
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const chatRef = useRef<Chat | null>(null);

    useEffect(() => {
        if (chatMessages.length === 0 && currentUser) {
             const welcomeMessage = `哈喽 ${currentUser}！我的主要功能是陪你一起背书哦！不过，如果你想找人聊聊天，或者有什么心事想和我说，我也是一个超棒的倾听者呢。`;
            setChatMessages([{ from: 'pata', message: welcomeMessage }]);
        }
    }, [currentUser, chatMessages.length, setChatMessages]);

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [chatMessages]);
    
    useEffect(() => {
        if (chatRef.current) return;
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const systemInstruction = `你是Pata，一个可爱、治愈系的史莱姆宠物。你的性格温柔、体贴，带一点可爱的孩子气。你的主要功能是作为用户支持性的伙伴。保持你的回答简短（如果可能，在80个字以内）、温暖和鼓励。你也是一个很好的倾听者，当用户想谈论他们的感受或发泄时。你也可以帮助用户完成背诵任务。`;
            
            const historyForAI = chatMessages
                .filter(m => m.message !== '...' && !m.message.includes('我的主要功能是陪你一起背书哦'))
                .map(m => ({
                    role: m.from === 'user' ? 'user' : 'model',
                    parts: [{ text: m.message }],
                }));

            const newChat = ai.chats.create({
                model: 'gemini-2.5-flash',
                config: {
                    systemInstruction,
                    temperature: 0.9,
                    topP: 1,
                },
                history: historyForAI,
            });
            chatRef.current = newChat;
        } catch (error) {
            console.error("Failed to initialize Gemini Chat:", error);
        }
    }, [chatMessages]);

    const handleSendChatMessage = useCallback(async (messageText: string) => {
        if (!messageText.trim() || isPataReplying || !chatRef.current) return;

        const newUserMessage: ChatMessage = { from: 'user', message: messageText.trim() };
        setChatMessages(prev => [...prev, newUserMessage]);
        setIsPataReplying(true);
        setChatInput('');

        try {
            const stream = await chatRef.current.sendMessageStream({ message: messageText.trim() });
            
            setChatMessages(prev => [...prev, { from: 'pata', message: '' }]); 

            let fullResponse = '';
            for await (const chunk of stream) {
                fullResponse += chunk.text;
                setChatMessages(prev => {
                    const newMessages = [...prev];
                    if (newMessages.length > 0 && newMessages[newMessages.length - 1].from === 'pata') {
                        newMessages[newMessages.length - 1].message = fullResponse;
                    }
                    return newMessages;
                });
            }
            
            if (fullResponse.trim() === '') {
                 setChatMessages(prev => {
                    const newMessages = [...prev];
                    if (newMessages.length > 0 && newMessages[newMessages.length - 1].from === 'pata') {
                         newMessages[newMessages.length - 1].message = 'Pata好像不知道该说什么了...';
                    }
                    return newMessages;
                });
            }
        } catch (error) {
            console.error("Gemini API error:", error);
            setChatMessages(prev => [...prev, { from: 'pata', message: 'Pata现在有点累，暂时无法回复，但你的话我都有好好听着哦。' }]);
        } finally {
            setIsPataReplying(false);
        }
    }, [isPataReplying, setChatMessages]);
    
    // Setup Speech Recognition
    useEffect(() => {
        if (!isSpeechRecognitionSupported) {
            console.warn("Speech recognition is not supported by this browser.");
            return;
        }

        const recognition = new SpeechRecognitionAPI();
        recognition.continuous = false;
        recognition.lang = 'zh-CN';
        recognition.interimResults = false;

        recognition.onresult = (event: any) => {
            const transcript = event.results[event.results.length - 1][0].transcript.trim();
            if (transcript) {
                handleSendChatMessage(transcript);
            }
        };

        recognition.onerror = (event: any) => {
            console.error("Speech recognition error:", event.error);
            if (event.error === 'not-allowed') {
                setShowPermissionGuide(true);
            }
            setIsListening(false);
        };

        recognition.onend = () => {
            setIsListening(false);
        };
        
        recognitionRef.current = recognition;

    }, [handleSendChatMessage]);

    const toggleListening = () => {
        if (!recognitionRef.current || isPataReplying) return;

        if (isListening) {
            recognitionRef.current.stop();
        } else {
            try {
                recognitionRef.current.start();
                setIsListening(true);
            } catch(e) {
                console.error("Could not start recognition:", e);
                // The onerror event should handle this, but as a fallback:
                if (e instanceof DOMException && e.name === 'NotAllowedError') {
                    setShowPermissionGuide(true);
                }
                setIsListening(false);
            }
        }
    };

    return (
        <div className="flex flex-col h-full bg-slate-100">
            <div ref={chatContainerRef} className="flex-grow p-4 space-y-4 overflow-y-auto">
                {chatMessages.map((msg, index) => (
                    <ChatBubble key={index} message={msg.message} from={msg.from} pataBackground={pataBackground} />
                ))}
                {isPataReplying && chatMessages[chatMessages.length - 1]?.from === 'user' && (
                    <ChatBubble message="..." from="pata" pataBackground={pataBackground} />
                )}
            </div>

            <div className="p-4 bg-white border-t border-slate-200">
                <div className="flex items-center gap-2">
                    <button onClick={() => setInputMode(inputMode === 'text' ? 'voice' : 'text')} className="p-2 text-slate-500 hover:text-violet-500 rounded-full hover:bg-slate-100 transition-colors" aria-label={inputMode === 'text' ? '切换到语音输入' : '切换到文字输入'}>
                        {inputMode === 'text' ? <MicrophoneIcon /> : <KeyboardIcon />}
                    </button>

                    {inputMode === 'text' ? (
                        <input
                            type="text"
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSendChatMessage(chatInput)}
                            placeholder="和Pata说点什么..."
                            className="w-full px-4 py-2 bg-slate-100 text-slate-800 border-transparent rounded-full focus:ring-2 focus:ring-violet-400 focus:outline-none transition"
                            disabled={isPataReplying}
                        />
                    ) : (
                        <button
                            onClick={toggleListening}
                            className={`w-full flex justify-center items-center gap-2 px-4 py-2 rounded-full font-semibold transition-colors ${
                                isListening ? 'bg-rose-500 text-white animate-pulse' : 'bg-violet-500 text-white hover:bg-violet-600'
                            }`}
                            disabled={isPataReplying}
                        >
                            <MicrophoneIcon />
                            {isListening ? '正在聆听...' : '按住说话'}
                        </button>
                    )}

                    {inputMode === 'text' && (
                        <button
                            onClick={() => handleSendChatMessage(chatInput)}
                            disabled={!chatInput.trim() || isPataReplying}
                            className="p-2 bg-violet-500 text-white rounded-full hover:bg-violet-600 disabled:bg-slate-300 disabled:cursor-not-allowed transition-transform transform hover:scale-110 flex-shrink-0"
                            aria-label="发送消息"
                        >
                            <SendIcon />
                        </button>
                    )}
                </div>
            </div>
            {showPermissionGuide && <PermissionGuideModal onClose={() => setShowPermissionGuide(false)} />}
        </div>
    );
};

export default CompanionScreen;