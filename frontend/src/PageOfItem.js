import "./PageOfItem.css"
import { useNavigate } from "react-router-dom";
function PageOfItem()
{
    const navigate = useNavigate();
    return(
        <>
        <div className="PageOfItem">
            
            <div className="image">
              <img src="C:\Users\antonio\OneDrive\Έγγραφα\GitHub\Video-Game-Eshop\frontend\src\IMGTODELETE\frierent.png" alt="placeholder einai cringe kai den fortonei h eikona deite to sto arxeio"></img>
              </div>
            <div className="Description">
            <p>HERE IS DESCRIPTION</p> 
            </div>
            <div className="idk"> sxolia? specs? consola? idk</div>
            
            
        
        <div className="buttonPart">
        <button className="back" onClick={()=>navigate("/")}>
            back
        </button>
        <button className="add"> Add  </button>
        <button className="wishlist">wishlist</button>
        </div>
        </div>
        </>
    );
}

export default PageOfItem