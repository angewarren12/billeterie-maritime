import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
    appId: 'sn.portdakar.agent',
    appName: 'Agent Port Dakar',
    webDir: 'dist',
    server: {
        androidScheme: 'https'
    },
    plugins: {
        SplashScreen: {
            launchShowDuration: 3000,
            backgroundColor: "#0284c7"
        }
    }
};

export default config;
