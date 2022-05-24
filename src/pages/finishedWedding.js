import {useRouter} from 'next/router';
import { useEffect, useState } from 'react';
import WeddingContract from '../../artifacts/contracts/WeddingManager.sol/WeddingManager.json';
import { ethers } from 'ethers';
import {create as ipfsHttpClient} from 'ipfs-http-client';
import axios from 'axios';
const Wedding =() =>{
    const client = ipfsHttpClient('https://ipfs.infura.io:5001/api/v0');
    const router = useRouter();
    const {id} = router.query;
    const contractAddress ='0xe7f1725e7734ce288f8367e1bb143e90bb3f0512';
    const[wedingDetails, setWeddingDetails]= useState({partner1:{address:'',name:'',ringId:0,sentRing:false,tokeUri:''},partner2:{address:'',name:'',ringId:0,sentRing:false,tokenUri:''},thirdParty:'',balance:0,status:1});
    const[ring1, setRing1]= useState({image:'',metaData:''});
    const[ring2,setRing2] =useState({image:'',metaData:''});
    const[tokenUri,settokenUri] = useState('');
    const[account,setAccount] = useState('');
    const [eventMessage,setEventMessage]= useState('');
    const giftEth=1 ^10-2;
    useEffect(()=>{
        fetchWedding();
    },[id]);
    const fetchWedding = async () =>{
            try{
                const currentAccount = await window.ethereum.request({method:'eth_accounts'});
                setAccount(currentAccount);
                const provider = new ethers.providers.Web3Provider(window.ethereum);
                const signer = provider.getSigner();
                const weddingManager = new ethers.Contract(contractAddress, WeddingContract.abi,signer);
                const weddingId = await weddingManager.getWeddingIdByAccount();
                const wedding = await weddingManager.getWeddingById(weddingId.toNumber());
                setWeddingDetails({partner1:{
                    address:wedding.partner1.wallet,
                    name:wedding.partner1.name,
                    ringId:wedding.partner1.ringId.toNumber(),
                    sentRing:wedding.partner1.sentRing,
                    tokenUri:wedding.partner1.tokenUri
                },
                partner2:{
                    address:wedding.partner2.wallet,
                    name:wedding.partner2.name,
                    ringId:wedding.partner2.ringId.toNumber(),
                    sentRing:wedding.partner2.sentRing,
                    tokenUri:wedding.partner2.tokenUri
                },
                thirdParty:wedding.thirdParty,
                balance:wedding.balance.toNumber(),
                status:wedding.status.toNumber()
                })
                console.log(wedding);
                const getmetaData1 = await axios.get(wedding.partner1.tokeUri);
                setRing1({image:getmetaData1.data.image,metadata:getmetaData1.data.description});
                const getmetaData2 = await axios.get(wedding.partner2.tokeUri);
                setRing2({image:getmetaData2.data.image,metadata:getmetaData2.data.description})
                console.log(wedingDetails.partner2.sentRing &&
                    account.toString().toUpperCase() == wedingDetails.partner2.address.toUpperCase());
            }
            catch(err){
            }
    }
      const sendGifts = async() =>{
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const weddingManager = new ethers.Contract(contractAddress, WeddingContract.abi,signer);
        const wedding = await weddingManager.sendEther({ value: giftEth });
      }
    return (
        <div>
            <div className='bg-gray-100'>
                <div className='text-center'>

          <div className='flex flex-row'>
            <div>
                <p>{eventMessage}</p>
            <img src={ring1.image} width="120" height="120" />
            <p>Vows</p>
            </div>
            <div>
            <div>
                <p>Congratulation !!</p>
                <p>{wedingDetails.partner1.name} and {wedingDetails.partner2.name} are married !!</p>
                </div>

            </div>
            <div>
            <img src={ring2.image} width="120" height="120" />
            <p>Vows</p> 
            </div>
            
        </div>
        
        
       <div  className='flex flex-row'>
        <p> Want to send gifts to {wedingDetails.partnerName1} and {wedingDetails.partnerName2}</p>
        <div className='m-6 flex items-center justify-center'>
            <button className='bg-black hover:bg-gray-200 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline' onClick={sendGifts}> Send Your Gifts </button>

        </div>        
        </div>
                </div>
            </div>
        </div>
    )
}
export default Wedding;