import AsyncStorage from '@react-native-async-storage/async-storage';

export const COUNTDOWN_KEY = '@utilityhub_countdowns';

export async function clearAllCountdowns(): Promise<void> {
    await AsyncStorage.removeItem(COUNTDOWN_KEY);
}
