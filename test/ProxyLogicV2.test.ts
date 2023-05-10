import { expect } from "chai";
import { config, ethers } from "hardhat";
import { reset, loadFixture } from "@nomicfoundation/hardhat-network-helpers";

import {
  tAddr,
  councilAddr,
  futureRewardsProxyAddr,
  claimableRewardsProxyAddr,
  merkleDistAddr,
  proxyLogicV1Addr,
  proxyLogicV2Addr,
  dsProxyABI,
} from "./constants";

describe("ProxyLogicV2", function () {
  const amount = 1000;

  async function getAccountsAndContracts() {
    const t = await ethers.getContractAt("IERC20", tAddr);
    const [acc1] = await ethers.getSigners();
    const council = await ethers.getImpersonatedSigner(councilAddr);
    const ProxyLogicV1 = await ethers.getContractFactory("ProxyLogicV1");
    const ProxyLogicV2 = await ethers.getContractFactory("ProxyLogicV2");
    const claimableRewards = await ethers.getContractAt(
      dsProxyABI,
      claimableRewardsProxyAddr
    );
    const futureRewards = await ethers.getContractAt(
      dsProxyABI,
      futureRewardsProxyAddr
    );

    // First, future rewards proxy must approve the spent of the T rewards by
    // claimable rewards proxy
    const callData = ProxyLogicV1.interface.encodeFunctionData(
      "approveT(address,uint256)",
      [claimableRewards.address, amount]
    );

    await futureRewards
      .connect(council)
      ["execute(address,bytes)"](proxyLogicV1Addr, callData, {
        gasLimit: 100000,
      });

    return {
      t,
      acc1,
      council,
      ProxyLogicV1,
      ProxyLogicV2,
      claimableRewards,
      futureRewards,
    };
  }

  before(async function () {
    await reset(
      config.networks.hardhat.forking?.url,
      config.networks.hardhat.forking?.blockNumber
    );
  });

  it("Should top up if T spent is previously approved", async function () {
    const { t, council, ProxyLogicV2, futureRewards, claimableRewards } =
      await loadFixture(getAccountsAndContracts);

    const futureRewardsBalBefore = await t.balanceOf(futureRewards.address);
    const claimableRewardsBalBefore = await t.balanceOf(
      claimableRewards.address
    );
    const merkleDistAllowanceBefore = await t.allowance(
      claimableRewards.address,
      merkleDistAddr
    );

    const callData = ProxyLogicV2.interface.encodeFunctionData(
      "topUpClaimableRewards(uint256)",
      [amount]
    );

    await claimableRewards
      .connect(council)
      ["execute(address,bytes)"](proxyLogicV2Addr, callData, {
        gasLimit: 100000,
      });

    const futureRewardsBalAfter = await t.balanceOf(futureRewards.address);
    const claimableRewardsBalAfter = await t.balanceOf(
      claimableRewards.address
    );
    const merkleDistAllowanceAfter = await t.allowance(
      claimableRewards.address,
      merkleDistAddr
    );

    expect(futureRewardsBalBefore.sub(amount)).to.be.equal(
      futureRewardsBalAfter
    );
    expect(claimableRewardsBalBefore.add(amount)).to.be.equal(
      claimableRewardsBalAfter
    );
    expect(merkleDistAllowanceBefore.add(amount)).to.be.equal(
      merkleDistAllowanceAfter
    );
  });

  it("Should revert if top up amount is zero", async function () {
    const topUpAmount = 0;

    const { council, ProxyLogicV2, claimableRewards } = await loadFixture(
      getAccountsAndContracts
    );

    const callData = ProxyLogicV2.interface.encodeFunctionData(
      "topUpClaimableRewards(uint256)",
      [topUpAmount]
    );

    await expect(
      claimableRewards
        .connect(council)
        ["execute(address,bytes)"](proxyLogicV2Addr, callData, {
          gasLimit: 100000,
        })
    ).to.be.reverted;
  });

  it("Should not top up with an external account", async function () {
    const { acc1, ProxyLogicV2, claimableRewards } = await loadFixture(
      getAccountsAndContracts
    );

    const callData = ProxyLogicV2.interface.encodeFunctionData(
      "topUpClaimableRewards(uint256)",
      [amount]
    );

    await expect(
      claimableRewards
        .connect(acc1)
        ["execute(address,bytes)"](proxyLogicV2Addr, callData, {
          gasLimit: 100000,
        })
    ).to.be.reverted;
  });

  it("Should not top up if insufficient T approved", async function () {
    const { council, ProxyLogicV2, claimableRewards } = await loadFixture(
      getAccountsAndContracts
    );

    // Amount actually approved is 1000
    const topUpAmount = 5000;

    const callData = ProxyLogicV2.interface.encodeFunctionData(
      "topUpClaimableRewards(uint256)",
      [topUpAmount]
    );

    await expect(
      claimableRewards
        .connect(council)
        ["execute(address,bytes)"](proxyLogicV2Addr, callData, {
          gasLimit: 100000,
        })
    ).to.be.reverted;
  });

  it("Should not top up if T is not approved", async function () {
    const {
      council,
      ProxyLogicV1,
      ProxyLogicV2,
      claimableRewards,
      futureRewards,
    } = await loadFixture(getAccountsAndContracts);

    // Fixture set the allowance to 1000T. Let's set back the allowance to 0
    const callDataV1 = ProxyLogicV1.interface.encodeFunctionData(
      "approveT(address,uint256)",
      [claimableRewards.address, 0]
    );

    await futureRewards
      .connect(council)
      ["execute(address,bytes)"](proxyLogicV1Addr, callDataV1, {
        gasLimit: 100000,
      });

    const callData = ProxyLogicV2.interface.encodeFunctionData(
      "topUpClaimableRewards(uint256)",
      [amount]
    );

    await expect(
      claimableRewards
        .connect(council)
        ["execute(address,bytes)"](proxyLogicV2Addr, callData, {
          gasLimit: 100000,
        })
    ).to.be.reverted;
  });
});
