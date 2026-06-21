import React, { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView, StyleSheet } from "react-native";
import HomeScreen from "./src/screens/HomeScreen";
import SessionScreen from "./src/screens/SessionScreen";
import { configureNotificationHandler } from "./src/notifications";

type Screen = "home" | "session";

export default function App() {
  const [screen, setScreen] = useState<Screen>("home");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    configureNotificationHandler();
  }, []);

  function handleFinish() {
    setScreen("home");
    setRefreshKey((k) => k + 1);
  }

  return (
    <SafeAreaView style={styles.root}>
      {screen === "home" ? (
        <HomeScreen key={refreshKey} onStartSession={() => setScreen("session")} />
      ) : (
        <SessionScreen onFinish={handleFinish} onExit={() => setScreen("home")} />
      )}
      <StatusBar style="light" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#0f172a" },
});
