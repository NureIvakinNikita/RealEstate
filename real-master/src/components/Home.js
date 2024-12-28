import { ethers } from 'ethers';
import { useEffect, useState } from 'react';

import close from '../assets/close.svg';

const Home = ({ home, provider, account, escrow, togglePop }) => {
    const [hasBought, setHasBought] = useState(false);
    const [hasLended, setHasLended] = useState(false);
    const [hasInspected, setHasInspected] = useState(false);
    const [hasSold, setHasSold] = useState(false);

    const [buyer, setBuyer] = useState(null);
    const [lender, setLender] = useState(null);
    const [inspector, setInspector] = useState(null);
    const [seller, setSeller] = useState(null);

    const [owner, setOwner] = useState(null);
    const [userRole, setUserRole] = useState(null); // Для зберігання ролі користувача

    // Завантаження деталей і ролі користувача
    const fetchDetails = async () => {
        if (!account) {
            console.error("Account is not connected");
            return;
        }

        const latestBlock = await provider.getBlockNumber();
        console.log("Останній блок:", latestBlock);
    
        const blockTag = latestBlock;  // Використовуємо останній блок
        console.log(blockTag);

        console.log();
    
        try {
            const buyer = await escrow.buyer(home.id, { blockTag });
            setBuyer(buyer);
    
            const hasBought = await escrow.approval(home.id, buyer, { blockTag });
            setHasBought(hasBought);
    
            const seller = await escrow.seller();
            setSeller(seller);
    
            const hasSold = await escrow.approval(home.id, seller);
            setHasSold(hasSold);
    
            const lender = await escrow.lender();
            setLender(lender);
    
            const hasLended = await escrow.approval(home.id, lender);
            setHasLended(hasLended);
    
            const inspector = await escrow.inspector();
            setInspector(inspector);
    
            const hasInspected = await escrow.inspectionPassed(home.id);
            setHasInspected(hasInspected);
    
        } catch (error) {
            console.error("Error fetching details:", error);
        }
    };

    // Завантаження власника
    const fetchOwner = async () => {
        try {
            if (await escrow.isListed(home.id)) return;
            const owner = await escrow.buyer(home.id);
            setOwner(owner);
        } catch (error) {
            console.error("Error fetching owner:", error);
        }
    };

    // Функція покупки
    const buyHandler = async () => {
        if (!account) {
            alert("Please connect your MetaMask account.");
            return;
        }

        const escrowAmount = await escrow.escrowAmount(home.id);
        const signer = await provider.getSigner();
        try {
            let transaction = await escrow.connect(signer).depositEarnest(home.id, { value: escrowAmount });
            await transaction.wait();

            transaction = await escrow.connect(signer).approveSale(home.id);
            await transaction.wait();

            setHasBought(true);
        } catch (error) {
            console.error("Error buying:", error);
        }
    };

    // Функція інспекції
    const inspectHandler = async () => {
        if (!account) {
            alert("Please connect your MetaMask account.");
            return;
        }

        const signer = await provider.getSigner();
        try {
            const transaction = await escrow.connect(signer).updateInspectionStatus(home.id, true);
            await transaction.wait();
            setHasInspected(true);
        } catch (error) {
            console.error("Error inspecting:", error);
        }
    };

    // Функція позики
    const lendHandler = async () => {
        if (!account) {
            alert("Please connect your MetaMask account.");
            return;
        }

        const signer = await provider.getSigner();
        try {
            const transaction = await escrow.connect(signer).approveSale(home.id);
            await transaction.wait();

            const lendAmount = (await escrow.purchasePrice(home.id) - await escrow.escrowAmount(home.id));
            await signer.sendTransaction({ to: escrow.address, value: lendAmount.toString(), gasLimit: 60000 });

            setHasLended(true);
        } catch (error) {
            console.error("Error lending:", error);
        }
    };

    // Функція продажу
    const sellHandler = async () => {
        if (!account) {
            alert("Please connect your MetaMask account.");
            return;
        }

        const signer = await provider.getSigner();
        try {
            let transaction = await escrow.connect(signer).approveSale(home.id);
            await transaction.wait();

            transaction = await escrow.connect(signer).finalizeSale(home.id);
            await transaction.wait();

            setHasSold(true);
        } catch (error) {
            console.error("Error selling:", error);
        }
    };

    // Завантаження ролі користувача
    const fetchRole = async () => {
        if (!account) {
            console.error("Account is not connected");
            return;
        }
        
        try {
            const role = await escrow.getUserRole(account);
            console.log("Fetching role" + role);
            setUserRole(role);
        } catch (error) {
            console.error("Failed to fetch role:", error);
        }
    };

    useEffect(() => {
        fetchDetails();
        fetchOwner();
        fetchRole();
        console.log(userRole+"df")  // Завантажуємо роль користувача
    }, [hasSold, account]);

    return (
        <div className="home">
            <div className="home__details">
                <div className="home__image">
                    <img src={home.image} alt="Home" />
                </div>
                <div className="home__overview">
                    <h1>{home.name}</h1>
                    <p>
                        <strong>{home.attributes[2].value}</strong> bds |
                        <strong>{home.attributes[3].value}</strong> ba |
                        <strong>{home.attributes[4].value}</strong> sqft
                    </p>
                    <p>{home.address}</p>

                    <h2>{home.attributes[0].value} ETH</h2>

                    {owner ? (
                        <div className="home__owned">
                            Owned by {owner.slice(0, 6) + '...' + owner.slice(38, 42)}
                        </div>
                    ) : (
                        <div>
                            {((userRole === "Buyer" && account === buyer) || userRole === "Both") ? (
                                <button className="home__buy" onClick={buyHandler} >
                                    Buy
                                </button>
                            ) : ((userRole === "Seller" && account === seller) || userRole=="Both") ? (
                                <button className="home__buy" onClick={sellHandler} disabled={hasSold}>
                                    Approve & Sell
                                </button>
                            ) : (userRole === "Lender") ? (
                                <button className="home__buy" onClick={lendHandler} disabled={hasLended}>
                                    Approve & Lend
                                </button>
                            ) : (userRole === "Inspector") ? (
                                <button className="home__buy" onClick={inspectHandler} disabled={hasInspected}>
                                    Approve Inspection
                                </button>
                            ) : null}

                            {/* Кнопка "Contact Agent" лише для підключених акаунтів */}
                            {account ? (
                                <button className="home__contact">
                                    Contact agent
                                </button>
                            ) : (
                                <p>Please connect your MetaMask account to unlock actions.</p>
                            )}
                        </div>
                    )}

                    <hr />

                    <h2>Overview</h2>

                    <p>{home.description}</p>

                    <hr />

                    <h2>Facts and features</h2>

                    <ul>
                        {home.attributes.map((attribute, index) => (
                            <li key={index}><strong>{attribute.trait_type}</strong> : {attribute.value}</li>
                        ))}
                    </ul>
                </div>

                <button onClick={togglePop} className="home__close">
                    <img src={close} alt="Close" />
                </button>
            </div>
        </div>
    );
};

export default Home;
