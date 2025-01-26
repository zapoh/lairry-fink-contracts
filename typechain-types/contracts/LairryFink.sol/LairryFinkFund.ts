/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import type {
  BaseContract,
  BigNumberish,
  BytesLike,
  FunctionFragment,
  Result,
  Interface,
  EventFragment,
  AddressLike,
  ContractRunner,
  ContractMethod,
  Listener,
} from "ethers";
import type {
  TypedContractEvent,
  TypedDeferredTopicFilter,
  TypedEventLog,
  TypedLogDescription,
  TypedListener,
  TypedContractMethod,
} from "../../common";

export interface LairryFinkFundInterface extends Interface {
  getFunction(
    nameOrSignature:
      | "deposit"
      | "getCreationDepositFee"
      | "getDeadlineOffset"
      | "getDepositFee"
      | "getDepositFeeBalance"
      | "getDepositsEnabled"
      | "getMinimumDeposit"
      | "getNetAssetValue"
      | "getPortfolio"
      | "getReserveTokenAddress"
      | "getReserveTokenBalance"
      | "getShareBalance"
      | "getSharePrice"
      | "getShareTokenAddress"
      | "getSharesOutstanding"
      | "getSlippageTolerance"
      | "getTotalAllocation"
      | "owner"
      | "renounceOwnership"
      | "setAllocation"
      | "setDeadlineOffset"
      | "setDepositFee"
      | "setDepositsEnabled"
      | "setMinimumDeposit"
      | "setSlippageTolerance"
      | "transferOwnership"
      | "withdraw"
      | "withdrawDepositFees"
  ): FunctionFragment;

  getEvent(
    nameOrSignatureOrTopic:
      | "Allocation"
      | "Deposit"
      | "OwnershipTransferred"
      | "Withdraw"
  ): EventFragment;

  encodeFunctionData(
    functionFragment: "deposit",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "getCreationDepositFee",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "getDeadlineOffset",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "getDepositFee",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "getDepositFeeBalance",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "getDepositsEnabled",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "getMinimumDeposit",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "getNetAssetValue",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "getPortfolio",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "getReserveTokenAddress",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "getReserveTokenBalance",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "getShareBalance",
    values: [AddressLike]
  ): string;
  encodeFunctionData(
    functionFragment: "getSharePrice",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "getShareTokenAddress",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "getSharesOutstanding",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "getSlippageTolerance",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "getTotalAllocation",
    values?: undefined
  ): string;
  encodeFunctionData(functionFragment: "owner", values?: undefined): string;
  encodeFunctionData(
    functionFragment: "renounceOwnership",
    values?: undefined
  ): string;
  encodeFunctionData(
    functionFragment: "setAllocation",
    values: [AddressLike, BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "setDeadlineOffset",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "setDepositFee",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "setDepositsEnabled",
    values: [boolean]
  ): string;
  encodeFunctionData(
    functionFragment: "setMinimumDeposit",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "setSlippageTolerance",
    values: [BigNumberish]
  ): string;
  encodeFunctionData(
    functionFragment: "transferOwnership",
    values: [AddressLike]
  ): string;
  encodeFunctionData(
    functionFragment: "withdraw",
    values: [BigNumberish, AddressLike]
  ): string;
  encodeFunctionData(
    functionFragment: "withdrawDepositFees",
    values: [AddressLike, BigNumberish]
  ): string;

  decodeFunctionResult(functionFragment: "deposit", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "getCreationDepositFee",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getDeadlineOffset",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getDepositFee",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getDepositFeeBalance",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getDepositsEnabled",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getMinimumDeposit",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getNetAssetValue",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getPortfolio",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getReserveTokenAddress",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getReserveTokenBalance",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getShareBalance",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getSharePrice",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getShareTokenAddress",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getSharesOutstanding",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getSlippageTolerance",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "getTotalAllocation",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "owner", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "renounceOwnership",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "setAllocation",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "setDeadlineOffset",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "setDepositFee",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "setDepositsEnabled",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "setMinimumDeposit",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "setSlippageTolerance",
    data: BytesLike
  ): Result;
  decodeFunctionResult(
    functionFragment: "transferOwnership",
    data: BytesLike
  ): Result;
  decodeFunctionResult(functionFragment: "withdraw", data: BytesLike): Result;
  decodeFunctionResult(
    functionFragment: "withdrawDepositFees",
    data: BytesLike
  ): Result;
}

export namespace AllocationEvent {
  export type InputTuple = [
    tokenAddress: AddressLike,
    newAllocation: BigNumberish
  ];
  export type OutputTuple = [tokenAddress: string, newAllocation: bigint];
  export interface OutputObject {
    tokenAddress: string;
    newAllocation: bigint;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace DepositEvent {
  export type InputTuple = [
    depositor: AddressLike,
    shares: BigNumberish,
    shareValue: BigNumberish
  ];
  export type OutputTuple = [
    depositor: string,
    shares: bigint,
    shareValue: bigint
  ];
  export interface OutputObject {
    depositor: string;
    shares: bigint;
    shareValue: bigint;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace OwnershipTransferredEvent {
  export type InputTuple = [previousOwner: AddressLike, newOwner: AddressLike];
  export type OutputTuple = [previousOwner: string, newOwner: string];
  export interface OutputObject {
    previousOwner: string;
    newOwner: string;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export namespace WithdrawEvent {
  export type InputTuple = [
    shareholder: AddressLike,
    to: AddressLike,
    shares: BigNumberish,
    shareValue: BigNumberish
  ];
  export type OutputTuple = [
    shareholder: string,
    to: string,
    shares: bigint,
    shareValue: bigint
  ];
  export interface OutputObject {
    shareholder: string;
    to: string;
    shares: bigint;
    shareValue: bigint;
  }
  export type Event = TypedContractEvent<InputTuple, OutputTuple, OutputObject>;
  export type Filter = TypedDeferredTopicFilter<Event>;
  export type Log = TypedEventLog<Event>;
  export type LogDescription = TypedLogDescription<Event>;
}

export interface LairryFinkFund extends BaseContract {
  connect(runner?: ContractRunner | null): LairryFinkFund;
  waitForDeployment(): Promise<this>;

  interface: LairryFinkFundInterface;

  queryFilter<TCEvent extends TypedContractEvent>(
    event: TCEvent,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TypedEventLog<TCEvent>>>;
  queryFilter<TCEvent extends TypedContractEvent>(
    filter: TypedDeferredTopicFilter<TCEvent>,
    fromBlockOrBlockhash?: string | number | undefined,
    toBlock?: string | number | undefined
  ): Promise<Array<TypedEventLog<TCEvent>>>;

  on<TCEvent extends TypedContractEvent>(
    event: TCEvent,
    listener: TypedListener<TCEvent>
  ): Promise<this>;
  on<TCEvent extends TypedContractEvent>(
    filter: TypedDeferredTopicFilter<TCEvent>,
    listener: TypedListener<TCEvent>
  ): Promise<this>;

  once<TCEvent extends TypedContractEvent>(
    event: TCEvent,
    listener: TypedListener<TCEvent>
  ): Promise<this>;
  once<TCEvent extends TypedContractEvent>(
    filter: TypedDeferredTopicFilter<TCEvent>,
    listener: TypedListener<TCEvent>
  ): Promise<this>;

  listeners<TCEvent extends TypedContractEvent>(
    event: TCEvent
  ): Promise<Array<TypedListener<TCEvent>>>;
  listeners(eventName?: string): Promise<Array<Listener>>;
  removeAllListeners<TCEvent extends TypedContractEvent>(
    event?: TCEvent
  ): Promise<this>;

  deposit: TypedContractMethod<[amount: BigNumberish], [void], "nonpayable">;

  getCreationDepositFee: TypedContractMethod<[], [bigint], "view">;

  getDeadlineOffset: TypedContractMethod<[], [bigint], "view">;

  getDepositFee: TypedContractMethod<[], [bigint], "view">;

  getDepositFeeBalance: TypedContractMethod<[], [bigint], "view">;

  getDepositsEnabled: TypedContractMethod<[], [boolean], "view">;

  getMinimumDeposit: TypedContractMethod<[], [bigint], "view">;

  getNetAssetValue: TypedContractMethod<[], [bigint], "view">;

  getPortfolio: TypedContractMethod<
    [],
    [[string[], bigint[], string[], bigint[], bigint[]]],
    "view"
  >;

  getReserveTokenAddress: TypedContractMethod<[], [string], "view">;

  getReserveTokenBalance: TypedContractMethod<[], [bigint], "view">;

  getShareBalance: TypedContractMethod<
    [shareholder: AddressLike],
    [bigint],
    "view"
  >;

  getSharePrice: TypedContractMethod<[], [bigint], "view">;

  getShareTokenAddress: TypedContractMethod<[], [string], "view">;

  getSharesOutstanding: TypedContractMethod<[], [bigint], "view">;

  getSlippageTolerance: TypedContractMethod<[], [bigint], "view">;

  getTotalAllocation: TypedContractMethod<[], [bigint], "view">;

  owner: TypedContractMethod<[], [string], "view">;

  renounceOwnership: TypedContractMethod<[], [void], "nonpayable">;

  setAllocation: TypedContractMethod<
    [tokenAddress: AddressLike, _allocation: BigNumberish],
    [void],
    "nonpayable"
  >;

  setDeadlineOffset: TypedContractMethod<
    [_deadlineOffset: BigNumberish],
    [void],
    "nonpayable"
  >;

  setDepositFee: TypedContractMethod<
    [_depositFee: BigNumberish],
    [void],
    "nonpayable"
  >;

  setDepositsEnabled: TypedContractMethod<
    [_depositsEnabled: boolean],
    [void],
    "nonpayable"
  >;

  setMinimumDeposit: TypedContractMethod<
    [_minimumDeposit: BigNumberish],
    [void],
    "nonpayable"
  >;

  setSlippageTolerance: TypedContractMethod<
    [_slippageTolerance: BigNumberish],
    [void],
    "nonpayable"
  >;

  transferOwnership: TypedContractMethod<
    [newOwner: AddressLike],
    [void],
    "nonpayable"
  >;

  withdraw: TypedContractMethod<
    [shares: BigNumberish, to: AddressLike],
    [void],
    "nonpayable"
  >;

  withdrawDepositFees: TypedContractMethod<
    [to: AddressLike, amount: BigNumberish],
    [void],
    "nonpayable"
  >;

  getFunction<T extends ContractMethod = ContractMethod>(
    key: string | FunctionFragment
  ): T;

  getFunction(
    nameOrSignature: "deposit"
  ): TypedContractMethod<[amount: BigNumberish], [void], "nonpayable">;
  getFunction(
    nameOrSignature: "getCreationDepositFee"
  ): TypedContractMethod<[], [bigint], "view">;
  getFunction(
    nameOrSignature: "getDeadlineOffset"
  ): TypedContractMethod<[], [bigint], "view">;
  getFunction(
    nameOrSignature: "getDepositFee"
  ): TypedContractMethod<[], [bigint], "view">;
  getFunction(
    nameOrSignature: "getDepositFeeBalance"
  ): TypedContractMethod<[], [bigint], "view">;
  getFunction(
    nameOrSignature: "getDepositsEnabled"
  ): TypedContractMethod<[], [boolean], "view">;
  getFunction(
    nameOrSignature: "getMinimumDeposit"
  ): TypedContractMethod<[], [bigint], "view">;
  getFunction(
    nameOrSignature: "getNetAssetValue"
  ): TypedContractMethod<[], [bigint], "view">;
  getFunction(
    nameOrSignature: "getPortfolio"
  ): TypedContractMethod<
    [],
    [[string[], bigint[], string[], bigint[], bigint[]]],
    "view"
  >;
  getFunction(
    nameOrSignature: "getReserveTokenAddress"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "getReserveTokenBalance"
  ): TypedContractMethod<[], [bigint], "view">;
  getFunction(
    nameOrSignature: "getShareBalance"
  ): TypedContractMethod<[shareholder: AddressLike], [bigint], "view">;
  getFunction(
    nameOrSignature: "getSharePrice"
  ): TypedContractMethod<[], [bigint], "view">;
  getFunction(
    nameOrSignature: "getShareTokenAddress"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "getSharesOutstanding"
  ): TypedContractMethod<[], [bigint], "view">;
  getFunction(
    nameOrSignature: "getSlippageTolerance"
  ): TypedContractMethod<[], [bigint], "view">;
  getFunction(
    nameOrSignature: "getTotalAllocation"
  ): TypedContractMethod<[], [bigint], "view">;
  getFunction(
    nameOrSignature: "owner"
  ): TypedContractMethod<[], [string], "view">;
  getFunction(
    nameOrSignature: "renounceOwnership"
  ): TypedContractMethod<[], [void], "nonpayable">;
  getFunction(
    nameOrSignature: "setAllocation"
  ): TypedContractMethod<
    [tokenAddress: AddressLike, _allocation: BigNumberish],
    [void],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "setDeadlineOffset"
  ): TypedContractMethod<[_deadlineOffset: BigNumberish], [void], "nonpayable">;
  getFunction(
    nameOrSignature: "setDepositFee"
  ): TypedContractMethod<[_depositFee: BigNumberish], [void], "nonpayable">;
  getFunction(
    nameOrSignature: "setDepositsEnabled"
  ): TypedContractMethod<[_depositsEnabled: boolean], [void], "nonpayable">;
  getFunction(
    nameOrSignature: "setMinimumDeposit"
  ): TypedContractMethod<[_minimumDeposit: BigNumberish], [void], "nonpayable">;
  getFunction(
    nameOrSignature: "setSlippageTolerance"
  ): TypedContractMethod<
    [_slippageTolerance: BigNumberish],
    [void],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "transferOwnership"
  ): TypedContractMethod<[newOwner: AddressLike], [void], "nonpayable">;
  getFunction(
    nameOrSignature: "withdraw"
  ): TypedContractMethod<
    [shares: BigNumberish, to: AddressLike],
    [void],
    "nonpayable"
  >;
  getFunction(
    nameOrSignature: "withdrawDepositFees"
  ): TypedContractMethod<
    [to: AddressLike, amount: BigNumberish],
    [void],
    "nonpayable"
  >;

  getEvent(
    key: "Allocation"
  ): TypedContractEvent<
    AllocationEvent.InputTuple,
    AllocationEvent.OutputTuple,
    AllocationEvent.OutputObject
  >;
  getEvent(
    key: "Deposit"
  ): TypedContractEvent<
    DepositEvent.InputTuple,
    DepositEvent.OutputTuple,
    DepositEvent.OutputObject
  >;
  getEvent(
    key: "OwnershipTransferred"
  ): TypedContractEvent<
    OwnershipTransferredEvent.InputTuple,
    OwnershipTransferredEvent.OutputTuple,
    OwnershipTransferredEvent.OutputObject
  >;
  getEvent(
    key: "Withdraw"
  ): TypedContractEvent<
    WithdrawEvent.InputTuple,
    WithdrawEvent.OutputTuple,
    WithdrawEvent.OutputObject
  >;

  filters: {
    "Allocation(address,uint256)": TypedContractEvent<
      AllocationEvent.InputTuple,
      AllocationEvent.OutputTuple,
      AllocationEvent.OutputObject
    >;
    Allocation: TypedContractEvent<
      AllocationEvent.InputTuple,
      AllocationEvent.OutputTuple,
      AllocationEvent.OutputObject
    >;

    "Deposit(address,uint256,uint256)": TypedContractEvent<
      DepositEvent.InputTuple,
      DepositEvent.OutputTuple,
      DepositEvent.OutputObject
    >;
    Deposit: TypedContractEvent<
      DepositEvent.InputTuple,
      DepositEvent.OutputTuple,
      DepositEvent.OutputObject
    >;

    "OwnershipTransferred(address,address)": TypedContractEvent<
      OwnershipTransferredEvent.InputTuple,
      OwnershipTransferredEvent.OutputTuple,
      OwnershipTransferredEvent.OutputObject
    >;
    OwnershipTransferred: TypedContractEvent<
      OwnershipTransferredEvent.InputTuple,
      OwnershipTransferredEvent.OutputTuple,
      OwnershipTransferredEvent.OutputObject
    >;

    "Withdraw(address,address,uint256,uint256)": TypedContractEvent<
      WithdrawEvent.InputTuple,
      WithdrawEvent.OutputTuple,
      WithdrawEvent.OutputObject
    >;
    Withdraw: TypedContractEvent<
      WithdrawEvent.InputTuple,
      WithdrawEvent.OutputTuple,
      WithdrawEvent.OutputObject
    >;
  };
}
