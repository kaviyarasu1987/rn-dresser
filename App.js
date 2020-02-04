import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import CustomDresserMale from './customdresser.male';
import DresserMale from './dresser.male';
export default function App() {
  return (
    <DresserMale />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
