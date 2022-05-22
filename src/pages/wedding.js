import {useRouter} from 'next/router';
import { useEffect, useState } from 'react';
import WeddingContract from '../../artifacts/contracts/WeddingManager.sol/WeddingManager.json';
import { ethers } from 'ethers';
import {create as ipfsHttpClient} from 'ipfs-http-client';

const Wedding =() =>{
    const client = ipfsHttpClient('https://ipfs.infura.io:5001/api/v0');
    const router = useRouter();
    const {id} = router.query;
    const contractAddress ='0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512';
    const[wedingDetails, setWeddingDetails]= useState({partner1:{address:'',name:'',ringId:0,sentRing:false},partner2:{address:'',name:'',ringId:0,sentRing:false},thirdParty:'',balance:0,status:1});
    const[ring1, setRing1]= useState('');
    const[ring2,setRing2] =useState('');
    const [eventMessage,setEventMessage]= useState('');
    const giftEth=1 ^10-2;
    useEffect(()=>{
        fetchWedding();
    },[id]);
    const fetchWedding = async () =>{
            try{
                const provider = new ethers.providers.Web3Provider(window.ethereum);
                const signer = provider.getSigner();
                const weddingManager = new ethers.Contract(contractAddress, WeddingContract.abi,signer);
                const wedding = await weddingManager.getWeddingById(id);
                    setWeddingDetails({partner1:{
                    address:wedding.partner1.wallet,
                    name:wedding.partner1.name,
                    ringId:wedding.partner1.ringId.toNumber(),
                    sentRing:wedding.partner1.sentRing
                },
                partner2:{
                    address:wedding.partner2.wallet,
                    name:wedding.partner2.name,
                    ringId:wedding.partner2.ringId.toNumber(),
                    sentRing:wedding.partner2.sentRing
                },
                thirdParty:wedding.thirdParty,
                balance:wedding.balance.toNumber(),
                status:wedding.status.toNumber()
                })
                console.log(wedding);
            }
            catch(err){
                
            }
           
            
        
    }
    const addImageRing = async (e) =>{
        const file =e.target.files[0];
        const account = await window.ethereum.request({method:'eth_accounts'});
        try {
            if(account.toString().toUpperCase() == wedingDetails.partner1.address.toUpperCase() || account.toString().toUpperCase() == wedingDetails.partner2.address.toUpperCase()){
                const added = await client.add(
                    file,
                    {
                      progress: (prog) => console.log(`received: ${prog}`)
                    }
                  )
                  const url = `https://ipfs.infura.io/ipfs/${added.path}`;
                  console.log(url);
                    if(account.toString().toUpperCase() == wedingDetails.partner1.address.toUpperCase() ){
                      const metadata= await uploadToIPFS(wedingDetails.partnerName1, wedingDetails.partnerName2,id,url);
                      setRing1(metadata)
      
                    }
                    if(account.toString().toUpperCase() == wedingDetails.partner2.address.toUpperCase()){
                      const metadata= await uploadToIPFS(wedingDetails.partnerName2, wedingDetails.partnerName1,id,url);
                      setRing2(metadata)
                    }
            }
            
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
      const mintRing =async(tokenUri)=>{
        try{
            console.log(tokenUri);
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            const weddingManager = new ethers.Contract(contractAddress, WeddingContract.abi,signer);
            const weddingRing = await weddingManager.createRing(tokenUri);
            console.log(weddingRing);
            const event = await weddingManager.on("RingCreated",(address, ringId, uri)=>{
                console.log(address);
                console.log(ringId);
                console.log(uri);
            })

        }
        catch(err){
            
        }
      }
      const sendRing = async()=>{
        console.log(wedingDetails);

        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const weddingManager = new ethers.Contract(contractAddress, WeddingContract.abi,signer);
        const wedding = await weddingManager.sendRing(id);
        const event = await wedding.on("RingSent",(to, from,ringId)=>{
          setEventMessage("The ring is transferred to-",to)  
        })

      }
      const sendGifts = async() =>{
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const weddingManager = new ethers.Contract(contractAddress, WeddingContract.abi,signer);
        const wedding = await weddingManager.sendEther({ value: giftEth });
      }
    return (
        <div>
            {/* {id==0 && <div className='flex bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4'>
          <input className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" onChange={(event)=>{setCurrentId(event.target.value)}} placeholder="Find Your Wedding"/>

        </div>} */}
            <div className='bg-gray-100'>
                <div className='text-center'>

            <h2 className="font-medium leading-tight text-2xl mt-0 mb-2">Welcome to wedding page of {wedingDetails.partner1.name} and {wedingDetails.partner2.name}</h2>
        <p> Get Started with your crypto wedding</p>
        {wedingDetails.status ==1 &&
        <div>
        {wedingDetails.partner1.sentRing ||
        <div className='flex flex-row'>
        <div className='basis-1/2 bg-black'>
            <div className='m-6 flex items-center justify-center'>
                <div className='bg-gray-100 p-6'>
                <img src={ring1.image} width="120" height="120" />

                </div>
                <input type="file" onChange={addImageRing}/>

            
            </div>
            
        </div>
        <div className='basis-1/2 text-center'>
            <p>Your digital ring</p>
            <p>You can create your own ring by uploading any image of your choice and we will mint it as an NFT which will remain on block chain forever </p>
            <div className='m-6 flex items-center justify-center'>
        <button className='bg-black hover:bg-gray-200 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline' onClick={()=>{mintRing(ring1)}}> Mint Your Ring</button>

    </div>
        </div>

    </div>
        }
             {wedingDetails.partner1.sentRing && <div>{wedingDetails.partner1.name} has already created the ring!!</div>}
             <div className='flex flex-row'>
            <div className='basis-1/2 bg-black'>
                <div className='m-6 flex items-center justify-center'>
                    <div className='bg-gray-100 p-6'>
                    <img src={ring2.image} width="120" height="120" />

                    </div>
                    <input type="file" onChange={addImageRing}/>

                
                </div>
                
            </div>
            <div className='basis-1/2 text-center'>
                <p>Your digital ring</p>
                <p>You can create your own ring by uploading any image of your choice and we will mint it as an NFT which will remain on block chain forever </p>
                <div className='m-6 flex items-center justify-center'>
            <button className='bg-black hover:bg-gray-200 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline' onClick={()=>{mintRing(ring2)}}> Mint Your Ring</button>

        </div>
            </div>

        </div>
        </div>
        }
        
        
          <div className='flex flex-row'>
            <div>
                <p>{eventMessage}</p>
            <img src={ring1} width="120" height="120" />
            <p>Vows</p>
            </div>
            <div>
            {wedingDetails.status==2 && <button onClick={sendRing}>Start The wedding</button>}
            {wedingDetails.status==3 && <div>
                <p>Congratulation !!</p>
                <p>{partner1.name} and {partner2.name} are married !!</p>
                </div>}

            </div>
            <div>
            <img src={ring1} width="120" height="120" />
            <p>Vows</p> 
            </div>
            
        </div>
        
        
        <div  className='flex flex-row'>
        <p> Want to send gifts to {wedingDetails.partnerName1} and {wedingDetails.partnerName2}</p>
        <div className='m-6 flex items-center justify-center'>
            <button className='bg-black hover:bg-gray-200 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline' onClick={sendGifts}> Send Your Gifts </button>

        </div>        </div>
                </div>
            </div>
        </div>
    )
}
export default Wedding;