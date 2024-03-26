import { Flex } from "@chakra-ui/react";
import { DataTable } from "@/components/DataTable";
import { useEffect, useState } from "react";
import {
  HypercertMetadata,
  getFromIPFS,
  validateMetaData,
} from "@hypercerts-org/sdk";
import { createColumnHelper } from "@tanstack/react-table";
import { useFetchFractionsForAccount } from "@/hooks/useFetchFractionsForAccount";
import { CreateOrderButton } from "@/components/CreateOrderButton";
import { UpdateCMSButton } from "@/components/UpdateCMSButton";

export type ClaimData = {
  id: string;
  cid: string;
  tokenID: string;
  hypercert: HypercertMetadata;
};

export const ReportPage = () => {
  const { fractions, isLoading } = useFetchFractionsForAccount();
  const [data, setData] = useState<ClaimData[]>([]);

  console.log(fractions);

  useEffect(() => {
    const fetchDataForClaims = async () => {
      if (!fractions) return;
      const hypercerts = await Promise.all(
        fractions.map(async (fraction: any) => {
          const metadata = await getFromIPFS(fraction?.claim.uri).then((res) =>
            validateMetaData(res) ? (res as HypercertMetadata) : null,
          );

          if (!metadata) return null;

          return {
            id: fraction?.claim.id,
            cid: fraction?.claim.uri,
            tokenID: fraction?.tokenID,
            hypercert: metadata,
          };
        }),
      ).then((res) => res.flatMap((r) => (r ? ([r] as ClaimData[]) : [])));

      setData(hypercerts);
    };
    if (fractions && fractions.length > 0) {
      fetchDataForClaims();
    }
  }, [fractions]);

  if (isLoading)
    return (
      <Flex
        direction={"column"}
        w={"100%"}
        justifyContent={"center"}
        alignItems={"center"}
        p={"5rem"}
      >
        Loading...
      </Flex>
    );

  if (!fractions || fractions.length === 0)
    return (
      <Flex
        direction={"column"}
        w={"100%"}
        justifyContent={"center"}
        alignItems={"center"}
        p={"5rem"}
      >
        No claims found, are you connected?
      </Flex>
    );

  const columnHelper = createColumnHelper<ClaimData>();

  const columns = [
    columnHelper.group({
      header: "Impact reports",
      columns: [
        columnHelper.accessor("hypercert.name", { header: "Name" }),
        columnHelper.accessor("hypercert.description", {
          header: "Description",
          cell: (props) => (
            <span>
              {props.getValue() ? props.getValue().slice(0, 50) + "..." : "N/A"}
            </span>
          ),
        }),
        columnHelper.accessor("tokenID", {
          header: "Token ID",
          cell: (props) => (
            <Flex justifyContent={"space-between"}>
              <span>{`${props.getValue().toString().slice(0, 10)}...${props.getValue().toString().slice(30)}`}</span>
              <CreateOrderButton tokenId={props.getValue()} />
            </Flex>
          ),
        }),
      ],
    }),
  ];

  return (
    <Flex
      direction={"column"}
      w={"100%"}
      justifyContent={"center"}
      alignItems={"center"}
      p={"5rem"}
    >
      <UpdateCMSButton claims={data} />
      <DataTable columns={columns} data={data} />
    </Flex>
  );
};
