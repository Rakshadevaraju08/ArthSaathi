import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { BellRing, ChevronRight, Fingerprint, Shield, Type } from 'lucide-react-native';

import { C } from '../../constants/colors';
import { useStore } from '../../store';
import { endpoints } from '../../services/api';
import { setToken } from '../../services/auth';
import type { Lang } from '../../types';

const LANGS: { code: Lang; native: string }[] = [
  { code: 'English', native: 'English' },
  { code: 'Hindi', native: 'Hindi' },
  { code: 'Kannada', native: 'Kannada' },
  { code: 'Marathi', native: 'Marathi' },
  { code: 'Tamil', native: 'Tamil' },
  { code: 'Telugu', native: 'Telugu' },
];

const langMap: Record<string, string> = { English: 'en', Hindi: 'hi', Kannada: 'kn', Marathi: 'mr', Tamil: 'ta', Telugu: 'te' };

const TOGGLES = [
  { key: 'notif', label: 'Enable Fraud Warnings', Icon: BellRing },
  { key: 'fraud', label: 'Notifications Alerts', Icon: Shield },
  { key: 'largeText', label: 'Large Accessibility Text', Icon: Type },
  { key: 'biometric', label: 'Biometric Passkey Access', Icon: Fingerprint },
] as const;

const MENU = ['Privacy Policy', 'Help & Support', 'About ArthSaathi'];

const roleLabel = {
  FARMER: 'Farmer',
  SHOP_OWNER: 'Grocery Shop',
  TAILOR: 'Tailor',
  DAILY_WAGE: 'Daily Wage Worker',
};

export default function ProfileScreen() {
  const router = useRouter();
  const storeOccupation = useStore((s) => s.occupation);
  const language = useStore((s) => s.language);
  const setLanguage = useStore((s) => s.setLanguage);
  const resetGlobalDataState = useStore((s) => s.resetGlobalDataState);
  const [toggles, setToggles] = useState({ notif: true, fraud: true, largeText: false, biometric: true });
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', phone: '', income: '', expenses: '', businessDetails: {} as any });

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        const res = await endpoints.getMyProfile();
        setProfileData(res.data?.data);
        if (res.data?.data?.preferences) {
          setToggles(prev => ({ ...prev, ...res.data.data.preferences }));
        }
      } catch (error) {
        console.warn('Failed to fetch profile', error);
        Alert.alert('Error', 'Could not load profile data');
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  const toggle = async (key: keyof typeof toggles) => {
    const newVal = !toggles[key];
    setToggles((current) => ({ ...current, [key]: newVal }));
    try {
      await endpoints.updateProfile({ preferences: { ...toggles, [key]: newVal } });
    } catch (e) {
      console.warn('Failed to update preference on backend', e);
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-slate-50 items-center justify-center" edges={['top']}>
        <ActivityIndicator size="large" color={C.emerald600} />
      </SafeAreaView>
    );
  }

  const mapOccupation = (occ?: string) => {
    switch (occ?.toLowerCase()) {
      case 'farmer': return 'FARMER';
      case 'shop_owner': return 'SHOP_OWNER';
      case 'tailor': return 'TAILOR';
      case 'daily_wage_worker':
      case 'daily_wage': return 'DAILY_WAGE';
      default: return 'FARMER';
    }
  };

  let businessDetails: any = {};
  let derivedOccupation = storeOccupation;

  if (profileData?.farmerProfile) { businessDetails = profileData.farmerProfile; derivedOccupation = 'FARMER'; }
  else if (profileData?.shopProfile) { businessDetails = profileData.shopProfile; derivedOccupation = 'SHOP_OWNER'; }
  else if (profileData?.tailorProfile) { businessDetails = profileData.tailorProfile; derivedOccupation = 'TAILOR'; }
  else if (profileData?.genericProfile) { businessDetails = profileData.genericProfile; derivedOccupation = 'DAILY_WAGE'; }
  else if (profileData?.occupation) { derivedOccupation = mapOccupation(profileData.occupation); }

  const fullName = profileData?.name || 'ArthSaathi User';
  const mobileNumber = profileData?.phone || 'Not set';
  const occupationEnum = derivedOccupation;
  const monthlyIncome = businessDetails?.monthlyIncome || profileData?.monthlyIncome || 0;
  const monthlyExpenses = businessDetails?.monthlyExpenses || profileData?.monthlyExpenses || 0;

  const initials = (fullName || 'User')
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const handleLogout = () => {
    router.replace('/(auth)/logout');
  };

  const joinedDate = businessDetails?.createdAt
    ? new Date(businessDetails.createdAt).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : '';

  const startEditing = () => {
    const cleanBusinessDetails = { ...businessDetails };
    delete cleanBusinessDetails.createdAt;
    delete cleanBusinessDetails.updatedAt;
    delete cleanBusinessDetails.id;
    delete cleanBusinessDetails.userId;

    setEditForm({
      name: fullName,
      phone: mobileNumber !== 'Not set' ? mobileNumber : '',
      income: String(monthlyIncome),
      expenses: String(monthlyExpenses),
      businessDetails: cleanBusinessDetails
    });
    setIsEditing(true);
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      const payloadBusinessDetails = { ...editForm.businessDetails };
      if (typeof payloadBusinessDetails.crops === 'string') {
        payloadBusinessDetails.crops = payloadBusinessDetails.crops.split(',').map((c: string) => c.trim());
      }
      await endpoints.updateProfile({
        name: editForm.name, phone: editForm.phone, monthlyIncome: editForm.income,
        monthlyExpenses: editForm.expenses, businessDetails: payloadBusinessDetails
      });
      const res = await endpoints.getMyProfile();
      setProfileData(res.data?.data);
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully.');
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleLanguageChange = async (code: Lang) => {
    setLanguage(code);
    try { await endpoints.updateProfile({ language: langMap[code] || 'en' }); } catch (e) {}
  };

  const displayDetails = Object.entries(businessDetails).filter(
    ([key]) => !['monthlyIncome', 'monthlyExpenses', 'id', 'userId', 'occupation', 'createdAt', 'updatedAt'].includes(key)
  );

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={['top']}>
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={[C.emerald600, C.teal600]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            marginHorizontal: 16,
            marginTop: 16,
            borderRadius: 20,
            padding: 18,
            paddingBottom: 20,
          }}
        >
          <View className="flex-row items-start justify-between">
            <View className="flex-1 pr-3">
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-emerald-50 text-xs font-black uppercase">Account Profile</Text>
                <TouchableOpacity onPress={isEditing ? handleSaveProfile : startEditing} className="bg-white/20 px-3 py-1 rounded-full">
                  <Text className="text-white text-xs font-bold">{isEditing ? (saving ? 'Saving...' : 'Save') : 'Edit Profile'}</Text>
                </TouchableOpacity>
              </View>
              {isEditing ? (
                <TextInput
                  value={editForm.name}
                  onChangeText={(text) => setEditForm((prev) => ({ ...prev, name: text }))}
                  className="text-white text-2xl font-black bg-white/20 px-3 py-1 rounded-xl"
                />
              ) : (
                <Text className="text-white text-2xl font-black mt-1" numberOfLines={1}>{fullName || 'ArthSaathi User'}</Text>
              )}
              <View className="flex-row items-center mt-2 flex-wrap">
                <View className="self-start bg-white/20 border border-white/20 rounded-full px-3 py-1 mr-2 mb-1">
                  <Text className="text-white text-xs font-black">{roleLabel[occupationEnum as keyof typeof roleLabel] || 'Unknown'}</Text>
                </View>
                {joinedDate ? (
                  <View className="self-start bg-white/20 border border-white/20 rounded-full px-3 py-1 mb-1">
                    <Text className="text-white text-xs font-black">Joined {joinedDate}</Text>
                  </View>
                ) : null}
              </View>
            </View>

            <View className="items-center">
              <View
                className="w-20 h-20 rounded-3xl bg-white items-center justify-center"
                style={{
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 6 },
                  shadowOpacity: 0.16,
                  shadowRadius: 10,
                  elevation: 6,
                }}
              >
                <Text className="text-2xl font-black text-emerald-600">{initials}</Text>
              </View>
              <View className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-emerald-50 border-2 border-emerald-600 items-center justify-center">
                <Feather name="check" size={15} color={C.emerald600} />
              </View>
            </View>
          </View>

          <View className="flex-row mt-5">
            <View className="flex-1 bg-white/15 rounded-2xl px-3 py-3 mr-2">
              <Text className="text-emerald-50 text-[11px] font-bold">Mobile</Text>
              {isEditing ? (
                <TextInput
                  value={editForm.phone}
                  onChangeText={(text) => setEditForm((prev) => ({ ...prev, phone: text }))}
                  keyboardType="phone-pad"
                  className="text-white text-sm font-black mt-1 bg-white/20 px-2 py-0.5 rounded"
                />
              ) : (
                <Text className="text-white text-sm font-black mt-1" numberOfLines={1}>
                  {mobileNumber || 'Not set'}
                </Text>
              )}
            </View>
            <View className="flex-1 bg-white/15 rounded-2xl px-3 py-3 ml-2">
              <Text className="text-emerald-50 text-[11px] font-bold">Language</Text>
              <Text className="text-white text-sm font-black mt-1">{language}</Text>
            </View>
          </View>
        </LinearGradient>

        <View className="px-4 mt-4">
          <View className="flex-row mb-3">
            <View className="flex-1 bg-white rounded-2xl border border-slate-100 p-4 mr-2">
              <Text className="text-slate-500 text-xs font-bold">Monthly income</Text>
              {isEditing ? (
                <TextInput
                  value={editForm.income}
                  onChangeText={(text) => setEditForm((prev) => ({ ...prev, income: text }))}
                  keyboardType="numeric"
                  className="text-slate-900 text-lg font-black mt-1 bg-slate-50 p-2 rounded-lg border border-slate-200"
                />
              ) : (
                <Text className="text-slate-900 text-lg font-black mt-1">
                  Rs {Number(monthlyIncome || 0).toLocaleString('en-IN')}
                </Text>
              )}
            </View>
            <View className="flex-1 bg-white rounded-2xl border border-slate-100 p-4 ml-2">
              <Text className="text-slate-500 text-xs font-bold">Monthly expenses</Text>
              {isEditing ? (
                <TextInput
                  value={editForm.expenses}
                  onChangeText={(text) => setEditForm((prev) => ({ ...prev, expenses: text }))}
                  keyboardType="numeric"
                  className="text-slate-900 text-lg font-black mt-1 bg-slate-50 p-2 rounded-lg border border-slate-200"
                />
              ) : (
                <Text className="text-slate-900 text-lg font-black mt-1">
                  Rs {Number(monthlyExpenses || 0).toLocaleString('en-IN')}
                </Text>
              )}
            </View>
          </View>

          <View className="bg-white rounded-2xl border border-slate-100 p-4 mb-3">
            <Text className="text-sm font-black text-slate-800 mb-3">Work profile</Text>
            <View className="flex-row justify-between mb-2">
              <Text className="text-slate-500 text-sm">Profession</Text>
            <Text className="text-slate-800 text-sm font-black">{roleLabel[occupationEnum as keyof typeof roleLabel] || 'Unknown'}</Text>
            </View>
            {displayDetails.map(([key, value]) => (
              <View key={key} className="flex-row justify-between items-center mb-2">
                <Text className="text-slate-500 text-sm capitalize flex-1">{key.replace(/([A-Z])/g, ' $1')}</Text>
                {isEditing ? (
                  <TextInput
                    value={String(editForm.businessDetails[key] || '')}
                    onChangeText={(text) => setEditForm(prev => ({
                      ...prev, businessDetails: { ...prev.businessDetails, [key]: text }
                    }))}
                    className="text-slate-800 text-sm font-bold bg-slate-50 border border-slate-200 rounded px-2 py-1 flex-1 ml-3"
                    style={{ textAlign: 'right' }}
                  />
                ) : (
                  <Text className="text-slate-800 text-sm font-bold flex-1 text-right ml-3" numberOfLines={1}>
                    {Array.isArray(value) ? value.join(', ') : String(value || '')}
                  </Text>
                )}
              </View>
            ))}
          </View>

          <View className="bg-white rounded-2xl p-4 border border-slate-100 mb-3">
            <Text className="text-sm font-black text-slate-800 mb-3">Select Language</Text>
            <View className="flex-row flex-wrap">
              {LANGS.map((item) => (
                <TouchableOpacity
                  key={item.code}
                  onPress={() => handleLanguageChange(item.code)}
                  className={`px-3 py-2 rounded-xl items-center border mr-2 mb-2 ${
                    language === item.code ? 'bg-emerald-500 border-emerald-600' : 'bg-white border-slate-300'
                  }`}
                >
                  <Text className={`text-[11px] font-bold ${language === item.code ? 'text-white' : 'text-slate-700'}`}>
                    {item.native}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View className="bg-white rounded-2xl border border-slate-100 overflow-hidden mb-3">
            <Text className="text-sm font-black text-slate-800 px-4 pt-4 pb-3">Preferences</Text>
            {TOGGLES.map((row, index) => (
              <View key={row.key} className={`flex-row items-center px-4 py-3 ${index < TOGGLES.length - 1 ? 'border-b border-slate-100' : ''}`}>
                <row.Icon size={16} color={C.slate500} />
                <Text className="flex-1 text-sm text-slate-700 font-medium ml-3">{row.label}</Text>
                <Switch value={toggles[row.key]} onValueChange={() => toggle(row.key)} trackColor={{ false: C.slate200, true: C.emerald500 }} thumbColor={C.white} />
              </View>
            ))}
          </View>

          <View className="bg-white rounded-2xl border border-slate-100 overflow-hidden mb-3">
            {MENU.map((item, index) => (
              <TouchableOpacity key={item} className={`flex-row items-center justify-between px-4 py-3.5 ${index < MENU.length - 1 ? 'border-b border-slate-100' : ''}`}>
                <Text className="text-sm text-slate-700 font-medium">{item}</Text>
                <ChevronRight size={14} color={C.slate400} />
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity onPress={handleLogout} activeOpacity={0.85} className="bg-rose-50 border border-rose-100 rounded-2xl py-3.5 items-center justify-center">
            <Text className="text-sm font-bold text-rose-600">Log Out</Text>
          </TouchableOpacity>

          <Text className="text-center text-[11px] text-slate-500 mt-3 mb-2">Version 1.0.4 - Local Prototype</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
