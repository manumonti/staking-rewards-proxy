export const tAddr = "0xCdF7028ceAB81fA0C6971208e83fa7872994beE5";
export const councilAddr = "0x9F6e831c8F8939DC0C830C6e492e7cEf4f9C2F5f";
export const futureRewardsProxyAddr =
  "0xbe3e95Dc12C0aE3FAC264Bf63ef89Ec81139E3DF";
export const claimableRewardsProxyAddr =
  "0xec8183891331a845E2DCf5CD616Ee32736E2BAA4";
export const merkleDistAddr =
  "0xeA7CA290c7811d1cC2e79f8d706bD05d8280BD37";
export const proxyLogicV1Addr = "0xa604C363d44e04da91F55E6146D09ecDD004f678";
export const proxyLogicV2Addr = "0xE9ec5e1c6956625D2F3e08A46D9f5f4c62B563f7";
export const dsProxyABI = [
  {
    constant: false,
    inputs: [{ name: "owner_", type: "address" }],
    name: "setOwner",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: false,
    inputs: [
      { name: "_target", type: "address" },
      { name: "_data", type: "bytes" },
    ],
    name: "execute",
    outputs: [{ name: "response", type: "bytes32" }],
    payable: true,
    stateMutability: "payable",
    type: "function",
  },
  {
    constant: false,
    inputs: [
      { name: "_code", type: "bytes" },
      { name: "_data", type: "bytes" },
    ],
    name: "execute",
    outputs: [
      { name: "target", type: "address" },
      { name: "response", type: "bytes32" },
    ],
    payable: true,
    stateMutability: "payable",
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "cache",
    outputs: [{ name: "", type: "address" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: false,
    inputs: [{ name: "authority_", type: "address" }],
    name: "setAuthority",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "owner",
    outputs: [{ name: "", type: "address" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: false,
    inputs: [{ name: "_cacheAddr", type: "address" }],
    name: "setCache",
    outputs: [{ name: "", type: "bool" }],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "authority",
    outputs: [{ name: "", type: "address" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "_cacheAddr", type: "address" }],
    payable: false,
    stateMutability: "nonpayable",
    type: "constructor",
  },
  { payable: true, stateMutability: "payable", type: "fallback" },
  {
    anonymous: true,
    inputs: [
      { indexed: true, name: "sig", type: "bytes4" },
      { indexed: true, name: "guy", type: "address" },
      { indexed: true, name: "foo", type: "bytes32" },
      { indexed: true, name: "bar", type: "bytes32" },
      { indexed: false, name: "wad", type: "uint256" },
      { indexed: false, name: "fax", type: "bytes" },
    ],
    name: "LogNote",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [{ indexed: true, name: "authority", type: "address" }],
    name: "LogSetAuthority",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [{ indexed: true, name: "owner", type: "address" }],
    name: "LogSetOwner",
    type: "event",
  },
];
