// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Perps {
   //this will how a user position will look like 
   struct Position{
      int entryPrice;
      int leverage;
      uint timestamp;
      int margin;
      int size;
      bool isLong;
      int quantity;
   }
   //address wise user positions 
   mapping(address => Position) userPositions;
  

  /*
     
     Events

  */
   event PositionOpened(address indexed user, bool isLong, int size, int quantity, int entryPrice);
   event MarginAdded(address indexed user , bool size , int quantity , int addedMargin);

   /*
     
     Functions

  */
   function openPosition(int margin, int leverage, bool isLong,int latestPrice) external {
      require(latestPrice > 0,"Latest Price is not valid");
      require(margin > 0 ,"Not a valid amount");
      int positionSize  = margin * leverage ;
      int quantity = positionSize / latestPrice;
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
      amount = latestPrice - userPosition.entryPrice * userPosition.quantity;
      }else{
      amount = userPosition.entryPrice - latestPrice * userPosition.quantity;
      }
      return amount ; 
   }

   function addMargin(int amount ,int latestPrice) external {
      require(userPositions[msg.sender].size  > 0 ,"No active positions");
      Position storage userPosition =  userPositions[msg.sender];
      userPosition.margin += amount;
      userPosition.size =  userPosition.margin * userPosition.leverage;
      userPosition.quantity = (userPosition.size * 1e18) / latestPrice ;
      event MarginAdded(msg.sender, userPosition.size, userPosition.quantity, amount); 
   }


   function removeMargin(int amount , int latestPrice) external {
      
   }
}