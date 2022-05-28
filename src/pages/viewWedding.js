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
    <div className="flex-row bg-[white]/50 shadow rounded">
      <h4 class="font-bold mx-20 pt-4 text-center md:text-2xl md:text-left text-[#6D9979]">
        Recently registered weddings
      </h4>
      <ul class="list-none">
        {weddings.map((wedding, id) => {
          return (
            <li>
              <div class="mx-20 w-3/4">
                <div
                  class="m-10  bg-white border-2 border-[#6D9979] rounded-lg shadow-lg"
                  key={id}
                >
                  <button
                    onClick={() => {
                      router.push({
                        pathname: "/wedding",
                        query: { id: id + 1 },
                      });
                    }}
                  >
                    <p class="font-bold text-xl p-3 text-gray-600">
                      Wedding - {id + 1}
                    </p>
                    <p class="text-gray-700 mx-auto text-base p-3">
                      Wedding of {wedding.partner1.name} and{" "}
                      {wedding.partner2.name}
                    </p>
                  </button>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
export default ViewWedding;
