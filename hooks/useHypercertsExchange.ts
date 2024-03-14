import {HypercertExchangeClient} from "@hypercerts-org/marketplace-sdk";
import {useChainId, WalletClient} from "wagmi";
import {BrowserProvider} from 'ethers';
import {type PublicClient, getPublicClient, getWalletClient} from '@wagmi/core';
import {useEffect, useState} from "react";

export function publicClientToProvider(publicClient: PublicClient) {
    const {chain, transport} = publicClient
    const network = {
        chainId: chain.id,
        name: chain.name,
        ensAddress: chain.contracts?.ensRegistry?.address,
    }
    return new BrowserProvider(transport, network)
}

/** Action to convert a viem Public Client to an ethers.js Provider. */
export function getEthersProvider({chainId}: { chainId?: number } = {}) {
    const publicClient = getPublicClient({chainId})
    return publicClientToProvider(publicClient)
}


export function walletClientToSigner(walletClient: WalletClient) {
    const {account, chain, transport} = walletClient
    const network = {
        chainId: chain.id,
        name: chain.name,
        ensAddress: chain.contracts?.ensRegistry?.address,
    }
    const provider = new BrowserProvider(transport, network)
    return provider.getSigner(account.address)
}

/** Action to convert a viem Wallet Client to an ethers.js Signer. */
export async function getEthersSigner({chainId}: { chainId?: number } = {}) {
    const walletClient = await getWalletClient({chainId})
    if (!walletClient) return undefined
    return walletClientToSigner(walletClient)
}

export const useHypercertExchange = () => {
    const chainId = useChainId();
    const [client, setClient] = useState<HypercertExchangeClient | null>(null);

    console.log('client', client);
    console.log('signer address', client?.signer?.getAddress());
    useEffect(() => {
        const getClient = async () => {
            if (chainId) {
                const hypercertExchangeClient = new HypercertExchangeClient(
                    chainId,
                    getEthersProvider({chainId}),
                    await getEthersSigner({chainId})
                );
                setClient(hypercertExchangeClient);
            }
        }
        if (chainId) {
            getClient();
        }
    }, [chainId]);

    return client;

}