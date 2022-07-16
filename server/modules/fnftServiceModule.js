const logger = require('../config/winston');
//const walletIns = require('./walletProvider');
const FractionalNFTJSON = require('../contractFiles/FractionalNFT.json')
const FNFTokenJSON = require('../contractFiles/FNFToken.json')
const utility = require('./utility');
const deploy = require('./deploy')

let ownerAddress

let web3,FractionalNFTAddress,contractInstance;
let FNFTokenAddress,FNFTokenInstance,FractionalNFT,FractionalNFTReceipt;

const deployContract = async (address) => {
    [web3,FractionalNFT] = await deploy(process.env.FractionalNFT,address)
}

const createToken = async function(reqBody){
    try {
        logger.info('method createTokens invoked');
        logger.info('reqBody',reqBody);
        let transactioHash;
        const contractName = process.env['FNFT_CONTRACT_ADDRESS'];
        logger.info(`contractName-----------${contractName}`);
        //await walletIns.getWalletProvider();
        const contractInstance = await utility.getContractInstance(contractName, FractionalNFTJSON.abi);
        console.log('============>', JSON.stringify(contractInstance.methods));
        logger.info(`contractInstance methods--${JSON.stringify(contractInstance.methods)}`);
        const transactionObject = {
            from: reqBody.address,
            gasPrice: 0,
            gas: 6721975
          };
        // const tokenId = utility.between(1, 200000);
        logger.info(`----------tokenId---------${tokenId}`);
        reqObj = {}
        reqObj.toAddress = reqBody.toAddress
        reqObj.tokenURI = reqBody.tokenURI
        reqObj.totalNoOfFractions = reqBody.totalNoOfFractions
        console.log('reqObj-------',reqObj);
        console.log('====> ', contractInstance.methods);
        await contractInstance.methods.mint(reqBody.toAddress,reqBody.tokenURI,reqBody.totalNoOfFractions).send(transactionObject)
            .then(function (receipt) {
                transactioHash = receipt.transactionHash;
                logger.debug(`Transaction Receipt = ${receipt.transactionHash} Block Number= ${receipt.blockNumber}`);
            })
            .catch(function (error) {
                logger.error(`Exception occurred in  contract method:: ${error.stack}`);
                throw error;

            });
        return {
            transactionReceipt:transactioHash,
        };
    }catch (error) {
       logger.error(error.stack);
       throw error.message;
    }
};

const getNFTTokenId = () => {
    return FractionalNFTReceipt.events['Transfer']['returnValues'][2]
}

const getNFTTokenIdByIndex = async (index=0) => {
    return contractInstance.methods.tokenByIndex(index)
}

const getFNFTContractAdress = async () => {
    const res = await contractInstance.methods.FNFT(getNFTTokenId()).call()
    return res['fractionalToken'];
}

const getNFTContractAddress = async () => {
    return await FractionalNFT.options.address
}

const deployFNFTContract = async () => {
    // logger.info('loading FNFToken contract');
    try
    {
        FNFTokenInstance = new web3.eth.Contract(FNFTokenJSON.abi)
        FNFTokenInstance.options.address = await getFNFTContractAdress()

        // logger.info(`FNFToken contract loaded`);
    }
    catch(error)
    {
        // logger.error(`Exception occurred in deployFNFTContract method :: ${error.stack}`);
        throw error;
    }
    
}

const getTotalNFTSupply = async () => {
    return await contractInstance.methods.totalSupply().call()   
}

const getTotalFNFTSupply = async () => {
    return await FNFTokenInstance.methods.totalSupply().call();
}

const getFNFTBalance = async (owner) => {
    let bal = await FNFTokenInstance.methods.balanceOf(owner).call();
    return (bal / await web3.utils.toWei(web3.utils.BN(1),'ether'))
}

const getNFTBalance = (owner) => {
    return contractInstance.methods.balanceOf(owner).call();
}

const getNameOfNFT = () => {
    return contractInstance.methods.name().call()
}

const getNameOfFNFT =  () => {
    return FNFTokenInstance.methods.name().call()
}

const getSymbolOfNFT = () => {
    return contractInstance.methods.symbol().call()
}

const getSymbolOfFNFT = () => {
    return  FNFTokenInstance.methods.symbol().call()
}

const getOwnerOfNFT =  () => {
    return contractInstance.methods.owner().call()
}

const getOwnerOfFNFT =  () => {
    return  FNFTokenInstance.methods.owner().call()
}

const getOwnerOfNFTByIndex =  (index=0) => {
    return  contractInstance.methods.ownerOf(index).call()
}

const getNFTTokenURI =  (tokenId) => {
    return contractInstance.methods.tokenURI(tokenId).call()
}

const getNFTTokenOfOwnerByIndex = (tokenId,owner) => {
    console.log("Owner "+owner);
    return contractInstance.methods.tokenOfOwnerByIndex(owner,tokenId).call()
}
module.exports = {
    createToken,
    getFNFTContractAdress,
    deployFNFTContract,
    getNFTTokenId,
    getTotalNFTSupply,
    getTotalFNFTSupply,
    getFNFTBalance,
    getNFTBalance,
    getNFTTokenIdByIndex,
    getNameOfNFT,
    getNameOfFNFT,
    getSymbolOfNFT,
    getSymbolOfFNFT,
    getOwnerOfNFT,
    getOwnerOfFNFT,
    getOwnerOfNFTByIndex,
    getNFTTokenURI
};




