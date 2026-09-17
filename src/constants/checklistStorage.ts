import AsyncStorage from '@react-native-async-storage/async-storage';

export const CHECKLIST_KEY = '@utilityhub_checklist';

export async function clearAllChecklist(): Promise<void> {
    await AsyncStorage.removeItem(CHECKLIST_KEY);
}
