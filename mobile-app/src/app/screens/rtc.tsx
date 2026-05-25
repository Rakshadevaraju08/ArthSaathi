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
import { endpoints } from '../../services/api';
import { Card } from '../../components/ui/Card';
import { C } from '../../constants/colors';
import type { RtcData } from '../../types';

const FIELDS: { key: keyof RtcData; label: string }[] = [
  { key: 'surveyNumber', label: 'Survey Number' },
  { key: 'ownerName',    label: 'Owner Name'    },
  { key: 'village',      label: 'Village'       },
  { key: 'taluk',        label: 'Taluk'         },
  { key: 'district',     label: 'District'      },
  { key: 'landArea',     label: 'Land Area'     },
  { key: 'cropType',     label: 'Crop Type'     },
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

  // Auto-fetch the user's latest RTC record from the backend on load
  useEffect(() => {
    const fetchExisting = async () => {
      try {
        const res = await endpoints.getRtcRecords();
        if (res.data?.data?.length > 0) {
          const d = res.data.data[0]; // Get the most recent record
          setRtc({
            surveyNumber: d.surveyNumber ?? d.survey_number ?? '',
            ownerName:    d.ownerName    ?? d.owner_name    ?? '',
            village:      d.village      ?? '',
            taluk:        d.taluk        ?? '',
            district:     d.district     ?? '',
            landArea:     d.landArea     ?? d.land_area     ?? '',
            cropType:     d.cropType     ?? d.crop_type     ?? '',
          });
        }
      } catch (err) {
        console.warn('Failed to fetch existing RTC records');
      }
    };
    fetchExisting();
  }, []);

  const uploadFile = async (uri: string, name: string, mimeType: string) => {
    setScanning(true);
    setProgress(0);

    // Animate progress bar while uploading
    const iv = setInterval(() => setProgress((p) => Math.min(90, p + 5)), 200);

    try {
      const form = new FormData();
      form.append('file', {
        uri,
        name,
        type: mimeType,
      } as any);

      const res = await endpoints.uploadRtc(form);
      clearInterval(iv);
      setProgress(100);

      // Map backend response to RtcData
      const d = res.data.data.extractedData || res.data.data;
      const rtc: RtcData = {
        surveyNumber: d.surveyNumber ?? d.survey_number ?? '',
        ownerName:    d.ownerName    ?? d.owner_name    ?? '',
        village:      d.village      ?? '',
        taluk:        d.taluk        ?? '',
        district:     d.district     ?? '',
        landArea:     d.landArea     ?? d.land_area     ?? '',
        cropType:     d.cropType     ?? d.crop_type     ?? '',
      };
      setRtc(rtc);
    } catch (err: any) {
      clearInterval(iv);
      const msg = err?.response?.data?.message || 'RTC upload failed. Please try again.';
      Alert.alert('Upload Error', msg);
    } finally {
      setScanning(false);
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') { Alert.alert('Permission needed'); return; }
    const r = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.9 });
    if (!r.canceled && r.assets[0]) {
      const asset = r.assets[0];
      await uploadFile(asset.uri, asset.fileName || 'photo.jpg', asset.mimeType || 'image/jpeg');
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') { Alert.alert('Permission needed'); return; }
    const r = await ImagePicker.launchCameraAsync({ quality: 0.9 });
    if (!r.canceled && r.assets[0]) {
      const asset = r.assets[0];
      await uploadFile(asset.uri, asset.fileName || 'camera.jpg', asset.mimeType || 'image/jpeg');
    }
  };

  const pickDoc = async () => {
    const r = await DocumentPicker.getDocumentAsync({ type: 'application/pdf' });
    if (!r.canceled && r.assets[0]) {
      const asset = r.assets[0];
      await uploadFile(asset.uri, asset.name || 'document.pdf', asset.mimeType || 'application/pdf');
    }
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
              style={{ flexDirection: 'row', alignItems: 'center', gap: 14, borderRadius: 18, padding: 16, shadowColor: C.emerald500, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 }}
            >
              <View className="w-12 h-12 bg-white/20 rounded-full items-center justify-center">
                <Feather name="camera" size={24} color={C.white} />
              </View>
              <View className="flex-1">
                <Text className="text-white font-bold text-base">Scan with Camera</Text>
                <Text className="text-white/80 text-xs mt-0.5">Take a clear picture of your RTC</Text>
              </View>
              <Feather name="chevron-right" size={20} color={C.white} opacity={0.8} />
              </LinearGradient>
            </TouchableOpacity>

            {/* Gallery */}
            <TouchableOpacity
              activeOpacity={0.8} onPress={pickImage}
            className="flex-row items-center gap-4 bg-white border border-slate-200 rounded-2xl p-4"
            style={{ shadowColor: '#94a3b8', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 }}
          >
            <View className="w-12 h-12 bg-emerald-50 rounded-full items-center justify-center">
              <Feather name="image" size={24} color={C.emerald600} />
            </View>
            <View className="flex-1">
              <Text className="text-slate-800 font-bold text-sm">Upload from Gallery</Text>
              <Text className="text-slate-500 text-xs mt-0.5">Select an existing photo (JPG, PNG)</Text>
            </View>
            <Feather name="chevron-right" size={20} color={C.slate400} />
            </TouchableOpacity>

            {/* PDF */}
            <TouchableOpacity
              activeOpacity={0.8} onPress={pickDoc}
            className="flex-row items-center gap-4 bg-white border border-slate-200 rounded-2xl p-4"
            style={{ shadowColor: '#94a3b8', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 }}
          >
            <View className="w-12 h-12 bg-emerald-50 rounded-full items-center justify-center">
              <Feather name="file-text" size={24} color={C.emerald600} />
            </View>
            <View className="flex-1">
              <Text className="text-slate-800 font-bold text-sm">Upload Document</Text>
              <Text className="text-slate-500 text-xs mt-0.5">Choose a downloaded PDF file</Text>
            </View>
            <Feather name="chevron-right" size={20} color={C.slate400} />
            </TouchableOpacity>

            {/* Info */}
          <Card className="p-4 mt-2">
            <View className="flex-row items-center gap-2 mb-1.5">
              <Feather name="info" size={16} color={C.emerald600} />
              <Text className="text-sm font-bold text-slate-800">What is RTC?</Text>
              </View>
            <Text className="text-xs text-slate-500 leading-5">
              Record of Rights, Tenancy and Crops — an official Karnataka land record proving ownership. Required for agricultural loans.
            </Text>
          </Card>
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
                  <Text className="text-sm font-semibold text-slate-800">{rtcData[key] || '—'}</Text>
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