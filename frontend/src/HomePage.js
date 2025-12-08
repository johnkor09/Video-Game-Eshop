import './HomePage.css';
import IMG1 from './slide_images/pvz.jpg'
import { FaArrowRight } from "react-icons/fa";
import { FaArrowLeft } from "react-icons/fa";

export default function Home() {
    return(
        <>
        <div className='slider'>
         <img src={IMG1} className='image' alt="error"></img>

          <button className='leftArrow'><FaArrowLeft className='arrowL' /></button>
          <button className='rightArrow'><FaArrowRight className='arrowR'/></button>
         
        </div>
            
        </>
    )
}