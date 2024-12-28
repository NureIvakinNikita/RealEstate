import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.svg";

const Navigation = ({ account, setAccount, provider, escrowContract, signer }) => {
  const navigate = useNavigate();
  const [role, setRole] = useState("");
  const [roleModalVisible, setRoleModalVisible] = useState(false);
  const [specialRoleAddress, setSpecialRoleAddress] = useState("");
  const [specialRoleType, setSpecialRoleType] = useState("");

  // Підключення до MetaMask
  const connectHandler = async () => {
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    const account = ethers.utils.getAddress(accounts[0]);
    setAccount(account);

    // Зберегти акаунт у localStorage
    localStorage.setItem("account", account);

    // Отримати роль користувача
    if (escrowContract) {
      try {
        const userRole = await escrowContract.getUserRole(account);
        setRole(userRole.toLowerCase());
      } catch (error) {
        console.error("Error fetching role:", error);
      }
    }
  };

  const getSigner = async (account) => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const address = await signer.getAddress();
  
      if (account === address) {
        return signer;
      }
  
      return null; // Якщо акаунт не співпав
    } catch (error) {
      console.error("Error in getSigner:", error);
      return null;
    }
  };

  // Вибір ролі
  const selectRoleHandler = async (selectedRole) => {
    if (!account) {
      alert("Please connect MetaMask first.");
      return;
    }
  
    let roleEnum;
    if (selectedRole === "buyer") roleEnum = 1;
    else if (selectedRole === "seller") roleEnum = 2;
    else if (selectedRole === "both") roleEnum = 3;
    else roleEnum = 4; // Admin
  
    try {
      const currentRole = await escrowContract.getRole(account);
      if (currentRole === roleEnum) {
        alert(`You already have the ${selectedRole} role.`);
        return;
      }
      
      
      const signer1 = provider.getSigner();//= await getSigner(account);
      console.log("Signer:", await signer1.getAddress());
      console.log("Account:", account);
      const tx = await escrowContract.connect(signer1).selectRole(account, roleEnum);
      await tx.wait();
      alert(`Role ${selectedRole} assigned successfully!`);
      setRole(selectedRole);  // Оновлюємо роль у стані
  
    } catch (error) {
      console.error("Error assigning role:", error);
      alert("Error assigning role.");
    }
  };

  // Призначення спеціальної ролі
  const assignSpecialRoleHandler = async () => {
    if (!account) {
      alert("Please connect MetaMask first.");
      return;
    }

    try {
      const tx = await escrowContract.assignSpecialRole(
        specialRoleAddress,
        specialRoleType
      );
      await tx.wait();
      alert(`Assigned ${specialRoleType} to ${specialRoleAddress}`);
      setRoleModalVisible(false);
    } catch (error) {
      console.error(error);
      alert("Error assigning special role.");
    }
  };

  // Завантаження акаунта з localStorage
  /*useEffect(() => {
    const storedAccount = localStorage.getItem("account");
    console.log("storedAccount: " + storedAccount);
    if (storedAccount) {
      setAccount(storedAccount);
    }
  }, [setAccount]);*/

  // Оновлення акаунта при зміні в MetaMask
  useEffect(() => {
    const handleAccountsChanged = async (accounts) => {
      const accountAddress = ethers.utils.getAddress(accounts[0]);
      setAccount(accountAddress);
      localStorage.setItem("account", accountAddress);

      if (accountAddress !== null) {
        // Оновлення ролі
        const userRole = await escrowContract.getUserRole(accountAddress);
        setRole(userRole.toLowerCase());
      } else {
        setRole("None");
      }
    };

    window.ethereum.on("accountsChanged", handleAccountsChanged);
    
    // Очищення слухача при розмонтуванні компонента
    return () => {
      window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
    };
  }, [setAccount, escrowContract]);

  // Викликати при першому завантаженні сторінки, щоб отримати роль
  /*useEffect(() => {
    const getRoleFromContract = async () => {
      if (escrowContract && account) {
        try {
          const userRole = await escrowContract.getUserRole(account);
          setRole(userRole.toLowerCase());
        } catch (error) {
          console.error("Error fetching role:", error);
        }
      }
    };

    getRoleFromContract();
  }, [escrowContract, account]);*/

  return (
    <nav>
      <ul className="nav__links">
        {role === "buyer" && <li><a href="/">Buy</a></li>}
        {role === "seller" && <li><a href="#" onClick={() => navigate('/sell')}>Sell</a></li>}
        {role === "both" && (
          <>
            <li><a href="/">Buy</a></li>
            <li><a href="#" onClick={() => navigate('/sell')}>Sell</a></li>
          </>
        )}
      </ul>
  
      <div className="nav__brand">
        <img src={logo} alt="Logo" />
        <h1>Millow</h1>
      </div>
      <div className="nav__button-container">
        {account ? (
          <>
            <button type="button" className="nav__connect">
              {account.slice(0, 6) + "..." + account.slice(38, 42)}
            </button>
            {role && (
              <button type="button" className="nav__select-role">
                Role: {role.charAt(0).toUpperCase() + role.slice(1)}
              </button>
            )}
            {role === "admin" ? (
              <button
                onClick={() => setRoleModalVisible(true)}
                className="nav__assign-worker"
              >
                Assign Worker
              </button>
            ) : role !== "both" ? (
              <button
                onClick={() => setRoleModalVisible(true)}
                className="nav__select-role"
              >
                Select Role
              </button>
            ) : null}
          </>
        ) : (
          <button
            type="button"
            className="nav__connect"
            onClick={connectHandler}
          >
            Connect
          </button>
        )}
      </div>
  
      {roleModalVisible && (
        <div className="role-modal">
          <h2>{role === "admin" ? "Assign Special Role" : "Select Role"}</h2>
          {role === "admin" ? (
            <>
              <input
                type="text"
                placeholder="Enter address"
                value={specialRoleAddress}
                onChange={(e) => setSpecialRoleAddress(e.target.value)}
              />
              <select
                onChange={(e) => setSpecialRoleType(e.target.value)}
                value={specialRoleType}
              >
                <option value="Inspector">Inspector</option>
                <option value="Lender">Lender</option>
                <option value="Admin">Admin</option>
              </select>
              <button
                onClick={assignSpecialRoleHandler}
                className="assign-role-button"
              >
                Assign Role
              </button>
            </>
          ) : (
            <>
              {role !== "buyer" && (
                <button onClick={() => selectRoleHandler("buyer")}>Buyer</button>
              )}
              {role !== "seller" && (
                <button onClick={() => selectRoleHandler("seller")}>Seller</button>
              )}
              {role !== "both" && (
                <button onClick={() => selectRoleHandler("both")}>Both</button>
              )}
            </>
          )}
          <button onClick={() => setRoleModalVisible(false)}>Close</button>
        </div>
      )}
    </nav>
  );
};

export default Navigation;
