import Head from 'next/head'
import Image from 'next/image'
import { ethers } from 'ethers';
import WeddingContract from '../../artifacts/contracts/WeddingManager.sol/WeddingManager.json';
import styles from '../styles/Home.module.css';
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { Carousel } from 'react-responsive-carousel';
import {useRouter} from 'next/router';
import React, { useState, useEffect } from 'react';



export default function Home() {
  
  
  useEffect(()=>{
    fetchWedding();
  });

  const fetchWedding = async () =>{
    try{
        const currentAccount = await window.ethereum.request({method:'eth_accounts'});
        //setAccount(currentAccount);
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contractAddress ='0xe7f1725e7734ce288f8367e1bb143e90bb3f0512';
        const weddingManager = new ethers.Contract(contractAddress, WeddingContract.abi,signer);
        const weddingId = await weddingManager.getWeddingIdByAccount();
        const weddingStatus = await weddingManager.getWeddingStatus(weddingId.toNumber());
        console.log(weddingId.toNumber());

        //if (weddingStatus.toNumber() == 0)
         // router.push('/register')
        if (weddingStatus.toNumber() == 1)
          router.push('/createRings?id=' + weddingId.toNumber())
        if (weddingStatus.toNumber() == 2)
          router.push('/exchangeRings?id=' + weddingId.toNumber())
        if (weddingStatus.toNumber() == 3)
        router.push('/finishedWedding?id=' + weddingId.toNumber())

        

    }
    catch(err){
        //console.log(err)
    }
}
  
  const router = useRouter();
  return (
    <div className="bg-[url('/background3.jpeg')]">
      <Head>
        <title>Crypto Wedding</title>
        <meta name="description" content="Get Married on Block Chain" />
        <link rel="icon" href="/Crypto.png" />
      </Head>

      <main className="bg-[url('/background3.jpeg')]">
        <div>
          <div className="flex flex-row">
            <div className="basis-3/4 p-6 content-center m-10">
              <h1 className="text-4xl font-bold">
                Get married on the Blockchain !!
              </h1>
              <p className="m-2 text=xl p-6 tracking-widest">
                Marriage registration is a tedious and expensive process in the
                offline world. We want a way to register weddings using digital
                technology, maintain the sanctity of the wedding, and celebrate
                the occasion. Crypto Wedding allows us to do just that with an
                easy-to-use app that lets you register your marriage on the
                Ethereum Blockchain. Anyone can use this app, from anywhere in
                the world. Note that this registration process would be symbolic
                and has no legal binding(yet).
              </p>
            </div>
            <div className="basis-1/2 content-center">
              <div className="p-6 mt-8">
                <Carousel
                  autoPlay
                  interval="10000"
                  transitionTime="10000"
                  showThumbs={false}
                  height={200}
                >
                  <div>
                    <img src="/carousel1.png" alt="image1" />
                  </div>
                  <div>
                    <img src="/carousel2.png" alt="image2" />
                  </div>
                  <div>
                    <img src="/carousel3.png" alt="image3" />
                  </div>
                  <div>
                    <img src="/carousel4.png" alt="image4" />
                  </div>
                </Carousel>
              </div>
            </div>
          </div>
        </div>
        <ViewWedding />

        <div className="flex flex-col">
          <div className="m-6 flex items-center justify-center">
            <button
              className="bg-black hover:bg-gray-200 text-white font-bold py-2 px-6 rounded focus:outline-none focus:shadow-outline"
              onClick={() => {
                router.push("/register");
              }}
            >
              {" "}
              Create a Wedding
            </button>
          </div>
          <div className="m-6 flex items-center justify-center">
            <button
              className="bg-black hover:bg-gray-200 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              onClick={() => {
                router.push("/wedding");
              }}
            >
              {" "}
              See Weddings
            </button>
          </div>
        </div>
      </main>

      <footer className={styles.footer}>
        <a
          href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by{" "}
          <span className={styles.logo}>
            <Image src="/vercel.svg" alt="Vercel Logo" width={72} height={16} />
          </span>
        </a>
      </footer>
    </div>
  );
}
