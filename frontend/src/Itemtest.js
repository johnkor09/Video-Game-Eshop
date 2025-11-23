import { useNavigate } from "react-router-dom";
function Itemtest()
{
    const navigate = useNavigate();
    return(
        <button onClick={()=>navigate('/PageOfItem')}>
            ITEM
            </button>
    );
}

export default Itemtest