# Crypto-Wedding
To run the application:
1. npm i(install all the packages on package.json)
3. npm run dev (to run the frontend)-
    it build .next folder and that is render on the browser if you feel your changes are not reflected as you have coded please remove .next folder and         rerun the app using above command.
5. npx hardhat node(to run the application in local host)
    So it will run the node of hardhat locally and generates 20 dummy accounts(address and privatekey) with each having fake ether of(1000 eth)
6. Configure your meta mask
      Go to your wallet and then select network - localhost 8545 
      (Common error could be your network Id is not matching you can update that in settings-> network) 
      Go to account icon and select import account add your dummy account private key and it will import
      There is a button called not connected on the dashboard 
8. npx hardhat run scripts/deploy.ts --network localhost (to deploy the app in local environment)
    It will compile and deploy the contract
    It will give the deployed address of the contract make sure Frontend is using the address while making transaction.
    
(optional)
9. npx hardhat compile(to compile the contract)
10. npx hardhat test(to run the test cases)


Th flow of application:

1.In scripts deploy.ts file I am calling Wedding Ring Contract first and sending the address to WeddingManager Contract so it will deploy both the contract no need to make any changes(in terminal you can read their addresses)

2. Src folder -> pages->
3.(_app.js) is fully codded and need no modification it renders navigation bar and all the other components
4. index.js -> is the home page you see when you run the app in the browser(needs to add pervious wedding to show)
5. resgister.js -> implements the create Wedding functionality
6. wedding.js -> implements minting the ring , exchanging the ring , send gifts, annulment.
