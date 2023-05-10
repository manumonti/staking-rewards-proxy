# Staking Rewards Proxy implementation

This repo contains the ProxyLogic smartcontracts. These are part of the staking rewards distribution
strategy of the Threshold Network:

![Threshold staking rewards workflow](assets/RewardsWorkflow.png)

1. There is an amount of T allocated for the Threshold staking rewards that are going to be
   distributed in the future. For better management of the Threshold treasury and security reasons,
   these future rewards have been deposited on a [DSProxy](https://github.com/dapphub/ds-proxy)
   contract whose owner is the Council multisig wallet. This is the [future rewards
   proxy](https://etherscan.io/address/0xbe3e95dc12c0ae3fac264bf63ef89ec81139e3df)
2. We also have a [claimable rewards
   proxy](https://etherscan.io/address/0xec8183891331a845e2dcf5cd616ee32736e2baa4) where the
   calculated month-distribution rewards are sent month by month.
3. The [MerkleDistribution](https://etherscan.io/address/0xea7ca290c7811d1cc2e79f8d706bd05d8280bd37)
   contract is responsible for allocating the rewards for each staker. When a staker `claim` the
   rewards, the T amount is sent from `claimingRewards` to the corresponding one.
4. For security reasons and to get a more efficient and error-proof workflow, this process is made
   by the special contract: `ProxyLogic`. The methods of these (proxy) contracts are called by
   `futureRewards` and join several smartcontract calls in only one, automating the process and
   making the process easier for the council. The methods of `ProxyLogic` are called by the
   `execute()` method in DSProxy.

## Smartcontract deployments

| Contract     | Address                                    |
| ------------ | ------------------------------------------ |
| ProxyLogicV1 | 0xa604C363d44e04da91F55E6146D09ecDD004f678 |
| ProxyLogicV2 | 0xE9ec5e1c6956625D2F3e08A46D9f5f4c62B563f7 |

## Testing

Tests have been built using Hardhat framework.

You can install the needed dependencies by:

```bash
$ npm install
```

To run the tests is needed to have a .env file with the following. Since Hardhat forking requires an
archive node, Alchemy is recommended.

```Dotenv
FORKING_BLOCK=17179805
FORKING_URL=https://eth-mainnet.g.alchemy.com/v2/<API_KEY>
```

```bash
$ npx hardhat test
```
