import React, {
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import {
  I18nManager,
  Image,
  StyleSheet,
  useWindowDimensions,
  View,
  ViewStyle,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withTiming,
  useAnimatedReaction,
  runOnJS,
  withSpring,
  cancelAnimation,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useVector } from 'react-native-redash';
import { clamp, withDecaySpring, withRubberBandClamp } from './utils';

import {
  EventsCallbacks,
  ItemRef,
  Props,
  RenderItem,
  RenderItemInfo,
} from './types';
import { LANDSCAPE, POTRAIT } from './utils/constants';

const rtl = I18nManager.isRTL;

const DOUBLE_TAP_SCALE = 3;
const MAX_SCALE = 6;
const SPACE_BETWEEN_IMAGES = 40;

export const snapPoint = (
  value: number,
  velocity: number,
  points: ReadonlyArray<number>
): number => {
  'worklet';
  const point = value + 0.25 * velocity;
  const deltas = points.map((p) => Math.abs(point - p));
  const minDelta = Math.min.apply(null, deltas);
  return points.filter((p) => Math.abs(point - p) === minDelta)[0];
};

const defaultRenderImage = ({
  item,
  setImageDimensions,
}: RenderItemInfo<any>) => {
  return (
    <Image
      onLoad={(e) => {
        const { height: h, width: w } = e.nativeEvent.source;
        setImageDimensions({ height: h, width: w });
      }}
      source={{ uri: item }}
      resizeMode="contain"
      style={StyleSheet.absoluteFillObject}
    />
  );
};
const ResizableImage = React.memo(
  <T extends any>({
    // setAllCroppedImageURI,
    // sliderSize,
    // SliderComponent,
    // showSeparationLine,
    // separationLineStyles,
    // compareSlider,
    // leftImage,
    // rightImage,
    shouldScaleToFit,
    // imageType,
    // scaleToFit,
    setIsFaceDetected,
    // faceRects,
    item,
    translateX,
    index,
    isFirst,
    isLast,
    currentIndex,
    renderItem,
    width,
    height,
    onSwipeToClose,
    onTap,
    onDoubleTap,
    onLongPress,
    onPanStart,
    onScaleStart,
    onScaleEnd,
    emptySpaceWidth,
    doubleTapScale,
    doubleTapInterval,
    maxScale,
    pinchEnabled,
    disableTransitionOnScaledImage,
    hideAdjacentImagesOnScaledImage,
    disableVerticalSwipe,
    disableSwipeUp,
    loop,
    length,
    onScaleChange,
    onScaleChangeRange,
    setRef,
  }: Props<T>) => {
    const [faceRects, setFaceRects] = useState<any>();

    const [scaleToFit, setScaleToFit] = useState(1);

    const [imageType, setImageType] = useState(undefined);

    // useEffect(() => {
    //   (async () => {
    //     if (!compareSlider) {
    //       try {
    //         let newWidth = 0;
    //         let newHeight = 0;

    //         Image.getSize(leftImage.uri, async (width, height) => {
    //           newWidth = width;
    //           newHeight = height;
    //           await getFaceRects(
    //             item,
    //             newWidth,
    //             newHeight,
    //             width,
    //             setFaceRects
    //           ); // aka viewPortWidth
    //           if (shouldScaleToFit)
    //             await getScaleToFit(newWidth, newHeight, setScaleToFit);
    //           await setImageTypeOnUseState(newWidth, newHeight, setImageType);
    //         });
    //       } catch (error) {
    //         console.warn(`[FaceDetect] error in useEffect === ${error}`);
    //         console.warn(
    //           `[FaceDetect] error in useEffect === ${JSON.stringify(error)}`
    //         );
    //       }
    //     }
    //   })();
    // }, [
    //   item,
    //   shouldScaleToFit,
    //   compareSlider,
    //   // setFaceRects, setScaleToFit, setImageType
    // ]);
    // useEffect(() => {
    //   (async () => {
    //     if (compareSlider && rightImage) {
    //       try {
    //         let newWidth = 0;
    //         let newHeight = 0;

    //         // @ts-ignore
    //         Image.getSize(rightImage.uri, async (width, height) => {
    //           newWidth = width;
    //           newHeight = height;

    //           // @ts-ignore
    //           const detectdeFaceRects = await getFaceRects(
    //             rightImage.uri,
    //             newWidth,
    //             newHeight,
    //             width
    //           ); // aka viewPortWidth
    //           const allCroppedImages = await getCroppedImageURI(
    //             rightImage.uri,
    //             detectdeFaceRects
    //           );
    //           setAllCroppedImageURI(allCroppedImages);

    //           if (shouldScaleToFit)
    //             getScaleToFit(newWidth, newHeight, setScaleToFit);
    //           setImageTypeOnUseState(newWidth, newHeight, setImageType);
    //         });
    //       } catch (error) {
    //         console.warn(`[awesome-gallery] error in useEffect === ${error}`);
    //         console.warn(
    //           `[awesome-gallery] error in useEffect === ${JSON.stringify(
    //             error
    //           )}`
    //         );
    //       }
    //     }
    //   })();
    // }, [rightImage, shouldScaleToFit, compareSlider]);

    const CENTER = {
      x: width / 2,
      y: height / 2,
    };

    const offset = useVector(0, 0);

    const scale = useSharedValue(1);

    const translation = useVector(0, 0);

    const origin = useVector(0, 0);

    const adjustedFocal = useVector(0, 0);

    const originalLayout = useVector(width, 0);
    const layout = useVector(width, 0);

    const isActive = useDerivedValue(
      () => currentIndex.value === index,
      [currentIndex]
    );
    const [newFaceRects, setNewFaceRects] = useState<any>();

    useEffect(() => {
      scale.value = withTiming(scaleToFit);
      if (faceRects?.length > 0) {
        if (imageType === LANDSCAPE) {
          let newY = [...faceRects];
          // get distance from Y based on scaleToFit
          const newHeight = scaleToFit * height; // aka viewPortHeight
          const point = (newHeight - height) / 2; // aka viewPortHeight
          const distanceFromY = Math.abs(point);
          newY[0] = {
            ...newY[0],
            y: newY[0]?.y + distanceFromY,
          };
          setNewFaceRects(newY);
        } else if (imageType === POTRAIT) {
          let newX = [...faceRects];

          // get distance from Y based on scaleToFit
          const newWidth = scaleToFit * width; // aka viewPortWidth
          const point = (newWidth - width) / 2; // aka viewPortWidth
          const distanceFromX = Math.abs(point);

          newX[0] = {
            ...newX[0],
            y: newX[0]?.x - distanceFromX * 0.5,
          };
          setNewFaceRects(newX);
        } else {
          setNewFaceRects(faceRects);
        }
        // setNewFaceRects(faceRects);
      }
    }, [scaleToFit, faceRects, imageType]);

    useAnimatedReaction(
      () => {
        return scale.value;
      },
      (scaleReaction) => {
        if (!onScaleChange) {
          return;
        }

        if (!onScaleChangeRange) {
          runOnJS(onScaleChange)(scaleReaction);
          return;
        }

        if (
          scaleReaction > onScaleChangeRange.start &&
          scaleReaction < onScaleChangeRange.end
        ) {
          runOnJS(onScaleChange)(scaleReaction);
        }
      }
    );

    const setAdjustedFocal = ({
      focalX,
      focalY,
    }: Record<'focalX' | 'focalY', number>) => {
      'worklet';

      adjustedFocal.x.value = focalX - (CENTER.x + offset.x.value);
      adjustedFocal.y.value = focalY - (CENTER.y + offset.y.value);
    };

    const resetValues = (animated = true) => {
      'worklet';

      scale.value = animated ? withTiming(scaleToFit) : scaleToFit;
      offset.x.value = animated ? withTiming(0) : 0;
      offset.y.value = animated ? withTiming(0) : 0;
      translation.x.value = animated ? withTiming(0) : 0;
      translation.y.value = animated ? withTiming(0) : 0;
    };

    const getEdgeX = () => {
      'worklet';
      const newWidth = scale.value * layout.x.value;

      const point = (newWidth - width) / 2;

      if (point < 0) {
        return [-0, 0];
      }

      return [-point, point];
    };

    const clampY = (value: number, newScale: number) => {
      'worklet';
      const newHeight = newScale * layout.y.value;
      const point = (newHeight - height) / 2;

      if (newHeight < height) {
        return 0;
      }
      return clamp(value, -point, point);
    };

    const clampX = (value: number, newScale: number) => {
      'worklet';
      const newWidth = newScale * layout.x.value;
      const point = (newWidth - width) / 2;

      if (newWidth < width) {
        return 0;
      }
      return clamp(value, -point, point);
    };

    const getEdgeY = () => {
      'worklet';

      const newHeight = scale.value * layout.y.value;

      const point = (newHeight - height) / 2;

      return [-point, point];
    };

    const onStart = () => {
      'worklet';

      cancelAnimation(translateX);

      offset.x.value = offset.x.value + translation.x.value;
      offset.y.value = offset.y.value + translation.y.value;

      translation.x.value = 0;
      translation.y.value = 0;
      // runOnJS();
    };

    const getPosition = (i?: number) => {
      'worklet';

      return (
        -(width + emptySpaceWidth) * (typeof i !== 'undefined' ? i : index)
      );
    };

    const getIndexFromPosition = (position: number) => {
      'worklet';

      return Math.round(position / -(width + emptySpaceWidth));
    };

    useAnimatedReaction(
      () => {
        return {
          i: currentIndex.value,
          translateX: translateX.value,
          currentScale: scale.value,
        };
      },
      ({ i, translateX, currentScale }) => {
        const translateIndex = translateX / -(width + emptySpaceWidth);
        if (loop) {
          let diff = Math.abs((translateIndex % 1) - 0.5);
          if (diff > 0.5) {
            diff = 1 - diff;
          }
          if (diff > 0.48 && Math.abs(i) !== index) {
            resetValues(false);
            return;
          }
        }
        if (Math.abs(i - index) === 2 && currentScale > 1) {
          resetValues(false);
        }
      }
    );

    useEffect(() => {
      setRef(index, {
        reset: (animated: boolean) => resetValues(animated),
        setFocal: ({ x, y }: any) => {
          // resetValues();
          setAdjustedFocal({ focalX: x, focalY: y });
        },
        zoomIn: ({ x, y }: any) => {
          console.log(`[zoomIn] [x] === ${x}`);
          console.log(`[zoomIn] [y] === ${y}`);
          console.log(`[zoomIn] doubleTapScale === ${doubleTapScale}`);

          // setAdjustedFocal({ focalX: x, focalY: y });
          scale.value = withTiming(doubleTapScale);

          offset.x.value = withTiming(
            clampX(
              adjustedFocal.x.value +
                -1 * doubleTapScale * adjustedFocal.x.value,
              doubleTapScale
            )
          );
          offset.y.value = withTiming(
            clampY(
              adjustedFocal.y.value +
                -1 * doubleTapScale * adjustedFocal.y.value,
              doubleTapScale
            )
          );
        },
      });
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [index]);

    const animatedStyle = useAnimatedStyle(() => {
      const isNextForLast =
        loop &&
        isFirst &&
        currentIndex.value === length - 1 &&
        translateX.value < getPosition(length - 1);
      const isPrevForFirst =
        loop &&
        isLast &&
        currentIndex.value === 0 &&
        translateX.value > getPosition(0);
      return {
        transform: [
          {
            translateX:
              offset.x.value +
              translation.x.value -
              (isNextForLast ? getPosition(length) : 0) +
              (isPrevForFirst ? getPosition(length) : 0),
          },
          { translateY: offset.y.value + translation.y.value },
          { scale: scale.value },
        ],
      };
    });

    const setImageDimensions: RenderItemInfo<T>['setImageDimensions'] = ({
      width: w,
      height: h,
    }) => {
      originalLayout.x.value = w;
      originalLayout.y.value = h;

      const portrait = width > height;

      if (portrait) {
        const imageHeight = Math.min((h * width) / w, height);
        const imageWidth = Math.min(w, width);
        layout.y.value = imageHeight;
        if (imageHeight === height) {
          layout.x.value = (w * height) / h;
        } else {
          layout.x.value = imageWidth;
        }
      } else {
        const imageWidth = Math.min((w * height) / h, width);
        const imageHeight = Math.min(h, height);
        layout.x.value = imageWidth;
        if (imageWidth === width) {
          layout.y.value = (h * width) / w;
        } else {
          layout.y.value = imageHeight;
        }
      }
    };

    useEffect(() => {
      setImageDimensions({
        width: originalLayout.x.value,
        height: originalLayout.y.value,
      });
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [width, height]);

    const itemProps: RenderItemInfo<T> = {
      item,
      index,
      setImageDimensions,
    };

    const scaleOffset = useSharedValue(1);

    const distanceY = useDerivedValue(() => {
      if (scale.value <= 1 && faceRects?.length > 0) {
        return newFaceRects ? newFaceRects[0].y : 0;
      } else if (scale.value > 1 && faceRects?.length > 0)
        return newFaceRects[0].y * scale.value;
      return newFaceRects;
    }, [scale.value, newFaceRects]);

    const distanceX = useDerivedValue(() => {
      if (scale.value <= 1 && faceRects?.length > 0) {
        return newFaceRects ? newFaceRects[0].x : 0;
      } else if (scale.value > 1 && faceRects?.length > 0)
        return newFaceRects[0].x * scale.value + newFaceRects[0].width;
      return newFaceRects;
    }, [scale.value, newFaceRects]);

    useAnimatedReaction(
      () => {
        return {
          offsetXvalue: offset.x.value,
          offsetYvalue: offset.y.value,
        };
      },
      ({ offsetXvalue, offsetYvalue }) => {
        const edgeX = getEdgeX();
        const edgeY = getEdgeY();

        const distanceFromViewPortX = distanceX.value - edgeX[1] + offsetXvalue;
        if (
          distanceFromViewPortX <= width &&
          distanceY.value + offsetYvalue >= edgeY[1]
        ) {
          console.log(`xxxxxxxxxxxxxxxxxxx face detected ------------`);
          if (setIsFaceDetected) runOnJS(setIsFaceDetected)(true);
        } else {
          if (setIsFaceDetected) runOnJS(setIsFaceDetected)(false);
        }
      },
      [
        offset.x.value,
        width,
        distanceX.value,
        offset.y.value,
        distanceY.value,
        height,
        setIsFaceDetected,
      ]
    );

    const pinchGesture = Gesture.Pinch()
      .enabled(pinchEnabled)
      .onStart(({ focalX, focalY }) => {
        'worklet';
        if (!isActive.value) return;
        if (onScaleStart) {
          runOnJS(onScaleStart)();
        }

        onStart();

        scaleOffset.value = scale.value;

        setAdjustedFocal({ focalX, focalY });

        origin.x.value = adjustedFocal.x.value;
        origin.y.value = adjustedFocal.y.value;
      })
      .onUpdate(({ scale: s, focalX, focalY, numberOfPointers }) => {
        'worklet';
        if (!isActive.value) return;
        if (numberOfPointers !== 2) return;

        const nextScale = withRubberBandClamp(
          s * scaleOffset.value,
          0.55,
          maxScale,
          [1, maxScale]
        );

        scale.value = nextScale;

        setAdjustedFocal({ focalX, focalY });

        translation.x.value =
          adjustedFocal.x.value +
          ((-1 * nextScale) / scaleOffset.value) * origin.x.value;
        translation.y.value =
          adjustedFocal.y.value +
          ((-1 * nextScale) / scaleOffset.value) * origin.y.value;
      })
      .onEnd(() => {
        'worklet';
        if (!isActive.value) return;
        if (onScaleEnd) {
          runOnJS(onScaleEnd)(scale.value);
        }
        if (scale.value < 1) {
          resetValues();
        } else {
          const sc = Math.min(scale.value, maxScale);

          const newWidth = sc * layout.x.value;
          const newHeight = sc * layout.y.value;

          const nextTransX =
            scale.value > maxScale
              ? adjustedFocal.x.value +
                ((-1 * maxScale) / scaleOffset.value) * origin.x.value
              : translation.x.value;

          const nextTransY =
            scale.value > maxScale
              ? adjustedFocal.y.value +
                ((-1 * maxScale) / scaleOffset.value) * origin.y.value
              : translation.y.value;

          if (scale.value > maxScale) {
            scale.value = withTiming(maxScale);
          }
          // for x
          const diffX = nextTransX + offset.x.value - (newWidth - width) / 2;

          if (newWidth <= width) {
            translation.x.value = withTiming(0);
          } else {
            let moved;
            if (diffX > 0) {
              translation.x.value = withTiming(nextTransX - diffX);
              moved = true;
            }

            if (newWidth + diffX < width) {
              translation.x.value = withTiming(
                nextTransX + width - (newWidth + diffX)
              );
              moved = true;
            }
            if (!moved) {
              translation.x.value = withTiming(nextTransX);
            }
          }

          // for y
          const diffY = nextTransY + offset.y.value - (newHeight - height) / 2;

          if (newHeight <= height) {
            translation.y.value = withTiming(-offset.y.value);
          } else {
            let moved;
            if (diffY > 0) {
              translation.y.value = withTiming(nextTransY - diffY);
              moved = true;
            }

            if (newHeight + diffY < height) {
              translation.y.value = withTiming(
                nextTransY + height - (newHeight + diffY)
              );
              moved = true;
            }
            if (!moved) {
              translation.y.value = withTiming(nextTransY);
            }
          }
        }
      });

    const isVertical = useSharedValue(false);
    const initialTranslateX = useSharedValue(0);
    const shouldClose = useSharedValue(false);
    const isMoving = useVector(0);

    const panGesture = Gesture.Pan()
      .minDistance(10)
      .maxPointers(1)
      .onBegin(() => {
        'worklet';
        if (!isActive.value) return;
        const newWidth = scale.value * layout.x.value;
        const newHeight = scale.value * layout.y.value;
        if (
          offset.x.value < (newWidth - width) / 2 - translation.x.value &&
          offset.x.value > -(newWidth - width) / 2 - translation.x.value
        ) {
          cancelAnimation(offset.x);
        }

        if (
          offset.y.value < (newHeight - height) / 2 - translation.y.value &&
          offset.y.value > -(newHeight - height) / 2 - translation.y.value
        ) {
          cancelAnimation(offset.y);
        }
      })
      .onStart(({ velocityY, velocityX }: any) => {
        'worklet';
        if (!isActive.value) return;

        if (onPanStart) {
          runOnJS(onPanStart)();
        }
        onStart(); // here offset is value is set:  offset.x.value = offset.x.value + translation.x.value;
        // console.log(`[panOnStart] offset.x.value === ${offset.x.value}`);
        console.log(`[panOnStart] offset.y.value === ${offset.y.value}`);

        isVertical.value = Math.abs(velocityY) > Math.abs(velocityX);
        initialTranslateX.value = translateX.value;
      })
      .onUpdate(({ translationX, translationY, velocityY }: any) => {
        ('worklet');
        // if (!isActive.value) return;
        // if (disableVerticalSwipe && scale.value === 1 && isVertical.value) return;

        // for x
        const x = getEdgeX();
        if (!isVertical.value || scale.value > 1) {
          const clampedX = clamp(
            translationX,
            x[0] - offset.x.value,
            x[1] - offset.x.value
          );

          const transX = rtl
            ? initialTranslateX.value - translationX + clampedX
            : initialTranslateX.value + translationX - clampedX;

          if (
            hideAdjacentImagesOnScaledImage &&
            disableTransitionOnScaledImage
          ) {
            const disabledTransition =
              disableTransitionOnScaledImage && scale.value > 1;

            const moveX = withRubberBandClamp(
              transX,
              0.55,
              width,
              disabledTransition
                ? [getPosition(index), getPosition(index + 1)]
                : [getPosition(length - 1), 0]
            );

            if (!disabledTransition) {
              translateX.value = moveX;
            }
            if (disabledTransition) {
              translation.x.value = rtl
                ? clampedX - moveX + translateX.value
                : clampedX + moveX - translateX.value;
            } else {
              translation.x.value = clampedX;
            }
          } else {
            if (loop) {
              translateX.value = transX;
            } else {
              translateX.value = withRubberBandClamp(
                transX,
                0.55,
                width,
                disableTransitionOnScaledImage && scale.value > 1
                  ? [getPosition(index), getPosition(index + 1)]
                  : [getPosition(length - 1), 0]
              );
            }
            translation.x.value = clampedX;
          }
        }

        // for y
        const edgeY = getEdgeY();
        const newHeight = scale.value * layout.y.value;
        if (newHeight > height) {
          translation.y.value = withRubberBandClamp(
            translationY,
            0.55,
            newHeight,
            [edgeY[0] - offset.y.value, edgeY[1] - offset.y.value]
          );
        } else if (
          !(scale.value === 1 && translateX.value !== getPosition()) &&
          (!disableSwipeUp || translationY >= 0)
        ) {
          translation.y.value = translationY;
        }

        if (isVertical.value && newHeight <= height) {
          const destY = translationY + velocityY * 0.2;
          shouldClose.value = disableSwipeUp
            ? destY > 220
            : Math.abs(destY) > 220;
        }
      })
      .onEnd(({ velocityX, velocityY }) => {
        ('worklet');

        // if (!isActive.value) return;

        // for x
        const edgeX = getEdgeX();
        if (
          Math.abs(translateX.value - getPosition()) >= 0 &&
          edgeX.some((x) => x === translation.x.value + offset.x.value)
        ) {
          let snapPoints = [index - 1, index, index + 1]
            .filter((_, y) => {
              if (loop) return true;

              if (y === 0) {
                return !isFirst;
              }
              if (y === 2) {
                return !isLast;
              }
              return true;
            })
            .map((i) => getPosition(i));

          if (disableTransitionOnScaledImage && scale.value > 1) {
            snapPoints = [getPosition(index)];
          }

          let snapTo = snapPoint(
            translateX.value,
            rtl ? -velocityX : velocityX,
            snapPoints
          );

          const nextIndex = getIndexFromPosition(snapTo);

          if (currentIndex.value !== nextIndex) {
            if (loop) {
              if (nextIndex === length) {
                currentIndex.value = 0;
                translateX.value = translateX.value - getPosition(length);
                snapTo = 0;
              } else if (nextIndex === -1) {
                currentIndex.value = length - 1;
                translateX.value = translateX.value + getPosition(length);
                snapTo = getPosition(length - 1);
              } else {
                currentIndex.value = nextIndex;
              }
            } else {
              currentIndex.value = nextIndex;
            }
          }

          translateX.value = withSpring(snapTo, {
            damping: 800,
            mass: 1,
            stiffness: 250,
            restDisplacementThreshold: 0.02,
            restSpeedThreshold: 4,
          });
        } else {
          const newWidth = scale.value * layout.x.value;

          isMoving.x.value = 1;
          offset.x.value = withDecaySpring(
            {
              velocity: velocityX,
              clamp: [
                -(newWidth - width) / 2 - translation.x.value,
                (newWidth - width) / 2 - translation.x.value,
              ],
            },
            (edge) => {
              'worklet';
              isMoving.x.value = 0;
              if (edge.isEdge) {
                isMoving.y.value = 0;
              }
            }
          );
        }
        console.log(
          `[panOnEnd] offset.x_y === ${offset.x.value}_${offset.y.value}`
        );
        // // no applicable for our use case
        // if (onSwipeToClose && shouldClose.value) {
        //   offset.y.value = withDecay({
        //     velocity: velocityY,
        //   });
        //   runOnJS(onSwipeToClose)();
        //   return;
        // }

        // for y
        const newHeight = scale.value * layout.y.value;
        if (newHeight > height) {
          isMoving.y.value = 1;
          offset.y.value = withDecaySpring(
            {
              velocity: velocityY,
              clamp: [
                -(newHeight - height) / 2 - translation.y.value,
                (newHeight - height) / 2 - translation.y.value,
              ],
            },
            (edge) => {
              'worklet';
              isMoving.y.value = 0;
              if (edge.isEdge) {
                isMoving.x.value = 0;
              }
            }
          );
        } else {
          const diffY =
            translation.y.value + offset.y.value - (newHeight - height) / 2;

          if (newHeight <= height && diffY !== height - diffY - newHeight) {
            const moveTo = diffY - (height - newHeight) / 2;

            translation.y.value = withTiming(translation.y.value - moveTo);
          }
        }
      });

    const interruptedScroll = useSharedValue(false);

    const tapGesture = Gesture.Tap()
      .enabled(!!onTap)
      .numberOfTaps(1)
      .maxDistance(10)
      .onBegin(() => {
        'worklet';
        if (isMoving.x.value || isMoving.y.value) {
          interruptedScroll.value = true;
        }
      })
      .onEnd(() => {
        'worklet';
        if (!isActive.value) return;
        if (onTap && !interruptedScroll.value) {
          runOnJS(onTap)();
        }
        interruptedScroll.value = false;
      });

    const doubleTapGesture = Gesture.Tap()
      .numberOfTaps(2)
      .maxDelay(doubleTapInterval)
      .onEnd(({ x, y, numberOfPointers }) => {
        'worklet';
        if (!isActive.value) return;
        if (numberOfPointers !== 1) return;
        if (onTap && interruptedScroll.value) {
          interruptedScroll.value = false;
          if (onTap) {
            runOnJS(onTap)();
          }
          return;
        }
        if (onDoubleTap) {
          runOnJS(onDoubleTap)();
        }

        if (scale.value === scaleToFit) {
          scale.value = withTiming(doubleTapScale);
          console.log(`[doubleTapGesture] x === ${x}`);
          console.log(`[doubleTapGesture] y === ${y}`);

          setAdjustedFocal({ focalX: x, focalY: y });

          offset.x.value = withTiming(
            clampX(
              adjustedFocal.x.value +
                -1 * doubleTapScale * adjustedFocal.x.value,
              doubleTapScale
            )
          );
          offset.y.value = withTiming(
            clampY(
              adjustedFocal.y.value +
                -1 * doubleTapScale * adjustedFocal.y.value,
              doubleTapScale
            )
          );
        } else {
          resetValues();
        }
      });

    const longPressGesture = Gesture.LongPress()
      .enabled(!!onLongPress)
      .maxDistance(10)
      .onStart(() => {
        'worklet';
        if (interruptedScroll.value) {
          interruptedScroll.value = false;
          return;
        }
        if (onLongPress) {
          runOnJS(onLongPress)();
        }
      });

    return (
      <GestureDetector
        gesture={Gesture.Race(
          Gesture.Simultaneous(
            longPressGesture,
            Gesture.Race(panGesture, pinchGesture)
          ),
          Gesture.Exclusive(doubleTapGesture, tapGesture)
        )}
      >
        <View style={{ width, height }}>
          {/* {compareSlider ? (
            <CompareSlider
              before={
                <Animated.View style={[{ width, height }, animatedStyle]}>
                  <Image
                    onLoad={(e) => {
                      const { height: h, width: w } = e.nativeEvent.source;
                      setImageDimensions({ height: h, width: w });
                    }}
                    source={leftImage}
                    resizeMode="contain"
                    style={StyleSheet.absoluteFillObject}
                  />
                  <View
                    style={{
                      position: 'absolute',
                      borderWidth: 1,
                      borderColor: 'green',
                      width: newFaceRects ? newFaceRects[0]?.width : 0,
                      height: newFaceRects ? newFaceRects[0]?.height : 0,
                      left: newFaceRects ? newFaceRects[0]?.x : 0,
                      top: newFaceRects ? newFaceRects[0]?.y : 0,
                    }}
                  />
                </Animated.View>
              }
              after={
                <Animated.View style={[{ width, height }, animatedStyle]}>
                  <Image
                    onLoad={(e) => {
                      const { height: h, width: w } = e.nativeEvent.source;
                      setImageDimensions({ height: h, width: w });
                    }}
                    source={rightImage}
                    resizeMode="contain"
                    style={StyleSheet.absoluteFillObject}
                  />
                  <View
                    style={{
                      position: 'absolute',
                      borderWidth: 1,
                      borderColor: 'green',
                      width: newFaceRects ? newFaceRects[0]?.width : 0,
                      height: newFaceRects ? newFaceRects[0]?.height : 0,
                      left: newFaceRects ? newFaceRects[0]?.x : 0,
                      top: newFaceRects ? newFaceRects[0]?.y : 0,
                    }}
                  />
                </Animated.View>
              }
              sliderSize={sliderSize}
              SliderComponent={SliderComponent}
              showSeparationLine={showSeparationLine}
              separationLineStyles={separationLineStyles}
              containerSize={{ width: width, height: height }}
            />
          ) : ( */}
          <Animated.View style={[{ width, height }, animatedStyle]}>
            {renderItem(itemProps)}
            <View
              style={{
                position: 'absolute',
                borderWidth: 1,
                borderColor: 'green',
                width: newFaceRects ? newFaceRects[0]?.width : 0,
                height: newFaceRects ? newFaceRects[0]?.height : 0,
                left: newFaceRects ? newFaceRects[0]?.x : 0,
                top: newFaceRects ? newFaceRects[0]?.y : 0,
              }}
            />
          </Animated.View>
          {/* )} */}
        </View>
      </GestureDetector>
    );
  }
);

export type GalleryRef = {
  setIndex: (newIndex: number) => void;
  reset?: (animated?: boolean) => void;
  zoomIn: ({ x, y }: any) => void;
};

export type GalleryReactRef = React.Ref<GalleryRef>;

type GalleryProps<T> = EventsCallbacks & {
  setAllCroppedImageURI?: any;
  sliderSize?: any;
  SliderComponent?: any;
  showSeparationLine?: boolean;
  separationLineStyles?: ViewStyle;
  rightImage?: any;
  leftImage?: any;
  compareSlider?: boolean;
  shouldScaleToFit?: boolean;
  setIsFaceDetected?: any;
  ref?: GalleryReactRef;
  data?: T[];

  renderItem?: RenderItem<T>;
  keyExtractor?: (item: T, index: number) => string | number;
  initialIndex?: number;
  onIndexChange?: (index: number) => void;
  numToRender?: number;
  emptySpaceWidth?: number;
  doubleTapScale?: number;
  doubleTapInterval?: number;
  maxScale?: number;
  style?: ViewStyle;
  containerDimensions?: { width: number; height: number };
  pinchEnabled?: boolean;
  disableTransitionOnScaledImage?: boolean;
  hideAdjacentImagesOnScaledImage?: boolean;
  disableVerticalSwipe?: boolean;
  disableSwipeUp?: boolean;
  loop?: boolean;
  onScaleChange?: (scale: number) => void;
  onScaleChangeRange?: { start: number; end: number };
};

const GalleryComponent = <T extends any>(
  {
    // setAllCroppedImageURI,
    // sliderSize,
    // SliderComponent,
    // showSeparationLine,
    // separationLineStyles,
    // leftImage,
    // compareSlider,
    shouldScaleToFit = true,
    setIsFaceDetected,
    // faceRects,
    data,
    renderItem = defaultRenderImage,
    initialIndex = 0,
    numToRender = 5,
    emptySpaceWidth = SPACE_BETWEEN_IMAGES,
    doubleTapScale = DOUBLE_TAP_SCALE,
    doubleTapInterval = 500,
    maxScale = MAX_SCALE,
    pinchEnabled = true,
    disableTransitionOnScaledImage = false,
    hideAdjacentImagesOnScaledImage = false,
    onIndexChange,
    style,
    keyExtractor,
    containerDimensions,
    disableVerticalSwipe,
    disableSwipeUp = false,
    loop = false,
    onScaleChange,
    onScaleChangeRange,
    ...eventsCallbacks
  }: GalleryProps<T>,
  ref: GalleryReactRef
) => {
  const tempData = data;
  const windowDimensions = useWindowDimensions();
  const dimensions = containerDimensions || windowDimensions;

  const isLoop = loop && tempData?.length > 1;

  const [index, setIndex] = useState(initialIndex);

  const refs = useRef<ItemRef[]>([]);

  const setRef = useCallback((index: number, value: ItemRef) => {
    refs.current[index] = value;
  }, []);

  const translateX = useSharedValue(
    initialIndex * -(dimensions.width + emptySpaceWidth)
  );

  const currentIndex = useSharedValue(initialIndex);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: rtl ? -translateX.value : translateX.value }],
  }));

  const changeIndex = useCallback(
    (newIndex: any) => {
      onIndexChange?.(newIndex);
      setIndex(newIndex);
    },
    [onIndexChange, setIndex]
  );

  useAnimatedReaction(
    () => currentIndex.value,
    (newIndex) => runOnJS(changeIndex)(newIndex),
    [currentIndex, changeIndex]
  );

  useEffect(() => {
    translateX.value = index * -(dimensions.width + emptySpaceWidth);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [windowDimensions]);

  useImperativeHandle(ref, () => ({
    setIndex(newIndex: number) {
      refs.current?.[index].reset(false);
      setIndex(newIndex);
      currentIndex.value = newIndex;
      translateX.value = newIndex * -(dimensions.width + emptySpaceWidth);
    },
    setFocal({ x, y }: any) {
      refs.current?.forEach((itemRef) => {
        itemRef.setFocal({ x, y });
      });
    },
    zoomIn({ x, y }) {
      refs.current?.forEach((itemRef) => {
        itemRef.zoomIn({ x, y });
      });
    },
    reset(animated = false) {
      refs.current?.forEach((itemRef) => itemRef.reset(animated));
    },
  }));

  useEffect(() => {
    if (index >= tempData.length) {
      const newIndex = tempData.length - 1;
      setIndex(newIndex);
      currentIndex.value = newIndex;
      translateX.value = newIndex * -(dimensions.width + emptySpaceWidth);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tempData?.length]);

  return (
    <View style={[{ flex: 1, backgroundColor: 'black' }, style]}>
      <Animated.View style={[{ flex: 1, flexDirection: 'row' }, animatedStyle]}>
        {tempData.map((item: any, i) => {
          const isFirst = i === 0;

          const outOfLoopRenderRange =
            !isLoop ||
            (Math.abs(i - index) < tempData.length - (numToRender - 1) / 2 &&
              Math.abs(i - index) > (numToRender - 1) / 2);

          const hidden =
            Math.abs(i - index) > (numToRender - 1) / 2 && outOfLoopRenderRange;

          return (
            <View
              key={
                keyExtractor
                  ? keyExtractor(item, i)
                  : item.id || item.key || item._id || item
              }
              style={[
                dimensions,
                isFirst ? {} : { marginLeft: emptySpaceWidth },
                { zIndex: index === i ? 1 : 0 },
              ]}
            >
              {hidden ? null : (
                // @ts-ignore
                <ResizableImage
                  {...{
                    // setAllCroppedImageURI,
                    // sliderSize,
                    // SliderComponent,
                    // showSeparationLine,
                    // separationLineStyles,
                    // compareSlider,
                    // leftImage,
                    shouldScaleToFit,
                    // scaleToFit,
                    setIsFaceDetected,
                    // faceRects,
                    translateX,
                    item,
                    currentIndex,
                    index: i,
                    isFirst,
                    isLast: i === tempData.length - 1,
                    length: tempData.length,
                    renderItem,
                    emptySpaceWidth,
                    doubleTapScale,
                    doubleTapInterval,
                    maxScale,
                    pinchEnabled,
                    disableTransitionOnScaledImage,
                    hideAdjacentImagesOnScaledImage,
                    disableVerticalSwipe,
                    disableSwipeUp,
                    loop: isLoop,
                    onScaleChange,
                    onScaleChangeRange,
                    setRef,
                    ...eventsCallbacks,
                    ...dimensions,
                  }}
                />
              )}
            </View>
          );
        })}
      </Animated.View>
    </View>
  );
};

const Gallery = React.forwardRef(GalleryComponent) as <T extends any>(
  p: GalleryProps<T> & { ref?: GalleryReactRef }
) => React.ReactElement;

export default Gallery;
