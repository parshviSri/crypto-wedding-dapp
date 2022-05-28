import { useRouter } from "next/router";
import WeddingContract from "../../artifacts/contracts/WeddingManager.sol/WeddingManager.json";
import { ethers } from "ethers";
import { useEffect, useState } from "react";

const ViewWedding = () => {
  const router = useRouter();
  const { id } = router.query;
  const contractAddress = "0xbDB63a121dE60b4036b212856928e43b82378a06"; // contract deployed on rinkeby

  const [wedding1, setWedding1] = useState({
    partner1Name: "",
    partner2Name: "",
  });
  const [wedding2, setWedding2] = useState({
    partner1Name: "",
    partner2Name: "",
  });
  const [wedding3, setWedding3] = useState({
    partner1Name: "",
    partner2Name: "",
  });
  const [wedding4, setWedding4] = useState({
    partner1Name: "",
    partner2Name: "",
  });
  const [wedding5, setWedding5] = useState({
    partner1Name: "",
    partner2Name: "",
  });
  const [weddings, setWeddings] = useState([]);
  useEffect(() => {
    fetchWedding();
  }, [id]);
  const fetchWedding = async () => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const weddingManager = new ethers.Contract(
        contractAddress,
        WeddingContract.abi,
        signer
      );
      const weddings = [];
      for (let i = 1; i < 5; i++) {
        weddings.push(await weddingManager.getWeddingById(i));
      }
      console.log(weddings);
      setWeddings(weddings);
    } catch (err) {}
  };

  return (
    <div className="flex flex-row">
      {weddings.map((wedding, id) => {
        return (
          <div class="max-w-sm rounded overflow-hidden shadow-lg">
            <div class="px-6 py-4">
              <button
                onClick={() => {
                  router.push({ pathname: "/wedding", query: { id: id + 1 } });
                }}
              >
                <div class="font-bold text-xl mb-2">Wedding - {id + 1}</div>
                <p class="text-gray-700 text-base">
                  Wedding of {wedding.partner1.name} and {wedding.partner2.name}
                </p>
              </button>
            </div>
            <div class="px-6 pt-4 pb-2">
              <span class="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">
                #photography
              </span>
              <span class="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">
                #travel
              </span>
              <span class="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">
                #winter
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
export default ViewWedding;
