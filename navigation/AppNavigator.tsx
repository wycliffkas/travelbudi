import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import BottomTabs from "./BottomTabs";
import TripDetails from "../screens/TripDetails/TripDetails"; // example

export type AppStackParamList = {
  Tabs: undefined;
  Details: { id: string };
};

const Stack = createNativeStackNavigator<AppStackParamList>();

export function AppNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Tabs"
        component={BottomTabs}
        options={{ headerShown: false }}
      />
      <Stack.Screen name="Details" component={TripDetails} />
    </Stack.Navigator>
  );
}
