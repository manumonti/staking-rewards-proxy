import { ethers } from "hardhat";

async function main() {
  const ProxyLogicV2 = await ethers.getContractFactory("ProxyLogicV2");
  const proxyLogicV2 = await ProxyLogicV2.deploy();
  await proxyLogicV2.deployed();
  console.log(proxyLogicV2.address)
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
