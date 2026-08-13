/** react-native-get-random-values polyfills this at the app entry point (index.js). */
declare const crypto: {
    getRandomValues<T extends ArrayBufferView>(array: T): T;
};
