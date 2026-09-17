import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import ImageToPdfScreen from '../screens/ImageToPdfScreen';
import QRGeneratorScreen from '../screens/QRGeneratorScreen';
import QRScannerScreen from '../screens/QRScannerScreen';
import UnitConverterScreen from '../screens/UnitConverterScreen';
import CurrencyConverterScreen from '../screens/CurrencyConverterScreen';
import ImageCompressorScreen from '../screens/ImageCompressorScreen';
import PasswordGeneratorScreen from '../screens/PasswordGeneratorScreen';
import CalculatorScreen from '../screens/CalculatorScreen';
import NotesScreen from '../screens/NotesScreen';
import TipCalculatorScreen from '../screens/TipCalculatorScreen';
import StopwatchScreen from '../screens/StopwatchScreen';
import AgeCalculatorScreen from '../screens/AgeCalculatorScreen';
import SettingsScreen from '../screens/SettingsScreen';
import BmiCalculatorScreen from '../screens/BmiCalculatorScreen';
import LoanCalculatorScreen from '../screens/LoanCalculatorScreen';
import DiscountCalculatorScreen from '../screens/DiscountCalculatorScreen';
import DateCalculatorScreen from '../screens/DateCalculatorScreen';
import PercentageCalculatorScreen from '../screens/PercentageCalculatorScreen';
import FuelCalculatorScreen from '../screens/FuelCalculatorScreen';
import ExpenseTrackerScreen from '../screens/ExpenseTrackerScreen';
import WorldClockScreen from '../screens/WorldClockScreen';
import SavingsCalculatorScreen from '../screens/SavingsCalculatorScreen';
import AreaCalculatorScreen from '../screens/AreaCalculatorScreen';
import GstCalculatorScreen from '../screens/GstCalculatorScreen';
import SalaryCalculatorScreen from '../screens/SalaryCalculatorScreen';
import CalorieCalculatorScreen from '../screens/CalorieCalculatorScreen';
import ChecklistScreen from '../screens/ChecklistScreen';
import CountdownScreen from '../screens/CountdownScreen';

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
                <Stack.Screen name="CurrencyConverter" component={CurrencyConverterScreen} />
                <Stack.Screen name="ImageCompressor" component={ImageCompressorScreen} />
                <Stack.Screen name="PasswordGenerator" component={PasswordGeneratorScreen} />
                <Stack.Screen name="Calculator" component={CalculatorScreen} />
                <Stack.Screen name="Notes" component={NotesScreen} />
                <Stack.Screen name="TipCalculator" component={TipCalculatorScreen} />
                <Stack.Screen name="Stopwatch" component={StopwatchScreen} />
                <Stack.Screen name="AgeCalculator" component={AgeCalculatorScreen} />
                <Stack.Screen name="Settings" component={SettingsScreen} />
                <Stack.Screen name="BmiCalculator" component={BmiCalculatorScreen} />
                <Stack.Screen name="LoanCalculator" component={LoanCalculatorScreen} />
                <Stack.Screen name="DiscountCalculator" component={DiscountCalculatorScreen} />
                <Stack.Screen name="DateCalculator" component={DateCalculatorScreen} />
                <Stack.Screen name="PercentageCalculator" component={PercentageCalculatorScreen} />
                <Stack.Screen name="FuelCalculator" component={FuelCalculatorScreen} />
                <Stack.Screen name="ExpenseTracker" component={ExpenseTrackerScreen} />
                <Stack.Screen name="WorldClock" component={WorldClockScreen} />
                <Stack.Screen name="SavingsCalculator" component={SavingsCalculatorScreen} />
                <Stack.Screen name="AreaCalculator" component={AreaCalculatorScreen} />
                <Stack.Screen name="GstCalculator" component={GstCalculatorScreen} />
                <Stack.Screen name="SalaryCalculator" component={SalaryCalculatorScreen} />
                <Stack.Screen name="CalorieCalculator" component={CalorieCalculatorScreen} />
                <Stack.Screen name="Checklist" component={ChecklistScreen} />
                <Stack.Screen name="Countdown" component={CountdownScreen} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}
