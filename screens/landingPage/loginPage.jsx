import React from 'react';
import { View, Text, TextInput, TouchableOpacity, ImageBackground, StyleSheet, Image, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
const landingPage = require("../../assets/images/landingPage.jpg");

function LoginPage() {
  return (
    <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="rgba(0, 0, 0, 1)" />
      <ImageBackground 
        source={landingPage}
        style={styles.backgroundImage}
      >
        <View style={styles.overlay} />
        <View style={styles.header}>
          <View style={styles.profileContainer}>
            <Image source={{ uri: 'https://path-to-your-profile-image1.jpg' }} style={styles.profileImage} />
            <Image source={{ uri: 'https://path-to-your-profile-image2.jpg' }} style={styles.profileImage} />
          </View>
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.title}>For the busy ones,</Text>
          <Text style={styles.subtitle}>workout from anywhere, anytime.</Text>
        </View>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder='+91 Enter your mobile number'
            keyboardType='phone-pad'
          />
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>CONTINUE</Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
      },
      backgroundImage: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
      },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, .7)', // Adjust the color and opacity as needed
      },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      width: '100%',
      paddingHorizontal: 20,
      marginTop: 10,
    },
    profileContainer: {
      flexDirection: 'row',
    },
    profileImage: {
      width: 40,
      height: 40,
      borderRadius: 20,
      marginRight: 10,
    },
    textContainer: {
      alignItems: 'center',
      marginTop: 50,
    },
    title: {
      color: '#fff',
      fontSize: 28,
      fontWeight: 'bold',
    },
    subtitle: {
      color: '#fff',
      fontSize: 18,
      marginTop: 10,
    },
    inputContainer: {
      width: '100%',
      paddingHorizontal: 20,
      marginTop: 50,
    },
    input: {
      backgroundColor: '#fff',
      borderRadius: 10,
      padding: 15,
      fontSize: 16,
    },
    button: {
      backgroundColor: '#ff6b6b',
      borderRadius: 10,
      padding: 15,
      alignItems: 'center',
      marginTop: 20,
    },
    buttonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: 'bold',
    },
  });

export default LoginPage;