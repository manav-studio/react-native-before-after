import ImageEditor from '@react-native-community/image-editor';

export const getCroppedImageURI = async (imageUri: string, faceRects: any) => {
  let listOfCroppedImageUri: any = [];
  if (faceRects.length > 0) {
    for (let index = 0; index < faceRects.length; index++) {
      let cropData = {
        offset: { x: faceRects[index].x, y: faceRects[index].y },
        size: { width: faceRects[index].width, height: faceRects[index].height },
        displaySize: { width: 100, height: 100 },
      };
      try {
        let croppedUri = await ImageEditor.cropImage(imageUri, cropData);
        listOfCroppedImageUri.push(croppedUri);
        console.log('Cropped image uri', croppedUri);
      } catch (error) {
        console.log(`error in cropImage() === ${error}`);
        console.log(`error in cropImage() === ${JSON.stringify(error)}`);
      }
    }
    return listOfCroppedImageUri;
  }
};
