// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;

contract WeddingManager{

    struct Wedding{
        address partner1;
        address partner2;
        address thirdParty;
        string partnerName1;
        string partnerName2;
        uint balance;
    }

    uint private counter;
    mapping (uint => Wedding) public weddings;

    modifier isPartner(uint weddingId, address wallet){
        require(weddings[weddingId].partner1 == wallet || weddings[weddingId].partner2 == wallet, "Address is not Partner");
        _;
    }

    modifier isPartnerOrThirdParty(uint weddingId, address wallet){
        require(weddings[weddingId].partner1 == wallet || weddings[weddingId].partner2 == wallet || weddings[weddingId].thirdParty == wallet, "Address is not Partner or Third Party");
        _;
    }
    
    function createWedding(
            address _partner1,
            address _partner2,
            string memory _partnerName1,
            string memory _partnerName2) external {

        address thirdParty;
        if(msg.sender == _partner1 || msg.sender == _partner2){
            thirdParty = address(0);
        } else {
            thirdParty = msg.sender;
        }

        weddings[counter] = Wedding(_partner1, _partner2, thirdParty, _partnerName1, _partnerName2, 0);
        counter++;
    }

    function createRings(uint _weddingId) external isPartnerOrThirdParty(_weddingId, msg.sender) {

    }

    //exchange the two NFT rings
    // does it need to be 2 different functions? (or one used twice) so that each partner does the transfer?

    function sendEther(uint _weddingId) external payable {
        require(weddings[_weddingId].partner1 != msg.sender && weddings[_weddingId].partner2 != msg.sender, "Address is Partner");
        weddings[_weddingId].balance += msg.value;
    }

    function withdrawEther(uint _weddingId, uint _amount) external isPartner(_weddingId, msg.sender) {
        require(weddings[_weddingId].balance >= _amount, "Not enough ether in balance");

        uint result = _amount / 2;
        (bool successPartner1, ) = weddings[_weddingId].partner1.call{value: result}("");
        (bool successPartner2, ) = weddings[_weddingId].partner2.call{value: result}("");

        // what if one is successfull and the other one isn't? does it go thorugh?
        require(successPartner1 && successPartner2, "There was an error! Ether was not sent.");
    }
    
    function getWeddingById(uint _weddingId) public view returns (Wedding memory){
        return weddings[_weddingId];
    }

}
