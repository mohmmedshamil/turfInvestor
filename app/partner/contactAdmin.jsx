import React, { useState } from "react";
import {
  View,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  Text,
  TouchableOpacity,
} from "react-native";
import firestore from "@react-native-firebase/firestore";
import { useUser } from "../store/userContext";

const ContactAdmin = () => {
  const [message, setMessage] = useState("");
  const { user } = useUser();

  const sendMessage = async () => {
    if (!message.trim()) {
      Alert.alert("Validation", "Message cannot be empty!");
      return;
    }

    try {
      await firestore().collection("adminMessages").add({
        userId: user?.id,
        userName: user?.name,
        message: message.trim(),
        timestamp: firestore.FieldValue.serverTimestamp(),
      });
      Alert.alert("Success", "Your message has been sent to the admin.");
      setMessage(""); // Clear the input after sending
    } catch (error) {
      Alert.alert(
        "Error",
        "Failed to send your message. Please try again later."
      );
      console.error("Error sending message:", error);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.textArea}
        placeholder="Type your message here..."
        placeholderTextColor="#999"
        multiline={true}
        numberOfLines={4}
        value={message}
        onChangeText={setMessage}
      />
      <TouchableOpacity
        style={{ borderRadius: 20, backgroundColor: "#FFB72B", alignItems: "center", padding: 10,  }}
        title="Send"
        onPress={sendMessage}
      >
        <Text style={{color: "#fff", fontWeight: 500}}>Send</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#021526",
  },
  textArea: {
    marginTop: 100,
    height: 150,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 10,
    fontSize: 16,
    color: "#FFF",
    backgroundColor: "#0d0d19",
    marginBottom: 20,
    alignItems: "flex-start"
  },
});

export default ContactAdmin;
