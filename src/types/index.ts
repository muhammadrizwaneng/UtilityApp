export type RootStackParamList = {
    Home: undefined;
    ImageToPdf: undefined;
    QRGenerator: undefined;
    QRScanner: undefined;
    UnitConverter: undefined;
    CurrencyConverter: undefined;
    ImageCompressor: undefined;
    PasswordGenerator: undefined;
    Calculator: undefined;
    Notes: undefined;
    TipCalculator: undefined;
    Stopwatch: undefined;
    AgeCalculator: undefined;
    Settings: undefined;
    BmiCalculator: undefined;
    LoanCalculator: undefined;
    DiscountCalculator: undefined;
    DateCalculator: undefined;
    PercentageCalculator: undefined;
    FuelCalculator: undefined;
    ExpenseTracker: undefined;
    WorldClock: undefined;
    SavingsCalculator: undefined;
    AreaCalculator: undefined;
    GstCalculator: undefined;
    SalaryCalculator: undefined;
    CalorieCalculator: undefined;
    Checklist: undefined;
    Countdown: undefined;
};

export type UtilityScreen = Exclude<keyof RootStackParamList, 'Home' | 'Settings'>;

export interface Utility {
    id: string;
    title: string;
    description: string;
    icon: string;
    screen: UtilityScreen;
    gradient: string[];
}
