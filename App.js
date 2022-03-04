import React from 'react';
import {
  Dimensions,
  SafeAreaView,
  StyleSheet,
  useColorScheme,
} from 'react-native';

import {Colors} from 'react-native/Libraries/NewAppScreen';
import Reanimated, {
  // runOnJS,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import {
  Camera,
  useCameraDevices,
  useFrameProcessor,
} from 'react-native-vision-camera';
import {scanFaces} from 'vision-camera-face-detector';

const App = () => {
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
    flex: 1,
  };

  const devices = useCameraDevices();
  const device = devices.front;

  // const [faces, setFaces] = React.useState([]);
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

  const width = Dimensions.get('screen').width;
  const height = Dimensions.get('screen').height;
  const widthRatio = 1080 / width; //1080 is the frame size from iphone11
  const heightRatio = 1920 / height; //1920 is the frame size from iphone11

  const [hasPermission, setHasPermission] = React.useState(false);
  const frameProcessor = useFrameProcessor(frame => {
    'worklet';
    const scannedFaces = scanFaces(frame);
    if (scannedFaces.length > 0) {
      const {bounds} = scannedFaces[0];
      faceBounds.value = {
        height: bounds.height / heightRatio,
        width: bounds.width / widthRatio,
        top: bounds.y / widthRatio,
        left: bounds.x / widthRatio,
      };
    }

    // runOnJS(setFaces)(scannedFaces);
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
        frameProcessorFps={16}
      />
      <Reanimated.View style={boxOverlayStyle} />
    </SafeAreaView>
  ) : null;
};

export default App;
