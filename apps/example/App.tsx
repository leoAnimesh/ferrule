import '@leoanimesh/ferrule-native';
import { Inter_400Regular } from '@expo-google-fonts/inter/400Regular';
import { Inter_500Medium } from '@expo-google-fonts/inter/500Medium';
import { Inter_600SemiBold } from '@expo-google-fonts/inter/600SemiBold';
import { Inter_700Bold } from '@expo-google-fonts/inter/700Bold';
import { Caveat_700Bold } from '@expo-google-fonts/caveat/700Bold';
import { Lora_400Regular } from '@expo-google-fonts/lora/400Regular';
import { Lora_400Regular_Italic } from '@expo-google-fonts/lora/400Regular_Italic';
import { Lora_500Medium } from '@expo-google-fonts/lora/500Medium';
import { Lora_600SemiBold } from '@expo-google-fonts/lora/600SemiBold';
import { Lora_700Bold } from '@expo-google-fonts/lora/700Bold';
import { SpaceMono_400Regular } from '@expo-google-fonts/space-mono/400Regular';
import { SpaceMono_700Bold } from '@expo-google-fonts/space-mono/700Bold';
import { useFonts } from 'expo-font';
import { LogBox } from 'react-native';
import { Harness } from './src/harness/Harness';

// React Native's own dev notice from a sticky header's native scroll animation. Its toast would land in regression screenshots.
LogBox.ignoreLogs(['Sending `onAnimatedValueUpdate`']);

export default function App() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold,
    Lora_400Regular, Lora_400Regular_Italic, Lora_500Medium, Lora_600SemiBold, Lora_700Bold, Caveat_700Bold, SpaceMono_400Regular, SpaceMono_700Bold,
  });
  if (!fontsLoaded) return null;
  return <Harness />;
}
