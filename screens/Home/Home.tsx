import { useRouter } from "@/.expo/types/router";
import ScreenWrapper from "@/components/ScreenWrapper";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function Home() {
  const router = useRouter();

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        {/* Branding */}
        <View style={styles.header}>
          <Text style={styles.title}>TravelBudi</Text>
          <Text style={styles.tagline}>
            Find trusted travel buddies for your next trip
          </Text>
        </View>

        {/* Purpose */}
        <View style={styles.body}>
          <Text style={styles.description}>
            TravelBudi helps you connect with people traveling to the same
            destination and dates as you. Travel together, share costs, and
            explore with confidence.
          </Text>

          <View style={styles.features}>
            <Text style={styles.feature}>• Match by destination and dates</Text>
            <Text style={styles.feature}>• View traveler profiles</Text>
            <Text style={styles.feature}>• Simple and safe connections</Text>
          </View>
        </View>

        {/* Call to Action */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => router.push("/auth")}
          >
            <Text style={styles.buttonText}>Get Started</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
    paddingVertical: 40,
  },
  header: {
    alignItems: "center",
  },
  title: {
    fontSize: 34,
    fontWeight: "700",
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
  },
  body: {
    marginTop: 40,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
    color: "#333",
  },
  features: {
    marginTop: 24,
    alignItems: "center",
  },
  feature: {
    fontSize: 14,
    marginBottom: 8,
  },
  footer: {
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#000",
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
