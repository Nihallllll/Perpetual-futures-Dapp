import { useWriteContract, useReadContract } from "wagmi";
import { Perpabi } from "../abi";
type Position = {
  entryPrice: bigint;
  margin: bigint;
  leverage: number;
  timestamp: bigint;
  size: bigint;
  isLong: boolean;
  quantity: bigint;
};

export function Dashboard() {
  const { writeContract } = useWriteContract();

  return (
    <div className="h-screen w-screen flex justify-center items-center">
      <div>
        <button
          className="mx-2 border rounded p-2 text-2xl"
          onClick={() => {
            writeContract({
              address: "0x2CC3cd0ebA37db68c909b90972E1E500BC82Cdf4",
              abi: Perpabi,
              functionName: "openPosition",
              args: [
                BigInt(1000 * 1e6), // 1000 USDC margin
                5, // 5x leverage
                true, // isLong
                BigInt(42000 * 1e8), // latest price
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
    </div>
  );
}
function ShowUserPosition() {
  const { data } = useReadContract({
    address: "0x2CC3cd0ebA37db68c909b90972E1E500BC82Cdf4",
    abi: Perpabi,
    functionName: "getUserPosition",
    args: ["0x2966473D85A76A190697B5b9b66b769436EFE8e5"],
  }) as { data: Position | undefined }; // ✅ Type assertion

  const position = data;

  return (
    <div>
      {position ? (
        <>
          <p>Entry Price: {Number(position.entryPrice) / 1e8}</p>
          <p>Margin: {Number(position.margin) / 1e6} USDC</p>
          <p>Leverage: {position.leverage}x</p>
          <p>Size: {Number(position.size) / 1e6}</p>
          <p>Quantity: {Number(position.quantity) / 1e18}</p>
          <p>Long: {position.isLong ? 'Yes' : 'No'}</p>
        </>
      ) : (
        <p>Loading or no position</p>
      )}
    </div>
  );
}
