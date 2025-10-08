import Colors from "@/utils/Colors";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";

const TrackOrder = () => {
  const { id } = useLocalSearchParams();

  const trackingUrl = `https://youlitestore.in/my-account/bt-track-order/?order=${id}`;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Track Order #{id}</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* WebView for Tracking */}
      <WebView
  source={{ uri: trackingUrl }}
  injectedJavaScript={`
    setTimeout(() => {
      const style = document.createElement('style');
      style.innerHTML = \`
        /* Hide headers and footers */
        header, footer, .site-header, .site-footer,
        .ekit-template-content-markup.ekit-template-content-header,
        .ekit-template-content-markup.ekit-template-content-footer,
        .woocommerce-MyAccount-navigation {
          display: none !important;
        }
        body { margin: 0; padding: 0; }
      \`;
      document.head.appendChild(style);
    }, 500);
    true;
  `}
  startInLoadingState={true}
  renderLoading={() => (
    <ActivityIndicator size="large" color={Colors.PRIMARY} style={{ marginTop: 20 }} />
  )}
/>

    </SafeAreaView>
  );
};

export default TrackOrder;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: Colors.PRIMARY,
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  headerTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});
