import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { MaterialIcons } from "@expo/vector-icons";
import Footer from "./footer";
import auth from '@react-native-firebase/auth';
import { router } from "expo-router";

const handleLogout = () => {
  Alert.alert(
    "Confirm Logout",
    "Are you sure you want to sign out?",
    [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Logout",
        onPress: () => {
          auth()
            .signOut()
            .then(() => {
              console.log('User signed out!');
              router.replace("/"); // Replace with your login route
            })
            .catch(error => {
              console.error('Error signing out: ', error);
            });
        },
      },
    ],
    { cancelable: false }
  );
};

const settingsItems = [
  {
    icon: <Ionicons name="person" size={24} color="#f5c806" />,
    text: "Personal info",
    onPress: () => router.replace("/partner/personalInfo"), // Replace with your personal info route
  },
  {
    icon: (
      <MaterialCommunityIcons name="message-question" size={24} color="#f5c806" />
    ),
    text: "Contact us",
    onPress: () => router.replace("/partner/contactAdmin"), // Replace with your contact us route
  },
  {
    icon: <MaterialIcons name="logout" size={24} color="#f5c806" />,
    text: "Logout",
    onPress: handleLogout,
  },
];

export default function SettingsScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: "#021526" }}>
      <ScrollView style={styles.container}>
        {settingsItems.map((item, index) => (
          <TouchableOpacity key={index} style={styles.item} onPress={item.onPress}>
            {item.icon}
            <Text style={styles.text}>{item.text}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <Footer />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    marginTop: 35,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    gap: 10,
  },
  icon: {
    marginRight: 16,
    color: "#333",
  },
  text: {
    fontSize: 16,
    color: "#f5c806",
  },
});
