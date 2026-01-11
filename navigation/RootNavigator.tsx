import { Colors } from "@/constants/theme";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import React from "react";
import BottomTabs from "./BottomTabs";

const NavigationTheme = {
  colors: {
    ...DefaultTheme.colors,
    primary: Colors.primary,
    background: Colors.background,
    card: Colors.background,
    text: Colors.text,
    border: "transparent",
    notification: Colors.primary,
  },
  dark: false,
  fonts: DefaultTheme.fonts,
};

export function RootNavigator() {
  return (
    <NavigationContainer theme={NavigationTheme}>
      <BottomTabs />
    </NavigationContainer>
  );
}
