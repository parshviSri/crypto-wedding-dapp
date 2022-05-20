// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.4;

contract WeddingManager {
    struct Partner {
        address wallet;
        string name;
        uint256 ringId;
    }

    struct Wedding {
        Partner partner1;
        Partner partner2;
        address thirdParty;
        uint256 balance;
    }

    uint256 private counter;
    mapping(uint256 => Wedding) public weddings;

    modifier isPartner(uint256 weddingId, address wallet) {
        require(
            weddings[weddingId].partner1.wallet == wallet ||
                weddings[weddingId].partner2.wallet == wallet,
            "Address is not Partner"
        );
        _;
    }

    modifier isPartnerOrThirdParty(uint256 weddingId, address wallet) {
        require(
            weddings[weddingId].partner1.wallet == wallet ||
                weddings[weddingId].partner2.wallet == wallet ||
                weddings[weddingId].thirdParty == wallet,
            "Address is not Partner or Third Party"
        );
        _;
    }

    function createWedding(
        address _partner1Wallet,
        address _partner2Wallet,
        string memory _partner1Name,
        string memory _partner2Name
    ) external {
        address thirdParty;
        if (msg.sender == _partner1Wallet || msg.sender == _partner2Wallet) {
            thirdParty = address(0);
        } else {
            thirdParty = msg.sender;
        }
        Partner memory partner1 = Partner(_partner1Wallet, _partner1Name, 0);
        Partner memory partner2 = Partner(_partner2Wallet, _partner2Name, 0);
        weddings[counter] = Wedding(partner1, partner2, thirdParty, 0);
        counter++;
    }

    function createRings(uint256 _weddingId)
        external
        isPartnerOrThirdParty(_weddingId, msg.sender)
    {}

    //exchange the two NFT rings
    // does it need to be 2 different functions? (or one used twice) so that each partner does the transfer?
    // we need to make sure both the wallets contain the ring NFTs

    function sendEther(uint256 _weddingId) external payable {
        require(
            weddings[_weddingId].partner1.wallet != msg.sender &&
                weddings[_weddingId].partner2.wallet != msg.sender,
            "Address is Partner"
        );
        weddings[_weddingId].balance += msg.value;
    }

    function withdrawEther(uint256 _weddingId, uint256 _amount)
        external
        isPartner(_weddingId, msg.sender)
    {
        require(
            weddings[_weddingId].balance >= _amount,
            "Not enough ether in balance"
        );

        uint256 result = _amount / 2;
        (bool successPartner1, ) = weddings[_weddingId].partner1.wallet.call{
            value: result
        }("");
        (bool successPartner2, ) = weddings[_weddingId].partner2.wallet.call{
            value: result
        }("");

        // what if one is successfull and the other one isn't? does it go thorugh?
        require(
            successPartner1 && successPartner2,
            "There was an error! Ether was not sent."
        );
    }

    function getWeddingById(uint256 _weddingId)
        public
        view
        returns (Wedding memory)
    {
        return weddings[_weddingId];
    }
}
