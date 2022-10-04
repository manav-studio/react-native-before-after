import { LANDSCAPE, POTRAIT, SQUARE } from "./constants";

export const setImageTypeOnUseState = (imgWidth: any, imgHeight: any, setImageType: any) => {
  if (imgWidth > imgHeight) {
    setImageType(LANDSCAPE);
  } else if (imgWidth < imgHeight) {
    setImageType(POTRAIT);
  } else if (imgWidth === imgHeight) {
    setImageType(SQUARE);
  }
};
