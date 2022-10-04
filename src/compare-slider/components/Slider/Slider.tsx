import React from 'react';
import { View } from 'react-native';
import { PanGestureHandler, PanGestureHandlerGestureEvent } from 'react-native-gesture-handler';

import { DEFAULT_SLIDER_SIZE } from '../../utils/constants';
import { IDefaultSliderProps, ISliderProps } from '../../types';

import { styles } from './styles';
import Animated, { useAnimatedGestureHandler, useAnimatedStyle, Value } from 'react-native-reanimated';
import { clamp } from 'react-native-redash';

const initialAnimatedValue = new Value(0);

const DefaultSlider: React.FC<IDefaultSliderProps> = ({ sliderSize = DEFAULT_SLIDER_SIZE, sliderStyles }) => {
  return (
    <View style={[styles.slider, sliderStyles, sliderSize]}>
      <View style={[styles.sliderArrow, styles.sliderArrowRight]} />
      <View style={[styles.sliderArrow, styles.sliderArrowLeft]} />
    </View>
  );
};

export const Slider: React.FC<ISliderProps> = props => {
  const {
    containerSize: { height: containerHeight, width },
    translateX = initialAnimatedValue,
    updateTranslateX,
    sliderSize = DEFAULT_SLIDER_SIZE,
    sliderStyles,
    showSeparationLine = true,
    separationLineStyles,
    SliderComponent = <DefaultSlider sliderSize={sliderSize} sliderStyles={sliderStyles} />,
  } = props;

  const offsetFromEdges = 30;
  const boundX = width / 2 - offsetFromEdges;

  const onGestureEvent = useAnimatedGestureHandler<PanGestureHandlerGestureEvent, { offsetX: number }>({
    onStart: (_event, ctx) => {
      ctx.offsetX = translateX.value;
    },
    onActive: (event, ctx) => {
      translateX.value = clamp(ctx.offsetX + event.translationX, -boundX, boundX);
      updateTranslateX(translateX.value);
    },
    onEnd: () => {},
  });
  const animatedStyle = useAnimatedStyle(() => {
    return { transform: [{ translateX: translateX.value }] };
  });

  return (
    <PanGestureHandler onGestureEvent={onGestureEvent}>
      <Animated.View style={[sliderSize, styles.animatedView, animatedStyle]} pointerEvents="box-only">
        {showSeparationLine && (
          <Animated.View style={[styles.separationLine, { height: containerHeight }, separationLineStyles]} />
        )}
        {SliderComponent}
      </Animated.View>
    </PanGestureHandler>
  );
};
