import { BlockchainSelector } from "./BlockchainSelector";

interface Step2FormProps {
  selectedChains: string[];
  onUpdate: (chains: string[]) => void;
}

export function Step2Form({ selectedChains, onUpdate }: Step2FormProps) {
  return (
    <BlockchainSelector 
      selectedChains={selectedChains}
      onSelectionChange={onUpdate}
    />
  );
}