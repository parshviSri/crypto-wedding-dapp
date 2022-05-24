import { useState } from "react";
import { ethers } from "ethers";
import Wedding from "../../artifacts/contracts/WeddingManager.sol/WeddingManager.json";
import { useRouter } from "next/router";

const Register = () => {
  const router = useRouter();

  const [formInput, updateFormInput] = useState({
    parterName1: "",
    partnerName2: "",
    partner1: "",
    partner2: "",
  });
  const [tokenId, setTokenId] = useState(null);
  const contractAddress = "0xbDB63a121dE60b4036b212856928e43b82378a06"; // contract deployed on rinkeby
  const createWedding = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const weddingManager = new ethers.Contract(
      contractAddress,
      Wedding.abi,
      signer
    );
    const transaction = await weddingManager.createWedding(
      formInput.partner1,
      formInput.partner2,
      formInput.parterName1,
      formInput.partnerName2
    );
    await transaction.wait();
    const event = await weddingManager.on("WeddingCreated", (tokenId) => {
      console.log(tokenId.toNumber());
      setTokenId(tokenId.toNumber());
      router.push({ pathname: "/wedding", query: { id: tokenId.toNumber() } });
    });
    console.log(tokenId);
    console.log(event);
  };
  return (
    <div>
      <div className="text-center">
        <h2 className="font-medium leading-tight text-2xl mt-0 mb-2">
          Welcome
        </h2>
        <p> Get Started with your crypto wedding</p>
      </div>
      <div className="flex flex-row m-24 justify-center">
        <div className="bg-white shadow-md rounded p-6 mb-4 ml-10">
          <h1 className="text-center">Spouse 1</h1>
          <div className="m-6">
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="spouse name"
              onChange={(e) =>
                updateFormInput({ ...formInput, parterName1: e.target.value })
              }
            />
          </div>
          <div className="m-6">
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="wallet address"
              onChange={(e) =>
                updateFormInput({ ...formInput, partner1: e.target.value })
              }
            />
          </div>
        </div>
        <div className="bg-white shadow-md rounded p-6 mb-4 ml-10">
          <h1 className="text-center">Spouse 2</h1>
          <div className="m-6">
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="spouse name"
              onChange={(e) =>
                updateFormInput({ ...formInput, partnerName2: e.target.value })
              }
            />
          </div>
          <div className="m-6">
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="wallet address"
              onChange={(e) =>
                updateFormInput({ ...formInput, partner2: e.target.value })
              }
            />
          </div>
        </div>
      </div>
      <div className="m-6 flex items-center justify-center">
        <button
          className="bg-black hover:bg-gray-200 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          onClick={createWedding}
        >
          {" "}
          Create Your Wedding
        </button>
      </div>
    </div>
  );
};
export default Register;
