import React from 'react';
import { View, Text } from 'react-native';
import type { AIMsg } from '../../types';

export function ChatBubble({ msg }: { msg: AIMsg }) {
  const isUser = msg.role === 'user';
  return (
    <View className={`px-4 mb-2 ${isUser ? 'items-end' : 'items-start'}`}>
      <View
        className={`max-w-[85%] px-3 py-2.5 rounded-2xl ${
          isUser
            ? 'bg-emerald-500 rounded-br-[4px]'
            : 'bg-white border border-slate-100 rounded-bl-[4px]'
        }`}
        style={!isUser ? {
          borderLeftWidth: 3,
          borderLeftColor: '#10b981',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.04,
          shadowRadius: 4,
          elevation: 1,
        } : {}}
      >
        <Text className={`text-sm leading-5 ${isUser ? 'text-white' : 'text-slate-700'}`}>
          {msg.text}
        </Text>
      </View>
    </View>
  );
}