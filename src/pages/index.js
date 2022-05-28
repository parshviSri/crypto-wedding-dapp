import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { Carousel } from "react-responsive-carousel";
import { useRouter } from "next/router";
import ViewWedding from "./viewWedding";

export default function Home() {
  const router = useRouter();
  return (
    <div className="bg-[url('/background4.jpeg')]">
      <Head>
        <title>Crypto Wedding</title>
        <meta name="description" content="Get Married on Block Chain" />
        <link rel="icon" href="/Crypto.png" />
      </Head>

      <main>
        <div className="bg-[url('/background3.jpeg')]">
          <div className="bg-white/60 pt-3">
            <div className="text-center space-x-3 text-gray-400">
              <span>Find wedding</span>
              <input
                type="number"
                className="border-2 border-gray-100"
                placeholder=" wedding id"
                onChange={(event) => {
                  router.push({
                    pathname: "/wedding",
                    query: { id: event.target.value },
                  });
                }}
              />
            </div>
            <div className="mt-4 flex items-center justify-center">
              <button
                className="bg-[#c08c8c] hover:bg-gray-200 text-white font-bold py-2 px-6 rounded focus:outline-none focus:shadow-outline"
                onClick={() => {
                  router.push("/register");
                }}
              >
                {" "}
                Register your Marriage
              </button>
            </div>
          </div>
          <div className="flex flex-row">
            <div className="basis-3/4 p-6 content-center m-10">
              <h1 class="text-4xl font-bold text-center md:text-5xl md:text-left text-gray-800">
                Get married on the Blockchain!
              </h1>
              <br />
              <p class="text-darkGrayishBlue md:text-left text-gray-700">
                Register weddings using digital technology, maintain the
                sanctity of the wedding on the blockchain, and celebrate the
                occasion with your friends and family. <br />
                Note that this registration process would be symbolic and has no
                legal binding <span class="italic">(yet)</span>.
              </p>

              <div className="items-center mx-auto p-10">
                <ViewWedding />
              </div>
              <div className="flex flex-col">
                {/* <div className="m-6 flex items-center justify-center">
            <button
              className="bg-black hover:bg-gray-200 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              onClick={() => {
                router.push("/viewWedding");
              }}
            >
              {" "}
              See Weddings
            </button>
          </div> */}
              </div>
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
      </main>

      <footer className={styles.footer}>
        <a
          href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#c99c9c] bg-[]"
        >
          Minted by &nbsp;<strong>Team Wedding Crashers @ DappCamp3</strong>
          {/* <span className={styles.logo}>
            <Image src="/vercel.svg" alt="Vercel Logo" width={72} height={16} />
          </span> */}
        </a>
      </footer>
    </div>
  );
}
