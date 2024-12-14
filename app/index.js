import React, { useRef, useState } from "react";
import { StyleSheet, View, Button, Text } from "react-native";
import {Camera, CameraView, useCameraPermissions} from "expo-camera";
import * as MediaLibrary from "expo-media-library";
import * as FileSystem from "expo-file-system";
import * as ImagePicker from "expo-image-picker";

export default function App() {
    // const [hasCameraPermission, setHasCameraPermission] = useState(null);
    const [hasMediaPermission, setHasMediaPermission] = useState(null);
    const [videoUri, setVideoUri] = useState(null);
    const cameraRef = useRef(null);
    const [permission, requestPermission] = useCameraPermissions();
    // Request permissions

    // Record video using Camera
    const recordVideo = async () => {
        if (!cameraRef.current) return;

        try {
            const video = await cameraRef.current.recordAsync({codec: "hvc1"});
            setVideoUri(video.uri);
            console.log("Recorded video URI:", video.uri);
        } catch (error) {
            console.error("Error recording video:", error);
        }
    };

    // Stop recording
    const stopRecording = () => {
        if (cameraRef.current) {
            cameraRef.current.stopRecording();
        }
    };

    // Save video to media library
    const saveVideo = async () => {
        if (!videoUri) {
            console.error("No video URI available");
            return;
        }

        const { status: mediaStatus } = await MediaLibrary.requestPermissionsAsync();

        try {
            // Move file to a persistent location
            const newUri = `${FileSystem.documentDirectory}video.mp4`;
            await FileSystem.copyAsync({
                from: videoUri,
                to: newUri,
            });
            console.log("Moved video URI:", newUri);

            // Attempt to save to media library
            const asset = await MediaLibrary.createAssetAsync(newUri);
            console.log("Video saved successfully:", asset);
        } catch (error) {
            console.error("Error saving video:", error);
        }
    };

    // Use ImagePicker for recording (as an alternative)
    const recordWithImagePicker = async () => {
        const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        });

        if (!result.assets[0].cancelled) {
            setVideoUri(result.assets[0].uri);
            console.log("ImagePicker video URI:", result.assets[0].uri);
        }
    };

    return (
        <View style={styles.container}>
            {!permission?.granted &&
            <View style={{width:400, height: 300}}>
                    <Text variant={'titleMedium'} style={styles.message}>We need your permission to show the camera</Text>
                    <View  style={{display: 'flex', flexDirection: 'row', justifyContent: 'center'}}>
                        <Button mode="contained" style={{width: 'auto'}} onPress={requestPermission} title={'Grant Permission'}/>
                    </View>
            </View>}
            {permission?.granted &&
                <View style={{width: '100%', height: '100%',backgroundColor:'white'}}>
                    <CameraView style={styles.camera} facing={'back'} ref={cameraRef} mode={'video'}/>
                    {/*<CameraView ref={cameraRef} style={styles.camera} />*/}
                    <View style={styles.controls}>
                        <Button title="Record Video" onPress={recordVideo} />
                        <Button title="Stop Recording" onPress={stopRecording} />
                        <Button title="Save Video" onPress={saveVideo} />
                        <Button title="Record with ImagePicker" onPress={recordWithImagePicker} />
                    </View>
            </View>}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
        height: '100%',
        backgroundColor: 'green'
    },
    camera: {
        flex: 1,
        height: '100%',
        width: '100%'
    },
    controls: {
        flex: 1,
        justifyContent: "space-evenly",
        padding: 10,
    },
});
