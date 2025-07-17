import React from 'react';
import { View, Text, StyleSheet, ImageBackground } from 'react-native';

const  BackgroundImage = ({children}) => {
    const backgroundImage = require("../assets/images/background.png");
  return (
    <ImageBackground source={backgroundImage} style={styles.backgroundImage}>
        {children}
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
    backgroundImage: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
});

export default BackgroundImage;