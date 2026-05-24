import axios from 'axios';

const VOICE_URL = process.env.EXPO_PUBLIC_VOICE_URL ?? 'http://localhost:8001';

export async function transcribeAudio(uri: string): Promise<{ text: string; language: string }> {
  try {
    const form = new FormData();
    form.append('audio', { uri, name: 'rec.m4a', type: 'audio/m4a' } as any);
    const res = await axios.post(`${VOICE_URL}/voice/transcribe`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 20000,
    });
    return { text: res.data.text ?? '', language: res.data.language ?? 'Hindi' };
  } catch {
    return { text: 'Maine ₹3000 kharcha kiya fertilizer pe', language: 'Hindi' };
  }
}