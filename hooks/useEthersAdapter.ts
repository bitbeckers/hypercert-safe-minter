import { ethers } from "ethers";
import { EthersAdapter } from "@safe-global/protocol-kit";
import { useEthersSigner } from "./useEthersV6Signer";
import { useChainId, useWalletClient } from "wagmi";

export const useEthersAdapter = () => {
  const chainId = useChainId();
  const signer = useEthersSigner({ chainId });

  if (!signer) {
    return null;
  }

  const ethAdapter = new EthersAdapter({
    ethers,
    signerOrProvider: signer,
  });

  return ethAdapter;
};
