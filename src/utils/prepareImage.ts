export default null;
// async function prepareImage(imageUri) {
//   const selectedImg = imageUri;
//   const imgWidth = selectedImg.width > 1200 ? 1200 : selectedImg.width;
//   const imgHeight = imgWidth * (selectedImg.width / selectedImg.height);
//   console.log(`[selectedImg] === ${JSON.stringify(selectedImg)}`);
//   console.log(`[selectedImg] === ${selectedImg}`);
//   let photoUri = await RNPhotoManipulator.crop(
//     selectedImg,
//     { x: 0, y: 0, width: selectedImg.width, height: selectedImg.height },
//     { width: imgWidth, height: imgHeight }
//   );
//   photoUri = await RNPhotoManipulator.crop(
//     photoUri,
//     { x: 0, y: 0, width: imgWidth, height: imgHeight },
//     { width: imgWidth, height: imgHeight }
//   );
//   setResizedImage(photoUri);
//   const res = await processFaces(photoUri);
//   setFaceData(res);
// }
