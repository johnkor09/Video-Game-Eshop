import "./PageOfItem.css"
import { useNavigate } from "react-router-dom";
function PageOfItem()
{
    const navigate = useNavigate();
    return(
        <>
        <div className="PageOfItem">
            <div className="CentralPart">
            <div className="image">
             <img src="C:\Users\antonio\OneDrive\Έγγραφα\GitHub\Video-Game-Eshop\frontend\src\IMGTODELETE\frierent.png" alt="placeholder einai cringe kai den fortonei h eikona deite to sto arxeio"></img>
            </div>
             
              <div className="Description">
                <p>HERE IS DESCRIPTION</p> 
              </div>

             <div className="idk"> sxolia? specs? consola? idk</div>
            </div>
            
        
             <div className="ButtonPart">
              <div className="Buttons1">
              <div><button className="back" onClick={()=>navigate("/")}> back</button></div>
              <div><button className="wishlist">wishlist</button></div>
              </div>
              
               <div className="Buttons2">
               <div><button className="add"> Add  </button></div>
                <div>
                <label for="quantity"> quantity:</label>
                <input type="number" name="quantity" min="1" max="99"></input>
                </div>
                </div>
             </div>
            
        </div>
        </>
    );
}

export default PageOfItem