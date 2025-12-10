import './HomePage.css';
import IMG1 from './slide_images/pvz.jpg'
import IMG2 from './slide_images/asuka.jpg'
import IMG3 from './slide_images/oguri.jpeg'
import IMG4 from './slide_images/mu.png'
import IMG5 from './slide_images/yo-phone-linging.jpg'
import { FaArrowRight } from "react-icons/fa";
import { FaArrowLeft } from "react-icons/fa";

export default function Home() {
    const pictures=[IMG1,IMG2,IMG3,IMG4,IMG5];
    let index=0;
   /*const next_image = () => {
        if(index < 4)
         index++
        else
          index =0;
       
    }*/
    return(
        <>
        <div className='slider'>
         

          <button className='leftArrow' /*onClick={next_image}*/><FaArrowLeft className='arrowL' /></button>
          <button className='rightArrow'><FaArrowRight className='arrowR'/></button>
          <img src={pictures[index]} className='image' alt="error"></img>
         
        </div>
            
        </>
    )
}


