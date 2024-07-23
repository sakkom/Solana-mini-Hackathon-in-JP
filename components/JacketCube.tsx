import React, { useRef, useState } from "react";
// Import Swiper React components
import { Swiper, SwiperSlide } from "swiper/react";

// Import Swiper styles
import "swiper/css";
import "swiper/css/effect-cube";
import "swiper/css/pagination";

// import required modules
import { EffectCube, Pagination } from "swiper/modules";

interface JacketCubeProps {
  urls: string[];
}

export const JacketCube: React.FC<JacketCubeProps> = ({ urls }) => {
  return (
    <>
      <Swiper
        effect={"cube"}
        grabCursor={true}
        cubeEffect={{
          shadow: true,
          slideShadows: true,
          shadowOffset: 20,
          shadowScale: 0.94,
        }}
        pagination={false}
        modules={[EffectCube, Pagination]}
        className="mySwiper"
      >
        {urls.map((url, index) => (
          <SwiperSlide key={index}>
            <img src={url} className="rounded-sm aspect-square object-cover" />
          </SwiperSlide>
        ))}
      </Swiper>
    </>
  );
};
