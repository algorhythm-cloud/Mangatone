import { Tabs } from "expo-router";
import { useColorScheme } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function TabLayout() {
  const colorScheme = useColorScheme();

  const colors = {
    light: {
      primary: "#FF6B35",
      background: "#FFFFFF",
      surface: "#F8F9FA",
      text: "#000000",
      textSecondary: "#666666",
      tabBarInactive: "#999999",
    },
    dark: {
      primary: "#FF8A65",
      background: "#121212",
      surface: "#1E1E1E",
      text: "#FFFFFF",
      textSecondary: "#CCCCCC",
      tabBarInactive: "#666666",
    },
  };

  const theme = colors[colorScheme || "light"];

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.surface,
          borderTopColor: colorScheme === "dark" ? "#333333" : "#E0E0E0",
          borderTopWidth: 1,
          height: 85,
          paddingBottom: 25,
          paddingTop: 10,
        },
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.tabBarInactive,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
          marginTop: 4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons 
              name={focused ? "home" : "home-outline"} 
              size={size} 
              color={color} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: "Search",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons 
              name={focused ? "search" : "search-outline"} 
              size={size} 
              color={color} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          title: "Library",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons 
              name={focused ? "library" : "library-outline"} 
              size={size} 
              color={color} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="trending"
        options={{
          title: "Trending",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons 
              name={focused ? "flame" : "flame-outline"} 
              size={size} 
              color={color} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons 
              name={focused ? "person" : "person-outline"} 
              size={size} 
              color={color} 
            />
          ),
        }}
      />
    </Tabs>
  );
}