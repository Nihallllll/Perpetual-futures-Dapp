// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
import "./USDC.sol";

contract USDCfaucet {
    USDC public usdc ;
    mapping (address => bool ) claims;
    function claim(address _address) external{
        require(claims[_address] == false , "Alredy claimed");
        usdc.mint(_address, 1000);
        claims[_address] = true;
    }
}