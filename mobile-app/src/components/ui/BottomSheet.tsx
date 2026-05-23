import React from 'react';
import {
  Modal, View, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform,
} from 'react-native';

type Props = {
  visible:  boolean;
  onClose:  () => void;
  children: React.ReactNode;
};

export function BottomSheet({ visible, onClose, children }: Props) {
  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <View
          style={StyleSheet.absoluteFill}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={onClose}
            className="flex-1 bg-black/40"
          />
        </View>

        <View
          className="bg-white rounded-t-3xl p-5 pb-9"
        >
          <View className="w-10 h-1 bg-slate-200 rounded-full self-center mb-4" />
          {children}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}