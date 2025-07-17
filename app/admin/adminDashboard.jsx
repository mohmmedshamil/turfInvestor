import React, { useState } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator, // Import ActivityIndicator for the loader
} from "react-native";
import { FontAwesome6, MaterialIcons } from "@expo/vector-icons";
import BackgroundImage from "../backgroundImage";
import { Link, router } from "expo-router";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Feather } from '@expo/vector-icons';
import AntDesign from '@expo/vector-icons/AntDesign';
import auth from '@react-native-firebase/auth';

const data = [
  {
    key: "project",
    label: "Project",
    iconName: (
      <MaterialCommunityIcons name="soccer-field" size={30} color="white" />
    ),
    link: "/admin/projectDashboard",
  },
  {
    key: "partners",
    label: "Partners",
    iconName: <Feather name="users" size={30} color="white" />,
    link: "/admin/partnerDashboard",
  },
  {
    key: "cashier",
    label: "Cashier",
    iconName: (
      <MaterialCommunityIcons
        name="account-cash-outline"
        size={30}
        color="white"
      />
    ),
    link: "/admin/cashierDashboard",
  },
  {
    key: "withdrawRequest",
    label: "Withdraw request",
    iconName: (
      <MaterialIcons name="account-balance-wallet" size={30} color="white" />
    ),
    link: "/admin/withdrawHistory",
  },
  // Add more items as needed
];

const handleLogout = async (setLoading) => {
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
        onPress: async () => {
          setLoading(true);
          try {
            await auth().signOut();
            console.log('User signed out!');
            router.replace("/"); // Replace with your login route
          } catch (error) {
            console.error('Error signing out: ', error);
          } finally {
            setLoading(false);
          }
        },
      },
    ],
    { cancelable: false }
  );
};

const AdminDashboard = () => {
  const [loading, setLoading] = useState(false); // State for managing loading

  const renderItem = ({ item }) => (
    <GridItem
      icon={item.iconName}
      label={item.label}
      link={item.link}
    />
  );

  return (
    <BackgroundImage>
      <View style={styles.container}>
        {loading && (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#ffffff" />
          </View>
        )}
        <View style={styles.logoutContainer}>
        <View style={styles.headerText}>
              <Text style={styles.greeting}>hello, Admin</Text>
              <Text style={styles.welcome}>Welcome back</Text>
            </View>
          <AntDesign name="logout" size={24} color="white" style={styles.logoutIcon} onPress={() => handleLogout(setLoading)} />
        </View>
        <FlatList
          data={data}
          renderItem={renderItem}
          keyExtractor={(item) => item.key}
          numColumns={2} // Number of columns in your grid
          contentContainerStyle={styles.flatListContainer}
        />
      </View>
    </BackgroundImage>
  );
};

const GridItem = ({ icon, label, link }) => {
  return (
    <TouchableOpacity style={styles.gridItem} onPress={() => router.replace(link)}>
      {icon}
      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 10,
  },
  flatListContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  gridItem: {
    width: 150,
    height: 150,
    backgroundColor: "#1f2435",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    margin: 10,
  },
  label: {
    color: "white",
    marginTop: 10,
    textAlign: "center",
  },
  logoutContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  logoutIcon: {
    backgroundColor: "#1f2435",
    padding: 10,
    marginLeft: 10,
    borderRadius: 15,
    borderColor: "#1f2400",
    borderWidth: 2,
  },
  loaderContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1, // Ensure loader is on top of other elements
  },
  headerText: {
    flex: 1,
    marginLeft: 16,
  },
  greeting: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
  },
  welcome: {
    fontSize: 14,
    color: "gray",
  },
});

export default AdminDashboard;
