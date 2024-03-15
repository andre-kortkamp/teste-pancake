const hardhat = require("hardhat");
const { ethers } = require("ethers");
require("dotenv").config();

const poolAbi = require("./pancakeV3PoolABI.json");
const poolArdxAddress = "0xEbA0b050F2086EA71B9E6a4b88762568D9a96C21";

const newPositionAbi = require("./pancakeNewPosition.json");
const newPositionAddress = "0x427bF5b37357632377eCbEC9de3626C71A5396c1";

const factoryAbi = require("./pancakeFactory.json");
const factoryAddress = "0x0BFbCF9fa4f9C56B0F40a671Ad40E0805A091865";

const wethAbi = require("./ardx.json");
const usdcAddress = "0xCec56059C4C405672D7130a3ED852e4d785cC219";
const usdcAbi = require("./erc20.json");
const wethAddress = "0xe5AC2a886c02d4462F941704D1B7650143ba84C2";

async function getPoolData(poolContract) {
  const [tickSpacing, fee, liquidity, slot0] = await Promise.all([
    poolContract.tickSpacing(),
    poolContract.fee(),
    poolContract.liquidity(),
    poolContract.slot0(),
  ]);

  // console.log(tickSpacing, fee, liquidity, slot0);
  return {
    tickSpacing: tickSpacing,
    fee: fee,
    liquidity: liquidity,
    sqrtPriceX96: slot0[0],
    tick: slot0[1],
  };
}

async function main() {
  const provider = new ethers.providers.JsonRpcProvider(
    "https://bsc-testnet-rpc.publicnode.com"
  );

  const PoolContract = new ethers.Contract(poolArdxAddress, poolAbi, provider);
  const newPositionContract = new ethers.Contract(
    newPositionAddress,
    newPositionAbi,
    provider
  );

  //const poolAddress = await factoryContract.getPool(
  //  wethAddress,
  //  usdcAddress,
  //  "2500"
  //);
  //console.log("poolAddress", poolAddress);

  const privateKey = process.env.PRIVATE_KEY;
  const wallet = new ethers.Wallet(privateKey, provider);
  const signer = wallet.connect(provider);

  const wethContract = new ethers.Contract(wethAddress, wethAbi, provider);
  const usdcContract = new ethers.Contract(usdcAddress, usdcAbi, provider);

  const testNewPostion = await newPositionContract
    .connect(signer)
    .positions(11862);
  console.log(
    testNewPostion.tickLower,
    testNewPostion.tickUpper,
    testNewPostion.liquidity.toString()
  );
  const poolData = await getPoolData(PoolContract);
  //console.log(poolData);

  const test = await PoolContract.tickSpacing();
  //console.log(test);

  const poolLiquidity = await PoolContract.connect(signer).collect(
    signer.address,
    284450,
    286550,
    BigInt(1000000000000000000),
    BigInt(1000000000000000000)
  );
  //console.log(poolLiquidity);
  const test2 = await poolLiquidity.wait();
  console.log(test2);

  // const amountIn = ethers.utils.parseUnits("1", "18");
  //
  // const test = await wethContract
  //   .connect(signer)
  //   .approve(smartRouterAddress, amountIn.toString());
  //
  // console.log(test);
  // await test.wait();
  // console.log("hash transação:", test.hash);
  //
  // const smartRouterContract = new ethers.Contract(
  //   smartRouterAddress,
  //   smartRouterAbi,
  //   provider
  // );
  //
  // const params = {
  //   tokenIn: wethAddress,
  //   tokenOut: usdcAddress,
  //   fee: "2500",
  //   recipient: signer.address,
  //   deadline: Math.floor(Date.now() / 1000) + 60 * 10,
  //   amountIn,
  //   amountOutMinimum: 0,
  //   sqrtPriceLimitX96: 0,
  // };

  //);
}

main();
