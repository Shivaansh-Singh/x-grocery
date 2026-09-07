import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.rushd.app',
  appName: 'RushD',
  webDir: 'public',
  server: {
    url: 'https://rushdapp.vercel.app',
    cleartext: false,
    androidScheme: 'https'
  },
  android: {
    allowMixedContent: false,
    captureInput: true
  }
};

export default config;
