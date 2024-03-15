const { ethers } = require("ethers");
require("dotenv").config();

const smartRouterAbi = require("./pancakeSmartRouter.json");
const smartRouterAddress = "0x9a489505a00cE272eAa5e07Dba6491314CaE3796";

const factoryAbi = require("./pancakeFactory.json");
const factoryAddress = "0x0BFbCF9fa4f9C56B0F40a671Ad40E0805A091865";

const wethAbi = require("./ardx.json");
const usdcAddress = "0x003c3a1Ea8C4fA05ED2AE5e20dDa7528aAD07121";
const usdcAbi = require("./erc20.json");
const wethAddress = "0xe5AC2a886c02d4462F941704D1B7650143ba84C2";

async function main() {
  const provider = new ethers.providers.JsonRpcProvider(
    "https://purple-empty-road.bsc-testnet.quiknode.pro/ec72708b9e7ed4646b9086b5f9350f813af9988a/"
  );

  const factoryContract = new ethers.Contract(
    factoryAddress,
    factoryAbi,
    provider
  );

  const poolAddress =
    //"0x61efefc224b52e33ddecc0ce8c57c9e2425b6ff4";
    await factoryContract.getPool(wethAddress, usdcAddress, "2500");

  console.log("poolAddress", poolAddress);

  const privateKey = process.env.PRIVATE_KEY;
  const signer = new ethers.Wallet(privateKey, provider);
  //console.log(signer.getAddress);
  // const signer = wallet.connect(provider);

  const wethContract = new ethers.Contract(wethAddress, wethAbi, provider);
  const usdcContract = new ethers.Contract(usdcAddress, usdcAbi, provider);

  const amountIn = ethers.utils.parseUnits("1", "6");

  const gasPrice = await provider.getGasPrice();
  console.log(gasPrice.toString());

  const balance = await usdcContract.balanceOf(signer.address);
  console.log(ethers.utils.formatUnits(balance.toString(), 6));

  const tx = await usdcContract
    .connect(signer)
    .approve(smartRouterAddress, amountIn);

  // console.log(test);

  const hash = await tx.wait();
  console.log("hash transação:", hash.hash);

  const smartRouterContract = new ethers.Contract(
    smartRouterAddress,
    smartRouterAbi,
    provider
  );

  const params = {
    tokenIn: wethAddress,
    tokenOut: usdcAddress,
    fee: "2500",
    recipient: signer.address,
    deadline: Math.floor(Date.now() / 1000) + 60 * 10,
    amountIn,
    amountOutMinimum: 0,
    sqrtPriceLimitX96: 0,
  };

  let wethBalance;
  let usdcBalance;
  wethBalance = await wethContract.balanceOf(signer.address);
  usdcBalance = await usdcContract.balanceOf(signer.address);
  console.log("================= ANTES SWAP");
  console.log(
    "SALDO ARDOXUS: ARDX",
    ethers.utils.formatUnits(wethBalance.toString(), 18),
    "ARDX"
  );
  console.log(
    "SALDO USDC:",
    ethers.utils.formatUnits(usdcBalance.toString(), 6),
    "USDC"
  );

  const txSwap = await smartRouterContract
    .connect(signer)
    .exactInputSingle(params, {
      gasLimit: ethers.utils.hexlify(1000000),
    });
  await txSwap.wait();

  wethBalance = await wethContract.balanceOf(signer.address);
  usdcBalance = await usdcContract.balanceOf(signer.address);
  console.log("================= DEPOIS SWAP");
  console.log(
    "SALDO ARDOXUS:",
    ethers.utils.formatUnits(wethBalance.toString(), 18),
    "ARDX"
  );
  console.log(
    "SALDO USDC:",
    ethers.utils.formatUnits(usdcBalance.toString(), 6),
    "USDC"
  );
}

main();
