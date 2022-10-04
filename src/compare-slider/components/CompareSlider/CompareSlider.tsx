import React from 'react';
import { View } from 'react-native';

import { Slider } from '../Slider';
import { ICompareSlider } from '../../types';

import { styles } from './styles';
import Animated, { useAnimatedStyle, useDerivedValue, useSharedValue } from 'react-native-reanimated';

export const CompareSlider: React.FC<ICompareSlider> = props => {
  const { before, after, containerSize, sliderSize, SliderComponent, sliderStyles, showSeparationLine } = props;
  const { width: containerWidth, height: containerHeight } = containerSize;

  const translateX = useSharedValue(0);
  const boxWidth = useDerivedValue(() => translateX.value + containerWidth / 2, [translateX]);

  const updateTranslateX = (value: any) => {
    'worklet';
    translateX.value = value;
  };
  const animatedStyle = {
    before: useAnimatedStyle(() => ({
      width: boxWidth.value,
    })),
    after: useAnimatedStyle(() => ({
      left: boxWidth.value,
    })),
  };
  return (
    <View
      style={[
        {
          width: containerWidth,
          height: containerHeight,
          overflow: 'hidden',
        },
      ]}>
      <View
        style={{
          position: 'absolute',
          width: containerWidth,
          height: containerHeight,
        }}>
        <Animated.View style={[styles.item, styles.itemBefore, animatedStyle.before]}>{before}</Animated.View>
        <Animated.View style={[styles.item, styles.itemAfter, animatedStyle.after]}>
          <Animated.View style={[styles.itemAfterChild, { width: containerWidth }]}>{after}</Animated.View>
        </Animated.View>
      </View>
      <Slider
        translateX={translateX}
        updateTranslateX={updateTranslateX}
        sliderSize={sliderSize}
        containerSize={containerSize}
        sliderStyles={sliderStyles}
        SliderComponent={SliderComponent}
        showSeparationLine={showSeparationLine}
      />
    </View>
  );
};
