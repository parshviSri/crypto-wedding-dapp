import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import WeddingContract from "../../artifacts/contracts/WeddingManager.sol/WeddingManager.json";
import { BigNumber, ethers } from "ethers";
import { create as ipfsHttpClient } from "ipfs-http-client";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Wedding = () => {
  const client = ipfsHttpClient("https://ipfs.infura.io:5001/api/v0");
  const router = useRouter();
  const { id } = router.query;
  const contractAddress = "0xbDB63a121dE60b4036b212856928e43b82378a06";
  const [weddingDetails, setWeddingDetails] = useState({
    partner1: {
      address: "",
      name: "",
      ringId: 0,
      sentRing: false,
      tokeUri: "",
    },
    partner2: {
      address: "",
      name: "",
      ringId: 0,
      sentRing: false,
      tokenUri: "",
    },
    thirdParty: "",
    balance: BigNumber.from(0),
    status: 1,
  });
  const [ring1, setRing1] = useState({ image: "", metaData: "" });
  const [ring2, setRing2] = useState({ image: "", metaData: "" });
  const [formInput, updateFormInput] = useState({ giftAmount: "0" });
  const [withdrawFormInput, updateWithdrawFormInput] = useState({
    withdrawAmount: "0",
  });
  const [tokenUri, settokenUri] = useState("");
  const [account, setAccount] = useState("");
  const dummyImg = "/img1.jpg";
  const openSea =
    "https://testnets.opensea.io/assets/rinkeby/0x3771525B52D81348861520B07175083bA8551B65/";

  useEffect(() => {
    fetchWedding();
  }, [id]);
  const fetchWedding = async () => {
    try {
      const currentAccount = await window.ethereum.request({
        method: "eth_accounts",
      });
      setAccount(currentAccount);
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const weddingManager = new ethers.Contract(
        contractAddress,
        WeddingContract.abi,
        signer
      );
      const wedding = await weddingManager.getWeddingById(id);
      console.log(wedding);
      setWeddingDetails({
        partner1: {
          address: wedding.partner1.wallet,
          name: wedding.partner1.name,
          ringId: wedding.partner1.ringId.toNumber(),
          sentRing: wedding.partner1.sentRing,
          tokeUri: wedding.partner1.tokeUri,
        },
        partner2: {
          address: wedding.partner2.wallet,
          name: wedding.partner2.name,
          ringId: wedding.partner2.ringId.toNumber(),
          sentRing: wedding.partner2.sentRing,
          tokeUri: wedding.partner2.tokeUri,
        },
        thirdParty: wedding.thirdParty,
        balance: wedding.balance,
        status: wedding.status.toNumber(),
      });
      console.log(weddingDetails);
      console.log(id > 0 && weddingDetails.partner1.name);
      const getmetaData1 = await axios.get(wedding.partner1.tokeUri);
      console.log(getmetaData1.data.image);
      setRing1({
        image: getmetaData1.data.image,
        metadata: getmetaData1.data.description,
      });
      const getmetaData2 = await axios.get(wedding.partner2.tokeUri);
      setRing2({
        image: getmetaData2.data.image,
        metadata: getmetaData2.data.description,
      });
      console.log(
        weddingDetails.partner2.sentRing &&
          account.toString().toUpperCase() ==
            weddingDetails.partner2.address.toUpperCase()
      );
    } catch (err) {}
  };
  const addImageRing = async (e) => {
    const file = e.target.files[0];
    const account = await window.ethereum.request({ method: "eth_accounts" });
    try {
      if (
        account.toString().toUpperCase() ==
          weddingDetails.partner1.address.toUpperCase() ||
        account.toString().toUpperCase() ==
          weddingDetails.partner2.address.toUpperCase()
      ) {
        const added = await client.add(file, {
          progress: (prog) => console.log(`received: ${prog}`),
        });
        const url = `https://ipfs.infura.io/ipfs/${added.path}`;
        console.log(url);
        if (
          account.toString().toUpperCase() ==
          weddingDetails.partner1.address.toUpperCase()
        ) {
          const metadata = await uploadToIPFS(
            weddingDetails.partner1.name,
            weddingDetails.partner2.name,
            id,
            url
          );
          settokenUri(metadata);
          const getmetaData = await axios.get(metadata);

          setRing1({
            image: getmetaData.data.image,
            metadata: getmetaData.data.description,
          });
        }
        if (
          account.toString().toUpperCase() ==
          weddingDetails.partner2.address.toUpperCase()
        ) {
          const metadata = await uploadToIPFS(
            weddingDetails.partner2.name,
            weddingDetails.partner1.name,
            id,
            url
          );
          settokenUri(metadata);

          const getmetaData = await axios.get(metadata);
          console.log(getmetaData);
          setRing2({
            image: getmetaData.data.image,
            metadata: getmetaData.data.description,
          });
        }
      }
    } catch (error) {
      console.log("Error uploading file: ", error);
    }
  };
  async function uploadToIPFS(from, to, tokenId, image) {
    /* first, upload metadata to IPFS */
    const description =
      "This NFT is a symbol of commitment from " +
      from +
      " to" +
      to +
      " in blockchain matrimony.";
    const name = "Wedding Id - " + tokenId;
    const attributes = [{ to: to, from: from }];
    const data = JSON.stringify({
      name,
      description,
      image,
      attributes,
    });
    try {
      const added = await client.add(data);
      const url = `https://ipfs.infura.io/ipfs/${added.path}`;
      /* after metadata is uploaded to IPFS, return the URL to use it in the transaction */
      return url;
    } catch (error) {
      console.log("Error uploading file: ", error);
    }
  }
  const mintRing = async (tokenUri) => {
    try {
      console.log(tokenUri);
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const weddingManager = new ethers.Contract(
        contractAddress,
        WeddingContract.abi,
        signer
      );
      const weddingRing = await weddingManager.createRing(tokenUri);
      console.log(weddingRing);

      const event = await weddingManager.on(
        "RingCreated",
        (address, ringId, uri) => {
          toast("Please wait your ring is being minted!!", {
            position: "top-center",
            autoClose: 15000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
          });
          console.log(address);
          console.log(ringId);
          console.log(uri);
        }
      );
    } catch (err) {}
  };
  const sendRing = async () => {
    console.log(weddingDetails);

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const weddingManager = new ethers.Contract(
      contractAddress,
      WeddingContract.abi,
      signer
    );

    const wedding = await weddingManager.sendRing(id);
    toast("Please wait your ring is being exchanged!!", {
      position: "top-center",
      autoClose: 6000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
    const event = await weddingManager.on("RingSent", (to, from, ringId) => {});
  };

  const sendGift = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const weddingManager = new ethers.Contract(
      contractAddress,
      WeddingContract.abi,
      signer
    );
    const overrides = {
      value: ethers.utils.parseUnits(formInput.giftAmount, "ether"),
    };
    const wedding = await weddingManager.sendEther(id, overrides);
  };

  const withdrawBalance = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const weddingManager = new ethers.Contract(
      contractAddress,
      WeddingContract.abi,
      signer
    );
    const wedding = await weddingManager.withdrawEther(
      id,
      ethers.utils.parseUnits(withdrawFormInput.withdrawAmount, "ether")
    );
  };

  return (
    <div className="bg-[url('/background3.jpeg')]">
      <ToastContainer
        position="top-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      {/* <div className="text-center">
        <h1>Find Your Wedding</h1>
        <input
          type="number"
          onChange={(event) => {
            router.push({
              pathname: "/wedding",
              query: { id: event.target.value },
            });
          }}
        />
      </div> */}
      <div>
        {weddingDetails.partner1.name && (
          <div className="text-center p-3">
            <h2 className="font-medium leading-tight text-2xl mt-0 mb-2 text-gray-700">
              Welcome to wedding page of {weddingDetails.partner1.name} and{" "}
              {weddingDetails.partner2.name}
            </h2>
            {weddingDetails.status < 3 && (
              <p> Get Started with your crypto wedding</p>
            )}
            {weddingDetails.status == 1 && (
              <div>
                {account.toString().toUpperCase() ==
                  weddingDetails.partner1.address.toUpperCase() && (
                  <div>
                    {weddingDetails.partner1.sentRing || (
                      <div className="flex flex-row">
                        <div className="basis-1/2 bg-black">
                          <div className="m-6 flex items-center justify-center">
                            <div className="bg-gray-100 p-6">
                              <img
                                src={ring1.image || dummyImg}
                                width="120"
                                height="120"
                              />
                            </div>
                            <input type="file" onChange={addImageRing} />
                          </div>
                        </div>
                        <div className="basis-1/2 text-center">
                          <p>Your digital ring</p>
                          <p>
                            You can create your own ring by uploading any image
                            of your choice and we will mint it as an NFT which
                            will remain on block chain forever{" "}
                          </p>
                          <div className="m-6 flex items-center justify-center">
                            <button
                              className="bg-black hover:bg-gray-200 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                              onClick={() => {
                                mintRing(tokenUri);
                              }}
                            >
                              {" "}
                              Mint Your Ring
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                {account.toString().toUpperCase() ==
                  weddingDetails.partner2.address.toUpperCase() && (
                  <div>
                    {weddingDetails.partner2.sentRing || (
                      <div className="flex flex-row">
                        <div className="basis-1/2 bg-black">
                          <div className="m-6 flex items-center justify-center">
                            <div className="p-6">
                              <img
                                src={ring2.image || dummyImg}
                                width="120"
                                height="120"
                              />
                            </div>
                            <input type="file" onChange={addImageRing} />
                          </div>
                        </div>
                        <div className="basis-1/2 text-center">
                          <p>Your digital ring</p>
                          <p>
                            You can create your own ring by uploading any image
                            of your choice and we will mint it as an NFT which
                            will remain on block chain forever{" "}
                          </p>
                          <div className="m-6 flex items-center justify-center">
                            <button
                              className="bg-black hover:bg-gray-200 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                              onClick={() => {
                                mintRing(tokenUri);
                              }}
                            >
                              {" "}
                              Mint Your Ring
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                {weddingDetails.partner1.sentRing && (
                  <div>
                    {weddingDetails.partner1.name} has already created the
                    ring!!
                  </div>
                )}
              </div>
            )}

            <div className="flex flex-row justify-center">
              <div className="p-10">
                <a
                  href={openSea + weddingDetails.partner2.ringId}
                  target="_blank"
                >
                  {" "}
                  <img
                    src={ring1.image || dummyImg}
                    className="object-contain h-48 w-96"
                  />
                </a>
                <p>Vows</p>
              </div>
              <div>
                {weddingDetails.status == 2 && (
                  <button
                    className="bg-black hover:bg-gray-200 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline m-12"
                    onClick={sendRing}
                  >
                    Exchange The Ring
                  </button>
                )}
                {weddingDetails.status == 3 && (
                  <div className="mt-12">
                    <p className="font-medium leading-tight text-2xl mt-0 mb-2">
                      Congratulation !!
                    </p>
                    <p className="font-medium leading-tight text-2xl mt-0 mb-2">
                      {weddingDetails.partner1.name} and{" "}
                      {weddingDetails.partner2.name} are married !!
                    </p>
                  </div>
                )}
              </div>
              <div className="p-10">
                <a
                  href={openSea + weddingDetails.partner1.ringId}
                  target="_blank"
                >
                  <img
                    src={ring2.image || dummyImg}
                    className="object-contain h-48 w-96"
                    width="320"
                    height="320"
                  />
                </a>
                <p>Vows</p>
              </div>
            </div>

            <div className="flex flex-row justify-center">
              {account.toString().toUpperCase() ==
                weddingDetails.partner1.address.toUpperCase() ||
                account.toString().toUpperCase() ==
                  weddingDetails.partner2.address.toUpperCase() || (
                  <div className="flex items-center space-x-4">
                    <p>
                      Send a wedding gift to{" "}
                      <span className="font-bold">
                        {weddingDetails.partner1.name}
                      </span>{" "}
                      and &nbsp;
                      <span className="font-bold">
                        {weddingDetails.partner2.name}
                      </span>
                    </p>
                    <input
                      className="shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      placeholder="gift amount in ether"
                      onChange={(e) =>
                        updateFormInput({
                          ...formInput,
                          giftAmount: e.target.value,
                        })
                      }
                    />
                    <button
                      className="bg-black hover:bg-gray-200 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                      onClick={sendGift}
                    >
                      {" "}
                      Send Gift{" "}
                    </button>
                    {/* <button
                      className="bg-gray-600 hover:bg-gray-400 text-white font-bold py-1 px-4 rounded focus:outline-none focus:shadow-outline"
                      onClick={(e) =>
                        updateFormInput({
                          ...formInput,
                          giftAmount: "1000",
                        })
                      }
                    >
                      1 Szabo
                    </button>
                    <button
                      className="bg-gray-600 hover:bg-gray-400 text-white font-bold py-1 px-4 rounded focus:outline-none focus:shadow-outline"
                      onClick={(e) =>
                        updateFormInput({
                          ...formInput,
                          giftAmount: "1000000",
                        })
                      }
                    >
                      1 Finney
                    </button>
                    <button
                      className="bg-gray-600 hover:bg-gray-400 text-white font-bold py-1 px-4 rounded focus:outline-none focus:shadow-outline"
                      onClick={(e) =>
                        updateFormInput({
                          ...formInput,
                          giftAmount: "1000000000",
                        })
                      }
                    >
                      1 Ether
                    </button> */}
                  </div>
                )}
            </div>
            {(account.toString().toUpperCase() ==
              weddingDetails.partner1.address.toUpperCase() ||
              account.toString().toUpperCase() ==
                weddingDetails.partner2.address.toUpperCase()) && (
              <div className="flex flex-row justify-center space-x-4">
                <div>
                  <input
                    type="number"
                    value={withdrawFormInput.withdrawAmount}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    placeholder="withdraw amount in ether"
                    onChange={(e) =>
                      updateWithdrawFormInput({
                        ...formInput,
                        withdrawAmount: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <button
                    className="bg-black hover:bg-gray-200 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    onClick={withdrawBalance}
                  >
                    Withdraw Balance
                  </button>
                </div>
                <div>
                  <span>
                    Current balance: &nbsp;
                    {ethers.utils.formatUnits(weddingDetails.balance, "ether")}
                    &nbsp; ether
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
        {id > 0 || weddingDetails.partner1.name || (
          <div className="text-center">
            <h1>No Wedding with this id is present !!</h1>
          </div>
        )}
      </div>
    </div>
  );
};
export default Wedding;
