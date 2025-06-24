import { useEffect, useState } from "react";
import { useWriteContract, useReadContract } from "wagmi";
import { Perpabi } from "../abi";
import { useAccount } from 'wagmi'
type Position = {
  entryPrice: bigint;
  margin: bigint;
  leverage: number;
  timestamp: bigint;
  size: bigint;
  isLong: boolean;
  quantity: bigint;
};

export function OpenPosition() {
  const { writeContract } = useWriteContract();
  const [latestPrice, setLatestPrice] = useState<number | null>(null);

  // 🔁 Fetch latest price from Binance every 5 seconds
  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const res = await fetch("https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT");
        const data = await res.json();
        setLatestPrice(Number(data.price));
      } catch (err) {
        console.error("Failed to fetch price:", err);
      }
    };

    fetchPrice();
    const interval = setInterval(fetchPrice, 5000); // refresh every 5 sec
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center">
      <div className="mb-4 text-lg">
        Latest Price: {latestPrice ? `$${latestPrice.toFixed(2)}` : "Loading..."}
      </div>

      <button
        className="mx-2 border rounded p-2 text-2xl"
        disabled={!latestPrice}
        onClick={() => {
          if (!latestPrice) return;

          writeContract({
            address: "0x2CC3cd0ebA37db68c909b90972E1E500BC82Cdf4",
            abi: Perpabi,
            functionName: "openPosition",
            args: [
              BigInt(1000 * 1e6), // 1000 USDC margin
              5,                  // 5x leverage
              true,               // isLong
              BigInt(latestPrice * 1e8), // price scaled for 8 decimals
            ],
          });
        }}
      >
        Open Position
      </button>

      <div>
        <ShowUserPosition />
      </div>
    </div>
  );
}

function ShowUserPosition() {
  const {address} = useAccount();
  const { data } = useReadContract({
    address: "0x2CC3cd0ebA37db68c909b90972E1E500BC82Cdf4",
    abi: Perpabi,
    functionName: "getUserPosition",
    args: address ? [address] : [],
    
  });

  let position: Position | null = null;

  if (Array.isArray(data) && data.length === 7) {
    position = {
      entryPrice: BigInt(data[0]),
      margin: BigInt(data[1]),
      leverage: Number(data[2]),
      timestamp: BigInt(data[3]),
      size: BigInt(data[4]),
      isLong: Boolean(data[5]),
      quantity: BigInt(data[6]),
    };
  }

  return (
    <div>
      {position ? (
        <>
          <p>Entry Price: {Number(position.entryPrice) / 1e8}</p>
          <p>Margin: {Number(position.margin) / 1e6} USDC</p>
          <p>Leverage: {position.leverage}x</p>
          <p>Size: {Number(position.size) / 1e6}</p>
          <p>Quantity: {Number(position.quantity) / 1e18}</p>
          <p>Long: {position.isLong ? "Yes" : "No"}</p>
        </>
      ) : (
        <p>Loading or no position</p>
      )}
    </div>
  );
}
