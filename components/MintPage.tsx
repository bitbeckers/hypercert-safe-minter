import {Flex} from "@chakra-ui/react";
import {MetadataUploader} from "@/components/MetadataUploader";
import {MintHypercerts} from "@/components/MintHypercerts";
import {DataTable} from "@/components/DataTable";
import {useEffect, useState} from "react";
import {HypercertMetadata} from "@hypercerts-org/sdk";
import {createColumnHelper} from "@tanstack/react-table";
import {fetchReports, transformToHypercertData, Report} from "vd2hc";
import {DateTime} from "luxon";

export type MintData = HypercertMetadata & { cid: string };

const VD_REPORTS_ENDPOINT = "https://directus.vd-dev.org";


export const MintPage = () => {
    const [metadata, setMetadata] = useState<HypercertMetadata[]>([]);
    const [cids, setCids] = useState<string[]>([]);
    const [claimIDS, setClaimIDS] = useState<string[]>([]);

    const [data, setData] = useState<MintData[]>([]);

    const columnHelper = createColumnHelper<MintData>();

    //Merge metadata with cids
    useEffect(() => {
        if (metadata.length > 0) {
            if (cids.length > 0) {
                const mergedData = metadata.map((meta, index) => {
                    return {...meta, cid: cids[index]};
                });
                setData(mergedData);
            } else {
                setData(metadata as MintData[]);
            }
        }
    }, [metadata, cids]);


    useEffect(() => {
        const fetchVoicedeckReports = async () => {
            console.log("Fetching reports");
            const response = await fetchReports(VD_REPORTS_ENDPOINT);

            console.log(response);

            if (response && response.data.length > 0) {
                const metadata = response.data.map(
                    transformToHypercertData
                );
                setMetadata(metadata);
            }
        };

        fetchVoicedeckReports();
    }, []);


    const columns = [
        columnHelper.group({
            header: "Hypercert data",
            columns: [
                columnHelper.accessor("name", {header: "Name"}),
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

    return (<Flex
        direction={"column"}
        w={"100%"}
        justifyContent={"center"}
        alignItems={"center"}
    >
        <MetadataUploader data={metadata} onUpload={setCids}/>
        {cids && cids.length > 0 && <MintHypercerts data={data}/>}
        <DataTable columns={columns} data={data}/>
    </Flex>)

}