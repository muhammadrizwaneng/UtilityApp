import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import ImageToPdfScreen from '../screens/ImageToPdfScreen';
import QRGeneratorScreen from '../screens/QRGeneratorScreen';
import QRScannerScreen from '../screens/QRScannerScreen';
import UnitConverterScreen from '../screens/UnitConverterScreen';
import TextToolsScreen from '../screens/TextToolsScreen';
import CurrencyConverterScreen from '../screens/CurrencyConverterScreen';
import ColorPickerScreen from '../screens/ColorPickerScreen';
import ImageCompressorScreen from '../screens/ImageCompressorScreen';
import PasswordGeneratorScreen from '../screens/PasswordGeneratorScreen';
import CalculatorScreen from '../screens/CalculatorScreen';
import NotesScreen from '../screens/NotesScreen';
import TipCalculatorScreen from '../screens/TipCalculatorScreen';
import StopwatchScreen from '../screens/StopwatchScreen';
import AgeCalculatorScreen from '../screens/AgeCalculatorScreen';
import Base64ToolsScreen from '../screens/Base64ToolsScreen';

import { RootStackParamList } from '../types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
    return (
        <NavigationContainer>
            <Stack.Navigator
                screenOptions={{
                    headerShown: false,
                    animation: 'slide_from_right',
                }}>
                <Stack.Screen name="Home" component={HomeScreen} />
                <Stack.Screen name="ImageToPdf" component={ImageToPdfScreen} />
                <Stack.Screen name="QRGenerator" component={QRGeneratorScreen} />
                <Stack.Screen name="QRScanner" component={QRScannerScreen} />
                <Stack.Screen name="UnitConverter" component={UnitConverterScreen} />
                <Stack.Screen name="TextTools" component={TextToolsScreen} />
                <Stack.Screen name="CurrencyConverter" component={CurrencyConverterScreen} />
                <Stack.Screen name="ImageCompressor" component={ImageCompressorScreen} />
                <Stack.Screen name="ColorPicker" component={ColorPickerScreen} />
                <Stack.Screen name="PasswordGenerator" component={PasswordGeneratorScreen} />
                <Stack.Screen name="Calculator" component={CalculatorScreen} />
                <Stack.Screen name="Notes" component={NotesScreen} />
                <Stack.Screen name="TipCalculator" component={TipCalculatorScreen} />
                <Stack.Screen name="Stopwatch" component={StopwatchScreen} />
                <Stack.Screen name="AgeCalculator" component={AgeCalculatorScreen} />
                <Stack.Screen name="Base64Tools" component={Base64ToolsScreen} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}
