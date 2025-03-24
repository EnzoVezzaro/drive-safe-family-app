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
          locationWhenInUsePermission: "Show current location on map.",
          locationAlwaysAndWhenInUsePermission: "Allow $(PRODUCT_NAME) to use your location.",
          isAndroidBackgroundLocationEnabled: true,
          isIosBackgroundLocationEnabled: true,
          isAndroidForegroundServiceEnabled: true
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
    ios: {
      bundleIdentifier: "com.anonymous.drivesafefamily",
      infoPlist: {
        UIBackgroundModes: ["location"],
        NSLocationWhenInUseUsageDescription: "We use your location to track your activity.",
        NSLocationAlwaysUsageDescription: "We need access to your location at all times for background tracking.",
        NSLocationAlwaysAndWhenInUseUsageDescription: "We require background location access to provide continuous tracking."
      }
    },
    android: {
      permissions: [
        "android.permission.ACCESS_COARSE_LOCATION",
        "android.permission.ACCESS_FINE_LOCATION",
        "android.permission.ACCESS_BACKGROUND_LOCATION",
        "android.permission.FOREGROUND_SERVICE",
        "android.permission.FOREGROUND_SERVICE_LOCATION"
      ],
      package: process.env.BUNDLE_IDENTIFIER || "com.anonymous.drivesafefamily"
    }
  }
};
