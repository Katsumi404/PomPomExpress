import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';

const DataTestScreen = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Use correct URL for the emulator or real device
    fetch('http://10.202.135.206:8081/datatest') // Android Emulator
    // fetch('http://192.168.x.x:3000/datatest') // Real Device
      .then(response => response.json())
      .then(json => {
        setData(json);
        setLoading(false);
      })
      .catch(error => {
        console.error(error);
        setLoading(false);
      });
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Data Test Screen</Text>
      {loading ? (
        <Text style={styles.content}>Loading...</Text>
      ) : (
        <Text style={styles.content}>{JSON.stringify(data)}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  content: {
    fontSize: 16,
    marginVertical: 10,
  },
});

export default DataTestScreen;