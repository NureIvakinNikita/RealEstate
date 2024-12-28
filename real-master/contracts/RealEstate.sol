//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract RealEstate is ERC721URIStorage {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    // Мапа для зберігання всіх ID токенів
    uint256[] private tokenIds;

    constructor() ERC721("Real Estate", "REAL") {}

    function mint(string memory tokenURI) public returns (uint256) {
        _tokenIds.increment();

        uint256 newItemId = _tokenIds.current();
        _mint(msg.sender, newItemId);
        _setTokenURI(newItemId, tokenURI);

        // Додаємо ID нового токена до масиву
        tokenIds.push(newItemId);

        return newItemId;
    }

    function totalSupply() public view returns (uint256) {
        return _tokenIds.current();
    }

    // Метод для отримання списку всіх ID токенів
    function getProperties() public view returns (uint256[] memory) {
        return tokenIds;
    }
}
