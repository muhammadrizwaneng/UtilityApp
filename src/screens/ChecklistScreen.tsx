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
import { CHECKLIST_KEY } from '../constants/checklistStorage';
import { RootStackParamList } from '../types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Checklist'>;

interface Props {
    navigation: NavigationProp;
}

interface Item {
    id: string;
    text: string;
    done: boolean;
    createdAt: number;
}

export default function ChecklistScreen({ navigation }: Props) {
    const [items, setItems] = useState<Item[]>([]);
    const [text, setText] = useState('');
    const insets = useSafeAreaInsets();

    const load = useCallback(async () => {
        const raw = await AsyncStorage.getItem(CHECKLIST_KEY);
        if (!raw) return;
        try {
            const parsed: Item[] = JSON.parse(raw);
            setItems(parsed);
        } catch {
            /* ignore */
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    const persist = async (next: Item[]) => {
        setItems(next);
        await AsyncStorage.setItem(CHECKLIST_KEY, JSON.stringify(next));
    };

    const addItem = () => {
        const value = text.trim();
        if (!value) return;
        persist([
            {
                id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
                text: value,
                done: false,
                createdAt: Date.now(),
            },
            ...items,
        ]);
        setText('');
    };

    const toggle = (item: Item) => {
        persist(items.map(i => (i.id === item.id ? { ...i, done: !i.done } : i)));
    };

    const remove = (item: Item) => {
        Alert.alert('Delete item?', item.text, [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: () => persist(items.filter(i => i.id !== item.id)),
            },
        ]);
    };

    const clearDone = () => {
        const remaining = items.filter(i => !i.done);
        if (remaining.length === items.length) return;
        persist(remaining);
    };

    const remaining = useMemo(() => items.filter(i => !i.done).length, [items]);

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
                            <Text style={styles.title}>Checklist</Text>
                            <View style={styles.placeholder} />
                        </View>

                        <View style={styles.summary}>
                            <Text style={styles.summaryText}>
                                {remaining} remaining · {items.length} total
                            </Text>
                            {items.some(i => i.done) && (
                                <TouchableOpacity onPress={clearDone}>
                                    <Text style={styles.clearDone}>Clear done</Text>
                                </TouchableOpacity>
                            )}
                        </View>

                        <View style={styles.addRow}>
                            <TextInput
                                style={styles.addInput}
                                placeholder="Add a task"
                                placeholderTextColor={COLORS.textMuted}
                                value={text}
                                onChangeText={setText}
                                onSubmitEditing={addItem}
                                returnKeyType="done"
                            />
                            <TouchableOpacity style={styles.addButton} onPress={addItem}>
                                <Text style={styles.addButtonText}>Add</Text>
                            </TouchableOpacity>
                        </View>

                        <FlatList
                            data={items}
                            keyExtractor={item => item.id}
                            contentContainerStyle={{
                                paddingHorizontal: SPACING.lg,
                                paddingBottom: insets.bottom + SPACING.xl,
                            }}
                            ListEmptyComponent={
                                <Text style={styles.empty}>No tasks yet. Add groceries, packing, or work items.</Text>
                            }
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.itemRow}
                                    onPress={() => toggle(item)}
                                    onLongPress={() => remove(item)}>
                                    <View
                                        style={[
                                            styles.checkbox,
                                            item.done && styles.checkboxDone,
                                        ]}>
                                        {item.done ? (
                                            <Text style={styles.checkMark}>✓</Text>
                                        ) : null}
                                    </View>
                                    <Text
                                        style={[
                                            styles.itemText,
                                            item.done && styles.itemDone,
                                        ]}>
                                        {item.text}
                                    </Text>
                                </TouchableOpacity>
                            )}
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
    summary: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: SPACING.lg,
        marginTop: SPACING.lg,
    },
    summaryText: { color: COLORS.textMuted, fontWeight: '600' },
    clearDone: { color: COLORS.primaryLight, fontWeight: '700' },
    addRow: {
        flexDirection: 'row',
        gap: SPACING.sm,
        paddingHorizontal: SPACING.lg,
        marginTop: SPACING.md,
        marginBottom: SPACING.md,
    },
    addInput: {
        flex: 1,
        backgroundColor: COLORS.backgroundCard,
        borderRadius: SIZES.radiusMd,
        borderWidth: 1,
        borderColor: COLORS.border,
        color: COLORS.text,
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
        fontSize: SIZES.fontMd,
    },
    addButton: {
        backgroundColor: COLORS.primary,
        borderRadius: SIZES.radiusMd,
        paddingHorizontal: SPACING.lg,
        justifyContent: 'center',
    },
    addButtonText: { color: COLORS.white, fontWeight: '700' },
    empty: {
        textAlign: 'center',
        color: COLORS.textMuted,
        marginTop: SPACING.lg,
        fontSize: SIZES.fontMd,
    },
    itemRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.backgroundCard,
        borderRadius: SIZES.radiusMd,
        padding: SPACING.md,
        marginBottom: SPACING.sm,
        borderWidth: 1,
        borderColor: COLORS.border,
        ...SHADOWS.small,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: COLORS.primaryLight,
        marginRight: SPACING.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkboxDone: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
    checkMark: { color: COLORS.white, fontWeight: '800' },
    itemText: { flex: 1, color: COLORS.text, fontSize: SIZES.fontMd, fontWeight: '600' },
    itemDone: { color: COLORS.textMuted, textDecorationLine: 'line-through' },
});
