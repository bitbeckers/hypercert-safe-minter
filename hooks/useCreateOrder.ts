import {useHypercertExchange} from "@/hooks/useHypercertsExchange";
import {waitForTransactionReceipt} from "viem/actions";
import {parseEther} from "viem";
import {useWalletClient} from "wagmi";

export const useCreateOrder = () => {
    const hypercertExchangeClient = useHypercertExchange();
    const walletClientData = useWalletClient();

    const createOrder = async (tokenId: string) => {
        if (!hypercertExchangeClient) return;

        const {maker, isCollectionApproved, isTransferManagerApproved} =
            await hypercertExchangeClient.createFractionalSaleMakerAsk({
                startTime: Math.floor(Date.now() / 1000), // Use it to create an order that will be valid in the future (Optional, Default to now)
                endTime: Math.floor(Date.now() / 1000) + 86400, // If you use a timestamp in ms, the function will revert
                price: parseEther("1"), // Be careful to use a price in wei, this example is for 1 ETH
                itemIds: [tokenId], // Token id of the NFT(s) you want to sell, add several ids to create a bundle
                minUnitAmount: 10, // Minimum amount of units to sell per sale
                maxUnitAmount: 100, // Maximum amount of units to sell per sale
                minUnitsToKeep: 50, // Minimum amount of units to keep after the sale
                sellLeftoverFraction: true, // If you want to sell the leftover fraction
                currency: '0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9' // Optional, address of the currency used for the sale. Defaults to WETH for now (0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9).
            });

        // Grant the TransferManager the right the transfer assets on behalf od the LooksRareProtocol
        if (!isTransferManagerApproved) {
            const tx = await hypercertExchangeClient
                .grantTransferManagerApproval()
                .call();
            await waitForTransactionReceipt(walletClientData, {
                hash: tx.hash as `0x${string}`,
            });
        }

        // Approve the collection items to be transferred by the TransferManager
        if (!isCollectionApproved) {
            const tx = await hypercertExchangeClient.approveAllCollectionItems(
                maker.collection
            );
            await waitForTransactionReceipt(walletClientData, {
                hash: tx.hash as `0x${string}`,
            });
        }

        // Sign your maker order
        const signature = await hypercertExchangeClient.signMakerOrder(maker);

        await hypercertExchangeClient.registerOrder({
            order: maker,
            signature,
        });
    }

    return {createOrder};
}