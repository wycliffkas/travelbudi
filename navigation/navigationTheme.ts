import { DefaultTheme, Theme } from "@react-navigation/native";
import { Colors } from "@/constants/theme";

export const NavigationTheme: Theme = {
  ...DefaultTheme,
  dark: false,
  colors: {
    ...DefaultTheme.colors,
    primary: Colors.primary,
    background: Colors.background,
    card: Colors.background,
    text: Colors.text,
    border: "transparent",
    notification: Colors.primary,
  },
  fonts: DefaultTheme.fonts,
};
