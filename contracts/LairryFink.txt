// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol";

contract LairryFinkShareToken is ERC20, Ownable {
    constructor(
        string memory _shareTokenName,
        string memory _shareTokenSymbol
    )
        ERC20(_shareTokenName, _shareTokenSymbol)
        // Owned by the mutual fund contract that deploys
        // the share token contract
        Ownable(msg.sender)
    { }

    function decimals() override public pure returns (uint8) {
        // Share tokens are not divisible
        return 0;
    }

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }

    function burn(address from, uint256 amount) public onlyOwner {
        _burn(from, amount);
    }
}

contract LairryFinkFund is Ownable {
    using SafeERC20 for ERC20;
    using SafeERC20 for IERC20;

    event Allocation(address indexed tokenAddress, uint256 newAllocation);
    event Deposit(address indexed depositor, uint256 shares, uint256 shareValue);
    event Withdraw(address indexed shareholder, address to, uint256 shares, uint256 shareValue);

    uint8 private constant BASIS_POINTS = 4;

    // Pool reserve token 
    // This is the base currency used by the fund. It is the currency through which users
    // conduct deposits and withdrawals, and the unit in which the fund's assets are valued.
    ERC20 private immutable reserveToken;

   
    // Pool share token
    // The pool share token is used to determine shareholder equity in the mutual fund.
    // These share tokens function exactly like shares in a traditional open-ended mutual fund.
    // The share token is deployed by the pool contract itself in the constructor.
    // Share tokens can be bought/sold directly from/to the fund contract.
    // Share token price = (NetAssetValue / SharesOutstanding)
    // The contract mints share tokens on share purchase and burns share tokens on share sale.
    LairryFinkShareToken private immutable shareToken;

    // Flag for temporarily halting deposits for everyone except the contract owner
    // Withdrawals will still be enabled for all existing shareholders
    bool private depositsEnabled;

    // Minimum amount of reserve tokens that can be deposited into the fund
    // This is necessary because if too few tokens are deposited, we may
    // not be able to allocate them appropriately across the fund's portfolio allocation.
    uint256 private minimumDeposit;

    uint256 private depositFee;
    uint256 depositFeeBalance;
    uint256 private immutable creationDepositFee; // fee cannot be set higher than the value it was set to on contract creation

    // Deadline offset for swaps in seconds from the current block timestamp
    uint256 private deadlineOffset;

    // adjustable slippage tolerance
    uint256 private slippageTolerance;

    address private immutable uniswapV2Router02Address;

    // Portfolio allocation of reserve token balance to selected tokens.
    // Represented in basis points.
    // For example, if the allocation for token A is set to 5000, 50% of the
    // pool's reserves will be used to purchase token A.
    // Unallocated funds remain stored in the pool's reserve token.
    mapping(address => uint256) private allocation;
    address[] private assets;

    constructor(
        address _reserveTokenAddress,
        string memory _shareTokenName,
        string memory _shareTokenSymbol,
        address _uniswapV2Router02Address,
        uint256 _deadlineOffset,
        bool _depositsEnabled,
        uint256 _minimumDeposit,
        uint256 _slippageTolerance,
        uint256 _depositFee
    )
        Ownable(msg.sender)
    {
        reserveToken = ERC20(_reserveTokenAddress);
        shareToken = new LairryFinkShareToken(
            _shareTokenName,
            _shareTokenSymbol
        );

        uniswapV2Router02Address = _uniswapV2Router02Address;
        deadlineOffset = _deadlineOffset;
        depositsEnabled = _depositsEnabled;
        minimumDeposit = _minimumDeposit;
        slippageTolerance = _slippageTolerance;
        depositFee = _depositFee;
        creationDepositFee = _depositFee;
    }

    function getReserveTokenAddress() public view returns (address) {
        return address(reserveToken);
    }

    function getReserveTokenBalance() public view returns (uint256) {
        uint256 reserveTokenBalance = reserveToken.balanceOf(address(this));
        if (reserveTokenBalance <= depositFeeBalance) {
            return 0;
        }
        return reserveTokenBalance - depositFeeBalance;
    }

    function getShareTokenAddress() public view returns (address) {
        return address(shareToken);
    }

    function getSharesOutstanding() public view returns (uint256) {
        return shareToken.totalSupply();
    }

    function getSharePrice() public view returns (uint256) {
        uint256 sharesOutstanding = getSharesOutstanding();
        if (sharesOutstanding == 0) {
            return 0;
        }
        return getNetAssetValue() / getSharesOutstanding();
    }

    function getShareBalance(address shareholder) public view returns (uint256) {
        return shareToken.balanceOf(shareholder);
    }

    function getDepositsEnabled() public view returns (bool) {
        return depositsEnabled;
    }

    function setDepositsEnabled(bool _depositsEnabled) public onlyOwner {
        depositsEnabled = _depositsEnabled;
    }

    function getMinimumDeposit() public view returns (uint256) {
        return minimumDeposit;
    }

    function setMinimumDeposit(uint256 _minimumDeposit) public onlyOwner {
        minimumDeposit = _minimumDeposit;
    }

    function getDeadlineOffset() public view returns (uint256) {
        return deadlineOffset;
    }

    function setDeadlineOffset(uint256 _deadlineOffset) public onlyOwner {
        deadlineOffset = _deadlineOffset;
    }

    function getSlippageTolerance() public view returns (uint256) {
        return slippageTolerance;
    }

    function setSlippageTolerance(uint256 _slippageTolerance) public onlyOwner {
        slippageTolerance = _slippageTolerance;
    }

    function getDepositFee() public view returns (uint256) {
        return depositFee;
    }

    function getCreationDepositFee() public view returns (uint256) {
        return creationDepositFee;
    }

    function setDepositFee(uint256 _depositFee) public onlyOwner {
        require(_depositFee <= creationDepositFee, "Deposit fee cannot be set higher than the value it was set to on contract creation.");
        depositFee = _depositFee;
    }

    function getDepositFeeBalance() public view returns (uint256) {
        return depositFeeBalance;
    }

    function withdrawDepositFees(address to, uint256 amount) public onlyOwner {
        require(depositFeeBalance > 0, "Current fee balance is 0.");
        require(amount <= depositFeeBalance, "Requested withdrawal amount exceeds fee balance.");

        depositFeeBalance -= amount;
        reserveToken.safeTransfer(to, amount);
    }

    // Return a tuple of arrays for current asset information:
    // (
    //   addresses,
    //   allocations,
    //   symbols,
    //   balances,
    //   reserve value
    // )
    function getPortfolio() public view returns (address[] memory, uint256[] memory, string[] memory, uint256[] memory, uint256[] memory) {
        address[] memory _addresses = new address[](assets.length);
        uint256[] memory _allocations = new uint256[](assets.length);
        string[] memory _symbols = new string[](assets.length);
        uint256[] memory _balances = new uint256[](assets.length);
        uint256[] memory _values = new uint256[](assets.length);

        IUniswapV2Router02 router = IUniswapV2Router02(uniswapV2Router02Address);

        for (uint256 i = 0; i < assets.length; i++) {
            address tokenAddress = assets[i];
            _addresses[i] = tokenAddress;
            _allocations[i] = allocation[tokenAddress];
            ERC20 token = ERC20(tokenAddress);
            _symbols[i] = token.symbol();
            _balances[i] = token.balanceOf(address(this));
            if (_balances[i] > 0) {
                _values[i] = _sellAmount(router, tokenAddress, _balances[i]);
            } else {
                _values[i] = 0;
            }
        }
        return (_addresses, _allocations, _symbols, _balances, _values);
    }

    // Get total net value of the fund's assets in terms of the reserve token.
    function getNetAssetValue() public view returns (uint256) {
        IUniswapV2Router02 router = IUniswapV2Router02(uniswapV2Router02Address);
        uint256 totalValue = getReserveTokenBalance();
        for (uint256 i = 0; i < assets.length; i++) {
            address tokenAddress = assets[i];
            IERC20 token = IERC20(tokenAddress);
            uint256 tokenBalance = token.balanceOf(address(this));
            if (tokenBalance == 0) {
                continue;
            }
            totalValue += _sellAmount(router, tokenAddress, tokenBalance);
        }
        return totalValue;
    }

    // Buy shares
    //
    // Buy `amount` reserve tokens (less deposit fee) worth of shares from the fund contract at the current share price.
    // Then, exchange the desposit for portfolio assets as specified in `allocation`
    // Finally, mint for the depositor a number of share tokens equal to the number of shares they bought.
    //
    // Emits a {Deposit} event on success.
    function deposit(uint256 amount) public {
        require(
            depositsEnabled || msg.sender == this.owner(),
            "Deposits are temporarily disabled."
        );

        require(
            amount >= minimumDeposit,
            "Deposit amount is less than the minimum deposit."
        );

        require(
            reserveToken.allowance(msg.sender, address(this)) >= amount,
            "Reserve token allowance is less than deposit amount."
        );
 
        // Determine deposit fee
        uint256 feeMax = 10**BASIS_POINTS;
        uint256 fee = depositFee * amount / feeMax;
        uint256 amountLessFee = amount - fee;
        depositFeeBalance += fee;

        // Determine share purchase amount
        uint256 shares;
        uint256 netAssetValue;
        uint256 sharesOutstanding = getSharesOutstanding();
        if (sharesOutstanding == 0) {
            // Initial deposit - establish share price of 1 reserveToken/share
            shares = amountLessFee / (10 ** reserveToken.decimals());
            sharesOutstanding = shares;
            netAssetValue = amountLessFee;
        } else {
            netAssetValue = getNetAssetValue();
            shares = amountLessFee * sharesOutstanding / netAssetValue;
        }
        require(shares > 0, "You must buy at least one share.");

        // Since we are buying an integer number of shares, there may
        // be change left over if `amountLessFee / price` has a fractional part.
        uint256 shareValue = shares * netAssetValue / sharesOutstanding;
        uint256 change = amountLessFee - shareValue;

        // Transfer reserve tokens to fund contract
        reserveToken.safeTransferFrom(
            msg.sender,
            address(this),
            amount - change
        );

        // Buy assets with deposited funds
        IUniswapV2Router02 router = IUniswapV2Router02(uniswapV2Router02Address);
        for (uint256 i = 0; i < assets.length; i++) {
            address tokenAddress = assets[i];
            uint256 reserveTokenAmount = allocation[tokenAddress] * amountLessFee / 10**BASIS_POINTS;
            if (reserveTokenAmount == 0) {
                continue;
            }
            _buy(
                router,
                tokenAddress,
                reserveTokenAmount
            );
        }

        // Mint depositor's purchased shares
        shareToken.mint(msg.sender, shares);

        emit Deposit(msg.sender, shares, shareValue);
    }

    // Sell shares
    //
    // Liquidate shareholder assets for reserve tokens proportional to the shareholder's equity stake.
    // Send the liquidated reserve tokens to the shareholder.
    // Also send the shareholder's share of reserve tokens to the shareholder.
    // Lastly, burn a number of the shareholder's share tokens equal to the number of shares they sold.
    //
    //
    // Emits a {Withdraw} event on success.
    function withdraw(uint256 shares, address to) public {
        uint256 sharesOutstanding = getSharesOutstanding();
        require(
            sharesOutstanding > 0,
            "No shares outstanding."
        );
        require(shares > 0, "You must sell at least one share.");
        uint256 shareBalance = getShareBalance(msg.sender);
        require(shareBalance >= shares, "Sell amount is greater than current share balance.");
        uint256 shareValue = shares * getSharePrice();

        // Sell shareholder's share of assets
        IUniswapV2Router02 router = IUniswapV2Router02(uniswapV2Router02Address);
        for (uint256 i = 0; i < assets.length; i++) {
            address tokenAddress = assets[i];
            IERC20 token = IERC20(tokenAddress);
            uint256 sellAmount = shares * token.balanceOf(address(this)) / sharesOutstanding;
            _sell(
                router,
                tokenAddress,
                sellAmount,
                to
            );
        }

        // Transfer the shareholder's share of reserve tokens to shareholder
        uint256 reserveWithdrawalAmount = shares * getReserveTokenBalance() / sharesOutstanding;
        if (reserveWithdrawalAmount > 0) {
            reserveToken.safeTransfer(
                to,
                reserveWithdrawalAmount
            );
        }

        // Burn shareholder's sold shares
        shareToken.burn(msg.sender, shares);

        emit Withdraw(msg.sender, to, shares, shareValue);
    }

    // Set the pool's allocation for the asset specified by `tokenAddress`.
    //
    // Emits an {Allocation} event on success.
    function setAllocation(address tokenAddress, uint256 _allocation) public onlyOwner {
        require(_allocation >= 0 && _allocation <= 10**BASIS_POINTS, "Asset allocation must be >= 0 and <= 1.");
        require(_allocation != allocation[tokenAddress], "New allocation cannot be the same as old allocation");

        int256 allocationDelta = int256(_allocation) - int256(allocation[tokenAddress]);
        require(int256(getTotalAllocation()) + allocationDelta <= int256(10**BASIS_POINTS), "Total asset allocation cannot be > 1.");

        // Calculate target token value based on new allocation
        uint256 netAssetValue = getNetAssetValue();
        uint256 targetTokenValue = _allocation * netAssetValue / 10**BASIS_POINTS;

        // Get current token balance and its value
        IERC20 token = IERC20(tokenAddress);
        uint256 currentTokenBalance = token.balanceOf(address(this));
        IUniswapV2Router02 router = IUniswapV2Router02(uniswapV2Router02Address);
        uint256 currentTokenValue = currentTokenBalance > 0 ? _sellAmount(router, tokenAddress, currentTokenBalance) : 0;

        if (currentTokenValue < targetTokenValue) {
            // Need to buy more tokens
            uint256 valueToAdd = targetTokenValue - currentTokenValue;
            uint256 reserveTokenAmount = valueToAdd;
            uint256 reserveTokenBalance = getReserveTokenBalance();
            if (reserveTokenAmount > reserveTokenBalance) {
                reserveTokenAmount = reserveTokenBalance;
            }
            if (reserveTokenAmount > 0) {
                _buy(
                    router,
                    tokenAddress,
                    reserveTokenAmount
                );
            }
        } else if (currentTokenValue > targetTokenValue) {
            // Need to sell excess tokens
            uint256 excessValue = currentTokenValue - targetTokenValue;
            uint256 tokenAmountToSell = excessValue * currentTokenBalance / currentTokenValue;
            if (tokenAmountToSell > 0) {
                _sell(
                    router,
                    tokenAddress,
                    tokenAmountToSell,
                    address(this)
                );
            }
        }

        // Update assets array
        if (_allocation == 0 && allocation[tokenAddress] > 0) {
            // remove token address from asset list
            for (uint256 i = 0; i < assets.length; i++) {
                if (assets[i] == tokenAddress) {
                    assets[i] = assets[assets.length - 1];
                    assets.pop();
                    break;
                }
            }
        } else if (_allocation > 0 && allocation[tokenAddress] == 0) {
            // add token address to asset list
            assets.push(tokenAddress);
        }

        allocation[tokenAddress] = _allocation;
        emit Allocation(tokenAddress, _allocation);
    }

    // Get total reserve allocation in basis points.
    function getTotalAllocation() public view returns (uint256) {
        uint256 totalAllocation = 0;
        for (uint256 i = 0; i < assets.length; i++) {
            totalAllocation += allocation[assets[i]];
        }
        return totalAllocation;
    }

    // Get path for swapping reserve token -> asset on uniswap
    function _buyPath(IUniswapV2Router02 router, address tokenAddress) internal view returns (address[] memory) {
        address _weth = router.WETH();
        if (tokenAddress == _weth) {
            address[] memory wethPath = new address[](2);
            wethPath[0] = address(reserveToken);
            wethPath[1] = _weth;
            return wethPath;
        }
        address[] memory path = new address[](3);
        path[0] = address(reserveToken);
        path[1] = _weth;
        path[2] = tokenAddress;
        return path;
    }

    // Get path for swapping asset -> reserve token on uniswap
    function _sellPath(IUniswapV2Router02 router, address tokenAddress) internal view returns (address[] memory) {
        address _weth = router.WETH();
        if (tokenAddress == _weth) {
            address[] memory wethPath = new address[](2);
            wethPath[0] = _weth;
            wethPath[1] = address(reserveToken);
            return wethPath;
        }
        address[] memory path = new address[](3);
        path[0] = tokenAddress;
        path[1] = _weth;
        path[2] = address(reserveToken);
        return path;
    }

    // Calculate the minimum amount of a token we need to receive from a swap
    // without the transaction reverting based on the set slippage tolerance
    function _calculateSlippage(uint256 tokenAmount) internal view returns (uint256) {
        return (10**BASIS_POINTS - slippageTolerance) * tokenAmount / 10**BASIS_POINTS;
    }

    // Get the amount of the token specified by `tokenAddress` that we should expect to receive
    // in exchange for spending `reserveTokenAmount` reserve tokens.
    function _buyAmount(IUniswapV2Router02 router, address tokenAddress, uint256 reserveTokenAmount) internal view returns (uint256) {
        address[] memory path = _buyPath(router, tokenAddress);
        uint256[] memory amountsOut = router.getAmountsOut(
            reserveTokenAmount,
            path
        );
        return amountsOut[amountsOut.length - 1];
    }

    // Swap `amount` reserve tokens for the token specified by `tokenAddress`,
    // factoring in slippage tolerance.
    // There must be a path from reserveToken -> WETH -> token on uniswap, otherwise
    // this operation will fail.
    function _buy(IUniswapV2Router02 router, address tokenAddress, uint256 amount) internal {
        require(amount <= getReserveTokenBalance(), "Insufficient reserve token balance.");
        uint256 minimumOut = _calculateSlippage(_buyAmount(router, tokenAddress, amount));
        address[] memory path = _buyPath(router, tokenAddress);
        reserveToken.approve(uniswapV2Router02Address, amount);
        router.swapExactTokensForTokensSupportingFeeOnTransferTokens(
            amount,
            minimumOut,
            path,
            address(this),
            block.timestamp + deadlineOffset
        );
    }

    // Get the amount of reserve tokens we should expect to receive in exchange for spending
    // `tokenAmount` of the token specified by `tokenAddress`.
    function _sellAmount(IUniswapV2Router02 router, address tokenAddress, uint256 tokenAmount) internal view returns (uint256) {
        address[] memory path = _sellPath(router, tokenAddress);
        uint256[] memory amountsOut = router.getAmountsOut(
            tokenAmount,
            path
        );
        return amountsOut[amountsOut.length - 1];
    }

    // Swap `amount` of the token specified by `tokenAddress` for reserve tokens,
    // factoring in slippage tolerance.
    // There must be a path from token -> WETH -> reserveToken on uniswap, otherwise
    // this operation will fail.
    function _sell(IUniswapV2Router02 router, address tokenAddress, uint256 amount, address to) internal {
        IERC20 token = IERC20(tokenAddress);
        require(amount <= token.balanceOf(address(this)), "Insufficient token balance.");
        uint256 minimumOut = _calculateSlippage(_sellAmount(router, tokenAddress, amount));
        address[] memory path = _sellPath(router, tokenAddress);
        token.approve(uniswapV2Router02Address, amount);
        router.swapExactTokensForTokensSupportingFeeOnTransferTokens(
            amount,
            minimumOut,
            path,
            to,
            block.timestamp + deadlineOffset
        );
    }
}