import React, { Component } from 'react';
import { View, Text, StyleSheet, AppRegistry, Platform } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    paddingTop: 15,
  },
  text: {
    fontSize: 12,
    textAlign: 'center',
  },
  textBold: {
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    paddingBottom: 8,
  },
  code: {
    color: '#333',
    fontFamily: 'Courier New',
  },
});

class App extends Component {
  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.header}>Foundation</Text>
        <Text style={styles.text}>
          Start writing your app. Edit <Text style={styles.code}>index.js</Text>.
        </Text>
        <View style={styles.textContainer}>
          <Text style={styles.textBold}>Did you notice the splash screen?</Text>
          <Text style={styles.code}>foundation.config.js</Text>
          <Text style={styles.text}>Change configuration and run</Text>
          <Text style={styles.code}>foundation run-{Platform.OS}</Text>
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.textBold}>Revert back to native codes</Text>
          <Text style={styles.code}>foundation create-native</Text>
          <Text style={styles.text}>to generate native sources.</Text>
        </View>
      </View>
    );
  }
}

AppRegistry.registerComponent('Foundation', () => App);
