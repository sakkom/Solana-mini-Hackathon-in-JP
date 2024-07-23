import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";
import React from "react";

interface PreviewImagesPros {
  imgUrl: string[];
}

export const PreviewImages: React.FC<PreviewImagesPros> = ({ imgUrl }) => {
  const [ref] = useKeenSlider<HTMLDivElement>({
    slides: {
      perView: 2,
      spacing: 10,
    },
  });

  return (
    <div ref={ref} className="keen-slider">
      {imgUrl.map((img, index) => (
        <div className="keen-slider__slide number-slide1">
          <img src={img} />
        </div>
      ))}
    </div>
  );
};
