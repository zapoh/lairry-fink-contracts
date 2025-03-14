// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import "./IDtf.sol";
import "./FundBytecode.sol";

/**
 * @title DtfFactory
 * @dev Factory contract for deploying full  instances
 * This version deploys complete contracts rather than proxies,
 * giving users complete ownership and independence.
 */
contract DtfFactory {
    // Events
    event FundCreated(
        address indexed fundAddress,
        address indexed creator,
        string name,
        string symbol,
        uint256 timestamp
    );

    // Registry storage
    address[] public deployedFunds;
    mapping(address => bool) public isFund;
    mapping(address => address[]) public userFunds;

    // Fixed parameters that will be the same for all fund instances
    address public immutable wethAddress;
    address public immutable uniswapRouterAddress;
    uint256 public immutable defaultDeadlineOffset;
    
    // Reference to the bytecode contract
    FundBytecode public immutable bytecodeContract;

    /**
     * @dev Constructor sets the fixed parameters for all funds
     * @param _wethAddress Address of the WETH contract
     * @param _uniswapRouterAddress Address of the Uniswap V2 Router
     * @param _defaultDeadlineOffset Default deadline offset for swaps
     * @param _bytecodeContract Address of the contract containing the fund bytecode
     */
    constructor(
        address _wethAddress,
        address _uniswapRouterAddress, 
        uint256 _defaultDeadlineOffset,
        address _bytecodeContract
    ) {
        wethAddress = _wethAddress;
        uniswapRouterAddress = _uniswapRouterAddress;
        defaultDeadlineOffset = _defaultDeadlineOffset;
        bytecodeContract = FundBytecode(_bytecodeContract);
    }

    /**
     * @dev Creates a new LairryFinkFund with the caller as owner
     * @param _shareName Name of the share token
     * @param _shareSymbol Symbol of the share token
     * @param _depositsEnabled Whether deposits are enabled initially
     * @param _minimumDeposit Minimum deposit amount in wei
     * @param _slippageTolerance Slippage tolerance in basis points (e.g. 200 = 2%)
     * @param _depositFee Deposit fee in basis points
     * @param _withdrawalFee Withdrawal fee in basis points
     * @return The address of the newly created fund
     */
    function createFund(
        string memory _shareName,
        string memory _shareSymbol,
        bool _depositsEnabled,
        uint256 _minimumDeposit,
        uint256 _slippageTolerance,
        uint256 _depositFee,
        uint256 _withdrawalFee
    ) external returns (address) {
        // Get the bytecode from the bytecode contract
        bytes memory creationCode = bytecodeContract.FUND_BYTECODE();
        
        // Encode constructor parameters
        bytes memory constructorArgs = abi.encode(
            wethAddress,
            _shareName,
            _shareSymbol,
            uniswapRouterAddress,
            defaultDeadlineOffset,
            _depositsEnabled,
            _minimumDeposit,
            _slippageTolerance,
            _depositFee,
            _withdrawalFee
        );
        
        // Combine bytecode and constructor arguments
        bytes memory bytecode = abi.encodePacked(creationCode, constructorArgs);
        
        // Create a salt based on user address and parameters for deterministic address
        bytes32 salt = keccak256(
            abi.encodePacked(
                msg.sender,
                _shareName,
                _shareSymbol,
                block.timestamp
            )
        );
        
        // Deploy the contract using create2 for deterministic addresses
        address fundAddress;
        assembly {
            fundAddress := create2(0, add(bytecode, 32), mload(bytecode), salt)
            if iszero(extcodesize(fundAddress)) {
                revert(0, 0)
            }
        }
        
        // Transfer ownership to the caller
        ILairryFinkFund(fundAddress).transferOwnership(msg.sender);
        
        // Update registry
        deployedFunds.push(fundAddress);
        isFund[fundAddress] = true;
        userFunds[msg.sender].push(fundAddress);
        
        // Emit creation event
        emit FundCreated(
            fundAddress,
            msg.sender,
            _shareName,
            _shareSymbol,
            block.timestamp
        );
        
        return fundAddress;
    }
    
    /**
     * @dev Predicts the address where a fund will be deployed
     * Useful for users to know their fund address before deployment
     */
    function predictFundAddress(
        string memory _shareName,
        string memory _shareSymbol
    ) external view returns (address) {
        bytes32 salt = keccak256(
            abi.encodePacked(
                msg.sender,
                _shareName,
                _shareSymbol,
                block.timestamp
            )
        );
        
        bytes32 hash = keccak256(
            abi.encodePacked(
                bytes1(0xff),
                address(this),
                salt,
                keccak256(abi.encodePacked(bytecodeContract.FUND_BYTECODE()))
            )
        );
        
        return address(uint160(uint256(hash)));
    }

    /**
     * @dev Returns all funds created through this factory
     * @return Array of fund addresses
     */
    function getAllFunds() external view returns (address[] memory) {
        return deployedFunds;
    }
    
    /**
     * @dev Returns all funds created by a specific user
     * @param _user Address of the user
     * @return Array of fund addresses created by the user
     */
    function getFundsCreatedBy(address _user) external view returns (address[] memory) {
        return userFunds[_user];
    }
    
    /**
     * @dev Returns the total number of funds deployed
     * @return Number of funds deployed
     */
    function getFundCount() external view returns (uint256) {
        return deployedFunds.length;
    }
} 