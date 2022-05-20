import Link from 'next/link'
import '../styles/globals.css'
import {useState,useEffect} from 'react';
import { ethers } from 'ethers';

function MyApp({ Component, pageProps }) {
  const[con , setCon] = useState(false);
  const [user, setUser] = useState('')
  useEffect(()=>{
    connectWallet();
  },[])
  const connectWallet = async() =>{
    
    if(window.ethereum){
      setCon(true)
      const account = await window.ethereum.request({method:'eth_accounts'});
      if(account.length==0){
        const connectAccount = await window.ethereum.request({method:'eth_requestAccounts'})
      }
      try{
      //   const provider = new ethers.providers.InfuraProvider();
      // const ensDomain = await provider.lookupAddress(account);
      // setUser(ensDomain)
      setUser(account.toString().substr(0,8));
      }
    catch(err){
      setUser(account.toString().substr(0,8));

    }
      
    }
  }
  return (
  <div>
    <nav className='border-b m-6 flex flex-row'>
      <div className='basis-1/2'>
      <Link href='/'>
        <a className='p-6'>Home</a>
      </Link>
      <Link href='/register'>
        <a className='p-6'>Register</a>
      </Link>
      <Link href={{ pathname: '/wedding', query: { id:0 } }}>
        <a className='p-6'>Wedding</a>
      </Link>
      </div>
      
      <div className='basis-1/2'>
      <Link href='/'>
        <a className='content-center p-6 text-2xl font-bold'>CRYPTO WEDDING</a>
      </Link>
      </div>
      <div className='basis-1/4'>
        {con||<button className='bg-black hover:bg-gray-500 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline'>Connect Wallet</button>}
        {con && <p>Welcome :{user}....</p>}
      </div>
    </nav>
    
    {con || <p className='text-2xl font-bold text-blue-800 text-center my-6'>Do not have Meta Mask install from  <a href="https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn?hl=en" className='text-pink-500'>here</a></p>}
    {con && <Component {...pageProps} />}  </div>
  )
}

export default MyApp
