import { useAuth } from '../Authentication/AuthContext';
import { useState, useEffect } from 'react';
import Select from 'react-select'
import axios from 'axios';
import { RiImageAddLine } from "react-icons/ri";
import { LuSave } from "react-icons/lu";
import { FaRegTrashCan } from "react-icons/fa6";
import { LuHardDriveUpload } from "react-icons/lu";
import './AdminPanel.css';

export default function AdminProducts() {
    const [selectedType, setSelectedType] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({});
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const { token } = useAuth();

    useEffect(() => {
        const fetchProductsByType = async () => {
            // Αν δεν υπάρχει επιλογή ή είναι 'none', καθαρίζουμε τη λίστα
            if (!selectedType || selectedType.value === 'none') {
                setProducts([]);
                return;
            }

            setLoading(true);
            setError(null);

            try {
                // Καθορισμός του URL ανάλογα με τον τύπο
                let url = '';
                switch (selectedType.value) {
                    case 'game':
                        url = 'http://localhost:4000/api/games/all';
                        break;
                    case 'collectible':
                        url = 'http://localhost:4000/api/collectibles/all'; // Υποθέτω ότι υπάρχει αυτό το endpoint
                        break;
                    case 'accessory':
                        url = 'http://localhost:4000/api/accessories/all'; // Υποθέτω ότι υπάρχει αυτό το endpoint
                        break;
                    default:
                        throw new Error("Άγνωστος τύπος προϊόντος");
                }

                const response = await axios.get(url);
                setProducts(response.data);

            } catch (err) {
                console.error("Failed to get products data.", err);
                setError("Πρόβλημα με τον server ή δεν βρέθηκαν προϊόντα.");
                setProducts([]);
            } finally {
                setLoading(false);
            }
        };
        fetchProductsByType();
    }, [selectedType]);

    const getProductDetails = async (productId) => {
        try {
            const response = await axios.get('http://localhost:4000/api/product/' + productId);
            setSelectedProduct(response.data);
            setFormData(response.data);

            setImagePreviewUrl(null);
        } catch (err) {
            console.error("Failed to get product details.", err);
            setError("Πρόβλημα με τον server!");
        }
    }

    const handleProductSelect = (selectedOption) => {
        setImageFile(null);
        setImagePreviewUrl(null);

        if (!selectedOption || selectedOption.value === 'none') {
            setSelectedProduct(null);
            setFormData({ product_type: selectedType?.value });
            return;
        }
        getProductDetails(selectedOption.value);
    };

    const handleProductTypeSelect = (selectedTypeOption) => {
        setSelectedProduct(null);
        setFormData({});
        setImageFile(null);
        setImagePreviewUrl(null);

        if (!selectedTypeOption || selectedTypeOption.value === 'none') {
            setSelectedType(null);
            setProducts([]);
        } else {
            setSelectedType(selectedTypeOption);
            setFormData({ product_type: selectedTypeOption.value });
        }
    };

    const productOptions = products.map(product => ({
        value: product.product_id,
        label: `${product.title} (ID: ${product.product_id})`
    }));

    const selectOptions = [
        { value: 'none', label: '--- Create New Product ---' },
        ...productOptions
    ];

    const selectedValue = selectedProduct
        ? selectOptions.find(option => option.value === selectedProduct.product_id)
        : selectOptions.find(option => option.value === 'none') || null;

    const handleInputChange = (event) => {
        const { id, value } = event.target;
        setFormData(prevData => ({
            ...prevData,
            [id]: value
        }));
    };

    const handleTrashClick = async () => {
        if (!selectedProduct || !selectedProduct.product_id) {
            setFormData([]);
            setImagePreviewUrl(null);
            setImageFile(null);
            return;
        }

        const confirmDelete = window.confirm(`Είσαι σίγουρος ότι θέλεις να διαγράψεις το προϊόν "${selectedProduct.title}";`);
        if (!confirmDelete) return;
        if (!token) return alert('Δεν είστε συνδεδεμένοι.');

        try {
            await axios.delete('http://localhost:4000/api/admin/products/' + selectedProduct.product_id, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            alert('Το προϊόν διαγράφηκε επιτυχώς!');
            setProducts(prev => prev.filter(p => p.product_id !== selectedProduct.product_id));
            setSelectedProduct(null);
            setFormData({ product_type: selectedType?.value });
            setImagePreviewUrl(null);

        } catch (err) {
            console.error("Failed to delete product.", err);
            alert("Αποτυχία διαγραφής.");
        }
    }

    const handleImageChange = (event) => {
        setImageFile(null);
        setImagePreviewUrl(null);
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreviewUrl(reader.result);
            };
            reader.readAsDataURL(file);
            setImageFile(file);
        }
        event.target.value = null;
    };

    const validateForm = () => {
        // Βασικά πεδία (products table)
        if (!formData.title || !formData.price || !formData.stock_quantity || !formData.description_) {
            return false;
        }

        const type = formData.product_type || selectedType?.value;

        if (type === 'game') {
            if (!formData.platform || !formData.developer || !formData.genres || !formData.release_date) return false;
        } else if (type === 'collectible') {
            if (!formData.collectible_type || !formData.brand) return false;
        } else if (type === 'accessory') {
            if (!formData.accessory_type || !formData.brand) return false;
        }

        return true;
    };

    const handleSave = async () => {
        if (!validateForm()) return alert('Συμπλήρωσε όλα τα απαραίτητα πεδία για τον τύπο: ' + (selectedType?.value));
        if (!selectedProduct) return alert('Επέλεξε ένα προϊόν για επεξεργασία.');
        if (!token) return alert('Δεν είστε συνδεδεμένοι.');

        const form = new FormData();
        Object.keys(formData).forEach(key => {
            if (formData[key] !== null && formData[key] !== undefined) {
                form.append(key, formData[key]);
            }
        });
        if (imageFile) { form.append('coverImage', imageFile); }

        try {
            const response = await axios.put('http://localhost:4000/api/admin/products/' + selectedProduct.product_id, form, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            alert('Το προϊόν ενημερώθηκε επιτυχώς!');

            const updatedProduct = response.data.product;
            setProducts(prev => prev.map(p => p.product_id === selectedProduct.product_id ? updatedProduct : p));
            setSelectedProduct(updatedProduct);
            setFormData(updatedProduct);
        } catch (err) {
            console.error("Failed to update Product.", err);
            alert('Αποτυχία ενημέρωσης: ' + (err.response?.data?.message || err.message));
        }
    };

    const handleUpload = async () => {
        if (!formData.product_type && selectedType) {
            formData.product_type = selectedType.value;
        }

        if (!validateForm()) return alert('Συμπλήρωσε τα κενά');
        if (selectedProduct) return alert('Επέλεξε "Create New Product" για δημιουργία.');
        if (!imageFile) return alert('Παρακαλώ επιλέξτε μια φωτογραφία.');
        if (!token) return alert('Δεν είστε συνδεδεμένοι.');

        const form = new FormData();
        Object.keys(formData).forEach(key => {
            if (formData[key] !== null && formData[key] !== undefined) {
                form.append(key, formData[key]);
            }
        });
        form.append('coverImage', imageFile);

        try {
            const response = await axios.post('http://localhost:4000/api/admin/products/upload', form, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            alert('Το προϊόν ανέβηκε επιτυχώς!');
            setProducts(prev => [...prev, response.data.product]);

            setFormData({ product_type: selectedType.value });
            setImagePreviewUrl(null);
            setImageFile(null);
        } catch (err) {
            console.error("Failed to create product.", err);
            alert('Αποτυχία δημιουργίας: ' + err.message);
        }
    };

    if (loading) {
        return (
            <div className="AdminPanel-loading">
                <div className='Text'>Loading product list</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className='AdminPanel error'>
                <div className='Text error'>Κατι πηγε στραβα με την φορτωση προιοντων! Error:{error}</div>
            </div>
        );
    }

    const customStyles = {
        control: (base, state) => ({
            ...base,
            background: 'rgba(255, 255, 255, 0)',
            borderRadius: '16px',
            border: '1px solid rgba(255, 255, 255, 0.37)',
            boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
            backdropFilter: 'blur(5.8px)',
            WebkitBackdropFilter: 'blur(5.8px)',
            color: 'black',
            padding: '5px',
            // eslint-disable-next-line
            boxShadow: state.isFocused ? '0 0 0 1px rgba(255, 255, 255, 0.5)' : '0 4px 30px rgba(0, 0, 0, 0.1)',
            '&:hover': {
                border: '1px solid rgba(255, 255, 255, 0.8)',
            }
        }),
        menu: (base) => ({
            ...base,
            background: 'rgba(255, 255, 255, 0)',
            borderRadius: '10px',
            backdropFilter: 'blur(10px)',
            zIndex: 9999,

        }),
        menuPortal: (base) => ({
            ...base,
            zIndex: 9999
        }),
        singleValue: (base) => ({
            ...base,
            color: 'black',
            fontWeight: 'bold'
        }),
        input: (base) => ({
            ...base,
            color: 'black',
            background: 'rgba(255, 255, 255, 0)'
        }),
        placeholder: (base) => ({
            ...base,
            color: 'rgba(0, 0, 0, 0.6)'
        }),
        menuList: (base) => ({
            ...base,
            backgroundColor: 'transparent',
            '&::-webkit-scrollbar': {
                width: '0px',
                height: '0px',
                background: 'transparent',
            }
        }),
        option: (base, state) => ({
            ...base,
            color: 'black',
            borderRadius: '5px',
            margin: '2px 5px',
            width: 'auto',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            ...(state.isSelected && {
                backgroundColor: 'rgba(255, 255, 255, 0.5)',
                color: 'black',
            }),
            ...(state.isFocused && {
                backgroundColor: 'rgba(255, 255, 255, 0.5)',
                color: 'black',
            }),
            '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.7)',
                backdropFilter: 'blur(20px)', // παραπανω BLUR στο hover
                WebkitBackdropFilter: 'blur(20px)',
                color: 'black',
            },
        }),
    };

    const selectTypeOptions = [
        { value: 'none', label: '--- Select a Product Type ---' },
        { value: 'game', label: 'Game' },
        { value: 'collectible', label: 'Collectible' },
        { value: 'accessory', label: 'Accessory' }
    ];

    const currentType = formData.product_type || selectedType?.value;

    return (<>
        <div className="EditExistingProducts-panel">
            <div className='EditExistingProducts-title'>Products</div>
            <div className='EditExistingProducts-Selects'>
                <Select className="EditExistingProducts-productTypelist"
                    options={selectTypeOptions}
                    onChange={handleProductTypeSelect}
                    value={selectedType}
                    placeholder="Select Type first..."
                    styles={customStyles}
                    menuPortalTarget={document.body}
                />
                <Select className="EditExistingProducts-productlist"
                    isSearchable={true}
                    isDisabled={!selectedType || selectedType.value === 'none'}
                    isLoading={loading}
                    options={selectOptions}
                    onChange={handleProductSelect}
                    value={selectedValue}
                    placeholder={loading ? "Loading..." : "Select Product to Edit..."}
                    styles={customStyles}
                    menuPortalTarget={document.body}
                />
            </div>
        </div>
        <div className='NewProductForm-panel'>
            <div className='NewProductForm-title'>
                {selectedProduct ? `Edit: ${selectedProduct.title}` : `New ${selectedType?.label || 'Product'} Form`}
            </div>

            <div className='NewProductForm-info-grid'>
                {/* Image Upload Area */}
                <div className='ImageInsert-button-container'>
                    <input type="file" id="coverImageUpload" style={{ display: 'none' }} accept="image/*" onChange={handleImageChange} />
                    <label htmlFor="coverImageUpload" className='ImageInsert-button'>
                        {imagePreviewUrl ? (
                            <img className='img-info' src={imagePreviewUrl} alt="Preview" />
                        ) : formData.cover_image_url ? (
                            <img className='img-info'
                                src={`/product_images/${formData.cover_image_url}`}
                                onError={(e) => { e.target.src = './product_images/placeholder.jpg' }}
                                alt="Cover" />
                        ) : (
                            <RiImageAddLine className='image-icon' />
                        )}
                    </label>
                </div>

                {/* Common Fields */}
                <div className='info-panel'>
                    <div className='info-grid'>
                        <label className='info-text'>Title:</label>
                        <input className='info-input' id='title' maxLength={100} value={formData.title || ''} onChange={handleInputChange} />
                    </div>
                    <div className='info-grid'>
                        <label className='info-text'>Price:</label>
                        <input className='info-input' type='number' id='price' min='0' value={formData.price || ''} onChange={handleInputChange} />
                    </div>
                    <div className='info-grid'>
                        <label className='info-text'>Stock:</label>
                        <input className='info-input' type='number' id='stock_quantity' min='0' value={formData.stock_quantity || ''} onChange={handleInputChange} />
                    </div>
                </div>

                {/* Dynamic Fields based on Type */}
                <div className='info-panel'>
                    {/* GAMES */}
                    {currentType === 'game' && (
                        <>
                            <div className='info-grid'>
                                <label className='info-text'>Platform:</label>
                                <input className='info-input' id='platform' value={formData.platform || ''} onChange={handleInputChange} />
                            </div>
                            <div className='info-grid'>
                                <label className='info-text'>Developer:</label>
                                <input className='info-input' id='developer' value={formData.developer || ''} onChange={handleInputChange} />
                            </div>
                            <div className='info-grid'>
                                <label className='info-text'>Publisher:</label>
                                <input className='info-input' id='publisher' value={formData.publisher || ''} onChange={handleInputChange} />
                            </div>
                            <div className='info-grid'>
                                <label className='info-text'>Genre:</label>
                                <input className='info-input' id='genres' value={formData.genres || ''} onChange={handleInputChange} />
                            </div>
                            <div className='info-grid'>
                                <label className='info-text'>Release Date:</label>
                                <input className='info-input' type='date' id='release_date'
                                    value={formData.release_date ? new Date(formData.release_date).toISOString().split('T')[0] : ''}
                                    onChange={handleInputChange} />
                            </div>
                        </>
                    )}

                    {/* COLLECTIBLES */}
                    {currentType === 'collectible' && (
                        <>
                            <div className='info-grid'>
                                <label className='info-text'>Brand:</label>
                                <input className='info-input' id='brand' value={formData.brand || ''} onChange={handleInputChange} />
                            </div>
                            <div className='info-grid'>
                                <label className='info-text'>Type:</label>
                                <input className='info-input' id='collectible_type' value={formData.collectible_type || ''} onChange={handleInputChange} />
                            </div>
                        </>
                    )}

                    {/* ACCESSORIES - NEW BASED ON SQL */}
                    {currentType === 'accessory' && (
                        <>
                            <div className='info-grid'>
                                <label className='info-text'>Brand:</label>
                                <input className='info-input' id='brand' value={formData.brand || ''} onChange={handleInputChange} />
                            </div>
                            <div className='info-grid'>
                                <label className='info-text'>Type:</label>
                                <input className='info-input' id='accessory_type' value={formData.accessory_type || ''} onChange={handleInputChange} />
                            </div>
                        </>
                    )}

                    {!currentType && <div className='info-text' style={{ opacity: 0.5 }}>Select a Type to see specific fields</div>}
                </div>

                {/* Buttons */}
                <div className="Button-grid-info">
                    <button className="button-info" onClick={handleTrashClick} ><FaRegTrashCan className="buttonicon" color={'red'} /></button>
                    <button className="button-info" onClick={handleSave} disabled={!selectedProduct}><LuSave className="buttonicon" color={selectedProduct ? 'green' : 'grey'} /></button>
                    <button className="button-info" onClick={handleUpload} disabled={selectedProduct || !selectedType || selectedType.value === 'none'}><LuHardDriveUpload className="buttonicon" color={!selectedProduct ? 'blue' : 'grey'} /></button>
                </div>
            </div>

            <div className="NewProductInfo-description">
                <div className="NewProductInfo-descr-title">Description</div>
                <textarea className="NewProductInfo-descr-input" id='description_' rows="10" value={formData.description_ || ''} onChange={handleInputChange}></textarea>
            </div>
        </div>
    </>
    );
}