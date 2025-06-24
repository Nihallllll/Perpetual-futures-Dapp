import { useAccount, useConnect, useDisconnect } from 'wagmi'

export function Appbar() {
  const { address } = useAccount()

  return <div className='flex justify-between p-2 m-2'>
    <div className='text-2xl'>
        Stakify
    </div>
    <div>
        {!address ? <Connectors /> : <Disconnect />}
    </div>
  </div>
}
    
function Connectors() {
    const { connectors, connect } = useConnect()
    return connectors.map((connector) => (
        <button className='mx-2 border rounded p-2' key={connector.uid} onClick={() => connect({ connector })}>
        {connector.name}
        </button>
    ))
}

function Disconnect() {
    const {disconnect} = useDisconnect();
    
    return <div>
        <button className='mx-2 border rounded p-2' onClick={() => disconnect()}>
            Disconnect wallet
        </button>
    </div>

}