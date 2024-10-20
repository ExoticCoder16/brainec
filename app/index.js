import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, Pressable } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { useRouter } from 'expo-router';
import MathSpatialSummary from './MathSpatialSummary';
// import { MyButton } from '../components/MyButton';

const AIModels = ['claude-3-5-sonnet-20240620', 'gpt-4o', 'Google Gemini 1.5 Pro', 'Facebook Llama 3.2', 'NVIDIA Llama 3.1 Nemotron 70B'];

const FileThumb = ({ file, onDelete }) => (
  <View style={styles.thumbContainer}>
    <Pressable style={styles.deleteButton} onPress={() => onDelete(file)}>
      <Text style={styles.deleteButtonText}>X</Text>
    </Pressable>
    {file.type.startsWith('image') ? (
      <Image source={{ uri: file.uri }} style={styles.thumb} />
    ) : (
      <View style={styles.pdfThumb}>
        <Text>PDF</Text>
      </View>
    )}
  </View>
);

export default function Home() {
  const [selectedModel, setSelectedModel] = useState('claude-3-5-sonnet-20240620');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [storyAIResult, setStoryAIResult] = useState(null);
  const router = useRouter();

  // Image picker function (integrated with URI logging)
  const pickImages = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 1,
      allowsEditing: true,
      base64: false, // Ensure this is explicitly false
    });

    if (!result.canceled) {
      // Log the URI of the selected images
      result.assets.forEach(asset => {
        console.log('Image URI:', asset.uri);
      });

      const newFiles = result.assets.map(asset => ({
        uri: asset.uri,
        type: 'image/jpeg',
        name: asset.fileName || 'image.jpg',
      }));
      setSelectedFiles(prevFiles => [...prevFiles, ...newFiles]);
    }
  };

  const pickPDF = async () => {
    let result = await DocumentPicker.getDocumentAsync({
      type: 'application/pdf',
      multiple: true,
    });

    if (result.type === 'success') {
      const newFiles = Array.isArray(result) ? result : [result];
      const pdfFiles = newFiles.map(file => ({
        uri: file.uri,
        type: 'application/pdf',
        name: file.name,
      }));
      setSelectedFiles(prevFiles => [...prevFiles, ...pdfFiles]);
    }
  };

  const deleteFile = (fileToDelete) => {
    setSelectedFiles(prevFiles => prevFiles.filter(file => file.uri !== fileToDelete.uri));
  };

  const sendFilesToAI = async (selectedFiles, selectedModel) => {
    const formData = new FormData();
  
    formData.append('model', selectedModel);
    console.log("Selected Model in FormData:", selectedModel);
  
    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      console.log(`Processing file ${i + 1}:`, file);
  
      if (file.uri.startsWith('data:')) {
        // Convert data URI to Blob
        const response = await fetch(file.uri);
        const blob = await response.blob();
        formData.append('files', blob, file.name || `image${i}.jpg`);
      } else {
        // For non-data URI (e.g., local file URIs), we need to fetch the file content
        const response = await fetch(file.uri);
        const blob = await response.blob();
        formData.append('files', blob, file.name);
      }
    }
  
    try {
      const response = await fetch('http://localhost:3000/api/analyze', {
        method: 'POST',
        body: formData,
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const data = await response.json();
      console.log('Success:', data);
    //   setStoryAIResult(data); 
    
    // Update the state with the StoryAI result
    if (data.length > 0 && data[0].analysis) {
        setStoryAIResult(data[0].analysis); // Extract and set only the analysis part
      } else {
        console.error('Unexpected data structure:', data);
      }
    } catch (error) {
      console.error('Error sending files to AI:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Home</Text>
      <View style={styles.buttonContainer}>
        <Pressable style={styles.button} onPress={pickImages}>
          <Text style={styles.buttonText}>Upload Images</Text>
        </Pressable>
        <Pressable style={styles.button} onPress={pickPDF}>
          <Text style={styles.buttonText}>Upload PDF</Text>
        </Pressable>
        <Picker
          selectedValue={selectedModel}
          style={styles.picker}
          onValueChange={(itemValue) => setSelectedModel(itemValue)}
        >
          {AIModels.map((model) => (
            <Picker.Item key={model} label={model} value={model} />
          ))}
        </Picker>
        <Pressable
          style={[styles.button, selectedFiles.length === 0 && styles.disabledButton]}
          onPress={() => sendFilesToAI(selectedFiles, selectedModel)} // Pass selectedFiles and selectedModel as arguments
          disabled={selectedFiles.length === 0}
        >
          <Text style={styles.buttonText}>Send to AI</Text>
        </Pressable>
      </View>
      <ScrollView style={styles.fileList}>
        <Text>Selected Model: {selectedModel}</Text>
        <Text>Files selected: {selectedFiles.length}</Text>
        <View style={styles.thumbsContainer}>
          {selectedFiles.map((file, index) => (
            <FileThumb key={index} file={file} onDelete={deleteFile} />
          ))}
        </View>
      </ScrollView>

      {storyAIResult && (
        <ScrollView>
            
        <View style={styles.mathSpatialSummaryContainer}>
            <MathSpatialSummary data={storyAIResult} />
        </View>
        </ScrollView>
)}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  disabledButton: {
    opacity: 0.5,
  },
  picker: {
    width: 150,
  },
  fileList: {
    flex: 1,
  },
  thumbsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  thumbContainer: {
    width: 80,
    height: 80,
    margin: 5,
    position: 'relative',
  },
  thumb: {
    width: '100%',
    height: '100%',
    borderRadius: 5,
  },
  pdfThumb: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
  },
  deleteButton: {
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: 'rgba(255, 0, 0, 0.7)',
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  deleteButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  mathSpatialSummaryContainer: {
    width: '100%',
    marginTop: 20,
  },
});
