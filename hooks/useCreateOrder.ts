import { useHypercertExchange } from "@/hooks/useHypercertsExchange";
import { waitForTransactionReceipt } from "viem/actions";
import { parseEther } from "viem";
import { useSignTypedData, useWalletClient } from "wagmi";
import { verifyTypedData } from "ethers";
import { utils } from "@hypercerts-org/marketplace-sdk";

export const useCreateOrder = () => {
  const hypercertExchangeClient = useHypercertExchange();
  const { data: client } = useWalletClient();
  const { signTypedDataAsync } = useSignTypedData();

  const createOrder = async (tokenId: string) => {
    if (!hypercertExchangeClient || !client) return;

    const { maker, isCollectionApproved, isTransferManagerApproved } =
      await hypercertExchangeClient.createFractionalSaleMakerAsk({
        startTime: Math.floor(Date.now() / 1000), // Use it to create an order that will be valid in the future (Optional, Default to now)
        endTime: Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60, // If you use a timestamp in ms, the function will revert
        price: parseEther("1"), // Be careful to use a price in wei, this example is for 1 ETH
        itemIds: [tokenId], // Token id of the NFT(s) you want to sell, add several ids to create a bundle
        minUnitAmount: 10, // Minimum amount of units to sell per sale
        maxUnitAmount: 1000, // Maximum amount of units to sell per sale
        minUnitsToKeep: 0, // Minimum amount of units to keep after the sale
        sellLeftoverFraction: true, // If you want to sell the leftover fraction
        currency: "0x0000000000000000000000000000000000000000", // Optional, address of the currency used for the sale. Defaults to WETH for now (0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9).
      });

    // Grant the TransferManager the right the transfer assets on behalf od the LooksRareProtocol
    if (!isTransferManagerApproved) {
      const tx = await hypercertExchangeClient
        .grantTransferManagerApproval()
        .call();
      await waitForTransactionReceipt(client, {
        hash: tx.hash as `0x${string}`,
      });
    }

    // Approve the collection items to be transferred by the TransferManager
    if (!isCollectionApproved) {
      const tx = await hypercertExchangeClient.approveAllCollectionItems(
        maker.collection,
      );
      await waitForTransactionReceipt(client, {
        hash: tx.hash as `0x${string}`,
      });
    }

    // Sign your maker order
    // const signature = await hypercertExchangeClient.signMakerOrder(maker);

    const domain = {
      name: "LooksRareProtocol",
      version: "2",
      chainId: 11155111,
      verifyingContract: "0x4DDe28116255775E6097Aa4edD288355eb74fcf6",
    };
    const types = {
      Maker: [
        { name: "quoteType", type: "uint8" },
        { name: "globalNonce", type: "uint256" },
        { name: "subsetNonce", type: "uint256" },
        { name: "orderNonce", type: "uint256" },
        { name: "strategyId", type: "uint256" },
        { name: "collectionType", type: "uint8" },
        { name: "collection", type: "address" },
        { name: "currency", type: "address" },
        { name: "signer", type: "address" },
        { name: "startTime", type: "uint256" },
        { name: "endTime", type: "uint256" },
        { name: "price", type: "uint256" },
        { name: "itemIds", type: "uint256[]" },
        { name: "amounts", type: "uint256[]" },
        { name: "additionalParameters", type: "bytes" },
      ],
    };

    console.log("Creating order");
    console.log("maker", maker);
    console.log("maker.signer", maker.signer);
    console.log("globalNonce", maker.globalNonce);
    console.log("start", maker.startTime);
    console.log("end", maker.endTime);
    console.log("", maker.orderNonce);
    console.log("", maker.price);
    console.log("subset", maker.subsetNonce);
    console.log("types", types);
    console.log("domain", domain);
    // console.log("safe address", safe.safe.safeAddress);
    const makerToEncode = {
      ...maker,
      globalNonce: maker.globalNonce.toString(),
      price: maker.price.toString(),
    };
    console.log(makerToEncode);
    // const settings = {
    //   offChainSigning: true,
    // };

    // const currentSettings = await safe.sdk.eth.setSafeSettings([settings]);
    // console.log('currentSettings', currentSettings);
    // console.log('makerHash', utils.getMakerHash(makerToEncode));
    // const messageHash = await safe.sdk.txs.signTypedMessage(typedMessage);
    // const typedMessageHash = safe.sdk.safe.calculateTypedMessageHash(typedMessage);
    // console.log('messageHash', messageHash, JSON.stringify(messageHash), typedMessageHash);
    // //@ts-ignore
    // const signature = await safe.sdk.safe.getOffChainSignature(messageHash.messageHash);
    // const isMessageSigned = await safe.sdk.safe.isMessageSigned({types, domain, message: makerToEncode, primaryType: 'Maker'}, signature.toString());

    const signature = await signTypedDataAsync({
      types,
      domain: {
        ...domain,
        verifyingContract: domain.verifyingContract as `0x${string}`,
      },
      message: makerToEncode,
      primaryType: "Maker",
    });
    console.log("wagmi signed data", signature);

    console.log("signature", signature);

    // Check if recovered address
    const typedData = hypercertExchangeClient.getTypedDataDomain();
    const recoveredAddress = verifyTypedData(
      typedData,
      utils.makerTypes,
      makerToEncode,
      signature,
    );
    const recoveredAddressMessageHash = verifyTypedData(
      domain,
      types,
      makerToEncode,
      signature,
    );
    console.log(
      "recoveredAddress",
      recoveredAddress,
      recoveredAddressMessageHash,
    );

    const registerOrderResponse = await hypercertExchangeClient.registerOrder({
      order: maker,
      signature: signature.toString(),
    });

    return {
      maker,
      isCollectionApproved,
      isTransferManagerApproved,
      registerOrderResponse,
    };
  };

  return { createOrder };
};
