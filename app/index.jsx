import React, { useEffect } from "react";
import { UserProvider } from "./store/userContext";
import { ConfirmationProvider } from "./store/confirmationContext";
import { ImageBackground, StyleSheet } from "react-native";
import LoginPage from "./loginPage";
import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";
import { useRouter } from "expo-router";
import registerNNPushToken from 'native-notify';

const backgroundImage = require("../assets/images/background.png");

export default function Index() {
  const router = useRouter();
  const user = auth().currentUser;
  useEffect(() => {
    const checkUserRole = async () => {

      if (user) {
        const phoneNumber = user.phoneNumber;

        const usersRef = firestore().collection("users");
        const querySnapshot = await usersRef
          .where("phoneNumber", "==", phoneNumber)
          .get();

        if (!querySnapshot.empty) {
          const userDoc = querySnapshot.docs[0];
          const userData = userDoc.data();
          const userRole = userData.role;
          if (userRole === "Admin") {
            router.replace(`/admin/adminDashboard`);
            console.log("User role is Admin");
          } else if (userRole === "cashier") {
            router.replace(`/cashier/projectList`);
            console.log("User role is cashier");
          }  else if (userRole === "partner") {
            router.replace(`/partner/partnerDashboard`);
            console.log("User role is partner");
          }
        } else {
          console.log("No user document found with the given phone number.");
        }
      } else {
        console.log("No user is currently signed in!");
      }
    };

    checkUserRole();
  }, [router]);


  return (
    <UserProvider>
      <ConfirmationProvider>
        <ImageBackground
          source={backgroundImage}
          style={styles.backgroundImage}
        >
          {!user ? <LoginPage /> : ""}
        </ImageBackground>
      </ConfirmationProvider>
    </UserProvider>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    resizeMode: "cover",
  },
});
