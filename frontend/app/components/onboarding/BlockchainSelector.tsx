import { useState } from "react";

const blockchains = [
  { id: 'ethereum', name: 'Ethereum', color: 'bg-cyan-400' },
  { id: 'polygon', name: 'Polygon', color: 'bg-purple-500' },
  { id: 'arbitrum', name: 'Arbitrum', color: 'bg-orange-500' },
  { id: 'bnb', name: 'BNB Chain', color: 'bg-yellow-500' },
  { id: 'solana', name: 'Solana', color: 'bg-green-500' }
];

interface BlockchainSelectorProps {
  selectedChains: string[];
  onSelectionChange: (chains: string[]) => void;
}

export function BlockchainSelector({ selectedChains, onSelectionChange }: BlockchainSelectorProps) {
  const toggleChain = (chainId: string) => {
    const newSelection = selectedChains.includes(chainId)
      ? selectedChains.filter(id => id !== chainId)
      : [...selectedChains, chainId];
    
    onSelectionChange(newSelection);
  };

  return (
    <div className="space-y-4">
      <p className="text-neutral-500 mb-6">
        Choose the blockchains you want to use for automations:
      </p>
      
      <div className="grid grid-cols-2 gap-4">
        {blockchains.map((blockchain) => (
          <button
            key={blockchain.id}
            onClick={() => toggleChain(blockchain.id)}
            className={`p-4 rounded-lg border transition-all cursor-pointer text-left flex items-center gap-3 ${
              selectedChains.includes(blockchain.id)
                ? 'border-white bg-neutral-800/50'
                : 'border-neutral-800 hover:border-neutral-600'
            }`}
          >
            <div className={`w-3 h-3 rounded-full ${blockchain.color}`} />
            <span className="text-white font-medium">{blockchain.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}