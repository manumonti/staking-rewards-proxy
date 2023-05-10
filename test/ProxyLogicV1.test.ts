import { reset, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { config, ethers } from "hardhat";

import {
  tAddr,
  councilAddr,
  futureRewardsProxyAddr,
  claimableRewardsProxyAddr,
  proxyLogicV1Addr,
  dsProxyABI,
} from "./constants";

describe("ProxyLogicV1", function () {
  async function getAccountsAndContracts() {
    const t = await ethers.getContractAt("IERC20", tAddr);
    const [acc1] = await ethers.getSigners();
    const council = await ethers.getImpersonatedSigner(councilAddr);
    const ProxyLogicV1 = await ethers.getContractFactory("ProxyLogicV1");
    const futureRewards = await ethers.getContractAt(
      dsProxyABI,
      futureRewardsProxyAddr
    );
    const claimableRewards = await ethers.getContractAt(
      dsProxyABI,
      claimableRewardsProxyAddr
    );

    return {
      t,
      acc1,
      council,
      ProxyLogicV1,
      futureRewards,
      claimableRewards,
    };
  }

  before (async function() {
    await reset(
      config.networks.hardhat.forking?.url,
      config.networks.hardhat.forking?.blockNumber
    );
  });

  describe("transferT", function () {
    it("should council transferT from proxy to other addr", async function () {
      const { t, acc1, council, ProxyLogicV1, futureRewards } =
        await loadFixture(getAccountsAndContracts);
      const amount = 1000;
      const futureRewardsBalBefore = await t.balanceOf(futureRewards.address);
      const acc1BalBefore = await t.balanceOf(acc1.address);

      const callData = ProxyLogicV1.interface.encodeFunctionData(
        "transferT(address,uint256)",
        [acc1.address, amount]
      );

      await futureRewards
        .connect(council)
        ["execute(address,bytes)"](proxyLogicV1Addr, callData, {
          gasLimit: 100000,
        });

      const futureRewardsBalAfter = await t.balanceOf(futureRewards.address);
      const acc1BalAfter = await t.balanceOf(acc1.address);

      expect(futureRewardsBalBefore.sub(amount)).to.be.equal(
        futureRewardsBalAfter
      );
      expect(acc1BalBefore.add(amount)).to.be.equal(acc1BalAfter);
    });

    it("should an external account not transferT from proxy", async function () {
      const { acc1, ProxyLogicV1, futureRewards } = await loadFixture(
        getAccountsAndContracts
      );
      const amount = 1000;

      const callData = ProxyLogicV1.interface.encodeFunctionData(
        "transferT(address,uint256)",
        [acc1.address, amount]
      );

      await expect(
        futureRewards
          .connect(acc1)
          ["execute(address,bytes)"](proxyLogicV1Addr, callData, {
            gasLimit: 100000,
          })
      ).to.be.reverted;
    });
  });

  describe("approveT", function () {
    it("should council approveT from proxy to other addr", async function () {
      const { t, acc1, council, ProxyLogicV1, futureRewards } =
        await loadFixture(getAccountsAndContracts);
      const amount = 1000;
      const allowanceBefore = await t.allowance(
        futureRewards.address,
        acc1.address
      );

      const callData = ProxyLogicV1.interface.encodeFunctionData(
        "approveT(address,uint256)",
        [acc1.address, amount]
      );

      await futureRewards
        .connect(council)
        ["execute(address,bytes)"](proxyLogicV1Addr, callData, {
          gasLimit: 100000,
        });

      const allowanceAfter = await t.allowance(
        futureRewards.address,
        acc1.address
      );

      expect(allowanceBefore.add(1000)).to.be.equal(allowanceAfter);
    });

    it("should an external account not approveT from proxy", async function () {
      const { acc1, ProxyLogicV1, futureRewards } = await loadFixture(
        getAccountsAndContracts
      );
      const amount = 1000;

      const callData = ProxyLogicV1.interface.encodeFunctionData(
        "approveT(address,uint256)",
        [acc1.address, amount]
      );

      await expect(
        futureRewards
          .connect(acc1)
          ["execute(address,bytes)"](proxyLogicV1Addr, callData, {
            gasLimit: 100000,
          })
      ).to.be.reverted;
    });
  });

  describe("transferTFrom", function () {
    const amount = 1000;

    it("should council transferTFrom proxy to other proxy", async function () {
      const {
        t,
        acc1,
        council,
        ProxyLogicV1,
        futureRewards,
        claimableRewards,
      } = await loadFixture(getAccountsAndContracts);

      const approveCallData = ProxyLogicV1.interface.encodeFunctionData(
        "approveT(address,uint256)",
        [claimableRewards.address, amount]
      );
      await futureRewards
        .connect(council)
        ["execute(address,bytes)"](proxyLogicV1Addr, approveCallData, {
          gasLimit: 100000,
        });

      const futureRewardsBalBefore = await t.balanceOf(futureRewards.address);
      const acc1BalBefore = await t.balanceOf(acc1.address);

      const transferCallData = ProxyLogicV1.interface.encodeFunctionData(
        "transferTFrom(address,address,uint256)",
        [futureRewards.address, acc1.address, amount]
      );

      await claimableRewards
        .connect(council)
        ["execute(address,bytes)"](proxyLogicV1Addr, transferCallData, {
          gasLimit: 100000,
        });

      const futureRewardsBalAfter = await t.balanceOf(futureRewards.address);
      const acc1BalAfter = await t.balanceOf(acc1.address);

      expect(futureRewardsBalBefore.sub(amount)).to.be.equal(
        futureRewardsBalAfter
      );
      expect(acc1BalBefore.add(amount)).to.be.equal(acc1BalAfter);
    });

    it("should a not approved account transferT", async function () {
      const { acc1, council, ProxyLogicV1, futureRewards, claimableRewards } =
        await loadFixture(getAccountsAndContracts);
      const amount = 1000;

      const approveCallData = ProxyLogicV1.interface.encodeFunctionData(
        "approveT(address,uint256)",
        [claimableRewards.address, amount]
      );
      await futureRewards
        .connect(council)
        ["execute(address,bytes)"](proxyLogicV1Addr, approveCallData, {
          gasLimit: 100000,
        });

      const transferCallData = ProxyLogicV1.interface.encodeFunctionData(
        "transferTFrom(address,address,uint256)",
        [futureRewards.address, acc1.address, amount]
      );

      await expect(
        futureRewards
          .connect(acc1)
          ["execute(address,bytes)"](proxyLogicV1Addr, transferCallData, {
            gasLimit: 100000,
          })
      ).to.be.reverted;
    });
  });
});
