import { expect } from "chai";
import { ethers } from "hardhat";

describe("Wedding Manager", function () {
  let weddingManager;
  let weddingRing;
	let owner;
	let account1;
  let account2;
  let account3;

  beforeEach("deploy contract", async () => {
		const accounts = await ethers.getSigners();

		owner = accounts[0];
		account1 = accounts[1];
    account2 = accounts[2];
    account3 = accounts[3];

		const WeddingManager = await ethers.getContractFactory("WeddingManager");
		weddingManager = await WeddingManager.deploy();

    const WeddingRing = await ethers.getContractFactory("WeddingRing");
		weddingRing = await WeddingRing.deploy();
		await weddingRing.deployed();
	});

  describe("create", function() {
    it("create a wedding by partner", async function () {
      await weddingManager.connect(account1).createWedding(account1.address, account2.address, "p1", "p2");
      let wedding = await weddingManager.connect(account1).getWeddingStatus(1);
      expect(wedding).to.equal(1);

      await expect(
				weddingManager.connect(account1).createWedding(account2.address, account3.address, "p2", "p3")
			).to.be.revertedWith("At least one of the partners is already married.");
    });
  })

  describe("rings", function() {
    it("rings flow", async function () {
      await expect(
				weddingManager.connect(account1).createRing("url")
			).to.be.revertedWith("Wedding not created");
      await weddingManager.connect(account2).createWedding(account1.address, account2.address, "p1", "p2");

      await weddingManager.connect(owner).setRingContractAddress(weddingRing.address)

      await expect(weddingManager.connect(account2).createRing("url")).to.emit(weddingManager, "RingCreated")
      let wedding = await weddingManager.connect(account2).getWeddingStatus(1);
      expect(wedding).to.equal(2);

      console.log(await weddingManager.connect(account1).getWeddingById(1))
      await expect(weddingManager.connect(account1).sendRing(1)).to.emit(weddingManager, "RingSent")
     // await expect(weddingManager.connect(account2).sendRing(1)).to.emit(weddingManager, "RingSent")


    });
  })

  describe("gifts", function(){
    it("send ether", async function () {
      await weddingManager.connect(account1).createWedding(account1.address, account2.address, "p1", "p2");

      await expect(
				weddingManager.connect(account1).sendEther(1, {value: 4})
			).to.be.revertedWith("Address is Partner");

      await expect(
				weddingManager.connect(account1).sendEther(2, {value: 4})
			).to.be.revertedWith("Wedding ID is not associated with a Wedding.");

      await weddingManager.connect(account3).sendEther(1, {value: 4});
      let balance = await weddingManager.connect(account1).getWeddingBalance(1);
      expect(balance).to.equal(4);
    });

    it("withdraw gifts", async function () {
      await weddingManager.connect(account1).createWedding(account1.address, account2.address, "p1", "p2");
      await weddingManager.connect(account3).sendEther(1, {value: 4});

      await expect(
				weddingManager.connect(account3).withdrawEther(1, 4)
			).to.be.revertedWith("Address is not Partner");

      await expect(
				weddingManager.connect(account2).withdrawEther(1, 6)
			).to.be.revertedWith("Not enough ether in balance");

      await weddingManager.connect(account2).withdrawEther(1,3);

      let balance = await weddingManager.connect(account1).getWeddingBalance(1);
      expect(balance).to.equal(1);

    })
  })

  describe("anull", function(){
    it("anll", async function () {
      await weddingManager.connect(account1).createWedding(account1.address, account2.address, "p1", "p2");
      // TODO

      /*let isMarried1 = await weddingManager.connect(account1).checkIfPersonIsMarried(account1.address)
      expect(isMarried1).to.equal(true)
      await weddingManager.connect(account1).annulMarriage(0)
      let isMarried2 = await weddingManager.connect(account1).checkIfPersonIsMarried(account1.address)
      expect(isMarried2).to.equal(false)*/
    });
  })
  
});
