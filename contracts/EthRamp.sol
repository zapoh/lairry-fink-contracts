// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol";

interface ILairryFinkFund {
    function deposit(uint256 amount) external;
    function withdraw(uint256 shares, address to) external;

    function getMinimumDeposit() external returns (uint256);
    function getReserveTokenAddress() external returns (address);
    function getShareTokenAddress() external returns (address);
    function getSlippageTolerance() external returns (uint256);
 }

contract LairryFinkETHRamp {
    using SafeERC20 for IERC20;

    // Basis points
    uint256 private constant MAX_BP = 10**4;

    // LairryFink Mutual Fund contract
    ILairryFinkFund private immutable lairryFinkFund;
    // LairryFink Mutual Fund reserve token contract
    IERC20 private immutable reserveToken;
    // LairryFink Mutual Fund share token contract
    IERC20 private immutable shareToken;

    // UniswapV2Router02 contract
    IUniswapV2Router02 private immutable uniswapV2Router02;
    // WETH address (pulled from uniswap router)
    address private immutable _weth;
    
    constructor(address _lairryFinkFundAddress, address _uniswapV2Router02Address) {
        lairryFinkFund = ILairryFinkFund(_lairryFinkFundAddress);
        reserveToken = IERC20(lairryFinkFund.getReserveTokenAddress());
        shareToken = IERC20(lairryFinkFund.getShareTokenAddress());
        uniswapV2Router02 = IUniswapV2Router02(_uniswapV2Router02Address);

        _weth = uniswapV2Router02.WETH();
    }

    // Swap ETH for mutual fund reserve tokens on Uniswap,
    // then use reserve tokens to buy mutual fund share tokens from the mutual fund contract.
    // The resulting share tokens are sent to msg.sender.
    function depositETH() public payable {
        address[] memory reserveTokenBuyPath = _reserveTokenBuyPath();
        uint256 reserveTokensIn = uniswapV2Router02.getAmountsOut(
            msg.value,
            reserveTokenBuyPath
        )[reserveTokenBuyPath.length - 1];
        uint256 minimumDepositReserveToken = lairryFinkFund.getMinimumDeposit();
        uint256 slippageTolerance = lairryFinkFund.getSlippageTolerance();
        uint256 minimumReserveTokensIn = (MAX_BP - slippageTolerance) * reserveTokensIn / MAX_BP;
        require (
            minimumReserveTokensIn >= minimumDepositReserveToken,
            "Reserve token amount is less than the mutual fund minimum deposit amount."
        );

        // buy reserve tokens
        uniswapV2Router02.swapExactETHForTokensSupportingFeeOnTransferTokens{value: msg.value}(
            minimumReserveTokensIn,
            reserveTokenBuyPath,
            address(this),
            block.timestamp + 300
        );

        // use new reserve token balance to buy shares
        uint256 reserveTokenBalance = reserveToken.balanceOf(address(this));
        reserveToken.approve(
            address(lairryFinkFund),
            reserveToken.balanceOf(address(this))
        );
        lairryFinkFund.deposit(reserveTokenBalance);

        // transfer share tokens to depositor
        shareToken.safeTransfer(
            msg.sender,
            shareToken.balanceOf(address(this))
        );

        // swap reserve token "change" back to ETH and return it to msg.sender
        reserveTokenBalance = reserveToken.balanceOf(address(this));
        reserveToken.approve(
            address(uniswapV2Router02),
            reserveTokenBalance
        );
        if (reserveTokenBalance > 0) {
            address[] memory reserveTokenSellPath = _reserveTokenSellPath();
            uint256 ethOut = uniswapV2Router02.getAmountsOut(
                reserveTokenBalance,
                reserveTokenSellPath
            )[reserveTokenSellPath.length - 1];
            uniswapV2Router02.swapExactTokensForETHSupportingFeeOnTransferTokens(
                reserveTokenBalance,
                (MAX_BP - slippageTolerance) * ethOut / MAX_BP,
                reserveTokenSellPath,
                msg.sender,
                block.timestamp + 300
            );
        }
    }

    // Sell a number of mutual fund share tokens specified by the `shares` argument to the mutual
    // fund contract for reserve tokens, then swap the resulting reserve tokens for ETH on Uniswap.
    // The resulting ETH is sent to the address specified by the `to` argument.
    //
    // The user should have already approved the number of shares they wish to sell for the
    // ETH ramp contract to spend.
    function withdrawETH(uint256 shares, address to) public {
        // transfer share tokens to the ETH ramp
        shareToken.safeTransferFrom(
            msg.sender,
            address(this),
            shares
        );

        // sell shares for reserve tokens
        lairryFinkFund.withdraw(shares, address(this));

        // sell reserve tokens for ETH, sending the proceeds back to msg.sender
        uint256 reserveTokenBalance = reserveToken.balanceOf(address(this));
        uint256 slippageTolerance = lairryFinkFund.getSlippageTolerance();
        address[] memory sellPath = _reserveTokenSellPath();
        uint256 ethOut = uniswapV2Router02.getAmountsOut(
            reserveTokenBalance,
            sellPath
        )[sellPath.length - 1];
        reserveToken.approve(
            address(uniswapV2Router02),
            reserveTokenBalance
        );
        uniswapV2Router02.swapExactTokensForETHSupportingFeeOnTransferTokens(
            reserveTokenBalance,
            (MAX_BP - slippageTolerance) * ethOut / MAX_BP,
            sellPath,
            to,
            block.timestamp + 300
        );
    }

    function _reserveTokenBuyPath() internal view returns (address[] memory) {
        address[] memory buyPath = new address[](2);
        buyPath[0] = _weth;
        buyPath[1] = address(reserveToken);
        return buyPath;
    }

    function _reserveTokenSellPath() internal view returns (address[] memory) {
        address[] memory sellPath = new address[](2);
        sellPath[0] = address(reserveToken);
        sellPath[1] = _weth;
        return sellPath;
    }
}