import { useHypercertClient } from "@/hooks/useHypercertClient";
import { Button, Flex } from "@chakra-ui/react";
import { useState } from "react";
import { encodeFunctionData, parseEther } from "viem";
import { HypercertMinterAbi } from "@hypercerts-org/sdk";
import { MintData } from "@/components/MintPage";
import { useAccount, useSendTransaction } from "wagmi";

export type MintHypercertProps = {
  data: MintData[];
};

export function MintHypercerts({ data }: MintHypercertProps) {
  const [isMinting, setIsMinting] = useState(false);
  const { client, chainId } = useHypercertClient();
  const { address, isConnected } = useAccount();
  const { sendTransactionAsync } = useSendTransaction();

  console.log("Connected: ", isConnected);

  const filterCids = data.map((d) => d.cid).filter((e) => String(e).trim());

  const encodeMintClaim = ({ metadata }: { metadata: string }) => {
    // function mintClaim(address account, uint256 units, string memory _uri, TransferRestrictions restrictions)

    return encodeFunctionData({
      abi: HypercertMinterAbi,
      functionName: "mintClaim",
      args: [address, parseEther("1"), metadata, 0],
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

    const value = 0n;

    const res = await Promise.all([
      ...filterCids.map((cid) => {
        return sendTransactionAsync({
          to,
          value,
          data: encodeMintClaim({ metadata: cid }),
        });
      }),
    ]);

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
