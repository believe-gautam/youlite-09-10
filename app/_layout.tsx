import { Stack } from "expo-router";
import { CartProvider } from "../utils/context/CartContext";

export default function RootLayout() {
  return (
    <CartProvider>
      <Stack
        initialRouteName="index"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="not_found" />
      </Stack>
    </CartProvider>
  );
}