import { MintData } from "@/app/page";
import { useHypercertClient } from "@/hooks/useHypercertClient";
import { Button, Flex } from "@chakra-ui/react";
import { useState } from "react";
import { encodeFunctionData, parseEther } from "viem";
import {
  MetaTransactionData,
  OperationType,
} from "@safe-global/safe-core-sdk-types";
import { HypercertMinterAbi } from "@hypercerts-org/sdk";
import { useSafeAppsSDK } from "@safe-global/safe-apps-react-sdk";

export type MintHypercertProps = {
  data: MintData[];
};

export function MintHypercerts({ data }: MintHypercertProps) {
  const [isMinting, setIsMinting] = useState(false);
  const { client, chainId } = useHypercertClient();

  const { sdk, connected, safe } = useSafeAppsSDK();

  console.log("Connected: ", connected);

  const filterCids = data.map((d) => d.cid).filter((e) => String(e).trim());

  const encodeMintClaim = ({ metadata }: { metadata: string }) => {
    // function mintClaim(address account, uint256 units, string memory _uri, TransferRestrictions restrictions)

    return encodeFunctionData({
      abi: HypercertMinterAbi,
      functionName: "mintClaim",
      args: [safe.safeAddress, parseEther("1"), metadata, 0],
    });
  };

  const createBatchTransactions = async () => {
    setIsMinting(true);
    if (!chainId) {
      console.log("Chain ID not supported");
      setIsMinting(false);
      return;
    }

    const to = client?.getDeployment(chainId).addresses?.HypercertMinterUUPS;

    if (!to) {
      console.log("HypercertMinterUUPS address not found");
      setIsMinting(false);
      return;
    }

    const operation = OperationType.Call;
    const value = "0";

    const transactions = filterCids.map((cid) => {
      const data: MetaTransactionData = {
        to,
        operation,
        value,
        data: encodeMintClaim({ metadata: cid }),
      };

      return data;
    });

    console.log("TXS: ", transactions);

    const res = await sdk.txs.send({ txs: transactions });

    console.log("Submitted txs: ", res);
    setIsMinting(false);
  };

  return (
    <Flex
      mt="2em"
      direction={"column"}
      justifyContent={"center"}
      alignItems={"center"}
      gap={"1em"}
    >
      <Button
        colorScheme="teal"
        size="lg"
        onClick={createBatchTransactions}
        isLoading={isMinting}
        isDisabled={filterCids.length === 0}
      >
        Mint Hypercert
      </Button>
    </Flex>
  );
}
