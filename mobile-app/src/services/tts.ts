import { AudioPlayer, createAudioPlayer } from 'expo-audio';
import { cacheDirectory, writeAsStringAsync, EncodingType } from 'expo-file-system/legacy';
import axios from 'axios';
import { Buffer } from 'buffer';

const VOICE_URL = process.env.EXPO_PUBLIC_VOICE_URL ?? 'http://localhost:8001';

let player: AudioPlayer | null = null;

export async function speakText(text: string, language: string): Promise<void> {
  try {
    const res = await axios.post(
      `${VOICE_URL}/voice/tts`,
      { text, language },
      { responseType: 'arraybuffer', timeout: 15000 }
    );
    const b64  = Buffer.from(res.data, 'binary').toString('base64');
    const path = (cacheDirectory || '') + 'tts.mp3';
    await writeAsStringAsync(path, b64, { encoding: EncodingType.Base64 });

    // Release previous player if any
    player?.release();
    player = createAudioPlayer({ uri: path });
    player.play();
  } catch (e) {
    console.warn('TTS failed', e);
  }
}