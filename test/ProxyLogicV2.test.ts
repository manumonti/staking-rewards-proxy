import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { Contract, ContractFactory } from "ethers";

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
  let acc1: SignerWithAddress;
  let t: Contract;
  let council: SignerWithAddress;
  let ProxyLogicV1: ContractFactory;
  let ProxyLogicV2: ContractFactory;
  let futureRewards: Contract;
  let claimableRewards: Contract;

  before(async function () {
    t = await ethers.getContractAt("IERC20", tAddr);
    [acc1] = await ethers.getSigners();
    council = await ethers.getImpersonatedSigner(councilAddr);
    ProxyLogicV1 = await ethers.getContractFactory("ProxyLogicV1");
    ProxyLogicV2 = await ethers.getContractFactory("ProxyLogicV2");
    claimableRewards = await ethers.getContractAt(
      dsProxyABI,
      claimableRewardsProxyAddr
    );
    futureRewards = await ethers.getContractAt(
      dsProxyABI,
      futureRewardsProxyAddr
    );
  });

  async function approveClaimableRewardsSpendingFutureRewardsTFixture() {
    const amount = 1000;

    const callDataV1 = ProxyLogicV1.interface.encodeFunctionData(
      "approveT(address,uint256)",
      [claimableRewards.address, amount]
    );

    await futureRewards
      .connect(council)
      ["execute(address,bytes)"](proxyLogicV1Addr, callDataV1, {
        gasLimit: 100000,
      });
  }

  it("Should not top up if T is not approved", async function () {
    const amount = 1000;

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

  it("Should top up if T spent is previously approved", async function () {
    const amount = 1000;

    const futureRewardsBalBefore = await t.balanceOf(futureRewards.address);
    const claimableRewardsBalBefore = await t.balanceOf(
      claimableRewards.address
    );
    const merkleDistAllowanceBefore = await t.allowance(
      claimableRewards.address,
      merkleDistAddr
    );

    // First future rewards proxy must approve the spent of the T rewards by
    // claimable rewards proxy
    await loadFixture(approveClaimableRewardsSpendingFutureRewardsTFixture);

    // Now that claimable rewards proxy can spent future rewards T, we can call
    // topUpClaimableRewards() method
    const callDataV2 = ProxyLogicV2.interface.encodeFunctionData(
      "topUpClaimableRewards(uint256)",
      [amount]
    );

    await claimableRewards
      .connect(council)
      ["execute(address,bytes)"](proxyLogicV2Addr, callDataV2, {
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
    const amount = 0;

    await loadFixture(approveClaimableRewardsSpendingFutureRewardsTFixture);

    const callDataV2 = ProxyLogicV2.interface.encodeFunctionData(
      "topUpClaimableRewards(uint256)",
      [amount]
    );

    await expect(
      claimableRewards
        .connect(council)
        ["execute(address,bytes)"](proxyLogicV2Addr, callDataV2, {
          gasLimit: 100000,
        })
    ).to.be.reverted;
  });

  it("Should not top up with an external account", async function () {
    const amount = 1000;

    await loadFixture(approveClaimableRewardsSpendingFutureRewardsTFixture);

    const callDataV2 = ProxyLogicV2.interface.encodeFunctionData(
      "topUpClaimableRewards(uint256)",
      [amount]
    );

    await expect(
      claimableRewards
        .connect(acc1)
        ["execute(address,bytes)"](proxyLogicV2Addr, callDataV2, {
          gasLimit: 100000,
        })
    ).to.be.reverted;
  });

  it("Should not top up if insufficient T approved", async function () {
    // Amount approved in the following fixture is 1000
    const amount = 5000;

    await loadFixture(approveClaimableRewardsSpendingFutureRewardsTFixture);

    const callDataV2 = ProxyLogicV2.interface.encodeFunctionData(
      "topUpClaimableRewards(uint256)",
      [amount]
    );

    await expect(
      claimableRewards
        .connect(council)
        ["execute(address,bytes)"](proxyLogicV2Addr, callDataV2, {
          gasLimit: 100000,
        })
    ).to.be.reverted;
  });
});
