import React from 'react';
import {Dimensions} from 'react-native';

import Reanimated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

const CameraFrame = ({face}) => {
  const top = useSharedValue(0);
  const left = useSharedValue(0);
  const width = useSharedValue(0);
  const height = useSharedValue(0);

  const screenWidth = Dimensions.get('screen').width;
  const screenHeight = Dimensions.get('screen').height;
  const widthRatio = 1080 / screenWidth; //1080 is the frame size from iphone11
  const heightRatio = 1920 / screenHeight; //1920 is the frame size from iphone11

  React.useEffect(() => {
    if (face.bounds) {
      const {bounds} = face;
      top.value = withTiming(bounds.y / widthRatio, {
        duration: 300,
        easing: Easing.ease,
      });
      left.value = withTiming(bounds.x / widthRatio, {
        duration: 300,
        easing: Easing.ease,
      });
      height.value = withTiming(bounds.height / heightRatio, {
        duration: 300,
        easing: Easing.ease,
      });
      width.value = withTiming(bounds.width / widthRatio, {
        duration: 300,
        easing: Easing.ease,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [face]);

  const boxOverlayStyle = useAnimatedStyle(
    () => ({
      top: top.value,
      left: left.value,
      width: width.value,
      height: height.value,
      position: 'absolute',
      borderWidth: 3,
      borderColor: 'red',
    }),
    [top, left, width, height],
  );
  return <Reanimated.View style={boxOverlayStyle} />;
};

export default CameraFrame;
