import './HomePage.css';
import { useState, useCallback,useEffect } from 'react';
import IMG1 from './slide_images/pvz.jpg'
import IMG2 from './slide_images/asuka.jpg'
import IMG3 from './slide_images/oguri.jpeg'
import IMG4 from './slide_images/mu.png'
import IMG5 from './slide_images/yo-phone-linging.jpg'
import { FaArrowRight } from "react-icons/fa";
import { FaArrowLeft } from "react-icons/fa";

export default function Home() {
  const pictures = [IMG1, IMG2, IMG3, IMG4, IMG5];
  const [picIndex, setIndex] = useState(0);

  const goNext = useCallback(() => {
    setIndex(index => {
      if (index === pictures.length - 1)
        return 0;
      else
        return index + 1;
    })
  }, [pictures.length]);

  useEffect(() => {
    const inter = setInterval(goNext, 5000);
    return () => clearInterval(inter);
  }, [goNext]);

  const goPrev = () => {
    setIndex(index => {
      if (index === 0)
        return pictures.length - 1;
      else
        return index - 1;
    })
  };

  return (
    <>
      <div className='slider'>

        <div className='animationPart'>
          {pictures.map(pic => (
            <img key={pic} src={pic} alt='' className='image' style={{ translate: `${-100 * picIndex}%` }} />))}
        </div>

        <button className='leftArrow' onClick={goPrev} ><FaArrowLeft className='arrowL' /></button>
        <button className='rightArrow' onClick={goNext}><FaArrowRight className='arrowR' /></button>


      </div>

    </>
  )
}


