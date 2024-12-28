import { useEffect, useState } from "react";
import { ethers } from "ethers";

// Components
import Navigation from "./components/Navigation";
import Search from "./components/Search";
import Home from "./components/Home";
import ListProperty from "./components/ListProperty";

// ABIs
import RealEstate from "./abis/RealEstate.json";
import Escrow from "./abis/Escrow.json";

// Config
import config from "./config.json";
import learn from "./learn.js";
function App({ account, setAccount, provider, setProvider, escrow, setEscrow, realEstate, setRealEstate, signer, setSigner }) {
  const [homes, setHomes] = useState([]);
  const [filteredHomes, setFilteredHomes] = useState([]);
  const [home, setHome] = useState({});
  const [toggle, setToggle] = useState(false);

  // Load Blockchain Data
  const loadBlockchainData = async () => {
    try {
      const providerInstance = new ethers.providers.Web3Provider(window.ethereum);
      setProvider(providerInstance);
      const network = await providerInstance.getNetwork();
      //?
      const signerFromProv = providerInstance.getSigner();
      setSigner(signerFromProv);
      //console.log("Signer:", await signer.getAddress());

      // Connect to RealEstate contract
      const realEstateInstance = new ethers.Contract(
        config[network.chainId].realEstate.address,
        RealEstate,
        providerInstance
      );
      setRealEstate(realEstateInstance);
      console.log("RealEstate Contract Address:", realEstateInstance.address);
      const totalSupply = await realEstateInstance.totalSupply();
      const homesList = [];

      // Fetch each token's metadata
      for (let i = 1; i <= totalSupply; i++) {
        try {
          const uri = await realEstateInstance.tokenURI(i);
          const response = await fetch(uri);
          const metadata = await response.json();
          homesList.push(metadata);
        } catch (error) {
          console.error(`Error fetching metadata for token ${i}:`, error);
        }
      }

      setHomes(homesList);
      setFilteredHomes(homesList);

      // Connect to Escrow contract
      const escrowInstance = new ethers.Contract(
        config[network.chainId].escrow.address,
        Escrow,
        providerInstance
      );
      setEscrow(escrowInstance);
      console.log("Escrow Contract Address:", escrowInstance.address);
      // Log Admin Address (if needed)
      const adminAddress = await escrowInstance.getAdmin();
      console.log("Admin Address:", adminAddress);
    } catch (error) {
      console.error("Error loading blockchain data:", error);
    }

    window.ethereum.on("accountsChanged", async () => {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      const accountAddress = ethers.utils.getAddress(accounts[0]);
      setAccount(accountAddress);
      localStorage.setItem("account", accountAddress);
      console.log("Stored by app.js", accountAddress);
    });
  };

  const filterOddHomes = () => {
  
    const oddHomes = homes.filter((_, index) => index % 2 === 0);
    setFilteredHomes(oddHomes);
    try {
      learn.filter(homes);
    } catch (error) {
    };
  };

  const cancel = () => {
    
    setFilteredHomes(homes);
  };

  useEffect(() => {
    loadBlockchainData();
  }, []);

  const togglePop = (home) => {
    setHome(home);
    setToggle(!toggle);
  };

  return (
    <div>
      <Navigation account={account} provider={provider} setAccount={setAccount} escrowContract={escrow} signer={signer} />
      <Search homes={homes} setFilteredHomes={setFilteredHomes} />

      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        <button onClick={filterOddHomes} className="nav__connect" style={{ margin: "5px 5px", padding: "5px 5px", fontSize: "15px" }}>
          Show Recomended Homes
        </button>
        <button onClick={cancel} className="nav__connect" style={{ margin: "5px 5px", padding: "5px 5px", fontSize: "15px" }}>
          Cancel Recomended Homes
        </button>
      </div>

      

      <div className="cards__section">
        <h3>Homes For You</h3>
        <hr />
        <div className="cards">
          {filteredHomes.length > 0 ? (
            filteredHomes.map((home, index) => (
              <div className="card" key={index} onClick={() => togglePop(home)}>
                <div className="card__image">
                  <img src={home.image} alt="Home" />
                </div>
                <div className="card__info">
                  <h4>{home.attributes[0].value} ETH</h4>
                  <p>
                    <strong>{home.attributes[2].value}</strong> bds |
                    <strong>{home.attributes[3].value}</strong> ba |
                    <strong>{home.attributes[4].value}</strong> sqft
                  </p>
                  <p>{home.address}</p>
                </div>
              </div>
            ))
          ) : (
            <p>No homes available at the moment.</p>
          )}
        </div>
      </div>

      {toggle && (
        <Home home={home} provider={provider} account={account} escrow={escrow} togglePop={togglePop} />
      )}
    </div>
  );
}

export default App;