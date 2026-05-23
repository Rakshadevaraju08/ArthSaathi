// Lazy-load expo-av — not available in Expo Go without a custom dev client
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let Audio: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  Audio = require('expo-av').Audio;
} catch {
  Audio = null;
}
import { cacheDirectory, writeAsStringAsync, EncodingType } from 'expo-file-system/legacy';
import axios from 'axios';
import { Buffer } from 'buffer';

const VOICE_URL = process.env.EXPO_PUBLIC_VOICE_URL ?? 'http://localhost:8001';

export async function speakText(text: string, language: string): Promise<void> {
  if (!Audio) return;          // expo-av not available (Expo Go)
  try {
    const res = await axios.post(
      `${VOICE_URL}/voice/tts`,
      { text, language },
      { responseType: 'arraybuffer', timeout: 15000 }
    );
    const b64  = Buffer.from(res.data, 'binary').toString('base64');
    const path = (cacheDirectory || '') + 'tts.mp3';
    await writeAsStringAsync(path, b64, { encoding: EncodingType.Base64 });
    const { sound } = await Audio.Sound.createAsync({ uri: path });
    await sound.playAsync();
    sound.setOnPlaybackStatusUpdate((s) => {
      if (s.isLoaded && s.didJustFinish) sound.unloadAsync();
    });
  } catch (e) {
    console.warn('TTS failed', e);
  }
}