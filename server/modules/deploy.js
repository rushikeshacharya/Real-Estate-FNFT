const walletIns = require(`./walletProvider`);
const FractionalNFTJSON = require('../contractFiles/FractionalNFT.json')
const path = require('path');
const fileSys = require('fs');
const solc = require('solc');

function findImports(relativePath) {
  const absolutePath = path.resolve(__dirname, '../../blockchain/node_modules', relativePath);
  const source = fileSys.readFileSync(absolutePath, 'utf8');
  return { contents: source };
}

const CompileContract = (contractName) => {
  const contract = path.resolve(__dirname,'../../blockchain/contracts',contractName);
  console.log("Contract Name : "+contract)
  const contractSource = fileSys.readFileSync(contract,{encoding:"utf-8"});
  console.log("Contract Source Generated.")
  let input = 
  {
      language: "Solidity",
      sources: {
        [contract]: {
          content: contractSource,
        },
      },
     
      settings: {
        outputSelection: {
          "*": {
            "*": ["*"],
          },
        },
        optimizer: {
          enabled: true,
           runs: 200
        }
      },
  };

  let compiledContract = JSON.parse(solc.compile(JSON.stringify(input),{ import: findImports }))
  if(compiledContract.errors)
  {
      console.log("Error While Compiling Contract.")
      console.log(compiledContract["errors"][0].message)
  }
  else
  {	
      const conFileName = Object.keys(compiledContract['contracts'])
      const conName = Object.keys(compiledContract['contracts'][conFileName[0]])
      const conSource = compiledContract['contracts'][conFileName[0]][conName[0]]
      return {abi:conSource['abi'],bytecode:conSource['evm']['bytecode']['object']}
  }    
}

const deploy = async (contractName,account) => {
    const web3 = await walletIns.getWalletProvider() 
    let abi,bytecode,contractInstance;
    console.log('Attempting to deploy from account ',account);
    if(!FractionalNFTJSON)
    {
      [abi,bytecode] = CompileContract(contractName)
    }
    else
    {
      abi = FractionalNFTJSON.abi
      bytecode = FractionalNFTJSON.bytecode
    }
    try {
        contractInstance = await new web3.eth.Contract(abi)
                            .deploy({data:bytecode})
                            .send({gas: '10000000',from:account});

        console.log('Contract deployed to ',contractInstance.options.address);
    
    return [web3,contractInstance]
    } catch (error) {
        console.log(error)   
    }
   
}

module.exports = deploy
