// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
import "./USDC.sol";
contract Perps {
   //this will how a user position will look like 
   struct Position{
      uint entryPrice;//current market price
      uint leverage;//money multiplier
      uint timestamp;//time is money
      uint margin;//actually i have this much
      uint size;//margin times leverage
      bool isLong;//high or low 
      uint quantity;//how much of the stock you bought
   }
   USDC public usdcToken;
   uint public lossedMoney;
   //address wise user positions 
   mapping(address => Position) userPositions;
  

  /*
     
     Events

  */
   event PositionOpened(address indexed user, bool isLong, uint size, uint quantity, uint entryPrice);
   event MarginAdded(address indexed user , uint size , uint quantity , uint addedMargin);
   event MarginRemoved(address indexed user , uint amount , uint size );
   /*
     
     Functions

  */
   function openPosition(uint margin, uint leverage, bool isLong,uint latestPrice) external {
      require(latestPrice > 0,"Latest Price is not valid");
      require(margin > 0 ,"Not a valid amount");
      uint positionSize  = margin * leverage ;
      uint quantity = (positionSize * 1e18) / latestPrice;
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


   function getPnL(uint latestPrice) external view returns(uint amount){
      Position storage userPosition = userPositions[msg.sender];
      if (userPosition.isLong){
      amount = latestPrice - userPosition.entryPrice * userPosition.quantity;
      }else{
      amount = userPosition.entryPrice - latestPrice * userPosition.quantity;
      }
      return amount ; 
   }

   function addMargin(uint amount ,uint latestPrice) external {
      require(userPositions[msg.sender].size  > 0 ,"No active positions");
      Position storage userPosition =  userPositions[msg.sender];
      userPosition.margin += amount;
      userPosition.size =  userPosition.margin * userPosition.leverage;
      userPosition.quantity = (userPosition.size * 1e18) / latestPrice ;
      emit MarginAdded(msg.sender, userPosition.size, userPosition.quantity, amount); 
   }


   function removeMargin(uint amount , uint latestPrice) external {
      require(userPositions[msg.sender].size  > 0 ,"No active positions");
      Position storage userPosition =  userPositions[msg.sender];
     
      uint pnl;
      if(userPosition.isLong){
         pnl = (latestPrice > userPosition.entryPrice) ? (latestPrice - userPosition.entryPrice) * userPosition.quantity /1e18 : 0 ;
      }else{
         pnl = (latestPrice < userPosition.entryPrice) ? ( userPosition.entryPrice - latestPrice ) * userPosition.quantity /1e18 : 0 ;
      }
      

      uint newMargin = userPosition.margin - amount ;
      uint positionSize = userPosition.size;
      uint maintenanceMargin = positionSize / 10; // Example: 10% of position size
      //uint marginRatio = (newMargin + pnl) * 100 / positionSize;

      require((newMargin + pnl) >= maintenanceMargin, "Cannot remove, margin too low");

    // Apply the removal
      userPosition.margin = newMargin;
      userPosition.size = newMargin * userPosition.leverage;
      userPosition.quantity = (userPosition.size * 1e18) / latestPrice;
      

      emit MarginRemoved(msg.sender, amount, userPosition.size);
   }

  function closePosition(uint latestPrice) external {
    require(latestPrice > 0, "Latest Price is not valid");
    require(userPositions[msg.sender].size > 0, "No active positions");

    Position storage userPosition = userPositions[msg.sender];
    
    int pnl;

    if (userPosition.isLong) {
        pnl = int(latestPrice - userPosition.entryPrice) * int(userPosition.quantity) / 1e18;
    } else {
        pnl = int(userPosition.entryPrice - latestPrice) * int(userPosition.quantity) / 1e18;
    }
    uint rewardOrloss;
   if(pnl >=0){
      rewardOrloss = userPosition.margin  + uint(pnl) ;
      usdcToken.mint(msg.sender, uint(pnl));
   }else{
      rewardOrloss = userPosition.margin - uint(pnl);
      lossedMoney += rewardOrloss ;       
   }

    delete userPositions[msg.sender]; // Close position
    
}

}