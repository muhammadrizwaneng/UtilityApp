import AsyncStorage from '@react-native-async-storage/async-storage';

export const NOTES_KEY = '@utilityhub_notes';

export async function clearAllNotes(): Promise<void> {
    await AsyncStorage.removeItem(NOTES_KEY);
}
