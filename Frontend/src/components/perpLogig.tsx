import { useEffect, useState } from "react";
import { useWriteContract, useReadContract } from "wagmi";
import { Perpabi } from "../abi";
import { useAccount } from "wagmi";
import { parseEther } from "viem";
type Position = {
  entryPrice: bigint;
  margin: bigint;
  leverage: number;
  timestamp: bigint;
  size: bigint;
  isLong: boolean;
  quantity: bigint;
};

export function ClosePosition() {
  const { writeContract } = useWriteContract();
  const [latestPrice, setLatestPrice] = useState<number | null>(null);

  // 🔁 Fetch latest price from Binance every 5 seconds
  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const res = await fetch(
          "https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT"
        );
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
        Latest Price:{" "}
        {latestPrice ? `$${latestPrice.toFixed(2)}` : "Loading..."}
      </div>

      <button
        className="mx-2 border rounded p-2 text-2xl"
        disabled={!latestPrice}
        onClick={() => {
          if (!latestPrice) return;

          writeContract({
            address: "0xa50Fb02A6e1f4D9C3EcE2d225042Fb8c74Bc64d1",
            abi: Perpabi,
            functionName: "closePosition",
            args: [
              BigInt(latestPrice * 1e8), // price scaled for 8 decimals
            ],
          });
        }}
      >
        Close Position
      </button>
    </div>
  );
}

export function OpenPosition() {
  const { writeContract } = useWriteContract();
  const [latestPrice, setLatestPrice] = useState<number | null>(null);
  const [margin, setMargin] = useState(0);
  const [leverage, setleverage] = useState(0);
  // 🔁 Fetch latest price from Binance every 5 seconds
  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const res = await fetch(
          "https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT"
        );
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
        Latest Price:{" "}
        {latestPrice ? `$${latestPrice.toFixed(2)}` : "Loading..."}
      </div>
      <input
        type="Number"
        placeholder="Margin"
        onChange={(e) => setMargin(Number(e.target.value))}
      ></input>
      <input
        type="Number"
        placeholder="Leverage"
        onChange={(e) => setleverage(Number(e.target.value))}
      ></input>
      <button
        className="mx-2 border rounded p-2 text-2xl"
        disabled={!latestPrice}
        onClick={() => {
          if (!latestPrice) return;
           console.log(leverage , margin);
          writeContract({
            address: "0xa50Fb02A6e1f4D9C3EcE2d225042Fb8c74Bc64d1",
            abi: Perpabi,
            functionName: "openPosition",
            args: [
              leverage, // leverage (e.g., 5 for 5x)
              true, // isLong (true for long, false for short)
              BigInt(latestPrice * 1e8), // price scaled for 8 decimals
            ],
            
            value: parseEther(margin.toString()),
          });
        }}
      >
        Open Position
      </button>
    </div>
  );
}

export function ShowUserPosition() {
  const { address } = useAccount();
  const { data, refetch } = useReadContract({
    address: "0xa50Fb02A6e1f4D9C3EcE2d225042Fb8c74Bc64d1",
    abi: Perpabi,
    functionName: "getUserPosition",
    args: address ? [address] : [length - 1],
  });

  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 5000); // every 5s
    return () => clearInterval(interval);
  }, [refetch]);

  let position: Position | null = null;

  if (Array.isArray(data) && data.length === 7) {
    position = {
      entryPrice: BigInt(data[0]),
      margin: BigInt(data[3]),
      leverage: Number(data[1]),
      timestamp: BigInt(data[2]),
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

export function GetPnl() {
  const { address } = useAccount();
  const [latestPrice, setLatestPrice] = useState<number | null>(null);
  const [shouldFetch, setShouldFetch] = useState(false);

  const { data, refetch, isFetching } = useReadContract({
    address: "0xa50Fb02A6e1f4D9C3EcE2d225042Fb8c74Bc64d1",
    abi: Perpabi,
    functionName: "getPnL",
    args: latestPrice ? [BigInt(latestPrice * 1e8)] : undefined,
    query: {
      enabled: false, // we will call manually
    },
  });

  // 🔁 Fetch latest price from Binance every 5 seconds
  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const res = await fetch(
          "https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT"
        );
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

  // 🔁 Trigger read when button clicked
  useEffect(() => {
    if (shouldFetch && latestPrice) {
      refetch();
      setShouldFetch(false); // reset flag
    }
  }, [shouldFetch, latestPrice, refetch]);

  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center">
      <div className="mb-4 text-lg">
        Latest Price:{" "}
        {latestPrice ? `$${latestPrice.toFixed(2)}` : "Loading..."}
      </div>

      <button
        className="mx-2 border rounded p-2 text-2xl"
        disabled={!latestPrice || isFetching}
        onClick={() => {
          setShouldFetch(true);
        }}
      >
        Get PnL
      </button>

      <div>
        sadsada
        {data !== undefined && (
          <p>PnL: {Number(data) / 1e6} USDC</p> // adjust formatting if needed
        )}
      </div>
    </div>
  );
}
