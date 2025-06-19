// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Perp {
   //this will how a user position will look like 
   struct Position{
      uint entryPrice;
      uint leverage;
      uint timestamp;
      uint margin;
      uint size;
      bool isLong;
      uint quantity;
   }
   //address wise user positions 
   mapping(address => Position) userPositions;
  

  /*
     
     Events

  */
   event PositionOpened(address indexed user, bool isLong, uint size, uint quantity, uint entryPrice);


   /*
     
     Functions

  */
   function openPosition(uint margin, uint leverage, bool isLong,uint latestPrice) external {
      require(latestPrice > 0,"Latest Price is not valid");
      require(margin > 0 ,"Not a valid amount");
      uint positionSize  = margin * leverage ;
      uint quantity = positionSize / latestPrice;
      userPositions[msg.sender] = Position({
         entryPrice : latestPrice,
         leverage: leverage,
         timestamp : block.timestamp,
         margin : margin,
         size : positionSize,
         isLong : isLong,
         quantity : quantity
      });
      emit PositionOpened(msg.sender, isLong, positionSize, quantity, latestPrice);
   }


   function getPnL(int latestPrice) external view returns(int amount){
      Position storage userPosition = userPositions[msg.sender];
      if (userPosition.isLong){
      amount = int(latestPrice - userPosition.entryPrice) * int(userPosition.quantity);
      }else{
      amount = int(userPosition.entryPrice - latestPrice) * int(userPosition.quantity);
      }
      return amount ; 
   }
}