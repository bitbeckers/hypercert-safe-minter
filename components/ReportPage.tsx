import {Flex} from "@chakra-ui/react";
import {MetadataUploader} from "@/components/MetadataUploader";
import {MintHypercerts} from "@/components/MintHypercerts";
import {DataTable} from "@/components/DataTable";
import {useEffect, useState} from "react";
import {HypercertMetadata} from "@hypercerts-org/sdk";
import {createColumnHelper} from "@tanstack/react-table";
import {fetchReports, transformToHypercertData, Report} from "vd2hc";
import {DateTime} from "luxon";
import {useFetchClaimsForAccount} from "@/hooks/useFetchClaimsForAccount";

type ClaimData = {
    id: string;
    cid: string;
    name: string;
    description: string;
    hypercert: HypercertMetadata;
}
export const ReportPage = () => {
    const {claims, isLoading} = useFetchClaimsForAccount();

    if (claims) console.log(claims[0]);

    if (isLoading) return (<Flex direction={"column"}
                                 w={"100%"}
                                 justifyContent={"center"}
                                 alignItems={"center"}
                                 p={"5rem"}>Loading...</Flex>)

    if (!claims || claims.length === 0) return (<Flex direction={"column"}
                                                      w={"100%"}
                                                      justifyContent={"center"}
                                                      alignItems={"center"}
                                                      p={"5rem"}>No claims found</Flex>)

    const columnHelper = createColumnHelper<ClaimData>();


    const columns = [
        columnHelper.group({
            header: "Impact reports",
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

            ],
        }),
    ];

    return (<Flex
        direction={"column"}
        w={"100%"}
        justifyContent={"center"}
        alignItems={"center"}
        p={"5rem"}
    >
        <MetadataUploader data={metadata} onUpload={setCids}/>
        {cids && cids.length > 0 && <MintHypercerts data={data}/>}
        <DataTable columns={columns} data={data}/>
    </Flex>)

}