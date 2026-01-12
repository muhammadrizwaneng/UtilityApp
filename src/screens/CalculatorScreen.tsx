import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { COLORS, SPACING, SIZES, SHADOWS } from '../constants/theme';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Calculator'>;

interface Props {
    navigation: NavigationProp;
}

export default function CalculatorScreen({ navigation }: Props) {
    const [display, setDisplay] = useState('0');
    const [previousValue, setPreviousValue] = useState<number | null>(null);
    const [operation, setOperation] = useState<string | null>(null);
    const [waitingForNewValue, setWaitingForNewValue] = useState(false);
    const insets = useSafeAreaInsets();

    const handleNumber = (num: string) => {
        if (waitingForNewValue) {
            setDisplay(num);
            setWaitingForNewValue(false);
        } else {
            setDisplay(display === '0' ? num : display + num);
        }
    };

    const handleDecimal = () => {
        if (waitingForNewValue) {
            setDisplay('0.');
            setWaitingForNewValue(false);
        } else if (display.indexOf('.') === -1) {
            setDisplay(display + '.');
        }
    };

    const handleOperation = (nextOperation: string) => {
        const inputValue = parseFloat(display);

        if (previousValue === null) {
            setPreviousValue(inputValue);
        } else if (operation) {
            const currentValue = previousValue || 0;
            const newValue = calculate(currentValue, inputValue, operation);

            setDisplay(String(newValue));
            setPreviousValue(newValue);
        }

        setWaitingForNewValue(true);
        setOperation(nextOperation);
    };

    const calculate = (firstValue: number, secondValue: number, operation: string) => {
        switch (operation) {
            case '+':
                return firstValue + secondValue;
            case '-':
                return firstValue - secondValue;
            case '×':
                return firstValue * secondValue;
            case '÷':
                return firstValue / secondValue;
            default:
                return secondValue;
        }
    };

    const handleEqual = () => {
        const inputValue = parseFloat(display);

        if (previousValue !== null && operation) {
            const currentValue = previousValue;
            const newValue = calculate(currentValue, inputValue, operation);

            setDisplay(String(newValue));
            setPreviousValue(null);
            setOperation(null);
            setWaitingForNewValue(true);
        }
    };

    const handleClear = () => {
        setDisplay('0');
        setPreviousValue(null);
        setOperation(null);
        setWaitingForNewValue(false);
    };

    const handlePercentage = () => {
        const value = parseFloat(display);
        setDisplay(String(value / 100));
    };

    const handlePlusMinus = () => {
        const value = parseFloat(display);
        setDisplay(String(value * -1));
    };

    const Button = ({ onPress, text, style, textStyle }: any) => (
        <TouchableOpacity
            style={[styles.button, style]}
            onPress={onPress}
            activeOpacity={0.7}>
            <Text style={[styles.buttonText, textStyle]}>{text}</Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={[COLORS.background, COLORS.backgroundLight]}
                style={styles.gradient}>
                <View style={[styles.mainContainer, { paddingTop: Math.max(insets.top, StatusBar.currentHeight || 0) + SPACING.md }]}>
                    {/* Header */}
                    <View style={styles.header}>
                        <TouchableOpacity
                            onPress={() => navigation.goBack()}
                            style={styles.backButton}>
                            <Text style={styles.backText}>←</Text>
                        </TouchableOpacity>
                        <Text style={styles.title}>Calculator</Text>
                        <View style={styles.placeholder} />
                    </View>

                    {/* Display */}
                    <View style={styles.displayContainer}>
                        <Text style={styles.displayText} numberOfLines={1}>
                            {display}
                        </Text>
                    </View>

                    {/* Buttons */}
                    <View style={styles.buttonsContainer}>
                        <View style={styles.row}>
                            <Button
                                onPress={handleClear}
                                text="C"
                                style={styles.functionButton}
                                textStyle={styles.functionButtonText}
                            />
                            <Button
                                onPress={handlePlusMinus}
                                text="+/-"
                                style={styles.functionButton}
                                textStyle={styles.functionButtonText}
                            />
                            <Button
                                onPress={handlePercentage}
                                text="%"
                                style={styles.functionButton}
                                textStyle={styles.functionButtonText}
                            />
                            <Button
                                onPress={() => handleOperation('÷')}
                                text="÷"
                                style={styles.operationButton}
                                textStyle={styles.operationButtonText}
                            />
                        </View>

                        <View style={styles.row}>
                            <Button
                                onPress={() => handleNumber('7')}
                                text="7"
                                style={styles.numberButton}
                            />
                            <Button
                                onPress={() => handleNumber('8')}
                                text="8"
                                style={styles.numberButton}
                            />
                            <Button
                                onPress={() => handleNumber('9')}
                                text="9"
                                style={styles.numberButton}
                            />
                            <Button
                                onPress={() => handleOperation('×')}
                                text="×"
                                style={styles.operationButton}
                                textStyle={styles.operationButtonText}
                            />
                        </View>

                        <View style={styles.row}>
                            <Button
                                onPress={() => handleNumber('4')}
                                text="4"
                                style={styles.numberButton}
                            />
                            <Button
                                onPress={() => handleNumber('5')}
                                text="5"
                                style={styles.numberButton}
                            />
                            <Button
                                onPress={() => handleNumber('6')}
                                text="6"
                                style={styles.numberButton}
                            />
                            <Button
                                onPress={() => handleOperation('-')}
                                text="-"
                                style={styles.operationButton}
                                textStyle={styles.operationButtonText}
                            />
                        </View>

                        <View style={styles.row}>
                            <Button
                                onPress={() => handleNumber('1')}
                                text="1"
                                style={styles.numberButton}
                            />
                            <Button
                                onPress={() => handleNumber('2')}
                                text="2"
                                style={styles.numberButton}
                            />
                            <Button
                                onPress={() => handleNumber('3')}
                                text="3"
                                style={styles.numberButton}
                            />
                            <Button
                                onPress={() => handleOperation('+')}
                                text="+"
                                style={styles.operationButton}
                                textStyle={styles.operationButtonText}
                            />
                        </View>

                        <View style={styles.row}>
                            <Button
                                onPress={() => handleNumber('0')}
                                text="0"
                                style={[styles.numberButton, styles.zeroButton]}
                            />
                            <Button
                                onPress={handleDecimal}
                                text="."
                                style={styles.numberButton}
                            />
                            <Button
                                onPress={handleEqual}
                                text="="
                                style={styles.equalsButton}
                                textStyle={styles.operationButtonText}
                            />
                        </View>
                    </View>
                </View>
            </LinearGradient>
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
    placeholder: {
        width: 40,
    },
    displayContainer: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'flex-end',
        paddingHorizontal: SPACING.xl,
        paddingBottom: SPACING.xl,
    },
    displayText: {
        fontSize: 48,
        fontWeight: '300',
        color: COLORS.text,
    },
    buttonsContainer: {
        paddingBottom: SPACING.xl,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: SPACING.md,
        marginBottom: SPACING.sm,
    },
    button: {
        width: 70,
        height: 70,
        borderRadius: 35,
        alignItems: 'center',
        justifyContent: 'center',
        ...SHADOWS.medium,
    },
    buttonText: {
        fontSize: 24,
        fontWeight: '400',
        color: COLORS.text,
    },
    numberButton: {
        backgroundColor: COLORS.backgroundCard,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    zeroButton: {
        width: 156,
    },
    functionButton: {
        backgroundColor: '#9CA3AF',
        borderWidth: 1,
        borderColor: '#6B7280',
    },
    functionButtonText: {
        color: COLORS.white,
    },
    operationButton: {
        backgroundColor: COLORS.primary,
    },
    operationButtonText: {
        color: COLORS.white,
        fontWeight: '600',
    },
    equalsButton: {
        backgroundColor: COLORS.primary,
    },
});
