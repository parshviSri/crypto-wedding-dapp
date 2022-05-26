// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./WeddingRing.sol";

contract WeddingManager is Ownable {
    struct Partner {
        address wallet;
        string name;
        uint256 ringId;
        string tokeUri;
        bool sentRing;
    }

    // status : 1 = created; 2 = rings created; 3 = rings exchanged
    // TODO: use this enum
    enum WeddingStatus {
        None,
        Created,
        Ready,
        Completed
    }

    struct Wedding {
        Partner partner1;
        Partner partner2;
        address thirdParty;
        uint256 balance;
        uint256 status;
    }

    uint256 private counter;
    WeddingRing private ringContract;
    mapping(uint256 => Wedding) public weddings;
    mapping(address => uint256) public addressToWedding;

    event WeddingCreated(uint256 tokenId);
    event RingCreated(address createdFor, uint256 ringId, string uri);
    event RingSent(address sentBy, address sentTo, uint256 ringId);
    event WeddingComplete(uint256 weddingId);

    constructor(address _weddingRingContract) {
        // option 1: create and deploy WeddingRing contract manually and set the address here
        ringContract = WeddingRing(_weddingRingContract);
        // option 2: create and deploy WeddingRing contract here
    }

    modifier isPartner(uint256 _weddingId, address _wallet) {
        require(
            weddings[_weddingId].partner1.wallet == _wallet ||
                weddings[_weddingId].partner2.wallet == _wallet,
            "Address is not Partner"
        );
        _;
    }

    modifier isWeddingCreated(address _address) {
        require(addressToWedding[_address] != 0, "Wedding not created");
        _;
    }

    modifier weddingIdExists(uint256 _weddingId) {
        require(
            weddings[_weddingId].status != 0,
            "Wedding ID is not associated with a Wedding."
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
        require(
            weddings[addressToWedding[_partner1Wallet]].status == 0 &&
                weddings[addressToWedding[_partner2Wallet]].status == 0,
            "At least one of the partners is already married."
        );

        address thirdParty;
        if (msg.sender != _partner1Wallet && msg.sender != _partner2Wallet) {
            thirdParty = msg.sender;
        }
        Partner memory partner1 = Partner(
            _partner1Wallet,
            _partner1Name,
            0,
            "",
            false
        );
        Partner memory partner2 = Partner(
            _partner2Wallet,
            _partner2Name,
            0,
            "",
            false
        );

        weddings[++counter] = Wedding(partner1, partner2, thirdParty, 0, 1);
        addressToWedding[_partner1Wallet] = counter;
        addressToWedding[_partner2Wallet] = counter;
        emit WeddingCreated(counter);
    }

    // should we update the addresses ??
    function updateWedding(
        uint256 _weddingId,
        string calldata _partner1Name,
        string calldata _partner2Name
    ) external isWeddingCreated(msg.sender) {
        require(
            weddings[_weddingId].status == 1,
            "Wedding has changed status, cannot be updated."
        );
        weddings[_weddingId].partner1.name = _partner1Name;
        weddings[_weddingId].partner2.name = _partner2Name;
    }

    function createRing(string memory _uri)
        public
        isWeddingCreated(msg.sender)
    {
        uint256 weddingId = addressToWedding[msg.sender];
        require(
            weddings[weddingId].status == 1,
            "Rings have already been created for this wedding."
        );

        // mint nft
        uint256 ringId = ringContract.mint(address(this), _uri);

        // store nft token id in wedding
        if (weddings[weddingId].partner1.wallet == msg.sender) {
            weddings[weddingId].partner1.ringId = ringId;
            weddings[weddingId].partner1.tokeUri = _uri;
        } else {
            // gas optimization
            if (weddings[weddingId].partner2.wallet == msg.sender) {
                weddings[weddingId].partner2.ringId = ringId;
                weddings[weddingId].partner2.tokeUri = _uri;
            }
        }

        emit RingCreated(msg.sender, ringId, _uri);
        if (
            weddings[weddingId].partner1.ringId != 0 &&
            weddings[weddingId].partner2.ringId != 0
        ) {
            weddings[weddingId].status = 2;
        }
    }

    function sendRing(uint256 _weddingId)
        public
        isPartner(_weddingId, msg.sender)
    {
        // TODO: refactor this to send both rings at once?
        require(
            weddings[_weddingId].status == 2,
            "Rings have not been created or wedding is completed."
        );

        Partner storage fromPartner;
        Partner storage toPartner;

        if (weddings[_weddingId].partner1.wallet == msg.sender) {
            fromPartner = weddings[_weddingId].partner1;
            toPartner = weddings[_weddingId].partner2;
        } else {
            fromPartner = weddings[_weddingId].partner2;
            toPartner = weddings[_weddingId].partner1;
        }

        // make sure we are sending to the other partner
        require(toPartner.wallet != msg.sender, "Sending ring to self");

        // check if we have a valid ringId
        require(fromPartner.ringId != 0, "Invalid ringId");

        // check if the ring has already been sent
        require(fromPartner.sentRing == false, "Ring has already been sent");

        //transfer ring
        ringContract.transferFrom(
            address(this),
            toPartner.wallet,
            fromPartner.ringId
        );
        emit RingSent(fromPartner.wallet, toPartner.wallet, fromPartner.ringId);
        fromPartner.sentRing = true;

        if (fromPartner.sentRing && toPartner.sentRing) {
            weddings[_weddingId].status = 3;
            // update ringID's
            // TODO: try solidity swapping
            uint256 tempId = fromPartner.ringId;
            fromPartner.ringId = toPartner.ringId;
            toPartner.ringId = tempId;
            emit WeddingComplete(_weddingId);
            // TODO: address mapping entries for partners
        }
    }

    function sendEther(uint256 _weddingId)
        external
        payable
        weddingIdExists(_weddingId)
    {
        require(weddings[_weddingId].status == 3, "Wedding not complete");
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

        weddings[_weddingId].balance -= _amount;

        uint256 result = _amount / 2;
        (bool successPartner1, ) = weddings[_weddingId].partner1.wallet.call{
            value: result
        }("");
        (bool successPartner2, ) = weddings[_weddingId].partner2.wallet.call{
            value: result
        }("");

        require(
            successPartner1 && successPartner2,
            "There was an error! Ether was not sent."
        );
    }

    // TODO: not necessary. we can use the getter
    function getWeddingById(uint256 _weddingId)
        external
        view
        returns (Wedding memory)
    {
        return weddings[_weddingId];
    }

    function getWeddingBalance(uint256 _weddingId)
        public
        view
        weddingIdExists(_weddingId)
        returns (uint256)
    {
        return weddings[_weddingId].balance;
    }

    function getWeddingStatus(uint256 _weddingId)
        public
        view
        weddingIdExists(_weddingId)
        returns (uint256)
    {
        return weddings[_weddingId].status;
    }

    function annulMarriage(uint256 _weddingId)
        external
        isPartner(_weddingId, msg.sender)
        weddingIdExists(_weddingId)
    {
        require(weddings[_weddingId].status == 3, "Wedding is not completed.");

        delete addressToWedding[weddings[_weddingId].partner1.wallet];
        delete addressToWedding[weddings[_weddingId].partner2.wallet];
        delete addressToWedding[weddings[_weddingId].thirdParty];
        delete weddings[_weddingId];
    }

    //aditional (?)
    function checkIfPersonIsMarried(address _address)
        public
        view
        returns (bool)
    {
        bool result;
        if (weddings[addressToWedding[_address]].status == 3) {
            result = true;
        }
        return result;
    }
}
