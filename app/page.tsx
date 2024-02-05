"use client";
import { Box, Flex, Spacer, Text } from "@chakra-ui/react";
import { HypercertMinter } from "@/components/HypercertMinter";
import { ConnectKitButton } from "connectkit";
import { useAccount } from "wagmi";
import { useAutoConnect } from "@/hooks/useAutoConnect";
import { fetchReports, transformToHypercertData } from "vd2hc";
import { useEffect, useState } from "react";
import { createColumnHelper } from "@tanstack/react-table";
import { HypercertMetadata } from "@hypercerts-org/sdk";
import { DateTime } from "luxon";
import { DataTable } from "@/components/DataTable";
import { MetadataUploader } from "@/components/MetadataUploader";
import { MintHypercerts } from "@/components/MintHypercerts";

const VD_REPORTS_ENDPOINT = "https://directus.vd-dev.org/items/reports";

interface Report {
  title: string | null;
  summary: string | null;
  image: string | null;
  original_report_url: string | null;
  states: string[] | null;
  category: string | null;
  work_timeframe: string | null;
  impact_scope: string | null;
  impact_timeframe: string | null;
  contributor: string | null;
  id: string;
  status: string;
  date_created: string | null;
  slug: string;
  story: string | null;
  bc_ratio: number | null;
  villages_impacted: number | null;
  people_impacted: number | null;
  verified_by: string[] | null;
  date_updated: string | null;
  byline: string | null;
  total_cost: string | null;
}

export type MintData = HypercertMetadata & { cid: string };

export default function Home() {
  const { address } = useAccount();

  const [metadata, setMetadata] = useState<HypercertMetadata[]>([]);
  const [cids, setCids] = useState<string[]>([]);

  const [data, setData] = useState<MintData[]>([]);

  const columnHelper = createColumnHelper<MintData>();

  console.log("CIDS: ", cids);

  //Merge metadata with cids
  useEffect(() => {
    if (metadata.length > 0) {
      if (cids.length > 0) {
        const mergedData = metadata.map((meta, index) => {
          return { ...meta, cid: cids[index] };
        });
        setData(mergedData);
      } else {
        setData(metadata as MintData[]);
      }
    }
  }, [metadata, cids]);

  const columns = [
    columnHelper.group({
      header: "Hypercert data",
      columns: [
        columnHelper.accessor("name", { header: "Name" }),
        columnHelper.accessor("description", {
          header: "Description",
          cell: (props) => (
            <span>
              {props.getValue() ? props.getValue().slice(0, 50) + "..." : "N/A"}
            </span>
          ),
        }),
        columnHelper.accessor("cid", {
          header: "CID",
          cell: (props) => (
            <span>
              {props.getValue()
                ? props.getValue().slice(0, 4) +
                  "..." +
                  props.getValue().slice(props.getValue().length - 4)
                : "N/A"}
            </span>
          ),
        }),
        columnHelper.accessor("hypercert.work_scope", {
          header: "Work scope",
          cell: (props) => <span>{props.getValue().value}</span>,
        }),
        columnHelper.accessor("hypercert.work_timeframe.value", {
          cell: (props) => (
            <span>
              {`${DateTime.fromSeconds(props.getValue()[0]).toISODate()} -
                ${
                  props.getValue()[1] === 0
                    ? "\u221e"
                    : DateTime.fromSeconds(props.getValue()[1]).toISODate()
                }`}
            </span>
          ),
          header: "Work timeframe",
        }),
        columnHelper.accessor("hypercert.impact_scope.value", {
          header: "Impact scope",
        }),
        columnHelper.accessor("hypercert.impact_timeframe.value", {
          header: "Impact timeframe",
          cell: (props) => (
            <span>
              {`${DateTime.fromSeconds(props.getValue()[0]).toISODate()} -
                ${
                  props.getValue()[1] === 0
                    ? "\u221e"
                    : DateTime.fromSeconds(props.getValue()[1]).toISODate()
                }`}
            </span>
          ),
        }),
        columnHelper.accessor("hypercert.contributors.value", {
          header: "Contributors",
        }),
      ],
    }),
  ];

  useAutoConnect();

  useEffect(() => {
    const fetchVoicedeckReports = async () => {
      const response = await fetchReports(VD_REPORTS_ENDPOINT);

      if (response && response.data.length > 0) {
        const metadata = response.data.map((res: Report) =>
          transformToHypercertData(res)
        );
        setMetadata(metadata);
      }
    };

    fetchVoicedeckReports();
  }, []);

  if (!address) {
    return (
      <Flex
        direction={"column"}
        justifyContent={"space-between"}
        p={"2rem"}
        color={"white"}
      >
        <Flex w={"100%"} justifyContent={"space-around"}>
          <Box
            maxW="sm"
            borderWidth="1px"
            borderRadius="lg"
            p={4}
            bgColor={"rgba(49, 74, 62, 0.5)"}
          >
            <Text>
              No account connected. Please connect via app.safe.global.
            </Text>
          </Box>
          <Spacer />
          <ConnectKitButton />
        </Flex>
      </Flex>
    );
  }

  return (
    <Flex
      direction={"column"}
      justifyContent={"space-between"}
      p={"2rem"}
      color={"white"}
    >
      <Flex w={"100%"} justifyContent={"space-around"}>
        <Box
          maxW="sm"
          borderWidth="1px"
          borderRadius="lg"
          p={4}
          bgColor={"rgba(49, 74, 62, 0.5)"}
        >
          <Text>
            Very PoC, use at own risk. This is a demo app for the Hypercert SDK
            and VoiceDeck
          </Text>
        </Box>
        <Spacer />
        <ConnectKitButton />
      </Flex>

      <Flex
        direction={"column"}
        w={"100%"}
        justifyContent={"center"}
        alignItems={"center"}
        p={"5rem"}
      >
        <MetadataUploader data={metadata} onUpload={setCids} />
        {cids && cids.length > 0 && <MintHypercerts data={data} />}
        <DataTable columns={columns} data={data} />
      </Flex>
    </Flex>
  );
}
