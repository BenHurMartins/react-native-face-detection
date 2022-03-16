import React from 'react';
import {SafeAreaView, StyleSheet, useColorScheme} from 'react-native';

import {Colors} from 'react-native/Libraries/NewAppScreen';
import {runOnJS} from 'react-native-reanimated';
import {
  Camera,
  useCameraDevices,
  useFrameProcessor,
} from 'react-native-vision-camera';
import {scanFaces} from 'vision-camera-face-detector';
import CameraFrame from './CameraFrame';

const App = () => {
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
    flex: 1,
  };

  const devices = useCameraDevices();
  const device = devices.front;

  const [faces, setFaces] = React.useState([]);

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
    runOnJS(setFaces)(scannedFaces);
  }, []);

  React.useEffect(() => {
    setPermissions();
  }, []);

  return device != null && hasPermission ? (
    <SafeAreaView style={backgroundStyle}>
      <Camera
        style={StyleSheet.absoluteFill}
        device={device ?? {}}
        isActive={true}
        frameProcessor={frameProcessor}
        frameProcessorFps={16}
      />
      {faces.map((face, index) => (
        <CameraFrame face={face} key={index} />
      ))}
    </SafeAreaView>
  ) : null;
};

export default App;
