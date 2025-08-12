import { Text, View, StyleSheet, Image } from "react-native";
import { Redirect } from "expo-router";

export default function Index() {
  return <Redirect href="/(tabs)" />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    padding: 32,
  },
  heading: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    color: "#181818", // equivalent to text-blue-400
  },
  text: {
    fontSize: 18,
    fontWeight: "medium",
    textAlign: "center",
    color: "#4D4D4D",
  },
  image: {
    width: 80,
    height: 80,
    marginBottom: 16,
  },
});
