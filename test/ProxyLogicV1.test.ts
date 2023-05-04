import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { Contract, ContractFactory } from "ethers";

import {
  tAddr,
  councilAddr,
  futureRewardsProxyAddr,
  claimableRewardsProxyAddr,
  proxyLogicV1Addr,
  dsProxyABI,
} from "./constants";

describe("ProxyLogicV1", function () {
  let acc1: SignerWithAddress;
  let t: Contract;
  let council: SignerWithAddress;
  let ProxyLogicV1: ContractFactory;
  let futureRewards: Contract;
  let claimableRewards: Contract;

  before(async function () {
    t = await ethers.getContractAt("IERC20", tAddr);
    [acc1] = await ethers.getSigners();
    council = await ethers.getImpersonatedSigner(councilAddr);
    ProxyLogicV1 = await ethers.getContractFactory("ProxyLogicV1");

    futureRewards = await ethers.getContractAt(
      dsProxyABI,
      futureRewardsProxyAddr
    );

    claimableRewards = await ethers.getContractAt(
      dsProxyABI,
      claimableRewardsProxyAddr
    );
  });

  describe("transferT", function () {
    it("should council transferT from proxy to other addr", async function () {
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

    beforeEach(async function () {
      const callData = ProxyLogicV1.interface.encodeFunctionData(
        "approveT(address,uint256)",
        [claimableRewards.address, amount]
      );
      await futureRewards
        .connect(council)
        ["execute(address,bytes)"](proxyLogicV1Addr, callData, {
          gasLimit: 100000,
        });
    });

    it("should council transferTFrom proxy to other proxy", async function () {
      const futureRewardsBalBefore = await t.balanceOf(futureRewards.address);
      const acc1BalBefore = await t.balanceOf(acc1.address);

      const callData = ProxyLogicV1.interface.encodeFunctionData(
        "transferTFrom(address,address,uint256)",
        [futureRewards.address, acc1.address, amount]
      );

      await claimableRewards
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

    it("should a not approved account transferT", async function () {
      const amount = 1000;

      const callData = ProxyLogicV1.interface.encodeFunctionData(
        "transferTFrom(address,address,uint256)",
        [futureRewards.address, acc1.address, amount]
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
});
