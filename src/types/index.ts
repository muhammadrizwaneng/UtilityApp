export interface Utility {
    id: string;
    title: string;
    description: string;
    icon: string;
    screen: string;
    gradient: string[];
}

export type RootStackParamList = {
    Home: undefined;
    ImageToPdf: undefined;
    QRGenerator: undefined;
    QRScanner: undefined;
    UnitConverter: undefined;
    TextTools: undefined;
    CurrencyConverter: undefined;
    ImageCompressor: undefined;
    ColorPicker: undefined;
    PasswordGenerator: undefined;
    Calculator: undefined;
    Notes: undefined;
    TipCalculator: undefined;
    Stopwatch: undefined;
    AgeCalculator: undefined;
    Base64Tools: undefined;
    Settings: undefined;
};
