import React, { useState, useRef } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';

import { useStore } from '../../store';
import { MicButton } from '../../components/voice/MicButton';
import { Waveform } from '../../components/voice/Waveform';
import { ChatBubble } from '../../components/voice/ChatBubble';
import { C } from '../../constants/colors';
import { endpoints } from '../../services/api';

type VS = 'idle' | 'listening' | 'processing' | 'done';

const STATUS_TEXT: Record<VS, string> = {
  idle:       'Tap to speak',
  listening:  'Listening...',
  processing: 'Processing...',
  done:       'Done ✓',
};

export default function VoiceScreen() {
  const router         = useRouter();
  const aiMessages     = useStore((s) => s.aiMessages);
  const addAiMessage   = useStore((s) => s.addAiMessage);
  const addTransaction = useStore((s) => s.addTransaction);
  const language       = useStore((s) => s.language);
  const scrollRef      = useRef<ScrollView>(null);

  const [state, setState] = useState<VS>('idle');

  // Map display language to backend language code
  const getLangCode = () => {
    const map: Record<string, string> = {
      Hindi: 'hi', English: 'en', Marathi: 'mr', Tamil: 'ta', Telugu: 'te',
    };
    return map[language] || 'en';
  };

  /* ── Demo fallback flow ── */
  const runDemo = () => {
    setState('processing');
    addAiMessage({ role: 'user', text: 'Maine ₹3000 kharcha kiya fertilizer pe' });
    addTransaction({ type: 'expense', amount: 3000, note: 'Fertilizer (voice)', category: 'Fertilizer' });
    setTimeout(() => {
      addAiMessage({ role: 'ai', text: 'Expense of ₹3,000 added under Fertilizer category. Your monthly expense is now updated. 💡 Tip: bulk buying can save 8–10%.' });
      setState('done');
      setTimeout(() => setState('idle'), 1000);
    }, 1500);
  };

  const startRec = async () => {
    setState('listening');
  };

  const stopRec = async () => {
    runDemo();
  };

  const handleMic = () => {
    if (state === 'idle') startRec();
    else if (state === 'listening') stopRec();
  };

  /* ── Quick prompt handler — calls financial-guidance API ── */
  const handleQuickPrompt = async (prompt: string) => {
    addAiMessage({ role: 'user', text: prompt });
    setState('processing');
    try {
      const res = await endpoints.financialGuidance(prompt, getLangCode());
      const { result } = res.data.data;
      const responseText = result.guidance +
        (result.tips?.length ? '\n\n💡 Tips:\n' + result.tips.map((t: string) => `• ${t}`).join('\n') : '');
      addAiMessage({ role: 'ai', text: responseText });
    } catch {
      addAiMessage({ role: 'ai', text: `Sure! Let me help you with: "${prompt}". Please provide more details.` });
    } finally {
      setState('idle');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white" style={{ flex: 1, backgroundColor: '#ffffff' }}>
      {/* Header */}
      <LinearGradient colors={['#ecfdf5', '#f0fdfa']} className="flex-row items-center px-4 py-3 border-b border-emerald-100">
        <TouchableOpacity
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace('/');
            }
          }}
          className="w-9 h-9 rounded-full bg-white items-center justify-center"
          style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 }}
        >
          <Feather name="x" size={18} color={C.slate600} />
        </TouchableOpacity>
        <View className="flex-1 items-center">
          <Text className="text-sm font-bold text-slate-800">ArthSaathi Voice</Text>
          <Text className="text-[10px] text-slate-400">AI Financial Assistant</Text>
        </View>
        <View className="w-9 h-9 rounded-full bg-emerald-500 items-center justify-center">
          <Text className="text-[10px] font-bold text-white">{language.slice(0, 2).toUpperCase()}</Text>
        </View>
      </LinearGradient>

      {/* Chat area */}
      <ScrollView
        ref={scrollRef}
        className="flex-1 bg-slate-50"
        style={{ flex: 1, backgroundColor: '#f8fafc' }}
        contentContainerStyle={{ paddingTop: 16, paddingBottom: 12 }}
        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
        showsVerticalScrollIndicator={false}
      >
        {aiMessages.map((msg, i) => (
          <View key={i}>
            <ChatBubble msg={msg} />
          </View>
        ))}
      </ScrollView>

      {/* Controls */}
      <View className="bg-white pt-4 pb-10 items-center border-t border-slate-100 gap-2">
        <Waveform active={state === 'listening'} />
        <Text className="text-sm font-medium text-slate-600">{STATUS_TEXT[state]}</Text>
        <MicButton listening={state === 'listening'} onPress={handleMic} />
        <Text className="text-xs text-slate-400 h-[18px]">
          {state === 'idle' ? 'Hold mic and speak in any language' : state === 'listening' ? 'Tap again to stop' : ''}
        </Text>

        {/* Quick prompts */}
        {state === 'idle' && (
          <View className="flex-row gap-2 mt-1">
            {['Add expense', 'Loan advice', 'Scam alert?'].map((p) => (
              <TouchableOpacity
                key={p}
                onPress={() => handleQuickPrompt(p)}
                className="px-3.5 py-1.5 rounded-full bg-emerald-50 border-[1.5px] border-emerald-200"
              >
                <Text className="text-xs font-semibold text-emerald-700">{p}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}