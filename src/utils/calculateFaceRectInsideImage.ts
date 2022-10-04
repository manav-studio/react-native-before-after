export const calculateFaceRectInsideImage = (boundingBox: any, imageSize: any) => {
  const wRatio = imageSize.originalWidth / imageSize.width;
  const hRatio = imageSize.originalHeight / imageSize.height;

  const faceX = boundingBox[0] / wRatio;
  const faceY = boundingBox[1] / hRatio;

  const faceWidth = boundingBox[2] / wRatio - faceX;
  const faceHeight = boundingBox[3] / hRatio - faceY;

  return {
    x: faceX,
    y: faceY,
    width: Math.ceil(faceWidth),
    height: Math.ceil(faceHeight),
  };
};

// -----------calculateFaceRectInsideImage ------start----
// imageSize.originalWidth === 600
// imageSize.width === 414
// imageSize.originalHeight === 473
// imageSize.height === 326.37

// wRatio (600/414) === 1.4492753623188406
// hRatio (473/326.37) === 1.4492753623188406
// faceX === 273.24
// faceY === 51.06
// faceWidth === 64.86000000000001
// faceHeight === 64.17
// -----------calculateFaceRectInsideImage ------end----
