// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./Ring.sol";

contract WeddingManager is Ownable {

    struct Partner {
        address wallet;
        string name;
        uint256 ringId;
        bool sentRing;
    }

    struct Wedding {
        Partner partner1;
        Partner partner2;
        address thirdParty;
        uint256 balance;
    }

    uint256 private counter;
    Ring private ringContract;
    mapping(uint256 => Wedding) public startedWeddings;
    mapping(uint256 => Wedding) public completedWeddings;
    mapping(address => uint256) public partnerToWedding;

    event WeddingCreated(uint256 tokenId);
    event RingCreated(uint256 ringId);

    constructor() {
        // create and deploy ring contract here ??
    }

    modifier isPartner(uint256 weddingId, address wallet) {
        require(
            startedWeddings[weddingId].partner1.wallet == wallet ||
            startedWeddings[weddingId].partner2.wallet == wallet,
            "Address is not Partner"
        );
        _;
    }

    modifier isPartnerOrThirdParty(uint256 weddingId, address wallet) {
        require(
            startedWeddings[weddingId].partner1.wallet == wallet ||
                startedWeddings[weddingId].partner2.wallet == wallet ||
                startedWeddings[weddingId].thirdParty == wallet,
            "Address is not Partner or Third Party"
        );
        _;
    }

    function setRingContractAddress(address _address) external onlyOwner {
        ringContract = Ring(_address);
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
        Partner memory partner1 = Partner(_partner1Wallet, _partner1Name, 0, false);
        Partner memory partner2 = Partner(_partner2Wallet, _partner2Name, 0, false);
        startedWeddings[counter] = Wedding(partner1, partner2, thirdParty, 0);
        emit WeddingCreated(counter);

        partnerToWedding[_partner1Wallet] = counter;
        partnerToWedding[_partner2Wallet] = counter;

        counter++;
    }

    function getPartnerFromAddress(address partner) internal returns (address, string) {
        require(partnerToWedding[partner] != 0, "Wedding doesn't exist");
        uint weddingId = partnerToWedding[partner];
        if (startedWeddings[weddingId].partner1.wallet == partner) {
            return (startedWeddings[weddingId].partner1.wallet, startedWeddings[weddingId].partner2.name);
        } else {
            return (startedWeddings[weddingId].partner1.wallet, startedWeddings[weddingId].partner1.name);
        }

    }
    function getOtherWeddingPartnerAddress(address partner) internal returns (address, string) {
        require(partnerToWedding[partner] != 0, "Wedding doesn't exist");
        uint weddingId = partnerToWedding[partner];
        if (startedWeddings[weddingId].partner1.wallet == partner) {
            return (startedWeddings[weddingId].partner2.wallet, startedWeddings[weddingId].partner2.name);
        } else {
            return (startedWeddings[weddingId].partner1.wallet, startedWeddings[weddingId].partner1.name);
        }
    }

    function createRing() public {
        require(
            partnerToWedding[msg.sender] != 0,
            "Wedding hasn't been created yet"
        );
        uint weddingId = partnerToWedding[msg.sender];
        uint ringId = ringContract.mint(msg.sender);

        if (startedWeddings[weddingId].partner1.wallet == msg.sender) {
            startedWeddings[weddingId].partner1.ringId = ringId;
        } 
        if (startedWeddings[weddingId].partner2.wallet == msg.sender) {
            startedWeddings[weddingId].partner2.ringId = ringId;
        } 

        // does this get called after minting happens?
        emit RingCreated(ringId);
    }

    function sendRing(uint ringId) public {
        require(partnerToWedding[msg.sender], 'Ring not created');
)
        uint weddingId = partnerToWedding[msg.sender];

        // ringContract.safeTransferFrom(p, getOtherWeddingPartnerAddress(p), p.ringId);
    }

    //exchange the two NFT rings
    // does it need to be 2 different functions? (or one used twice) so that each partner does the transfer?
    // we need to make sure both the wallets contain the ring NFTs

    function sendEther(uint256 _weddingId) external payable {
        require(
            startedWeddings[_weddingId].partner1.wallet != msg.sender &&
                startedWeddings[_weddingId].partner2.wallet != msg.sender,
            "Address is Partner"
        );
        startedWeddings[_weddingId].balance += msg.value;
    }

    function withdrawEther(uint256 _weddingId, uint256 _amount)
        external
        isPartner(_weddingId, msg.sender)
    {
        require(
            startedWeddings[_weddingId].balance >= _amount,
            "Not enough ether in balance"
        );

        uint256 result = _amount / 2;
        (bool successPartner1, ) = startedWeddings[_weddingId].partner1.wallet.call{
            value: result
        }("");
        (bool successPartner2, ) = startedWeddings[_weddingId].partner2.wallet.call{
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
        return startedWeddings[_weddingId];
    }
}
