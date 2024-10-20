import { Platform, TouchableOpacity, Pressable, Text, StyleSheet } from 'react-native';

export const MyButton = ({ onPress, children }) => {
  const ButtonComponent = Platform.OS === 'web' ? Pressable : TouchableOpacity;

  return (
    <ButtonComponent onPress={onPress} style={styles.buttonContainer}>
      <Text style={styles.buttonText}>
        {children}
      </Text>
    </ButtonComponent>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    // Add button styling here if needed
  },
  buttonText: {
    color: 'black',  // Default text color set to black
    fontSize: 16,    // Ensure the font size is set
  },
});
