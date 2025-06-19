// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
contract USDC is ERC20,Ownable{
    uint256 amountMinted;
    constructor () ERC20("usd","usd"){}

      function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
      }

}
