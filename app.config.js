export default {
  expo: {
    name: process.env.APP_NAME || "drive-safe-family",
    slug: "drive-safe-family",
    version: "0.0.1",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "myapp",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
      bundleIdentifier: process.env.BUNDLE_IDENTIFIER || "com.anonymous.drivesafefamily"
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
      package: process.env.BUNDLE_IDENTIFIER || "com.anonymous.drivesafefamily"
    }
  }
};
