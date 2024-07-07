import React from "react";
import { Dimensions, ImageBackground, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import LoginPage from "./loginPage";

const { width, height } = Dimensions.get('window');
const landingPage = require("../../assets/images/landingPage.jpg");

function LandingPage() {
  return (
    // <View style={styles.container}>
    //   <ImageBackground
    //     source={landingPage}
    //     style={[styles.backgroundImage, { width, height }]}
    //   >
    //     <View style={styles.overlay}>
    //       <Text style={styles.headerStyle}>Turf Projects</Text>
    //       <TouchableOpacity style={styles.button}>
    //         <Text style={styles.buttonText}>Get Started</Text>
    //       </TouchableOpacity>
    //     </View>
    //   </ImageBackground>
    // </View>
    <LoginPage />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',  // Optional: Adds a translucent overlay
    width: '100%',
  },
  headerStyle: {
    fontSize: 30,
    fontWeight: "bold",
    color: '#B5C0D0',
    textAlign: 'center',
    padding: 70,
    alignSelf: "center",
    borderRadius: 10,
    marginBottom: 20, // Space between header and button
  },
  button: {
    width: '80%',
    backgroundColor: '#333333',
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
    alignItems: 'center',
    marginBottom: 40,
  },
  buttonText: {
    color: '#B5C0D0',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default LandingPage;
