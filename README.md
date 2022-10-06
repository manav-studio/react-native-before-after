[![npm version](https://badge.fury.io/js/react-native-awesome-gallery.svg)](https://badge.fury.io/js/react-native-awesome-gallery)

<div style="text-align: center;">
  <h1 align="center">React Native Before After</h1>

</div>

## Supported features

- Zoom to scale
- Double tap to scale
- Native iOS feeling (rubber effect, decay animation on pan gesture)
- RTL support
- Fully customizable
- Both orientations (portrait + landscape)
- Infinite list
- Supports both iOS and Android.

## Installation

First you have to follow installation instructions of [Reanimated v2](https://docs.swmansion.com/react-native-reanimated/) and [react-native-gesture-handler](https://docs.swmansion.com/react-native-gesture-handler/)

```sh
yarn add react-native-awesome-gallery
```

Expo is supported since SDK 40. More information [here](https://docs.expo.io/versions/latest/sdk/reanimated/)

## Usage

```js
Comming Soon
```

## Props

| Prop                             | Description                                                                                                                                                                     | Type                                                                                             | Default                                                                |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------- |
| data `(will be updated soon)`    | Array of items to render                                                                                                                                                        | `T[]`                                                                                            | `undefined`                                                            |
| renderItem?                      | Callback func which can be used to render custom image component, e.g `FastImage`. NOTE: You have to call `setImageDimensions({width, height})` parameter after image is loaded | `(renderItemInfo: {item: T, index: number, setImageDimensions: Function}) => React.ReactElement` | `undefined`                                                            |
| keyExtractor?                    | Callback func which provides unique keys for items                                                                                                                              | `(item: T, index: number) => string or number`                                                   | Takes `id` or `key` or `_id` from `Item`, otherwise puts `Item` as key |
| initialIndex?                    | The initial image index                                                                                                                                                         | `number`                                                                                         | `0`                                                                    |
| onIndexChange?                   | Is called when index of active item is changed                                                                                                                                  | `(newIndex: number) => void`                                                                     | `undefined`                                                            |
| doubleTapScale?                  | Image scale when double tap is fired                                                                                                                                            | `number`                                                                                         | `3`                                                                    |
| doubleTapInterval?               | Time in milliseconds between single and double tap events                                                                                                                       | `number`                                                                                         | `500`                                                                  |
| maxScale?                        | Maximum scale user can set with gesture                                                                                                                                         | `number`                                                                                         | `6`                                                                    |
| pinchEnabled?                    | Is pinch gesture enabled                                                                                                                                                        | `boolean`                                                                                        | `true`                                                                 |
| disableTransitionOnScaledImage?  | Disables transition to next/previous image when scale > 1                                                                                                                       | `boolean`                                                                                        | `false`                                                                |
| hideAdjacentImagesOnScaledImage? | Hides next and previous images when scale > 1                                                                                                                                   | `boolean`                                                                                        | `false`                                                                |
| disableVerticalSwipe?            | Disables vertical swipe when scale == 1                                                                                                                                         | `boolean`                                                                                        | `false`                                                                |
| disableSwipeUp?                  | Disables swipe up when scale == 1                                                                                                                                               | `boolean`                                                                                        | `false`                                                                |
| loop?                            | Allows user to swipe infinitely. Works when `data.length > 1`                                                                                                                   | `boolean`                                                                                        | `false`                                                                |
| onScaleChange?                   | Is called when scale is changed                                                                                                                                                 | `(scale: number) => void`                                                                        | `undefined`                                                            |
| onScaleChangeRange?              | Shows range of scale in which `onScaleChange` is called                                                                                                                         | `{start: number, end: number}`                                                                   | `undefined`                                                            |
| containerDimensions?             | Dimensions object for the View that wraps gallery.                                                                                                                              | `{width: number, height: number}`                                                                | value returned from `useWindowDimensions()` hook.                      |
| style?                           | Style of container                                                                                                                                                              | `ViewStyle`                                                                                      | `undefined`                                                            |

## Events

| Prop                      | Description                                                                                                                    | Type       |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | ---------- |
| onSwipeToClose            | Fired when user swiped to top/bottom                                                                                           | `Function` |
| onTap                     | Fired when user tap on image                                                                                                   | `Function` |
| onDoubleTap               | Fired when user double tap on image                                                                                            | `Function` |
| onLongPress               | Fired when long press is detected                                                                                              | `Function` |
| onScaleStart              | Fired when pinch gesture starts                                                                                                | `Function` |
| onScaleEnd(scale: number) | Fired when pinch gesture ends. Use case: add haptic feedback when user finished gesture with `scale > maxScale` or `scale < 1` | `Function` |
| onPanStart                | Fired when pan gesture starts                                                                                                  | `Function` |

## Methods

```js
Comming Soon
```

## License

MIT
