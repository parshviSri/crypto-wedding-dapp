// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Ring is ERC721("CryptoWedding", "RING"), Ownable {
    using Counters for Counters.Counter;

    Counters.Counter internal _tokenIds;

    string public baseURI;

    constructor() {}

    function _baseURI() internal view virtual override returns (string memory) {
        return baseURI;
    }

    function setBaseURI(string memory _baseURIParam) public onlyOwner {
        baseURI = _baseURIParam;
    }

    function mint(address to) public onlyOwner returns (uint256) {
        uint256 ringId = _tokenIds.current();
        _safeMint(to, ringId);

        _tokenIds.increment();

        return ringId;
    }
}
