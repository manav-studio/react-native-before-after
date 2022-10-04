export const calculateImageSize = (originalWidth: number, originalHeight: number, windowWidth: number) => {
  const ratio = originalWidth / originalHeight;

  const w = originalWidth > windowWidth ? windowWidth : originalWidth;
  const h = w / ratio;

  return {
    width: w,
    height: h,
    originalWidth,
    originalHeight,
  };
};
