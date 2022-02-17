var express = require('express');
var router = express.Router();
const ethers = require('ethers')
const dotenv = require('dotenv')
const axios = require('axios');
const fs = require('fs');
const STAKING_ABI = require('../ABI/staking.json')
dotenv.config()


const mainnet_provider = new ethers.providers.JsonRpcProvider(process.env.RPC)

const mainnet_contract = new ethers.Contract(
    process.env.MAINNET_CONTRACT_ADDRESS,
    STAKING_ABI,
    mainnet_provider
)

router.get("/:account", async function (req, res) {
    var address = req.params.account;
    let nfts_owned = [];
    let response_data = [];

    // check if address is valid
    if (!ethers.utils.isAddress(address)) {
        res.status(400).json({
            "error": "Invalid address"
        })
    }
    else {

        const name = await mainnet_contract.name()
        console.log(name)

        // set the function that returns staked nfts here.
        const staked = await mainnet_contract.getStakedWulfz(
            address
        )

        for (let i = 0; i < staked.length; i++) {
            nfts_owned.push(parseInt(staked[i]))

        }

        let contract_address = process.env.MAINNET_CONTRACT_ADDRESS
        let url = 'https://api.opensea.io/api/v1/assets'

        let config = {
            headers: {
                'x-api-key': process.env.OPENSEA_API_KEY
            }
        }

        await axios.get(`${url}?owner=${address}&asset_contract_address=${contract_address}`, config)
            .then(function (response) {

                // iterate through each token_id push each token id to the wulfz_owned array
                for (let i = 0; i < response.data.assets.length; i++) {
                    nfts_owned.push(parseInt(response.data.assets[i].token_id));
                }
            })
            .catch(function (error) {
                // handle error
                console.log(error);
            })

        if (nfts_owned.length == 0) {
            res.status(401).json({
                "error": "No tokens owned."
            })
        }
        else {

            // iterate through the nfts_owned elements and open each file from the metadata folder and return the data as json
            for (let i = 0; i < nfts_owned.length; i++) {
                fs.readFile(`./metadata/${nfts_owned[i]}`, 'utf8', function (err, data) {
                    if (err) {
                        return console.log(err);
                    }
                    let tokenInfo = JSON.parse(data);
                    let token = { "token_id": "", "name": "", "description": "", "marketURL": "", "imageURL": "" };
                    token.token_id = nfts_owned[i];
                    token.name = tokenInfo.name;
                    token.description = tokenInfo.description;
                    token.marketURL = `https://opensea.io/assets/${process.env.MAINNET_CONTRACT_ADDRESS}/${nfts_owned[i]}`;
                    token.imageURL = tokenInfo.imageURL;
                    response_data.push(token);

                    // after the last token is read, return the response_data data as json
                    if (i == nfts_owned.length - 1) {
                        let response = {
                            "message": "Success",
                            "data": response_data
                        }
                        res.status(200).json(
                            response
                        )
                    }

                });
            }
        }
    }
});

//check if user hits the endpoint without an address
router.get("/", async function (req, res) {
    res.status(400).json({
        "error": "No account address provided."
    });
}
);






module.exports = router;