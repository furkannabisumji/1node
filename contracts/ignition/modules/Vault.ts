import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const VaultModule = buildModule("VaultModule", (m) => {
  const vault = m.contract("Vault", []);

  return { vault };
});

export default VaultModule;
