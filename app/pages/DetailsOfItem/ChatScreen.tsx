import Colors from "@/utils/Colors";
import Dimenstion from "@/utils/Dimenstion";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface ChatMessage {
  id: number;
  message: string;
  created_at: string;
  user_id: number;
  user_name: string;
}

export default function ChatScreen() {
  const router = useRouter();
  const { product_id, user_id, user_name } = useLocalSearchParams<{
    product_id: string;
    user_id: string;
    user_name: string;
  }>();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const API_BASE = "https://youlitestore.in/wp-json/product-chat/v1";

  // Fetch messages with filtering: show messages by current user or admin messages (user_id=1)
  const fetchMessages = async () => {
    if (!product_id || !user_id) return;
    try {
      setLoading(true);

      const res = await axios.get(
        `${API_BASE}/fetch?product_id=${product_id}&customer_id=${user_id}`
      );

      // Convert user_id to number for consistent comparison
      const processedData = (res.data || []).map((message: any) => ({
        ...message,
        user_id: parseInt(message.user_id, 10),
      }));

      const currentUserId = parseInt(user_id, 10);

      // Filter messages to show only current user messages and admin messages (user_id === 1)
      const filteredMessages = processedData.filter(
        (message: any) =>
          message.user_id === currentUserId || message.user_id === 1
      );

      setMessages(filteredMessages);
    } catch (err) {
      console.error("❌ Fetch chat error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Send message with user_id and customer_id (same as user_id) and product_id
// sendMessage function
const sendMessage = async () => {
  if (!newMessage.trim() || !product_id || !user_id) return;

  try {
    const response = await axios.post(`${API_BASE}/send`, {
      sender_id: parseInt(user_id, 10),     // <-- match backend
      customer_id: parseInt(user_id, 10),
      product_id: parseInt(product_id, 10),
      message: newMessage.trim(),
    });

    if (!response.data.success) throw new Error("Failed to send message");

    setNewMessage("");
    fetchMessages();
  } catch (err: any) {
    console.error("❌ Send message error:", err.response?.data || err.message);
  }
};


  useEffect(() => {
    if (product_id && user_id) {
      fetchMessages();
    }
  }, [product_id, user_id]);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Chat</Text>
          <Text style={styles.headerSubtitle}>
            {user_name || "Guest"} • Product #{product_id}
          </Text>
        </View>
        <View style={styles.headerRight}></View>
      </View>

      {/* Chat Body */}
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        {messages.length === 0 && !loading ? (
          <View style={styles.emptyState}>
            <Ionicons name="chatbubble-outline" size={64} color="#ccc" />
            <Text style={styles.emptyStateText}>No messages yet</Text>
            <Text style={styles.emptyStateSubText}>
              Start a conversation about this product
            </Text>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => {
              const currentUserId = parseInt(user_id || "0", 10);
              const isMine = item.user_id === currentUserId;
              const isAdmin = item.user_id === 1;

              return (
                <View
                  style={[
                    styles.messageBubble,
                    isMine ? styles.myMessage : styles.otherMessage,
                    isAdmin && styles.adminMessage,
                  ]}
                >
                  {!isMine && (
                    <Text
                      style={[styles.senderName, isAdmin && styles.adminName]}
                    >
                      {item.user_name} {isAdmin && "👑"}
                    </Text>
                  )}
                  <Text
                    style={[
                      styles.messageText,
                      isMine && styles.myMessageText,
                      isAdmin && styles.adminMessageText,
                    ]}
                  >
                    {item.message}
                  </Text>
                  <Text style={[styles.timestamp, isMine && styles.myTimestamp]}>
                    {formatTime(item.created_at)}
                  </Text>
                </View>
              );
            }}
            refreshing={loading}
            onRefresh={fetchMessages}
            contentContainerStyle={styles.messagesContainer}
            showsVerticalScrollIndicator={false}
          />
        )}

        {/* Input Box */}
        <View style={styles.inputContainer}>
          <TextInput
            value={newMessage}
            onChangeText={setNewMessage}
            placeholder="Type a message..."
            style={styles.input}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              !newMessage.trim() && styles.sendButtonDisabled,
            ]}
            onPress={sendMessage}
            disabled={!newMessage.trim()}
          >
            <Ionicons name="send" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    backgroundColor: Colors.PRIMARY,
    paddingVertical: 20,
    paddingHorizontal: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    height: Dimenstion.headerHeight,
  },
  backBtn: {
    padding: 4,
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
    marginHorizontal: 12,
  },
  headerRight: {
    width: 32, // Balance the back button width
  },
  headerTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  headerSubtitle: {
    color: "#ffe0c2",
    fontSize: 12,
    marginTop: 2,
  },
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  messagesContainer: {
    padding: 12,
    paddingBottom: 80,
  },
  messageBubble: {
    marginVertical: 6,
    padding: 12,
    borderRadius: 16,
    maxWidth: "75%",
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  myMessage: {
    alignSelf: "flex-end",
    backgroundColor: Colors.PRIMARY,
    borderBottomRightRadius: 4,
  },
  otherMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#fff",
    borderBottomLeftRadius: 4,
  },
  adminMessage: {
    backgroundColor: "#e8f5e8",
    borderLeftWidth: 3,
    borderLeftColor: "#4caf50",
  },
  senderName: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 4,
    color: "#555",
  },
  adminName: {
    color: "#2e7d32",
  },
  messageText: {
    fontSize: 15,
    color: "#000",
    lineHeight: 20,
  },
  myMessageText: {
    color: "#fff",
  },
  adminMessageText: {
    color: "#1b5e20",
  },
  timestamp: {
    fontSize: 10,
    color: "#666",
    marginTop: 4,
    alignSelf: "flex-end",
  },
  myTimestamp: {
    color: "rgba(255,255,255,0.8)",
  },
  inputContainer: {
    flexDirection: "row",
    padding: 12,
    borderTopWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#fff",
    alignItems: "flex-end",
  },
  input: {
    flex: 1,
    backgroundColor: "#f1f1f1",
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    maxHeight: 100,
  },
  sendButton: {
    marginLeft: 10,
    backgroundColor: Colors.PRIMARY,
    padding: 12,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    width: 44,
    height: 44,
  },
  sendButtonDisabled: {
    backgroundColor: "#ccc",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#666",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubText: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
  },
});
