import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ActivityIndicator, Modal, ScrollView } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Feather, MaterialIcons } from '@expo/vector-icons';

const ProfitCloseListItems = ({ item, setProfitData, profitData, index, projectId, handleEdit }) => {
  return (
    <View style={styles.tableRow}>
      <Text style={styles.tableCell}>{new Date(item.date).toDateString()}</Text>
      <Text style={[styles.tableCell, styles.centeredText]}>{item.income}</Text>
      <Text style={[styles.tableCell, styles.centeredText]}>{item.expense}</Text>
      <TouchableOpacity
        onPress={() => handleEdit(item, index)}
        style={styles.editButton}
      >
        <Text style={styles.editButtonText}>Edit</Text>
      </TouchableOpacity>
    </View>
  );
};

const EditProfitClose = ({ projectId, existingData = [] }) => {
  const [profitData, setProfitData] = useState(existingData);
  const [date, setDate] = useState(new Date());
  const [income, setIncome] = useState('');
  const [expense, setExpense] = useState('');
  const [error, setError] = useState('');
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [editingIndex, setEditingIndex] = useState(-1);
  const [loading, setLoading] = useState(false);
  const [searchDate, setSearchDate] = useState(null);
  const [showDate, setShowDate] = useState(false);
  const [showSearchDate, setShowSearchDate] = useState(false);

  const onChange = (event, selectedDate) => {
    setShowDate(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const onSearchDateChange = (event, selectedDate) => {
    setShowSearchDate(false);
    if (selectedDate) {
      setSearchDate(selectedDate);
    }
  };

  const clearSearchDate = () => setSearchDate(null);

  const showDatepicker = () => {
    setShowDate(true);
  };

  const showSearchDatepicker = () => {
    setShowSearchDate(true);
  };

  const handleAdd = () => {
    setEditingItem(null);
    setIncome('');
    setExpense('');
    setDate(new Date());
    setEditModalVisible(true);
    setIsEdit(false);
  };

  const handleEdit = (item, index) => {
    setEditingItem(item);
    setIncome(item.income.toString());
    setExpense(item.expense.toString());
    setDate(new Date(item.date));
    setEditingIndex(index);
    setEditModalVisible(true);
    setIsEdit(true);
  };

  const updateProfit = async () => {
    if (!income || !expense) {
      setError("Income and Expense are required fields.");
      return;
    }

    const newProfitData = {
      date: date.getTime(),
      income: parseFloat(income),
      expense: parseFloat(expense),
    };

    if (isEdit && editingItem) {
      const updatedProfitData = [...profitData];
      updatedProfitData[editingIndex] = newProfitData;
      setProfitData(updatedProfitData);

      try {
        await firestore()
          .collection("projects")
          .doc(projectId)
          .update({
            profits: updatedProfitData,
          });
        console.log("Profit updated successfully");
      } catch (error) {
        console.error("Error updating profit: ", error);
        Alert.alert("Error", "Failed to update profit. Please try again.");
      }
    } else {
      const newProfitList = [...profitData, newProfitData];
      setProfitData(newProfitList);

      try {
        await firestore()
          .collection("projects")
          .doc(projectId)
          .update({
            profits: newProfitList,
          });
        console.log("Profit added successfully");
      } catch (error) {
        console.error("Error adding profit: ", error);
        Alert.alert("Error", "Failed to add profit. Please try again.");
      }
    }

    setEditModalVisible(false);
    setIncome('');
    setExpense('');
  };

  const filteredProfitData = searchDate
    ? profitData.filter(item => new Date(item.date).toDateString() === searchDate.toDateString())
    : profitData;

  return (
    <View style={styles.gradientBackground}>
      <View style={styles.container}>
        <Text style={styles.header}>Profit and Close</Text>
        <TouchableOpacity onPress={handleAdd} style={styles.addButton}>
          <Text style={styles.addButtonText}>Add New Entry</Text>
        </TouchableOpacity>
        <Modal visible={editModalVisible} transparent={true} animationType="slide">
          <View style={styles.modalContainer}>
            <View style={styles.modalView}>
              <Text style={styles.modalText}>{isEdit ? 'Edit Profit' : 'Add New Profit'}</Text>
              <TouchableOpacity onPress={showDatepicker} style={styles.dateButton}>
                <Text style={styles.dateButtonText}>{date.toDateString()}</Text>
                <Feather name="calendar" size={15} color="white" style={styles.icon} />
              </TouchableOpacity>
              {showDate && (
                <DateTimePicker
                  testID="dateTimePicker"
                  value={date}
                  mode="date"
                  is24Hour={true}
                  display="default"
                  onChange={onChange}
                />
              )}
              <TextInput
                style={[styles.input, error ? styles.inputError : null]}
                placeholder="Enter Income"
                keyboardType="numeric"
                value={income}
                onChangeText={(text) => {
                  setIncome(text);
                  if (error) setError("");
                }}
              />
              <TextInput
                style={[styles.input, error ? styles.inputError : null]}
                placeholder="Enter Expense"
                keyboardType="numeric"
                value={expense}
                onChangeText={(text) => {
                  setExpense(text);
                  if (error) setError("");
                }}
              />
              {error ? <Text style={styles.errorText}>{error}</Text> : null}
              <TouchableOpacity onPress={updateProfit} style={styles.saveButton}>
                <Text style={styles.saveButtonText}>{isEdit ? 'Update' : 'Save'}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setEditModalVisible(false)} style={styles.cancelButton}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
        <View style={{ borderBottomWidth: 2, borderBottomColor: "#BB9AB1", marginBottom: 10, opacity: .5 }}></View>
        <View style={styles.searchPickerContainer}>
          <TouchableOpacity
            style={styles.searchDateButton}
            onPress={showSearchDatepicker}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Text style={styles.dateButtonText}>
                {searchDate ? searchDate.toDateString() : "Select Date to Search"}
              </Text>
              <Feather
                name="calendar"
                size={15}
                color="white"
                style={styles.icon}
              />
            </View>
            {searchDate ? (
              <TouchableOpacity onPress={clearSearchDate}>
                <MaterialIcons
                  name="clear"
                  size={15}
                  color="white"
                  style={[styles.icon, { paddingLeft: 15 }]}
                />
              </TouchableOpacity>
            ) : null}
          </TouchableOpacity>
          {showSearchDate && (
            <DateTimePicker
              testID="searchDateTimePicker"
              value={searchDate || new Date()}
              mode="date"
              is24Hour={true}
              display="default"
              onChange={onSearchDateChange}
            />
          )}
        </View>
        <View style={styles.tableHeader}>
          <Text style={styles.tableHeaderText}>Date</Text>
          <Text style={styles.tableHeaderText}>Income (₹)</Text>
          <Text style={styles.tableHeaderText}>Expense (₹)</Text>
          <Text style={styles.tableHeaderText}>Actions</Text>
        </View>
        <ScrollView>
          {filteredProfitData.map((item, index) => (
            <ProfitCloseListItems
              key={index}
              item={item}
              setProfitData={setProfitData}
              profitData={profitData}
              index={index}
              projectId={projectId}
              handleEdit={handleEdit}
            />
          ))}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  gradientBackground: {
    flex: 1,
    backgroundColor: "#0F172A",
  },
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#BB9AB1",
  },
  addButton: {
    backgroundColor: "#BB9AB1",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginBottom: 10,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalView: {
    width: 300,
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
  },
  modalText: {
    fontSize: 18,
    marginBottom: 10,
  },
  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    padding: 10,
    backgroundColor: "#BB9AB1",
    borderRadius: 5,
  },
  dateButtonText: {
    color: "white",
    fontSize: 16,
  },
  icon: {
    marginLeft: 10,
  },
  input: {
    width: "100%",
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    marginBottom: 10,
  },
  inputError: {
    borderColor: "red",
  },
  errorText: {
    color: "red",
    marginBottom: 10,
  },
  saveButton: {
    backgroundColor: "#4CAF50",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginBottom: 10,
  },
  saveButtonText: {
    color: "white",
    fontSize: 16,
  },
  cancelButton: {
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginBottom: 10,
  },
  cancelButtonText: {
    color: "#4CAF50",
    fontSize: 16,
  },
  tableHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    paddingBottom: 5,
    marginBottom: 10,
  },
  tableHeaderText: {
    fontSize: 14,
    color: "#BB9AB1",
    flex: 1,
    textAlign: "center",
  },
  tableRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  tableCell: {
    fontSize: 12,
    color: "#fff",
    flex: 1,
  },
  centeredText: {
    textAlign: "center",
  },
  editButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 5,
    paddingHorizontal: 15,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  editButtonText: {
    color: "#fff",
    fontSize: 16,
  },
  searchPickerContainer: {
    marginBottom: 20,
  },
  searchDateButton: {
    backgroundColor: "#BB9AB1",
    padding: 10,
    borderRadius: 5,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
});

export default EditProfitClose;
