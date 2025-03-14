/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { ethers } from "ethers";
import {
  DeployContractOptions,
  FactoryOptions,
  HardhatEthersHelpers as HardhatEthersHelpersBase,
} from "@nomicfoundation/hardhat-ethers/types";

import * as Contracts from ".";

declare module "hardhat/types/runtime" {
  interface HardhatEthersHelpers extends HardhatEthersHelpersBase {
    getContractFactory(
      name: "Ownable",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.Ownable__factory>;
    getContractFactory(
      name: "IERC1155Errors",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.IERC1155Errors__factory>;
    getContractFactory(
      name: "IERC20Errors",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.IERC20Errors__factory>;
    getContractFactory(
      name: "IERC721Errors",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.IERC721Errors__factory>;
    getContractFactory(
      name: "IERC1363",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.IERC1363__factory>;
    getContractFactory(
      name: "ERC20",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.ERC20__factory>;
    getContractFactory(
      name: "IERC20Metadata",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.IERC20Metadata__factory>;
    getContractFactory(
      name: "IERC20",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.IERC20__factory>;
    getContractFactory(
      name: "SafeERC20",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.SafeERC20__factory>;
    getContractFactory(
      name: "IERC165",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.IERC165__factory>;
    getContractFactory(
      name: "IUniswapV2Router01",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.IUniswapV2Router01__factory>;
    getContractFactory(
      name: "IUniswapV2Router02",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.IUniswapV2Router02__factory>;
    getContractFactory(
      name: "IWETH",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.IWETH__factory>;
    getContractFactory(
      name: "Dtf",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.Dtf__factory>;
    getContractFactory(
      name: "DtfShareToken",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.DtfShareToken__factory>;
    getContractFactory(
      name: "DtfFactory",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.DtfFactory__factory>;
    getContractFactory(
      name: "FundBytecode",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.FundBytecode__factory>;
    getContractFactory(
      name: "ILairryFinkFund",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.ILairryFinkFund__factory>;
    getContractFactory(
      name: "TestToken",
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<Contracts.TestToken__factory>;

    getContractAt(
      name: "Ownable",
      address: string | ethers.Addressable,
      signer?: ethers.Signer
    ): Promise<Contracts.Ownable>;
    getContractAt(
      name: "IERC1155Errors",
      address: string | ethers.Addressable,
      signer?: ethers.Signer
    ): Promise<Contracts.IERC1155Errors>;
    getContractAt(
      name: "IERC20Errors",
      address: string | ethers.Addressable,
      signer?: ethers.Signer
    ): Promise<Contracts.IERC20Errors>;
    getContractAt(
      name: "IERC721Errors",
      address: string | ethers.Addressable,
      signer?: ethers.Signer
    ): Promise<Contracts.IERC721Errors>;
    getContractAt(
      name: "IERC1363",
      address: string | ethers.Addressable,
      signer?: ethers.Signer
    ): Promise<Contracts.IERC1363>;
    getContractAt(
      name: "ERC20",
      address: string | ethers.Addressable,
      signer?: ethers.Signer
    ): Promise<Contracts.ERC20>;
    getContractAt(
      name: "IERC20Metadata",
      address: string | ethers.Addressable,
      signer?: ethers.Signer
    ): Promise<Contracts.IERC20Metadata>;
    getContractAt(
      name: "IERC20",
      address: string | ethers.Addressable,
      signer?: ethers.Signer
    ): Promise<Contracts.IERC20>;
    getContractAt(
      name: "SafeERC20",
      address: string | ethers.Addressable,
      signer?: ethers.Signer
    ): Promise<Contracts.SafeERC20>;
    getContractAt(
      name: "IERC165",
      address: string | ethers.Addressable,
      signer?: ethers.Signer
    ): Promise<Contracts.IERC165>;
    getContractAt(
      name: "IUniswapV2Router01",
      address: string | ethers.Addressable,
      signer?: ethers.Signer
    ): Promise<Contracts.IUniswapV2Router01>;
    getContractAt(
      name: "IUniswapV2Router02",
      address: string | ethers.Addressable,
      signer?: ethers.Signer
    ): Promise<Contracts.IUniswapV2Router02>;
    getContractAt(
      name: "IWETH",
      address: string | ethers.Addressable,
      signer?: ethers.Signer
    ): Promise<Contracts.IWETH>;
    getContractAt(
      name: "Dtf",
      address: string | ethers.Addressable,
      signer?: ethers.Signer
    ): Promise<Contracts.Dtf>;
    getContractAt(
      name: "DtfShareToken",
      address: string | ethers.Addressable,
      signer?: ethers.Signer
    ): Promise<Contracts.DtfShareToken>;
    getContractAt(
      name: "DtfFactory",
      address: string | ethers.Addressable,
      signer?: ethers.Signer
    ): Promise<Contracts.DtfFactory>;
    getContractAt(
      name: "FundBytecode",
      address: string | ethers.Addressable,
      signer?: ethers.Signer
    ): Promise<Contracts.FundBytecode>;
    getContractAt(
      name: "ILairryFinkFund",
      address: string | ethers.Addressable,
      signer?: ethers.Signer
    ): Promise<Contracts.ILairryFinkFund>;
    getContractAt(
      name: "TestToken",
      address: string | ethers.Addressable,
      signer?: ethers.Signer
    ): Promise<Contracts.TestToken>;

    deployContract(
      name: "Ownable",
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<Contracts.Ownable>;
    deployContract(
      name: "IERC1155Errors",
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<Contracts.IERC1155Errors>;
    deployContract(
      name: "IERC20Errors",
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<Contracts.IERC20Errors>;
    deployContract(
      name: "IERC721Errors",
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<Contracts.IERC721Errors>;
    deployContract(
      name: "IERC1363",
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<Contracts.IERC1363>;
    deployContract(
      name: "ERC20",
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<Contracts.ERC20>;
    deployContract(
      name: "IERC20Metadata",
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<Contracts.IERC20Metadata>;
    deployContract(
      name: "IERC20",
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<Contracts.IERC20>;
    deployContract(
      name: "SafeERC20",
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<Contracts.SafeERC20>;
    deployContract(
      name: "IERC165",
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<Contracts.IERC165>;
    deployContract(
      name: "IUniswapV2Router01",
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<Contracts.IUniswapV2Router01>;
    deployContract(
      name: "IUniswapV2Router02",
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<Contracts.IUniswapV2Router02>;
    deployContract(
      name: "IWETH",
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<Contracts.IWETH>;
    deployContract(
      name: "Dtf",
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<Contracts.Dtf>;
    deployContract(
      name: "DtfShareToken",
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<Contracts.DtfShareToken>;
    deployContract(
      name: "DtfFactory",
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<Contracts.DtfFactory>;
    deployContract(
      name: "FundBytecode",
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<Contracts.FundBytecode>;
    deployContract(
      name: "ILairryFinkFund",
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<Contracts.ILairryFinkFund>;
    deployContract(
      name: "TestToken",
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<Contracts.TestToken>;

    deployContract(
      name: "Ownable",
      args: any[],
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<Contracts.Ownable>;
    deployContract(
      name: "IERC1155Errors",
      args: any[],
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<Contracts.IERC1155Errors>;
    deployContract(
      name: "IERC20Errors",
      args: any[],
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<Contracts.IERC20Errors>;
    deployContract(
      name: "IERC721Errors",
      args: any[],
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<Contracts.IERC721Errors>;
    deployContract(
      name: "IERC1363",
      args: any[],
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<Contracts.IERC1363>;
    deployContract(
      name: "ERC20",
      args: any[],
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<Contracts.ERC20>;
    deployContract(
      name: "IERC20Metadata",
      args: any[],
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<Contracts.IERC20Metadata>;
    deployContract(
      name: "IERC20",
      args: any[],
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<Contracts.IERC20>;
    deployContract(
      name: "SafeERC20",
      args: any[],
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<Contracts.SafeERC20>;
    deployContract(
      name: "IERC165",
      args: any[],
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<Contracts.IERC165>;
    deployContract(
      name: "IUniswapV2Router01",
      args: any[],
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<Contracts.IUniswapV2Router01>;
    deployContract(
      name: "IUniswapV2Router02",
      args: any[],
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<Contracts.IUniswapV2Router02>;
    deployContract(
      name: "IWETH",
      args: any[],
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<Contracts.IWETH>;
    deployContract(
      name: "Dtf",
      args: any[],
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<Contracts.Dtf>;
    deployContract(
      name: "DtfShareToken",
      args: any[],
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<Contracts.DtfShareToken>;
    deployContract(
      name: "DtfFactory",
      args: any[],
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<Contracts.DtfFactory>;
    deployContract(
      name: "FundBytecode",
      args: any[],
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<Contracts.FundBytecode>;
    deployContract(
      name: "ILairryFinkFund",
      args: any[],
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<Contracts.ILairryFinkFund>;
    deployContract(
      name: "TestToken",
      args: any[],
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<Contracts.TestToken>;

    // default types
    getContractFactory(
      name: string,
      signerOrOptions?: ethers.Signer | FactoryOptions
    ): Promise<ethers.ContractFactory>;
    getContractFactory(
      abi: any[],
      bytecode: ethers.BytesLike,
      signer?: ethers.Signer
    ): Promise<ethers.ContractFactory>;
    getContractAt(
      nameOrAbi: string | any[],
      address: string | ethers.Addressable,
      signer?: ethers.Signer
    ): Promise<ethers.Contract>;
    deployContract(
      name: string,
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<ethers.Contract>;
    deployContract(
      name: string,
      args: any[],
      signerOrOptions?: ethers.Signer | DeployContractOptions
    ): Promise<ethers.Contract>;
  }
}
