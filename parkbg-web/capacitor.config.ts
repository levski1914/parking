import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.parkbg.app",
  appName: "ParkBG",
  webDir: "public",
  server: {
    url: "https://parking-three-iota.vercel.app/",
    cleartext: false,
  },
};

export default config;
