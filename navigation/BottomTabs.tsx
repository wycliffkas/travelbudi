import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import React from "react";

import { HapticTab } from "@/components/haptic-tab";
import { Colors } from "@/constants/theme";
import { Feather } from "@expo/vector-icons";

import CreateTrip from "../screens/CreateTrip/CreateTrip";
import Home from "../screens/Home/Home";
import Matches from "../screens/Matches/Matches";
import Messages from "../screens/Messages/Messages";
import Profile from "../screens/Profile/Profile";

export type BottomTabList = {
  Home: undefined;
  Profile: undefined;
  Create: undefined;
  Matches: undefined;
  Messages: undefined;
};

const Tab = createBottomTabNavigator<BottomTabList>();

export default function BottomTab() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarActiveTintColor: Colors.tabIconSelected,
        tabBarInactiveTintColor: Colors.tabIconDefault,
        tabBarStyle: { backgroundColor: Colors.background }
      }}>
      <Tab.Screen
        name="Home"
        component={Home}
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <Feather size={28} name="home" color={color} />
          )
        }}
      />
      <Tab.Screen
        name="Create"
        component={CreateTrip}
        options={{
          title: "Create Trip",
          tabBarIcon: ({ color }) => (
            <Feather size={28} name="plus" color={color} />
          )
        }}
      />

      <Tab.Screen
        name="Matches"
        component={Matches}
        options={{
          title: "Matches",
          tabBarIcon: ({ color }) => (
            <Feather size={28} name="heart" color={color} />
          )
        }}
      />

      <Tab.Screen
        name="Messages"
        component={Messages}
        options={{
          title: "Messages",
          tabBarIcon: ({ color }) => (
            <Feather size={28} name="message-circle" color={color} />
          )
        }}
      />

      <Tab.Screen
        name="Profile"
        component={Profile}
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => (
            <Feather size={28} name="user" color={color} />
          )
        }}
      />
    </Tab.Navigator>
  );
}
