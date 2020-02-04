import { React } from 'react'
import { WebView } from 'react-native'
import Expo from 'expo';
import * as ExpoPixi from 'expo-pixi';
import { Image, Button, Platform, AppState, StyleSheet, Text, View } from 'react-native';
import { Camera } from 'expo-camera';
import {Paint} from './jspaint';


export default class PaintMale extends React.Component {

    state = {
        hasCameraPermission: null,
        type: Camera.Constants.Type.back,
        imageuri: " ",
        panturi: " ",
        shirtCapture:"Try Shirt",
        pantCapture:"Try Pant"
    };

    async componentDidMount() {
        const { status } = await Permissions.askAsync(Permissions.CAMERA);
        this.setState({ hasCameraPermission: status === 'granted' });
    }


    onMessage(event) {



    }

    sendpostMessage(dataToSend) {

        this.webview.sendpostMessage(dataToSend)

    }
    render() {
        return (
            <Camera
                ref={ref => {
                    this.camera = ref;
                }}
                style={{ flex: 1 }} type={this.state.type}>


                <WebView
                    html={Paint}
                    style={this.props.style}
                    ref={ref => {
                        this.webview = ref
                    }}
                    javaScriptEnabledAndroid={true}
                    onMessage={this.onMessage} />



                 <View
                    style={{

                        top: 150,
                        left: 10,
                        backgroundColor: 'transparent',
                        flexDirection: 'row',
                        position: 'absolute',
                        zIndex: 3

                    }}>


                    <TouchableOpacity
                        style={{
                            top: 10,
                            left: 10


                        }}
                        onPress={async () => {
                            if (this.camera) {
                                const photo = await this.camera.takePictureAsync();
                                this.sendpostMessage(photo.uri)
                            }

                        }}>
                        <Text style={{ fontSize: 18, marginBottom: 10, color: 'black' }}> Capture</Text>
                    </TouchableOpacity>
                </View> 



            </Camera>


        );

    }

}