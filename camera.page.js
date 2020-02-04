import React from 'react';
import { Text, View,Image, TouchableOpacity } from 'react-native';
import * as Permissions from 'expo-permissions';
import { RNCamera } from 'react-native-camera';
import RNViewShot from "react-native-view-shot";

export default class CameraPage extends React.Component {
  state = {
    hasCameraPermission: null,
    type: RNCamera.Constants.Type.back,
  };

  async componentDidMount() {
    const { status } = await Permissions.askAsync(Permissions.CAMERA);
    this.setState({ hasCameraPermission: status === 'granted' });
  }

  render() {
    const { hasCameraPermission } = this.state;
    var imageURL ="";
    if (hasCameraPermission === null) {
      return <View />;
    } else if (hasCameraPermission === false) {
      return <Text>No access to camera</Text>;
    } else {
      return (
        <View style={{ flex: 1 }}
        ref={ref => {
          this.parentView = ref;
        }}
        >
          <RNCamera 
          ref={ref => {
            this.camera = ref;
          }}
          style={{ flex: 1 }} type={this.state.type}>
            <View
              style={{
                flex: 1,
                backgroundColor: 'transparent',
                flexDirection: 'row',
              }}>
              
              <Image source={{uri:imageURL}} />
              <TouchableOpacity
                style={{
                  flex: 0.1,
                  position:"absolute",
                  alignSelf: 'flex-end',
                  alignItems: 'center',
                  zIndex: 1

                }}
                onPress={() => {
                  RNViewShot.takeSnapshot(this.parentView, {
                    format: "jpeg",
                    quality: 0.8
                  })
                  .then(
                    uri => imageURL=uri,
                    error => console.error("Oops, snapshot failed", error)
                  );

                }}>
                <Text style={{ fontSize: 18, marginBottom: 10, color: 'white' }}> Capture </Text>
              </TouchableOpacity>
            </View>
          </RNCamera>
        </View>
      );
    }
  }
} 