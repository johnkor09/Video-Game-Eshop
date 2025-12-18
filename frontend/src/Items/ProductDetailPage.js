import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { FaShoppingBasket } from "react-icons/fa";
import axios from 'axios';
import { useAuth } from '../Authentication/AuthContext';
import './ProductDetailPage.css';

const ProductDetailPage = () => {
    const { productId } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user, token } = useAuth();

    useEffect(() => {
        const getProductDetails = async () => {
            if (!productId || productId === 'undefined') {
                setError("Μη έγκυρο ID προϊόντος.");
                setLoading(false);
                return;
            }
            try {
                const response = await axios.get(`http://localhost:4000/api/product/${productId}`);
                console.log("Product Data received:", response.data);
                setProduct(response.data);
            } catch (err) {
                console.error("Failed to get product details.", err);
                setError(err.response?.data?.message || "Πρόβλημα με τον server!");
            } finally {
                setLoading(false);
            }
        };
        getProductDetails();
    }, [ productId]);
    if (loading) return <div className="loading">Φόρτωση λεπτομερειών...</div>;
    if (error) return <div className='error'>Σφάλμα: {error}</div>;
    if (!product) return <div className='error'>Το προϊόν δεν βρέθηκε!</div>;

    const handleAddToCart = async () => {
        if (!user || !token) {
            alert("Πρέπει να συνδεθείτε για να προσθέσετε προϊόντα στο καλάθι.");
            return;
        }
        try {
            await axios.post('http://localhost:4000/api/cart/add',
                { productId: productId, quantity: 1 },
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
            alert("Το προϊόν προστέθηκε στο καλάθι!");
        } catch (err) {
            alert('Σφάλμα: ' + err.response?.data?.message);
        }
    };


    const renderSpecificDetails = () => {
        switch (product?.product_type) {
            case 'game':
                return (
                    <>
                        <p><strong>Platform:</strong> {product.platform}</p>
                        <p><strong>Developer:</strong> {product.developer || 'N/A'}</p>
                        <p><strong>Genres:</strong> {product.genres || 'N/A'}</p>
                        <p><strong>Release Date:</strong> {product.release_date ? new Date(product.release_date).toLocaleDateString('el-GR') : 'N/A'}</p>
                    </>
                );
            case 'collectible':
                return (
                    <>
                        <p><strong>Brand:</strong> {product.brand || 'N/A'}</p>
                        <p><strong>Collectible Type:</strong> {product.collectible_type || 'N/A'}</p>
                    </>
                );
            case 'accessory':
                return (
                    <>
                        <p><strong>Brand:</strong> {product.brand || 'N/A'}</p>
                        <p><strong>Accessory Type:</strong> {product.accessory_type || 'N/A'}</p>                    </>
                );
            default:
                return null;
        }
    };

    const imageUrl = product.cover_image_url
        ? `/game_images/${product.cover_image_url}`
        : '/game_images/placeholder.webp';

    return (
        <div className='detailsPage'>
            <div className='gameTitle'>{product.title}</div>

            <div className='content'>
                <img
                    src={imageUrl}
                    alt={product.title}
                    className='coverImage'
                    onError={(e) => { e.target.src = 'https://placehold.co/300x400?text=No+Image'; }}
                />

                <div className="main-info">
                    <div className="info-box">
                        <h3>Χαρακτηριστικά</h3>
                        {renderSpecificDetails()}
                        <p><strong>Stock:</strong> {product.stock_quantity > 0 ? `${product.stock_quantity} διαθέσιμα` : 'Εξαντλήθηκε'}</p>
                    </div>

                    <div className='purchase-box'>
                        <p className="price">€{product.price}</p>
                        <button
                            className='cartButton'
                            onClick={handleAddToCart}
                            disabled={product.stock_quantity <= 0}
                        >
                            <FaShoppingBasket /> {product.stock_quantity > 0 ? "Προσθήκη στο καλάθι" : "Μη διαθέσιμο"}
                        </button>
                    </div>
                </div>

                <div className='description'>
                    <div className='descriptionText'>Περιγραφή</div>
                    <div className='descriptionInfo'>{product.description_ || 'Δεν υπάρχει διαθέσιμη περιγραφή.'}</div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetailPage;