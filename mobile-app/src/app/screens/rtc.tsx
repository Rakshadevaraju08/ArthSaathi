import React, { useState, useEffect } from 'react';
import {
  ScrollView, View, Text, TouchableOpacity, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useStore } from '../../store';
import { Card } from '../../components/ui/Card';
import { C } from '../../constants/colors';

const FIELDS: { key: keyof NonNullable<ReturnType<typeof useStore>['rtcData']>; label: string }[] = [
  { key: 'survey',   label: 'Survey Number' },
  { key: 'owner',    label: 'Owner Name'    },
  { key: 'village',  label: 'Village'       },
  { key: 'district', label: 'District'      },
  { key: 'area',     label: 'Land Area'     },
  { key: 'crop',     label: 'Crop Type'     },
];

function ScanLine_() {
  return (
    <View className="items-center py-6 gap-4">
      <View className="w-48 h-32 rounded-xl bg-slate-100 border-2 border-dashed border-emerald-400 overflow-hidden justify-center items-center">
        <View style={[{ position: 'absolute', left: 0, right: 0, height: 2, backgroundColor: C.emerald500, shadowColor: C.emerald500, shadowOpacity: 0.8, shadowRadius: 4 }]} />
        <Text className="text-sm text-slate-500">📄 RTC Document</Text>
      </View>
      <Text className="text-sm font-semibold text-emerald-600">🔍 AI Extracting fields...</Text>
    </View>
  );
}

export default function RtcScreen() {
  const router      = useRouter();
  const rtcUploaded = useStore((s) => s.rtcUploaded);
  const rtcData     = useStore((s) => s.rtcData);
  const setRtc      = useStore((s) => s.setRtc);

  const [scanning,  setScanning]  = useState(false);
  const [progress,  setProgress]  = useState(0);

  const simulateScan = () => {
    setScanning(true);
    setProgress(0);
    const iv = setInterval(() => setProgress((p) => Math.min(100, p + 7)), 100);
    setTimeout(() => {
      clearInterval(iv);
      setScanning(false);
      setRtc({ survey: '123/4A', owner: 'Ramesh Patil', village: 'Sindagi', district: 'Vijayapura', area: '2.5 Acres', crop: 'Sugarcane' });
    }, 2000);
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') { Alert.alert('Permission needed'); return; }
    const r = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.9 });
    if (!r.canceled) simulateScan();
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') { Alert.alert('Permission needed'); return; }
    const r = await ImagePicker.launchCameraAsync({ quality: 0.9 });
    if (!r.canceled) simulateScan();
  };

  const pickDoc = async () => {
    const r = await DocumentPicker.getDocumentAsync({ type: 'application/pdf' });
    if (!r.canceled) simulateScan();
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={['top']} style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      {/* Header */}
      <View className="flex-row items-center gap-3 px-4 py-3.5 bg-white border-b border-slate-100">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-9 h-9 rounded-full bg-slate-100 items-center justify-center"
        >
          <Text className="text-xl text-slate-700 mt-[-2px]">‹</Text>
        </TouchableOpacity>
        <View>
          <Text className="text-base font-bold text-slate-800">📄 Land Record (RTC)</Text>
          <Text className="text-xs text-slate-500">AI OCR extracts your details instantly</Text>
        </View>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 40 }} showsVerticalScrollIndicator={false} style={{ flex: 1 }}>

        {!rtcUploaded && !scanning && (
          <View className="gap-3">
            {/* Camera */}
            <TouchableOpacity activeOpacity={0.85} onPress={takePhoto}>
              <LinearGradient
                colors={[C.emerald500, C.teal600]}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 14, borderRadius: 18, padding: 18 }}
              >
              <Feather name="camera" size={28} color={C.white} />
                <View>
                  <Text className="text-white font-bold text-base">Take Photo</Text>
                  <Text className="text-white/80 text-xs mt-0.5">Scan with camera</Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>

            {/* Gallery */}
            <TouchableOpacity
              activeOpacity={0.8} onPress={pickImage}
              className="flex-row items-center gap-3 bg-white border border-slate-200 rounded-2xl p-4"
            >
              <Feather name="upload" size={24} color={C.emerald600} />
              <View>
                <Text className="text-slate-800 font-semibold text-sm">Upload from Gallery</Text>
                <Text className="text-slate-400 text-xs mt-0.5">JPG, PNG supported</Text>
              </View>
            </TouchableOpacity>

            {/* PDF */}
            <TouchableOpacity
              activeOpacity={0.8} onPress={pickDoc}
              className="flex-row items-center gap-3 bg-white border border-slate-200 rounded-2xl p-4"
            >
              <Text className="text-2xl">📑</Text>
              <View>
                <Text className="text-slate-800 font-semibold text-sm">Upload PDF</Text>
                <Text className="text-slate-400 text-xs mt-0.5">PDF documents supported</Text>
              </View>
            </TouchableOpacity>

            {/* Info */}
            <Card className="p-4">
              <Text className="text-sm font-bold text-slate-800 mb-1.5">What is RTC?</Text>
              <Text className="text-xs text-slate-500 leading-5">
                Record of Rights, Tenancy and Crops — an official Karnataka land record proving ownership. Required for agricultural loans.
              </Text>
            </Card>

            {/* Demo trigger */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={simulateScan}
              className="items-center py-4 border-2 border-dashed border-emerald-300 bg-emerald-50/50 rounded-2xl"
            >
              <View className="flex-row gap-3 mb-2 items-center">
              <Feather name="camera" size={28} color={C.emerald600} />
              <Feather name="upload" size={28} color={C.emerald600} />
              </View>
              <Text className="text-sm font-semibold text-slate-700">Tap to upload RTC document</Text>
              <Text className="text-xs text-slate-500 mt-0.5">JPG, PNG, PDF supported</Text>
            </TouchableOpacity>
          </View>
        )}

        {scanning && (
          <View>
            <Card className="p-4">
              <View className="flex-row items-center gap-2 mb-3">
              <MaterialCommunityIcons name="line-scan" size={20} color={C.emerald600} />
                <Text className="text-sm font-semibold text-slate-800">AI Extracting...</Text>
              </View>
              <ScanLine_ />
              <View className="flex-row items-center gap-2 mt-2">
                <View className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                  <View
                    style={{ width: `${progress}%` as any, height: '100%', borderRadius: 4, backgroundColor: C.emerald500 }}
                  />
                </View>
                <Text className="text-xs font-bold text-emerald-600 w-8 text-right">{progress}%</Text>
              </View>
              <Text className="text-[11px] text-slate-400 mt-2 text-center">Reading land details, owner name, village...</Text>
            </Card>
          </View>
        )}

        {rtcUploaded && rtcData && (
          <View className="gap-3">
            <Card className="p-4">
              <View className="flex-row items-center gap-2 mb-3">
              <Feather name="check-circle" size={20} color={C.emerald600} />
                <View>
                  <Text className="text-sm font-bold text-slate-800">Extracted Successfully</Text>
                  <Text className="text-xs text-slate-500 mt-0.5">AI read all fields from your RTC</Text>
                </View>
              </View>
              {FIELDS.map(({ key, label }, i) => (
                <View
                  key={key}
                  className={`flex-row justify-between items-center py-2.5 ${i < FIELDS.length - 1 ? 'border-b border-slate-100' : ''}`}
                >
                  <Text className="text-xs text-slate-500">{label}</Text>
                  <Text className="text-sm font-semibold text-slate-800">{rtcData[key]}</Text>
                </View>
              ))}
            </Card>

            <TouchableOpacity activeOpacity={0.85}>
              <LinearGradient
                colors={[C.emerald500, C.teal600]}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={{ borderRadius: 18, paddingVertical: 15, alignItems: 'center', shadowColor: C.emerald500, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 6 }}
              >
                <Text className="text-white font-bold text-base">🏦 Use for Loan Application</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              className="items-center py-3.5"
              onPress={() => useStore.setState({ rtcUploaded: false, rtcData: null })}
            >
              <Text className="text-sm font-semibold text-slate-500">🔄 Scan Another Document</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}