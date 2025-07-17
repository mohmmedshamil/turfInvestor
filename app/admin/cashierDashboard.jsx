import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import firestore from "@react-native-firebase/firestore";
import BackgroundImage from "../backgroundImage";
import CashierCardItems from "./CashierCardItems";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

const CashierDashboard = () => {
  const [cashiers, setCashiers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [updateList, setUpdateList] = useState(false);
  const [loading, setLoading] = useState(true); // Add loading state

  useEffect(() => {
    const fetchCashiers = async () => {
      try {
        setLoading(true); // Start loading
        const usersSnapshot = await firestore()
          .collection("users")
          .where("role", "==", "cashier")
          .get();
        const cashierList = usersSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        let filterCashier = cashierList.filter((obj) => obj.isDeleted != true);
        setCashiers(filterCashier);
      } catch (error) {
        console.error("Error fetching cashiers: ", error);
      } finally {
        setLoading(false); // Stop loading
      }
    };

    fetchCashiers();
  }, [updateList]);

  const filteredCashiers = cashiers.filter((cashier) =>
    cashier.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <BackgroundImage>
      <SafeAreaView style={{ flex: 1, paddingTop: 50 }}>
        {loading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#ffffff" />
          </View>
        ) : (
          <>
            <TouchableOpacity
              onPress={() => router.replace(`/admin/adminDashboard`)}
            >
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <View style={styles.header}>
              <View style={styles.search}>
                <FontAwesome
                  name="search"
                  size={13}
                  color="#758694"
                  style={styles.icon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Search..."
                  underlineColorAndroid="transparent"
                  placeholderTextColor="#758694"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
              </View>
              <TouchableOpacity
                style={styles.createProject}
                onPress={() => router.replace("/admin/createCashier")}
              >
                <Text style={{ color: "#DC5F00", fontWeight: "500" }}>
                  Create Cashier
                </Text>
              </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={{ alignItems: "center" }}>
              {!filteredCashiers?.length && (
                <Text
                  style={{
                    color: "white",
                    margin: 15,
                    fontWeight: "bold",
                    padding: 5,
                    borderRadius: 10,
                    opacity: 0.8,
                  }}
                >
                  There are no cashiers, please create one.
                </Text>
              )}
              {filteredCashiers.map((cashier) => (
                <CashierCardItems
                  key={cashier.id}
                  id={cashier.id}
                  name={cashier.name}
                  email={cashier.email}
                  phoneNumber={cashier.phoneNumber}
                  assignedProject={cashier.assignedProject}
                  setUpdateList={setUpdateList}
                  updateList={updateList}
                />
              ))}
            </ScrollView>
          </>
        )}
      </SafeAreaView>
    </BackgroundImage>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    borderRadius: 5,
    marginHorizontal: 20,
    marginVertical: 10,
    gap: 20,
  },
  search: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "rgba(31, 31, 31, 0.7)",
    borderRadius: 5,
    height: 40,
    justifyContent: "center",
    gap: 5,
  },
  createProject: {
    backgroundColor: "rgba(238, 230, 238, 1)",
    borderRadius: 5,
    height: 40,
    paddingHorizontal: 10,
    justifyContent: "center",
  },
  icon: {
    marginLeft: 10,
    marginTop: 13,
  },
  input: {
    flex: 1,
    fontSize: 13,
    color: "#758694",
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default CashierDashboard;
