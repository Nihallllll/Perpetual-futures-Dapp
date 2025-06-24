// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/perpetual-futures.sol"; // Adjust the path

contract DeployScript is Script {
    function setUp() public {}

    function run() public {
        vm.startBroadcast();
        Perps perps = new Perps(); // add constructor args if any
        vm.stopBroadcast();
    }
}
