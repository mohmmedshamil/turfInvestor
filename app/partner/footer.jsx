import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

const Footer = () => {
const route = (name) => {
    if(name=="home"){
        router.replace("/partner/partnerDashboard");
    }
}
  return (
    <View style={styles.footer}>
      <TouchableOpacity style={styles.footerButton} onPress={() => router.replace("/partner/withdrawPage")}>
        <MaterialIcons name="account-balance-wallet" size={20} color="#0d0d19" />
        <Text style={styles.footerText}>Wallet</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.footerButton} onPress={() => router.replace("/partner/partnerDashboard")}>
        <Ionicons name="home" size={20} color="#0d0d19" />
        <Text style={styles.footerText}>Home</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.footerButton} onPress={() => router.push('/partner/settings')}>
        <Ionicons name="settings" size={20} color="#0d0d19" />
        <Text style={styles.footerText}>Settings</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 8,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: '#ddd',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 50, height: 50 },
    shadowOpacity: 1,
    shadowRadius: 4,
    backgroundColor: "#d6a231",
    elevation: 5,
  },
  footerButton: {
    alignItems: 'center',
    paddingVertical: 2,
  },
  footerText: {
    fontSize: 12,
    color: '#0d0d19',
  },
});

export default Footer;
