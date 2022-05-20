import {useRouter} from 'next/router';
import { useEffect, useState } from 'react';
import WeddingContract from '../../artifacts/contracts/WeddingManager.sol/WeddingManager.json';
import { ethers } from 'ethers';
import {create as ipfsHttpClient} from 'ipfs-http-client';

const Wedding =() =>{
    const client = ipfsHttpClient('https://ipfs.infura.io:5001/api/v0');
    const router = useRouter();
    const {id} = router.query;
    const contractAddress ='0x5FbDB2315678afecb367f032d93F642f64180aa3';
    const[wedingDetails, setWeddingDetails]= useState({partnerName1:'',partnerName2:'',partner1:'',partner2:''});
    const[ring1, setRing1]= useState(null)
    useEffect(()=>{
        fetchWedding();
    },[]);
    const fetchWedding = async () =>{
            try{
                const provider = new ethers.providers.Web3Provider(window.ethereum);
                const signer = provider.getSigner();
                const weddingManager = new ethers.Contract(contractAddress, WeddingContract.abi,signer);
                const wedding = await weddingManager.getWeddingById(id);
                setWeddingDetails({partnerName1:wedding.partnerName1,partner1:wedding.partner1,partnerName2:wedding.partnerName2,partner2:wedding.partner2})
            }
            catch(err){
                
            }
           
            
        
    }
    const addImageRing1 = async (e) =>{
        const file =e.target.files[0];
        try {
            const added = await client.add(
              file,
              {
                progress: (prog) => console.log(`received: ${prog}`)
              }
            )
            const url = `https://ipfs.infura.io/ipfs/${added.path}`
            setRing1(url);
           const metadata= await uploadToIPFS(wedingDetails.partnerName1, wedingDetails.partnerName2,id,url);
           console.log(metadata);

          } catch (error) {
            console.log('Error uploading file: ', error)
          } 
        
    }
    async function uploadToIPFS(from,to,tokenId,image) {
        /* first, upload metadata to IPFS */
        let description = "This NFT is the symbol of commitment from" +from +"to" +to+" to be in a matrimonial."
        const data = JSON.stringify({
          to,from,id:tokenId, description, image
        })
        try {
          const added = await client.add(data)
          const url = `https://ipfs.infura.io/ipfs/${added.path}`
          /* after metadata is uploaded to IPFS, return the URL to use it in the transaction */
          return url
        } catch (error) {
          console.log('Error uploading file: ', error)
        }  
      }
    return (
        <div>
            <div className='bg-gray-100'>
                <div className='text-center'>

            <h2 className="font-medium leading-tight text-2xl mt-0 mb-2">Welcome to wedding page of {wedingDetails.partnerName1} and {wedingDetails.partnerName2}</h2>
        <p> Get Started with your crypto wedding</p>
        <div className='flex flex-row'>
            <div className='basis-1/2 bg-black'>
                <div className='m-6 flex items-center justify-center'>
                    <div className='bg-gray-100 p-6'>
                    <img src={ring1} width="120" height="120" />

                    </div>
                    <input type="file" onChange={addImageRing1}/>

                
                </div>
                
            </div>
            <div className='basis-1/2 text-center'>
                <p>Your digital ring</p>
                <p>You can create your own ring by uploading any image of your choice and we will mint it as an NFT which will remain on block chain forever </p>
                <div className='m-6 flex items-center justify-center'>
            <button className='bg-black hover:bg-gray-200 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline'> Mint Your Ring</button>

        </div>
            </div>

        </div>
        <div className='flex flex-row'>
            <div className='basis-1/2 bg-black'>
                <div className='m-6 flex items-center justify-center'>
                    <div className='bg-gray-100 p-6'>
                    <img src={ring1} width="120" height="120" />

                    </div>
                    <input type="file" onChange={addImageRing1}/>

                
                </div>
                
            </div>
            <div className='basis-1/2 text-center'>
                <p>Your digital ring</p>
                <p>You can create your own ring by uploading any image of your choice and we will mint it as an NFT which will remain on block chain forever </p>
                <div className='m-6 flex items-center justify-center'>
            <button className='bg-black hover:bg-gray-200 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline'> Mint Your Ring</button>

        </div>
            </div>

        </div>
        <div className='flex flex-row'>
            <div>
            <img src={ring1} width="120" height="120" />
            <p>Vows</p>
            </div>
            <div>
                <button>Start The wedding</button>
            </div>
            <div>
            <img src={ring1} width="120" height="120" />
            <p>Vows</p> 
            </div>
            
        </div>
        <div  className='flex flex-row'>
        <p> Want to send gifts to {wedingDetails.partnerName1} and {wedingDetails.partnerName2}</p>
        <div className='m-6 flex items-center justify-center'>
            <button className='bg-black hover:bg-gray-200 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline'> Send Your Gifts </button>

        </div>        </div>
                </div>
            </div>
        </div>
    )
}
export default Wedding;