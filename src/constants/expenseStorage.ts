import AsyncStorage from '@react-native-async-storage/async-storage';

export const EXPENSES_KEY = '@utilityhub_expenses';

export async function clearAllExpenses(): Promise<void> {
    await AsyncStorage.removeItem(EXPENSES_KEY);
}
