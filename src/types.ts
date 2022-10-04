import { ViewStyle } from 'react-native';
import Animated from 'react-native-reanimated';

export type ImageSizeType = {
  width: number;
  height: number;
  originalWidth: number;
  originalHeight: number;
};

export type BoundingBoxType = [number, number, number, number];

export type FaceRectType = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type Dimensions = {
  height: number;
  width: number;
};

export type RenderItemInfo<T> = {
  index: number;
  item: T;
  setImageDimensions: (imageDimensions: Dimensions) => void;
};

export type EventsCallbacks = {
  onSwipeToClose?: () => void;
  onTap?: () => void;
  onDoubleTap?: () => void;
  onLongPress?: () => void;
  onScaleStart?: () => void;
  onScaleEnd?: (scale: number) => void;
  onPanStart?: () => void;
};

export type RenderItem<T> = (imageInfo: RenderItemInfo<T>) => React.ReactElement | null;

export type ItemRef = {
  reset?: (animated: boolean) => void;
  zoomIn?: ({ x, y }: any) => void;
};

export type Props<T> = EventsCallbacks & {
  getAllCroppedImageURI?: any;
  sliderSize?: any;
  SliderComponent?: any;
  showSeparationLine?: boolean;
  separationLineStyles?: ViewStyle;
  compareSlider?: boolean;
  leftImage?: T;
  rightImage?: T;
  imgWidth?: number;
  imgHeight?: number;
  shouldScaleToFit?: boolean;
  imageType?: any;
  scaleToFit?: any;
  setIsFaceDetected?: any;
  faceRects: FaceRectType | any;
  item: T;
  index: number;
  isFirst: boolean;
  isLast: boolean;
  translateX: Animated.SharedValue<number>;
  currentIndex: Animated.SharedValue<number>;
  renderItem: RenderItem<T>;
  width: number;
  height: number;
  length: number;

  emptySpaceWidth: number;
  doubleTapInterval: number;
  doubleTapScale: number;
  maxScale: number;
  pinchEnabled: boolean;
  disableTransitionOnScaledImage: boolean;
  hideAdjacentImagesOnScaledImage: boolean;
  disableVerticalSwipe: boolean;
  disableSwipeUp?: boolean;
  loop: boolean;
  onScaleChange?: (scale: number) => void;
  onScaleChangeRange?: { start: number; end: number };

  setRef: (index: number, value: ItemRef) => void;
};
