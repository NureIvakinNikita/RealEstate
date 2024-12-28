import React, { useState } from 'react';
import { uploadFile, uploadJSON, listSpaces } from '../ipfs-conn';
import { ethers } from "ethers";
const ListProperty = ({ account, provider, escrow, realEstate }) => {
  const [image, setImage] = useState(null);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [area, setArea] = useState('');
  const [rooms, setRooms] = useState('');
  const [yearBuilt, setYearBuilt] = useState('');
  const [residenceType, setResidenceType] = useState('');
  const [bathrooms, setBathrooms] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  console.log(realEstate+"realEstate");
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
        console.log("Submit");

        console.log(provider);
        if (!provider) {
            setMessage("Provider is not initialized. Please ensure MetaMask is connected.");
            setLoading(false);
            return;
        }

        if (!image) {
            setMessage("Please upload an image.");
            setLoading(false);
            return;
        }

        // Завантажуємо зображення на IPFS
        const imageCID = await uploadFile(image);
        const imageURL = `https://w3s.link/ipfs/${imageCID}`;
        
        // Створюємо метадані
        const metadata = {
            name,
            address,
            description,
            image: imageURL,
            attributes: [
                { trait_type: "Purchase Price", value: price },
                { trait_type: "Type of Residence", value: residenceType },
                { trait_type: "Bed Rooms", value: rooms },
                { trait_type: "Bathrooms", value: bathrooms },
                { trait_type: "Square Feet", value: area },
                { trait_type: "Year Built", value: yearBuilt },
            ],
        };

        // Завантажуємо метадані на IPFS
        const metadataCID = await uploadJSON(metadata);
        const metadataURL = `https://w3s.link/ipfs/${metadataCID}`;

        // Підключаємося до смарт-контрактів
        const signer = provider.getSigner();
        const realEstateWithSigner = realEstate.connect(signer);  // Використовуємо realEstate контракт

        console.log("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA");

        // Створюємо NFT
        const tx = await realEstateWithSigner.mint(metadataURL);
        const receipt = await tx.wait();
        const tokenId = receipt.events[0].args.tokenId.toNumber();

        console.log("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA");

        // Додаємо нерухомість до списку на продаж
        const escrowWithSigner = escrow.connect(signer);
        const priceInWei = ethers.utils.parseEther(price);
        const escrowAmount = ethers.utils.parseEther(price); // Сума для ескроу

        console.log("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA");
        // Передаємо правильну кількість аргументів, включаючи адресу покупця
        await escrowWithSigner.list(tokenId, ethers.constants.AddressZero, priceInWei, escrowAmount, { value: escrowAmount });
        console.log("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA");
        setMessage(`Property listed successfully! Token ID: ${tokenId}`);
        console.log("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA");  
      } catch (error) {
            console.error('Error processing property listing:', error);
            setMessage('Error listing property. Please try again.');
        } finally {
            setLoading(false);
        }
    };

  

    return (
        <div className="list-property">
            <h2>List Your Property</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Property Image:</label>
                    <input
                        type="file"
                        onChange={(e) => setImage(e.target.files[0])}
                        required
                    />
                </div>
                <div>
                    <label>Property Name:</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Address:</label>
                    <input
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Description:</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Price (ETH):</label>
                    <input
                        type="number"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Area (sqft):</label>
                    <input
                        type="number"
                        value={area}
                        onChange={(e) => setArea(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Rooms:</label>
                    <input
                        type="number"
                        value={rooms}
                        onChange={(e) => setRooms(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Year Built:</label>
                    <input
                        type="number"
                        value={yearBuilt}
                        onChange={(e) => setYearBuilt(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Type of Residence:</label>
                    <input
                        type="text"
                        value={residenceType}
                        onChange={(e) => setResidenceType(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Bathrooms:</label>
                    <input
                        type="number"
                        value={bathrooms}
                        onChange={(e) => setBathrooms(e.target.value)}
                        required
                    />
                </div>
                <button type="submit" disabled={loading}>
                    {loading ? 'Listing Property...' : 'List Property'}
                </button>
            </form>
            {message && <p>{message}</p>}
        </div>
    );
};

export default ListProperty;
