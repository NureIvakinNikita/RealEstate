import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import App from './App';  // Головний компонент
import SellPage from './components/SellPage';  // Компонент SellPage

const Root = () => {
    const [account, setAccount] = useState(null);
    const [provider, setProvider] = useState(null);
    const [escrow, setEscrow] = useState(null);
    const [realEstate, setRealEstate] = useState(null);
    const [signer, setSigner] = useState(null);
    return (
        <Router>
            <Routes>
                <Route 
                    path="/" 
                    element={
                        <App 
                            account={account} 
                            setAccount={setAccount} 
                            provider={provider} 
                            setProvider={setProvider} 
                            escrow={escrow} 
                            setEscrow={setEscrow} 
                            realEstate={realEstate} 
                            setRealEstate={setRealEstate} 
                            signer={signer}
                            setSigner={setSigner}
                        />
                    } 
                />
                 <Route 
                    path="/sell" 
                    element={
                        <SellPage 
                            account={account} 
                            setAccount={setAccount} 
                            provider={provider} 
                            escrow={escrow} 
                            realEstate={realEstate}  // Передаємо realEstate в SellPage
                        />
                    } 
                />
            </Routes>
        </Router>
    );
};

export default Root;
