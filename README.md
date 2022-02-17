# NFT Asset API

This API provides an easy method of fetching all NFTs belonging to a specific wallet & project regardless of whether or not the NFTs are staked.

# Setup

1. Run `npm install`.
2. Create a `.env` in the main directory and include the below code:

```
RPC=
MAINNET_CONTRACT_ADDRESS=
OPENSEA_API_KEY=
```
Please add your RPC, Mainnet Staking Contract Address and OpenSea API Key in this file.

3. Navigate to `./routes/staking.js`. Change the `getStakedWulfz()` function to the desired read function (returning all staked NFTs).
4. Copy and paste the contract ABI in `./ABI/staking.json`.
5. Run `npm start` to start the API on localhost.

To test the API, go to `https://localhost:8080/account/wallet_address`

Done!
