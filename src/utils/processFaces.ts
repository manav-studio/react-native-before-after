import FaceDetection, {
  FaceDetectorContourMode,
  FaceDetectorLandmarkMode,
  FaceDetectorPerformanceMode,
  FaceContourType,
} from 'react-native-face-detection';

async function processFaces(imagePath: string) {
  const options = {
    landmarkMode: FaceDetectorLandmarkMode.ALL,
    contourMode: FaceDetectorContourMode.ALL,
    performanceMode: FaceDetectorPerformanceMode.FAST,
  };

  const faces = await FaceDetection.processImage(imagePath, options);

  if (faces.length > 0) {
    return { status: true, faces };
  } else {
    return { status: false };
  }
}

export default processFaces;
