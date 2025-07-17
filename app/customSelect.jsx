import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Modal, FlatList } from "react-native";
import { Ionicons } from "@expo/vector-icons"; // Import Ionicons for the close icon

const CustomSelectPicker = ({ data, selectedValue, onValueChange, customButton, customModal }) => {
  const [modalVisible, setModalVisible] = useState(false);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.modalItem}
      onPress={() => {
        onValueChange(item.value);
        setModalVisible(false);
      }}
    >
      <Text style={styles.modalItemText}>{item.label}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={{ marginTop: 5 }}>
      <TouchableOpacity
        style={styles.picker}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.pickerText}>
          {data?.find((option) => option.value === selectedValue)?.label ||
            "Select an option"}
        </Text>
      </TouchableOpacity>
      <Modal visible={modalVisible} transparent={true} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Ionicons name="close" size={24} color="white" />
            </TouchableOpacity>
            <FlatList
              data={data}
              renderItem={renderItem}
              keyExtractor={(item) => item.value}
            />
            {customButton ? (
              <TouchableOpacity
                style={[styles.modalItem, {opacity: 1, borderBottomWidth: 0, marginLeft: 10}]}
                onPress={() => customModal()}
              >
                <Text style={[styles.modalItemText, {color: "#fff"}]}>{customButton}</Text>
              </TouchableOpacity>
            ) : ""}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  picker: {
    backgroundColor: "rgba(46, 46, 46, 0.8)",
    color: "white",
    borderRadius: 10,
    padding: 15,
    marginVertical: 5,
  },
  pickerText: {
    color: "white",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "80%",
    backgroundColor: "#3C5B6F",
    borderRadius: 5,
    padding: 10,
  },
  closeButton: {
    alignSelf: "flex-end",
    marginBottom: 10,
  },
  modalItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  modalItemText: {
    fontSize: 16,
  },
});

export default CustomSelectPicker;
