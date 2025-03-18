export default {
  expo: {
    name: process.env.APP_NAME || "bolt-expo-nativewind",
    slug: "bolt-expo-nativewind",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "myapp",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
      bundleIdentifier: process.env.BUNDLE_IDENTIFIER || "com.anonymous.boltexponativewind"
    },
    web: {
      bundler: "metro",
      output: "single",
      favicon: "./assets/images/favicon.png"
    },
    plugins: [
      "expo-router",
      "expo-font",
      [
        "expo-location",
        {
          locationWhenInUsePermission: "Show current location on map."
        }
      ],
      [
        "@rnmapbox/maps",
        {
          "RNMapboxMapsVersion": "11.8.0",
          "RNMapboxMapsDownloadToken": process.env.EXPO_PUBLIC_MAPBOX_SECRET_API_KEY
        }
      ]
    ],
    experiments: {
      typedRoutes: true
    },
    android: {
      permissions: [
        "android.permission.ACCESS_COARSE_LOCATION",
        "android.permission.ACCESS_FINE_LOCATION"
      ],
      package: process.env.BUNDLE_IDENTIFIER || "com.anonymous.boltexponativewind"
    }
  }
};
