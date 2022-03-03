/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */
import React from 'react';
import {SafeAreaView, StyleSheet, useColorScheme} from 'react-native';

import {Colors} from 'react-native/Libraries/NewAppScreen';
import Reanimated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import {
  Camera,
  useCameraDevices,
  useFrameProcessor,
} from 'react-native-vision-camera';
import {scanFaces, Face} from 'vision-camera-face-detector';

const App = () => {
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
    flex: 1,
  };

  const devices = useCameraDevices();
  const device = devices.front;

  const [faces, setFaces] = React.useState([]);
  const faceBounds = useSharedValue({top: 0, left: 0, width: 0, height: 0});

  const setPermissions = async () => {
    const cameraPermission = await Camera.getCameraPermissionStatus();
    const microphonePermission = await Camera.getMicrophonePermissionStatus();

    if (cameraPermission !== 'authorized') {
      const status = await Camera.requestCameraPermission();
      setHasPermission(status === 'authorized');
    }
    if (microphonePermission !== 'authorized') {
      await Camera.requestMicrophonePermission();
    }
    setHasPermission(cameraPermission === 'authorized');
  };

  const [hasPermission, setHasPermission] = React.useState(false);

  const frameProcessor = useFrameProcessor(frame => {
    'worklet';
    const scannedFaces = scanFaces(frame);
    if (scannedFaces.length > 0) {
      const {bounds} = scannedFaces[0];
      // console.log('🚀 ~ file: App.js ~ line 59 ~ App ~ bounds', bounds);
      faceBounds.value = {
        height: bounds.y / 2,
        width: bounds.x,
        top: bounds.y / 2,
        left: bounds.x / 2,
      };
    }

    runOnJS(setFaces)(scannedFaces);
  }, []);

  React.useEffect(() => {
    setPermissions();
  }, []);

  const boxOverlayStyle = useAnimatedStyle(
    () => ({
      position: 'absolute',
      borderWidth: 3,
      borderColor: 'red',
      ...faceBounds.value,
    }),
    [faceBounds],
  );

  return device != null && hasPermission ? (
    <SafeAreaView style={backgroundStyle}>
      <Camera
        style={StyleSheet.absoluteFill}
        device={device ?? {}}
        isActive={true}
        frameProcessor={frameProcessor}
        frameProcessorFps={60}
      />
      <Reanimated.View style={boxOverlayStyle} />
    </SafeAreaView>
  ) : null;
};

export default App;
