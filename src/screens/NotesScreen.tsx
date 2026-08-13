import React, { useCallback, useEffect, useState } from 'react';
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
    Modal,
    KeyboardAvoidingView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS, SPACING, SIZES, SHADOWS } from '../constants/theme';
import { NOTES_KEY } from '../constants/notesStorage';
import { RootStackParamList } from '../types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Notes'>;

interface Props {
    navigation: NavigationProp;
}

interface Note {
    id: string;
    title: string;
    body: string;
    updatedAt: number;
    pinned?: boolean;
}

function sortNotes(list: Note[]): Note[] {
    return [...list].sort((a, b) => {
        if (!!a.pinned !== !!b.pinned) return a.pinned ? -1 : 1;
        return b.updatedAt - a.updatedAt;
    });
}

export default function NotesScreen({ navigation }: Props) {
    const [notes, setNotes] = useState<Note[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [editing, setEditing] = useState<Note | null>(null);
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const insets = useSafeAreaInsets();

    const loadNotes = useCallback(async () => {
        const raw = await AsyncStorage.getItem(NOTES_KEY);
        if (!raw) return;
        try {
            const parsed: Note[] = JSON.parse(raw);
            setNotes(sortNotes(parsed));
        } catch {
            /* ignore */
        }
    }, []);

    useEffect(() => {
        loadNotes();
    }, [loadNotes]);

    const persist = async (next: Note[]) => {
        setNotes(sortNotes(next));
        await AsyncStorage.setItem(NOTES_KEY, JSON.stringify(next));
    };

    const togglePin = (note: Note) => {
        persist(notes.map(n => (n.id === note.id ? { ...n, pinned: !n.pinned } : n)));
    };

    const filteredNotes = notes.filter(
        n =>
            n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            n.body.toLowerCase().includes(searchQuery.toLowerCase()),
    );

    const openNew = () => {
        setEditing(null);
        setTitle('');
        setBody('');
        setModalVisible(true);
    };

    const openEdit = (note: Note) => {
        setEditing(note);
        setTitle(note.title);
        setBody(note.body);
        setModalVisible(true);
    };

    const saveNote = async () => {
        if (!title.trim() && !body.trim()) {
            Alert.alert('Empty note', 'Add a title or some text first.');
            return;
        }

        const now = Date.now();
        if (editing) {
            const next = notes.map(n =>
                n.id === editing.id
                    ? {
                          ...n,
                          title: title.trim() || 'Untitled',
                          body: body.trim(),
                          updatedAt: now,
                      }
                    : n,
            );
            await persist(next);
        } else {
            const note: Note = {
                id: `${now}`,
                title: title.trim() || 'Untitled',
                body: body.trim(),
                updatedAt: now,
            };
            await persist([note, ...notes]);
        }
        setModalVisible(false);
    };

    const deleteNote = (note: Note) => {
        Alert.alert('Delete note?', note.title, [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: async () => {
                    await persist(notes.filter(n => n.id !== note.id));
                },
            },
        ]);
    };

    const formatDate = (ts: number) => {
        const d = new Date(ts);
        return d.toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={[COLORS.background, COLORS.backgroundLight]}
                style={styles.gradient}>
                <View
                    style={[
                        styles.mainContainer,
                        {
                            paddingTop:
                                Math.max(
                                    insets.top,
                                    Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0,
                                ) + SPACING.md,
                        },
                    ]}>
                    <View style={styles.header}>
                        <TouchableOpacity
                            onPress={() => navigation.goBack()}
                            style={styles.backButton}>
                            <Text style={styles.backText}>←</Text>
                        </TouchableOpacity>
                        <Text style={styles.title}>Notes</Text>
                        <TouchableOpacity onPress={openNew} style={styles.addBtn}>
                            <Text style={styles.addBtnText}>+</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.searchContainer}>
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search notes..."
                            placeholderTextColor={COLORS.textMuted}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                    </View>

                    <FlatList
                        data={filteredNotes}
                        keyExtractor={item => item.id}
                        contentContainerStyle={{
                            padding: SPACING.lg,
                            paddingBottom: insets.bottom + SPACING.xl,
                            flexGrow: 1,
                        }}
                        ListEmptyComponent={
                            <View style={styles.empty}>
                                <Text style={styles.emptyIcon}>📝</Text>
                                <Text style={styles.emptyText}>
                                    {searchQuery ? 'No matching notes' : 'No notes yet'}
                                </Text>
                                <Text style={styles.emptyHint}>
                                    {searchQuery
                                        ? 'Try a different search term'
                                        : 'Tap + to create a note stored on this device'}
                                </Text>
                            </View>
                        }
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={styles.noteCard}
                                onPress={() => openEdit(item)}
                                onLongPress={() => deleteNote(item)}>
                                <View style={styles.noteCardHeader}>
                                    <Text style={styles.noteTitle} numberOfLines={1}>
                                        {item.title}
                                    </Text>
                                    <TouchableOpacity
                                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                                        onPress={() => togglePin(item)}>
                                        <Text style={styles.pinIcon}>
                                            {item.pinned ? '📌' : '📍'}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                                {!!item.body && (
                                    <Text style={styles.noteBody} numberOfLines={2}>
                                        {item.body}
                                    </Text>
                                )}
                                <Text style={styles.noteDate}>{formatDate(item.updatedAt)}</Text>
                            </TouchableOpacity>
                        )}
                    />
                </View>
            </LinearGradient>

            <Modal visible={modalVisible} animationType="slide" transparent>
                <KeyboardAvoidingView
                    style={styles.modalOverlay}
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                    <View
                        style={[
                            styles.modalCard,
                            { paddingBottom: Math.max(insets.bottom, SPACING.lg) },
                        ]}>
                        <Text style={styles.modalTitle}>
                            {editing ? 'Edit Note' : 'New Note'}
                        </Text>
                        <TextInput
                            style={styles.titleInput}
                            placeholder="Title"
                            placeholderTextColor={COLORS.textMuted}
                            value={title}
                            onChangeText={setTitle}
                        />
                        <TextInput
                            style={styles.bodyInput}
                            placeholder="Write something..."
                            placeholderTextColor={COLORS.textMuted}
                            value={body}
                            onChangeText={setBody}
                            multiline
                            textAlignVertical="top"
                        />
                        <View style={styles.modalActions}>
                            <TouchableOpacity
                                style={styles.cancelBtn}
                                onPress={() => setModalVisible(false)}>
                                <Text style={styles.cancelText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.saveBtn} onPress={saveNote}>
                                <Text style={styles.saveText}>Save</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    gradient: {
        flex: 1,
    },
    mainContainer: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.md,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    backButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    backText: {
        fontSize: 28,
        color: COLORS.text,
    },
    title: {
        fontSize: SIZES.fontXl,
        fontWeight: '700',
        color: COLORS.text,
    },
    addBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    addBtnText: {
        color: COLORS.white,
        fontSize: 28,
        fontWeight: '600',
        marginTop: -2,
    },
    empty: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 80,
    },
    emptyIcon: {
        fontSize: 56,
        marginBottom: SPACING.md,
    },
    emptyText: {
        fontSize: SIZES.fontXl,
        fontWeight: '700',
        color: COLORS.text,
    },
    emptyHint: {
        marginTop: SPACING.sm,
        color: COLORS.textMuted,
        textAlign: 'center',
    },
    noteCard: {
        backgroundColor: COLORS.backgroundCard,
        borderRadius: SIZES.radiusMd,
        padding: SPACING.lg,
        marginBottom: SPACING.md,
        borderWidth: 1,
        borderColor: COLORS.border,
        ...SHADOWS.medium,
    },
    searchContainer: {
        paddingHorizontal: SPACING.lg,
        paddingBottom: SPACING.sm,
    },
    searchInput: {
        backgroundColor: COLORS.backgroundCard,
        borderRadius: SIZES.radiusMd,
        paddingHorizontal: SPACING.md,
        paddingVertical: 12,
        fontSize: SIZES.fontMd,
        color: COLORS.text,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    noteCardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    pinIcon: {
        fontSize: 18,
        marginLeft: SPACING.sm,
    },
    noteTitle: {
        flex: 1,
        fontSize: SIZES.fontLg,
        fontWeight: '700',
        color: COLORS.text,
    },
    noteBody: {
        marginTop: SPACING.sm,
        fontSize: SIZES.fontMd,
        color: COLORS.textSecondary,
    },
    noteDate: {
        marginTop: SPACING.sm,
        fontSize: SIZES.fontXs,
        color: COLORS.textMuted,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: COLORS.overlay,
        justifyContent: 'flex-end',
    },
    modalCard: {
        backgroundColor: COLORS.backgroundLight,
        borderTopLeftRadius: SIZES.radiusXl,
        borderTopRightRadius: SIZES.radiusXl,
        padding: SPACING.lg,
        minHeight: '55%',
    },
    modalTitle: {
        fontSize: SIZES.fontXl,
        fontWeight: '700',
        color: COLORS.text,
        marginBottom: SPACING.md,
    },
    titleInput: {
        backgroundColor: COLORS.background,
        borderRadius: SIZES.radiusSm,
        padding: SPACING.md,
        color: COLORS.text,
        fontSize: SIZES.fontLg,
        fontWeight: '600',
        marginBottom: SPACING.sm,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    bodyInput: {
        flex: 1,
        minHeight: 160,
        backgroundColor: COLORS.background,
        borderRadius: SIZES.radiusSm,
        padding: SPACING.md,
        color: COLORS.text,
        fontSize: SIZES.fontMd,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    modalActions: {
        flexDirection: 'row',
        gap: SPACING.md,
        marginTop: SPACING.lg,
    },
    cancelBtn: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: SPACING.md,
        borderRadius: SIZES.radiusMd,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    cancelText: {
        color: COLORS.textSecondary,
        fontWeight: '600',
        fontSize: SIZES.fontMd,
    },
    saveBtn: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: SPACING.md,
        borderRadius: SIZES.radiusMd,
        backgroundColor: COLORS.primary,
    },
    saveText: {
        color: COLORS.white,
        fontWeight: '700',
        fontSize: SIZES.fontMd,
    },
});
