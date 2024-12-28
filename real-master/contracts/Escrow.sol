// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

interface IERC721 {
    function transferFrom(
        address _from,
        address _to,
        uint256 _id
    ) external;
}

contract Escrow {
    address public nftAddress;
    address payable public seller;
    address public admin;

    mapping(address => uint8) public roles; // 0 = None, 1 = Buyer, 2 = Seller, 3 = Both
    mapping(address => bool) public isInspector;
    mapping(address => bool) public isLender;

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can call this method");
        _;
    }

    modifier onlyBuyer(uint256 _nftID) {
        require(msg.sender == buyer[_nftID], "Only buyer can call this method");
        _;
    }

    modifier onlySeller() {
        require(msg.sender == seller, "Only seller can call this method");
        _;
    }

    modifier onlyInspector() {
        require(isInspector[msg.sender], "Only inspector can call this method");
        _;
    }

    mapping(uint256 => bool) public isListed;
    mapping(uint256 => uint256) public purchasePrice;
    mapping(uint256 => uint256) public escrowAmount;
    mapping(uint256 => address) public buyer;
    mapping(uint256 => bool) public inspectionPassed;
    mapping(uint256 => mapping(address => bool)) public approval;

    constructor(address _nftAddress, address payable _seller) {
        nftAddress = _nftAddress;
        seller = _seller;
        admin = msg.sender;
    }

    // Новий метод для повернення адреси адміна
    function getAdmin() public view returns (address) {
        require(admin != address(0), "Admin not set");
        return admin;
    }

    function selectRole(address account, uint8 role) public {
        
        roles[account] = role;
    }

    function assignRole(address user, uint8 role) public onlyAdmin {
        roles[user] = role;
    }

    function assignSpecialRole(address user, string memory roleType) public onlyAdmin {
        if (keccak256(abi.encodePacked(roleType)) == keccak256(abi.encodePacked("Inspector"))) {
            isInspector[user] = true;
        } else if (keccak256(abi.encodePacked(roleType)) == keccak256(abi.encodePacked("Lender"))) {
            isLender[user] = true;
        } else {
            revert("Invalid role type");
        }
    }

    function getRole(address user) public view returns (uint8) {
        return roles[user];
    }

    function list(
        uint256 _nftID,
        address _buyer,
        uint256 _purchasePrice,
        uint256 _escrowAmount
    ) public onlySeller {
        IERC721(nftAddress).transferFrom(msg.sender, address(this), _nftID);

        isListed[_nftID] = true;
        purchasePrice[_nftID] = _purchasePrice;
        escrowAmount[_nftID] = _escrowAmount;
        buyer[_nftID] = _buyer;
    }

    function depositEarnest(uint256 _nftID) public payable onlyBuyer(_nftID) {
        require(msg.value >= escrowAmount[_nftID], "Insufficient escrow amount");
    }

    function updateInspectionStatus(uint256 _nftID, bool _passed) public onlyInspector {
        inspectionPassed[_nftID] = _passed;
    }

    function approveSale(uint256 _nftID) public {
        require(roles[msg.sender] > 0 || isLender[msg.sender], "Not authorized");
        approval[_nftID][msg.sender] = true;
    }

    function finalizeSale(uint256 _nftID) public {
        require(inspectionPassed[_nftID], "Inspection not passed");
        require(approval[_nftID][buyer[_nftID]], "Buyer approval missing");
        require(approval[_nftID][seller], "Seller approval missing");
        require(address(this).balance >= purchasePrice[_nftID], "Insufficient funds");

        isListed[_nftID] = false;

        (bool success, ) = seller.call{value: address(this).balance}("");
        require(success, "Transfer to seller failed");

        IERC721(nftAddress).transferFrom(address(this), buyer[_nftID], _nftID);
    }

    function cancelSale(uint256 _nftID) public {
        if (!inspectionPassed[_nftID]) {
            payable(buyer[_nftID]).transfer(address(this).balance);
        } else {
            seller.transfer(address(this).balance);
        }
    }

    function lender() public view returns (address) {
        return isLender[msg.sender] ? msg.sender : address(0); // повертає адресу лендора, якщо викликає ця адреса
    }

    // Функція для отримання адреси інспектора
    function inspector() public view returns (address) {
        return isInspector[msg.sender] ? msg.sender : address(0); // повертає адресу інспектора, якщо викликає ця адреса
    }

    function getUserRole(address user) public view returns (string memory) {
        if (roles[user] == 1) {
            return "Buyer";
        } else if (roles[user] == 2) {
            return "Seller";
        } else if (roles[user] == 3) {
            return "Both";
        } else if (roles[user] == 4) {
            return "Admin";
        } else if (isInspector[user]) {
            return "Inspector";
        } else if (isLender[user]) {
            return "Lender";
        }
        return "None";
    }

    receive() external payable {}
}
