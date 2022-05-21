// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./WeddingRing.sol";

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
    WeddingRing private ringContract;
    mapping(uint256 => Wedding) public startedWeddings;
    mapping(uint256 => Wedding) public completedWeddings;
    mapping(address => uint256) public partnersGettingMarried;

    event WeddingCreated(uint256 tokenId);
    event RingCreated(address createdFor, uint256 ringId, string uri);
    event RingSent(address sentBy, address sentTo, uint256 ringId);
    event WeddingComplete(uint256 weddingId);

    constructor() {
        // option 1: create and deploy WeddingRing contract manually and set the address here
        // ringContact = address(0xd9145CCE52D386f254917e481eB44e9943F39138);
        // option 2: create and deploy WeddingRing contract here
    }

    modifier isPartner(uint256 weddingId, address wallet) {
        require(
            startedWeddings[weddingId].partner1.wallet == wallet ||
                startedWeddings[weddingId].partner2.wallet == wallet,
            "Address is not Partner"
        );
        _;
    }

    modifier isWeddingCreated() {
        require(partnersGettingMarried[msg.sender] != 0, "Wedding not created");
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
        ringContract = WeddingRing(_address);
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
        Partner memory partner1 = Partner(
            _partner1Wallet,
            _partner1Name,
            0,
            false
        );
        Partner memory partner2 = Partner(
            _partner2Wallet,
            _partner2Name,
            0,
            false
        );
        startedWeddings[counter] = Wedding(partner1, partner2, thirdParty, 0);
        emit WeddingCreated(counter);

        partnersGettingMarried[_partner1Wallet] = counter;
        partnersGettingMarried[_partner2Wallet] = counter;

        counter++;
    }

    function getOtherWeddingPartnerAddress(address partner)
        internal
        view
        returns (address)
    {
        require(partnersGettingMarried[partner] != 0, "Wedding doesn't exist");
        uint256 weddingId = partnersGettingMarried[partner];
        if (startedWeddings[weddingId].partner1.wallet == partner) {
            return (startedWeddings[weddingId].partner2.wallet);
        } else {
            return (startedWeddings[weddingId].partner1.wallet);
        }
    }

    function createRing(string memory _uri) public isWeddingCreated {
        uint256 weddingId = partnersGettingMarried[msg.sender];

        // mint nft
        uint256 ringId = ringContract.safeMint(msg.sender, _uri);

        // store nft token id in wedding
        if (startedWeddings[weddingId].partner1.wallet == msg.sender) {
            startedWeddings[weddingId].partner1.ringId = ringId;
        }
        if (startedWeddings[weddingId].partner2.wallet == msg.sender) {
            startedWeddings[weddingId].partner2.ringId = ringId;
        }

        // does this get called after minting happens?
        emit RingCreated(msg.sender, ringId, _uri);
    }

    function sendRing() public isWeddingCreated {
        uint256 weddingId = partnersGettingMarried[msg.sender];
        Partner storage fromPartner = startedWeddings[weddingId]
            .partner1
            .wallet == msg.sender
            ? startedWeddings[weddingId].partner1
            : startedWeddings[weddingId].partner2;

        //check if a ring has been created
        require(fromPartner.ringId != 0, "Ring not created");
        address toAddress = getOtherWeddingPartnerAddress(fromPartner.wallet);

        // transfer ring
        ringContract.safeTransferFrom(
            fromPartner.wallet,
            toAddress,
            fromPartner.ringId
        );

        emit RingSent(fromPartner.wallet, toAddress, fromPartner.ringId);

        fromPartner.sentRing = true;
    }

    // called after exchange is complete
    function finishWedding() public isWeddingCreated {
        uint256 weddingId = partnersGettingMarried[msg.sender];
        Wedding memory w = startedWeddings[weddingId];
        // check if the rings have been exchanged
        require(
            (w.partner1.sentRing && w.partner1.ringId != 0) &&
                (w.partner2.sentRing && w.partner2.ringId != 0),
            "Rings haven't been exchanged yet"
        );

        // add new entry to completed wedding mapping
        completedWeddings[weddingId] = Wedding(
            w.partner1,
            w.partner2,
            w.thirdParty,
            0
        );

        // clear entry in startedWeddings mapping
        delete startedWeddings[weddingId];

        emit WeddingComplete(weddingId);
    }

    function sendEther(uint256 _weddingId) external payable {
        require(
            startedWeddings[_weddingId].partner1.wallet != msg.sender &&
                startedWeddings[_weddingId].partner2.wallet != msg.sender,
            "Address is Partner"
        );
        completedWeddings[_weddingId].balance += msg.value;
    }

    function withdrawEther(uint256 _weddingId, uint256 _amount)
        external
        isPartner(_weddingId, msg.sender)
    {
        require(
            completedWeddings[_weddingId].balance >= _amount,
            "Not enough ether in balance"
        );

        uint256 result = _amount / 2;
        (bool successPartner1, ) = completedWeddings[_weddingId]
            .partner1
            .wallet
            .call{value: result}("");
        (bool successPartner2, ) = completedWeddings[_weddingId]
            .partner2
            .wallet
            .call{value: result}("");

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
        return completedWeddings[_weddingId];
    }
}
