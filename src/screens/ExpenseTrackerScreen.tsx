import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    Platform,
    StatusBar,
    FlatList,
    Alert,
    KeyboardAvoidingView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS, SPACING, SIZES, SHADOWS } from '../constants/theme';
import { EXPENSES_KEY } from '../constants/expenseStorage';
import { RootStackParamList } from '../types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'ExpenseTracker'>;

interface Props {
    navigation: NavigationProp;
}

interface Expense {
    id: string;
    amount: number;
    category: string;
    note: string;
    createdAt: number;
}

const CATEGORIES = [
    { id: 'food', label: 'Food', icon: '🍔' },
    { id: 'transport', label: 'Ride', icon: '🚗' },
    { id: 'bills', label: 'Bills', icon: '💡' },
    { id: 'shopping', label: 'Shop', icon: '🛍️' },
    { id: 'health', label: 'Health', icon: '💊' },
    { id: 'other', label: 'Other', icon: '📦' },
];

function startOfDay(ts: number) {
    const d = new Date(ts);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
}

function formatMoney(n: number) {
    return n.toLocaleString(undefined, { maximumFractionDigits: 2, minimumFractionDigits: 2 });
}

function formatWhen(ts: number) {
    const d = new Date(ts);
    return d.toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

export default function ExpenseTrackerScreen({ navigation }: Props) {
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [amount, setAmount] = useState('');
    const [note, setNote] = useState('');
    const [category, setCategory] = useState('food');
    const insets = useSafeAreaInsets();

    const load = useCallback(async () => {
        const raw = await AsyncStorage.getItem(EXPENSES_KEY);
        if (!raw) return;
        try {
            const parsed: Expense[] = JSON.parse(raw);
            setExpenses(parsed.sort((a, b) => b.createdAt - a.createdAt));
        } catch {
            /* ignore */
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    const persist = async (next: Expense[]) => {
        const sorted = [...next].sort((a, b) => b.createdAt - a.createdAt);
        setExpenses(sorted);
        await AsyncStorage.setItem(EXPENSES_KEY, JSON.stringify(sorted));
    };

    const addExpense = () => {
        const value = parseFloat(amount);
        if (!(value > 0)) {
            Alert.alert('Amount required', 'Enter how much you spent.');
            return;
        }
        const item: Expense = {
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            amount: value,
            category,
            note: note.trim(),
            createdAt: Date.now(),
        };
        persist([item, ...expenses]);
        setAmount('');
        setNote('');
    };

    const removeExpense = (item: Expense) => {
        Alert.alert('Delete expense?', item.note || formatMoney(item.amount), [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: () => persist(expenses.filter(e => e.id !== item.id)),
            },
        ]);
    };

    const { todayTotal, monthTotal } = useMemo(() => {
        const todayStart = startOfDay(Date.now());
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
        let today = 0;
        let month = 0;
        for (const e of expenses) {
            if (e.createdAt >= monthStart) month += e.amount;
            if (e.createdAt >= todayStart) today += e.amount;
        }
        return { todayTotal: today, monthTotal: month };
    }, [expenses]);

    const categoryLabel = (id: string) => CATEGORIES.find(c => c.id === id);

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={[COLORS.background, COLORS.backgroundLight]}
                style={styles.gradient}>
                <KeyboardAvoidingView
                    style={styles.mainContainer}
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                    <View
                        style={[
                            styles.mainContainer,
                            {
                                paddingTop:
                                    Math.max(
                                        insets.top,
                                        Platform.OS === 'android'
                                            ? StatusBar.currentHeight || 0
                                            : 0,
                                    ) + SPACING.md,
                            },
                        ]}>
                        <View style={styles.header}>
                            <TouchableOpacity
                                onPress={() => navigation.goBack()}
                                style={styles.backButton}>
                                <Text style={styles.backText}>←</Text>
                            </TouchableOpacity>
                            <Text style={styles.title}>Expense Tracker</Text>
                            <View style={styles.placeholder} />
                        </View>

                        <View style={styles.summaryRow}>
                            <View style={styles.summaryCard}>
                                <Text style={styles.summaryLabel}>Today</Text>
                                <Text style={styles.summaryValue}>{formatMoney(todayTotal)}</Text>
                            </View>
                            <View style={styles.summaryCard}>
                                <Text style={styles.summaryLabel}>This month</Text>
                                <Text style={[styles.summaryValue, { color: COLORS.primaryLight }]}>
                                    {formatMoney(monthTotal)}
                                </Text>
                            </View>
                        </View>

                        <View style={styles.addCard}>
                            <Text style={styles.label}>Amount</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="0.00"
                                placeholderTextColor={COLORS.textMuted}
                                keyboardType="decimal-pad"
                                value={amount}
                                onChangeText={setAmount}
                            />
                            <View style={styles.chipRow}>
                                {CATEGORIES.map(c => (
                                    <TouchableOpacity
                                        key={c.id}
                                        style={[
                                            styles.chip,
                                            category === c.id && styles.chipActive,
                                        ]}
                                        onPress={() => setCategory(c.id)}>
                                        <Text
                                            style={[
                                                styles.chipText,
                                                category === c.id && styles.chipTextActive,
                                            ]}>
                                            {c.icon} {c.label}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                            <TextInput
                                style={styles.noteInput}
                                placeholder="Note (optional)"
                                placeholderTextColor={COLORS.textMuted}
                                value={note}
                                onChangeText={setNote}
                            />
                            <TouchableOpacity style={styles.addButton} onPress={addExpense}>
                                <Text style={styles.addButtonText}>Add expense</Text>
                            </TouchableOpacity>
                        </View>

                        <FlatList
                            data={expenses}
                            keyExtractor={item => item.id}
                            contentContainerStyle={{
                                paddingHorizontal: SPACING.lg,
                                paddingBottom: insets.bottom + SPACING.xl,
                            }}
                            ListEmptyComponent={
                                <Text style={styles.empty}>
                                    No expenses yet. Add what you spent today.
                                </Text>
                            }
                            ListHeaderComponent={
                                expenses.length > 0 ? (
                                    <Text style={styles.listHint}>Long-press an item to delete</Text>
                                ) : null
                            }
                            renderItem={({ item }) => {
                                const cat = categoryLabel(item.category);
                                return (
                                    <TouchableOpacity
                                        style={styles.expenseRow}
                                        onLongPress={() => removeExpense(item)}>
                                        <Text style={styles.expenseIcon}>{cat?.icon ?? '📦'}</Text>
                                        <View style={styles.expenseBody}>
                                            <Text style={styles.expenseTitle}>
                                                {item.note || cat?.label || 'Expense'}
                                            </Text>
                                            <Text style={styles.expenseMeta}>
                                                {cat?.label} · {formatWhen(item.createdAt)}
                                            </Text>
                                        </View>
                                        <Text style={styles.expenseAmount}>
                                            {formatMoney(item.amount)}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            }}
                        />
                    </View>
                </KeyboardAvoidingView>
            </LinearGradient>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    gradient: { flex: 1 },
    mainContainer: { flex: 1 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.md,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    backButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
    backText: { fontSize: 28, color: COLORS.text },
    title: { fontSize: SIZES.fontXl, fontWeight: '700', color: COLORS.text },
    placeholder: { width: 40 },
    summaryRow: {
        flexDirection: 'row',
        gap: SPACING.md,
        paddingHorizontal: SPACING.lg,
        marginTop: SPACING.lg,
    },
    summaryCard: {
        flex: 1,
        backgroundColor: COLORS.backgroundCard,
        borderRadius: SIZES.radiusMd,
        padding: SPACING.md,
        borderWidth: 1,
        borderColor: COLORS.border,
        ...SHADOWS.medium,
    },
    summaryLabel: { color: COLORS.textMuted, fontSize: SIZES.fontSm, fontWeight: '600' },
    summaryValue: {
        marginTop: 4,
        color: COLORS.text,
        fontSize: SIZES.fontXl,
        fontWeight: '800',
    },
    addCard: {
        margin: SPACING.lg,
        backgroundColor: COLORS.backgroundCard,
        borderRadius: SIZES.radiusMd,
        padding: SPACING.lg,
        borderWidth: 1,
        borderColor: COLORS.border,
        ...SHADOWS.medium,
    },
    label: { fontSize: SIZES.fontMd, color: COLORS.textSecondary, marginBottom: SPACING.sm },
    input: { fontSize: SIZES.font2xl, fontWeight: '700', color: COLORS.text, padding: 0 },
    chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, marginTop: SPACING.md },
    chip: {
        paddingHorizontal: SPACING.sm,
        paddingVertical: 6,
        borderRadius: SIZES.radiusSm,
        backgroundColor: COLORS.backgroundLight,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    chipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
    chipText: { color: COLORS.textSecondary, fontWeight: '600', fontSize: SIZES.fontSm },
    chipTextActive: { color: COLORS.white },
    noteInput: {
        marginTop: SPACING.md,
        color: COLORS.text,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
        paddingVertical: SPACING.sm,
        fontSize: SIZES.fontMd,
    },
    addButton: {
        marginTop: SPACING.md,
        backgroundColor: COLORS.primary,
        borderRadius: SIZES.radiusSm,
        paddingVertical: SPACING.sm,
        alignItems: 'center',
    },
    addButtonText: { color: COLORS.white, fontWeight: '700', fontSize: SIZES.fontMd },
    empty: {
        textAlign: 'center',
        color: COLORS.textMuted,
        marginTop: SPACING.lg,
        fontSize: SIZES.fontMd,
    },
    listHint: {
        color: COLORS.textMuted,
        fontSize: SIZES.fontSm,
        marginBottom: SPACING.sm,
    },
    expenseRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.backgroundCard,
        borderRadius: SIZES.radiusMd,
        padding: SPACING.md,
        marginBottom: SPACING.sm,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    expenseIcon: { fontSize: 22, marginRight: SPACING.md },
    expenseBody: { flex: 1 },
    expenseTitle: { color: COLORS.text, fontWeight: '700', fontSize: SIZES.fontMd },
    expenseMeta: { color: COLORS.textMuted, fontSize: SIZES.fontSm, marginTop: 2 },
    expenseAmount: { color: COLORS.text, fontWeight: '800', fontSize: SIZES.fontMd },
});
