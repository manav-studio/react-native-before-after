import { calculateFaceRectInsideImage } from './calculateFaceRectInsideImage';
import { calculateImageSize } from './calculateImageSize';
import RNPhotoManipulator from 'react-native-photo-manipulator';
import processFaces from './processFaces';

export const getFaceRects = async (
  imgUri: any,
  imgWidth: number | any,
  imgHeight: number | any,
  windowWidth: number | any,
  setFaceRects?: any
) => {
  try {
    if (imgUri) {
      const photoUri = await RNPhotoManipulator.crop(
        imgUri,
        { x: 0, y: 0, width: imgWidth, height: imgHeight },
        { width: imgWidth, height: imgHeight }
      );
      const faces = await processFaces(photoUri);
      const imageSizeResult = calculateImageSize(imgWidth, imgHeight, windowWidth);
      const faceRectResults: any = [];
      faces.faces?.forEach((face: any) => {
        const faceRect = calculateFaceRectInsideImage(face.boundingBox, imageSizeResult);
        faceRectResults.push(faceRect);
      });

      console.log(`[getFaceRects] in faceRectResults === ${JSON.stringify(faceRectResults)}`);
      if (setFaceRects) setFaceRects(faceRectResults);
      else return faceRectResults;
    }
  } catch (error) {
    console.warn(`[getFaceRects] [error] in processImage === ${error}`);
  }
};
