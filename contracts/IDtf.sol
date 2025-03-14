// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

/**
 * @title ILairryFinkFund
 * @dev Minimal interface for the LairryFinkFund contract
 */
interface ILairryFinkFund {
    /**
     * @dev Transfers ownership of the contract to a new account (`newOwner`).
     * Can only be called by the current owner.
     */
    function transferOwnership(address newOwner) external;
    
    /**
     * @dev Returns the address of the current owner.
     */
    function owner() external view returns (address);
}