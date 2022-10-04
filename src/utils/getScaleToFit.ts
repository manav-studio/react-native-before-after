export const getScaleToFit = async (imgWidth: any, imgHeight: any, setScaleToFit: any) => {
  const viewPortWidthAfterFit = 1; // cause viewPort is square
  const viewPortHeightAfterFit = 1; // cause viewPort is square
  const imgWidthAfterFit = imgWidth / imgHeight;
  const imgHeightAfterFit = 1;
  if (imgHeightAfterFit === viewPortHeightAfterFit && imgWidthAfterFit < viewPortWidthAfterFit) {
    // potrait
    const scale = viewPortWidthAfterFit / imgWidthAfterFit;
    setScaleToFit(scale);
  } else if (imgHeightAfterFit === viewPortHeightAfterFit && imgWidthAfterFit > viewPortWidthAfterFit) {
    // landscape
    const scale = imgWidthAfterFit / viewPortWidthAfterFit;
    setScaleToFit(scale);
  }
};
