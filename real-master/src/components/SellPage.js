import React from 'react';
import ListProperty from './ListProperty';  // Your component for listing property
import Navigation from "./Navigation";

const SellPage = ({ account, provider, escrow, setAccount, realEstate }) => {
    console.log(escrow+"escrow");
    console.log(realEstate+"realEstate");
    return (
        <div>
            <Navigation account={account} provider={provider} setAccount={setAccount} escrowContract={escrow} />
            <div className="cards__section">
                <ListProperty 
                    account={account} 
                    provider={provider} 
                    escrow={escrow} 
                    realEstate={realEstate}  // Передаємо контракт RealEstate
                />
            </div>
        </div>
    );
};
export default SellPage;
