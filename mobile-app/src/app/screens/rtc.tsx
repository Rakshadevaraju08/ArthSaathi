import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as DocumentPicker from 'expo-document-picker';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { isAxiosError } from 'axios';
import { useRouter } from 'expo-router';

import { C } from '../../constants/colors';
import { useStore } from '../../store';
import { endpoints } from '../../services/api';
import type { RtcData } from '../../types';

export default function RtcScreen() {
  const router = useRouter();
  const setRtc = useStore((s) => s.setRtc);
  const rtcData = useStore((s) => s.rtcData);

  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<RtcData | null>(rtcData);
  const [fileName, setFileName] = useState<string | null>(null);

  const pickAndUpload = async () => {
    try {
      // Step 1: Open document picker
      const picked = await DocumentPicker.getDocumentAsync({
        type: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
        copyToCacheDirectory: true,
      });

      if (picked.canceled || !picked.assets?.[0]) return;

      const file = picked.assets[0];
      setFileName(file.name);
      setUploading(true);

      // Step 2: Build FormData
      const formData = new FormData();
      formData.append('file', {
        uri: file.uri,
        name: file.name,
        type: file.mimeType ?? 'application/octet-stream',
      } as any);

      // Step 3: Upload to backend
      const res = await endpoints.uploadRtc(formData);
      const data = res.data?.data;

      if (!data?.extractedData) throw new Error('Invalid response from server.');

      const extracted: RtcData = {
        ownerName: data.extractedData.ownerName ?? '',
        surveyNumber: data.extractedData.surveyNumber ?? '',
        village: data.extractedData.village ?? '',
        taluk: data.extractedData.taluk ?? '',
        district: data.extractedData.district ?? '',
        landArea: data.extractedData.landArea ?? '',
        cropType: data.extractedData.cropType ?? '',
      };

      setResult(extracted);
      setRtc(extracted);
    } catch (error) {
      if (isAxiosError(error)) {
        if (error.response?.status === 503) {
          Alert.alert(
            'OCR Service Offline',
            'The document scanning service is currently unavailable. Please try again later.'
          );
        } else {
          Alert.alert('Upload failed', error.response?.data?.message || 'Failed to process document.');
        }
      } else {
        Alert.alert('Error', 'Failed to pick or upload document. Please try again.');
      }
    } finally {
      setUploading(false);
    }
  };

  const fields = result
    ? [
        { label: 'Owner Name', value: result.ownerName },
        { label: 'Survey Number', value: result.surveyNumber },
        { label: 'Village', value: result.village },
        { label: 'Taluk', value: result.taluk },
        { label: 'District', value: result.district },
        { label: 'Land Area', value: result.landArea },
        { label: 'Crop Type', value: result.cropType },
      ]
    : [];

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={['top']}>
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={[C.amber600, '#d97706']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ paddingHorizontal: 20, paddingTop: 22, paddingBottom: 26, borderBottomLeftRadius: 28, borderBottomRightRadius: 28 }}
        >
          <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: 12 }}>
            <Feather name="arrow-left" size={22} color="#fff" />
          </TouchableOpacity>
          <Text className="text-white text-2xl font-black">RTC Land Record</Text>
          <Text className="text-amber-50 text-sm mt-2">Upload your RTC / Pahani document (JPEG, PNG, WEBP, or PDF) to extract land record details.</Text>
        </LinearGradient>

        <View className="px-5 mt-5">
          {/* Upload card */}
          <View className="bg-white rounded-2xl border border-slate-100 p-5 mb-4">
            <TouchableOpacity
              onPress={pickAndUpload}
              disabled={uploading}
              style={{
                borderWidth: 2,
                borderColor: uploading ? '#cbd5e1' : C.amber600,
                borderStyle: 'dashed',
                borderRadius: 16,
                padding: 28,
                alignItems: 'center',
                backgroundColor: uploading ? '#f8fafc' : '#fffbeb',
              }}
            >
              {uploading ? (
                <ActivityIndicator size="large" color={C.amber600} />
              ) : (
                <MaterialIcons name="upload-file" size={40} color={C.amber600} />
              )}
              <Text style={{ fontSize: 16, fontWeight: '900', color: uploading ? '#94a3b8' : C.amber600, marginTop: 12 }}>
                {uploading ? 'Scanning document...' : 'Tap to upload RTC document'}
              </Text>
              <Text style={{ fontSize: 12, color: '#94a3b8', marginTop: 6, textAlign: 'center' }}>
                {uploading ? 'AI OCR is extracting land record details' : 'Supported formats: JPEG, PNG, WEBP, PDF (max 10 MB)'}
              </Text>
              {fileName && !uploading && (
                <View style={{ marginTop: 10, backgroundColor: '#fef3c7', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 }}>
                  <Text style={{ fontSize: 11, color: C.amber600, fontWeight: 'bold' }}>📄 {fileName}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Extracted data */}
          {result && (
            <View className="bg-white rounded-2xl border border-slate-100 p-4 mb-4">
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 14 }}>
                <View style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: '#dcfce7', alignItems: 'center', justifyContent: 'center', marginRight: 10 }}>
                  <Feather name="check-circle" size={18} color={C.emerald600} />
                </View>
                <Text style={{ fontSize: 16, fontWeight: '900', color: '#0f172a' }}>Extracted Land Details</Text>
              </View>

              {fields.map(({ label, value }) => (
                <View
                  key={label}
                  style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' }}
                >
                  <Text style={{ fontSize: 13, color: '#64748b', fontWeight: '600' }}>{label}</Text>
                  <Text style={{ fontSize: 13, color: '#1e293b', fontWeight: 'bold', flex: 1, textAlign: 'right', marginLeft: 12 }}>
                    {value || '—'}
                  </Text>
                </View>
              ))}

              <TouchableOpacity
                onPress={pickAndUpload}
                style={{ marginTop: 14, borderWidth: 1, borderColor: C.amber600, borderRadius: 12, paddingVertical: 10, alignItems: 'center' }}
              >
                <Text style={{ color: C.amber600, fontWeight: 'bold', fontSize: 13 }}>Re-scan Document</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Info card */}
          <View className="bg-white rounded-2xl border border-slate-100 p-4">
            <Text style={{ fontSize: 14, fontWeight: '900', color: '#1e293b', marginBottom: 10 }}>Why upload RTC?</Text>
            {[
              'Verify land ownership and area for loan applications',
              'Confirm crop type and survey number for government schemes',
              'Build your digital land record for banking and insurance',
            ].map((tip) => (
              <View key={tip} style={{ flexDirection: 'row', marginBottom: 8, alignItems: 'flex-start' }}>
                <Text style={{ color: C.emerald600, marginRight: 8, marginTop: 1 }}>✓</Text>
                <Text style={{ fontSize: 12, color: '#475569', lineHeight: 18, flex: 1 }}>{tip}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}