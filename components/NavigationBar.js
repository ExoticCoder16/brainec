// components/NavigationBar.js

import React from 'react';
import { View, Button, Text, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';

const NavigationBar = ({ onUploadPress, selectedModel, onModelChange }) => {
  return (
    <View style={styles.container}>
      <Button title="Upload Image" onPress={onUploadPress} />
      <Picker
        selectedValue={selectedModel}
        onValueChange={onModelChange}
        style={styles.picker}
      >
        <Picker.Item label="Claude" value="Claude" />
        {/* Add more models here */}
      </Picker>
      <Text style={styles.modelName}> Model Name : {selectedModel}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    backgroundColor: '#f8f8f8',
  },
  picker: {
    height: 50,
    width: 150,
  },
  modelName: {
    marginLeft: 10,
  },
});

export default NavigationBar;
