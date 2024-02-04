import React from "react";
import { View, Text, Dimensions, TouchableOpacity, Image, SafeAreaView, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  withTiming,
  useDerivedValue,
  useAnimatedStyle,
  interpolate,
  Extrapolation,
  runOnJS,
  useAnimatedProps
} from "react-native-reanimated";
import Slider from '@react-native-community/slider';
import tw from "twrnc"
import Controls from "../Controls";
const SCREEN_HEIGHT = Dimensions.get('window').height;
const SCREEN_WIDTH = Dimensions.get('window').width;

const MIN_HEIGHT = 50; // Set your minimum height here

const ControlFooter = () => {
  const translateY = useSharedValue(0);

  const animatedContainerStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
    };
  });

  const animatedImageHeight = useDerivedValue(() => {
    return interpolate(translateY.value, [0, SCREEN_HEIGHT - 90], [300, 50], Extrapolation.CLAMP);
  });

  const animatedImageMarginLeft = useDerivedValue(() => {
    return interpolate(translateY.value, [0, SCREEN_HEIGHT - 90], [SCREEN_WIDTH / 2 - 165, 10], Extrapolation.CLAMP);
  });


  const animatedStyle = useAnimatedStyle(() => {
    return {
      height: animatedImageHeight.value,
      width: animatedImageHeight.value,
      marginLeft: animatedImageMarginLeft.value,
    };
  });
  const animatedProps = useAnimatedProps(() => {
    return {
        marginTop: animatedImageHeight.value === 300 ? 250 : 0,
    };
  });
  
  const animatedOpacity = useDerivedValue(() => {
    return interpolate(
      translateY.value,
      [0, SCREEN_HEIGHT - 250, SCREEN_HEIGHT - 90],
      [0, 0, 1],
      Extrapolation.CLAMP
    );
  });

  const animatedHeaderHeight = useDerivedValue(() => {
    return interpolate(
      translateY.value,
      [0, SCREEN_HEIGHT * 0.25, SCREEN_HEIGHT * 0.5, SCREEN_HEIGHT * 0.75],
      [100, 75, 50, 25],
      Extrapolation.CLAMP
    );
  });

  const animatedSongDetailsOpacity = useDerivedValue(() => {
    return interpolate(
      translateY.value,
      [0, SCREEN_HEIGHT - 100, SCREEN_HEIGHT - 90],
      [1, 0, 0],
      Extrapolation.CLAMP
    );
  });
  const handleButtonPress = () => {
    const destinationY = translateY.value === 0 ? SCREEN_HEIGHT - MIN_HEIGHT : 0;
    translateY.value = withTiming(destinationY, { duration: 300 }, (isFinished) => {
      if (isFinished) {
        runOnJS(handleTogglePosition)();
      }
    });
  };

  const handleTogglePosition = () => {
    if (translateY.value > SCREEN_HEIGHT - MIN_HEIGHT) {
      // Show alert if the user tries to push below the specified point
      alert('Warning', 'Cannot push below the minimum height!');
    }
  };

  return (
    <View>
      <Animated.View style={[styles.animatedContainer, animatedContainerStyle,styles.container]}>
        <View style={tw`h-full bg-pink-500`}>
          <Animated.View style={[tw`flex-row items-center px-4`,{ height: animatedHeaderHeight}]}>
            <TouchableOpacity
              onPress={handleButtonPress}
              style={tw`flex-1 h-full items-center flex-row top-full w-full`}
            >
              <View style={tw`items-center flex-row`}>
                <Animated.View animatedProps={animatedProps} style={[animatedStyle]}>
                  <Image
                    style={tw`h-full w-full`}
                    source={{
                      uri: 'https://images.pexels.com/photos/268533/pexels-photo-268533.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
                    }}
                  />
                </Animated.View>
                <View style={tw`pl-4`}>
                  <Animated.Text style={[tw`font-bold`,{ opacity: animatedOpacity}]}>Song name</Animated.Text>

                  <Animated.View style={[tw`flex-row items-center gap-2`,{opacity: animatedOpacity}]}>
                    <Text style={tw`text-black font-bold text-xs`}>Artist name</Text>
                    <Text style={tw`text-black font-bold text-xs`}>Artist name</Text>
                  </Animated.View>
                </View>
              </View>
            </TouchableOpacity>
          </Animated.View>
          <Animated.View style={{ height: animatedHeaderHeight, opacity: animatedSongDetailsOpacity, paddingHorizontal: 16, marginTop: 400 }}>
            <View style={tw`flex-1 items-center justify-end`}>
              <Text style={tw`font-bold text-2xl`}>Hotel California (Live)</Text>
              <Text style={tw`text-xl text-pink-500`}>Eagles - Hell Freezes Over</Text>
            </View>
            <View style={tw`flex-row items-center mt-4`}>
              <Controls/>
            </View>
            <TouchableOpacity onPress={handleButtonPress}>
              <Text>Toggle Position</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 25,
    // top: -100,
    zIndex: 10000,
    backgroundColor:'red'  //for testing
  },
  animatedContainer: {
    backgroundColor: 'white',
    height: SCREEN_HEIGHT,
  },
});

export default ControlFooter;
