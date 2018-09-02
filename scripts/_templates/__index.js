import React, { Component } from 'react';
import { View, Text, AppRegistry } from 'react-native';

class App extends Component {
  render() {
    return (
      <View>
        <Text>Welcome to Foundation Project</Text>
      </View>
    );
  }
}

AppRegistry.registerComponent('Foundation', () => App);
