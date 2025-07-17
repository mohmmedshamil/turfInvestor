import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import firestore from '@react-native-firebase/firestore';
import { router } from 'expo-router';

const CashierCardItems = ({
  id,
  name,
  email,
  phoneNumber,
  assignedProject,
  setUpdateList,
  updateList,
}) => {

  useEffect(() => {
    // Function to fetch any additional data or perform side effects
    const fetchData = async () => {
      // Example: Fetch cashier details if needed
      try {
        const doc = await firestore().collection('users').doc(id).get();
        if (doc.exists) {
          console.log('Cashier data:', doc.data());
        }
      } catch (error) {
        console.error('Error fetching cashier data:', error);
      }
    };

    // Fetch data on component mount
    fetchData();

    // Cleanup or additional effects can be handled here
    return () => {
      // Cleanup if needed
    };
  }, [id, updateList]); // Dependency array

  const confirmDelete = () => {
    Alert.alert(
      'Delete Cashier',
      'Are you sure you want to delete this cashier?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          onPress: handleDelete,
          style: 'destructive',
        },
      ],
      { cancelable: true }
    );
  };

  const handleDelete = async () => {
    try {
      await firestore().collection('users').doc(id).update({
        isDeleted: true,
      });
      setUpdateList(!updateList);
    } catch (error) {
      console.log("error", error);
      Alert.alert('Error', 'Failed to mark cashier as deleted');
    }
  };

  const editCashier = () => {
    const params = { cashierId: id, isEdit: true };
    const queryString = new URLSearchParams(params).toString();
    router.replace(`/admin/createCashier?${queryString}`);
  };

  return (
    <View style={styles.card}>
      <TouchableOpacity onPress={editCashier}>
        <View style={styles.header}>
          <Text style={styles.title}>{name}</Text>
          <Text style={styles.subTitle}>{assignedProject}</Text>
        </View>
        <View style={styles.body}>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Email:</Text>
            <Text style={styles.info}>{email}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Phone:</Text>
            <Text style={styles.info}>{phoneNumber}</Text>
          </View>
        </View>
      </TouchableOpacity>
      <TouchableOpacity style={styles.deleteBtn} onPress={confirmDelete}>
        <MaterialIcons name="delete-outline" size={24} color="red" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(31, 31, 31, 0.7)',
    borderRadius: 10,
    overflow: 'hidden',
    margin: 10,
    width: 300,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    position: 'relative',
  },
  header: {
    marginBottom: 10,
    borderBottomColor: '#EEEDEB',
    borderBottomWidth: 1,
    paddingBottom: 10,
  },
  title: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  subTitle: {
    color: '#7D8ABC',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 5,
  },
  body: {
    marginTop: 10,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 5,
  },
  label: {
    color: '#7D8ABC',
    fontSize: 14,
    fontWeight: 'bold',
  },
  info: {
    color: '#fff',
    fontSize: 14,
  },
  deleteBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    padding: 5,
    backgroundColor: 'rgba(140, 190, 180, .5)',
    borderRadius: 50,
  },
});

export default CashierCardItems;
