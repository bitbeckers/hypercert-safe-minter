import {Flex} from "@chakra-ui/react";
import {MetadataUploader} from "@/components/MetadataUploader";
import {MintHypercerts} from "@/components/MintHypercerts";
import {DataTable} from "@/components/DataTable";
import {useEffect, useState} from "react";
import {HypercertMetadata, getFromIPFS} from "@hypercerts-org/sdk";
import {createColumnHelper} from "@tanstack/react-table";
import {fetchReports, transformToHypercertData, Report} from "vd2hc";
import {DateTime} from "luxon";
import {useFetchClaimsForAccount} from "@/hooks/useFetchClaimsForAccount";
import {CreateOrderButton} from "@/components/CreateOrderButton";

type ClaimData = {
    id: string;
    cid: string;
    tokenID: string;
    hypercert: HypercertMetadata;
}
export const ReportPage = () => {
    const {claims, isLoading} = useFetchClaimsForAccount();
    const [data, setData] = useState<ClaimData[]>([]);

    useEffect(() => {
        const fetchDataForClaims = async () => {
            const hypercerts = await Promise.all(claims.claims.map(async (claim) => {
                return {
                    id: claim.id,
                    cid: claim.uri,
                    tokenID: claim.tokenID,
                    hypercert: await getFromIPFS(claim.uri),
                };
            }));
            setData(hypercerts);
        }
        if (claims && claims?.claims && claims.claims.length > 0) {
            fetchDataForClaims()
        }
    }, [claims]);

    if (isLoading) return (<Flex direction={"column"}
                                 w={"100%"}
                                 justifyContent={"center"}
                                 alignItems={"center"}
                                 p={"5rem"}>Loading...</Flex>)

    if (!claims || claims.length === 0) return (<Flex direction={"column"}
                                                      w={"100%"}
                                                      justifyContent={"center"}
                                                      alignItems={"center"}
                                                      p={"5rem"}>No claims found, are you connected?</Flex>)

    const columnHelper = createColumnHelper<ClaimData>();

    console.log(claims);
    console.log(data);

    const columns = [
        columnHelper.group({
            header: "Impact reports",
            columns: [
                columnHelper.accessor("hypercert.name", {header: "Name"}),
                columnHelper.accessor("hypercert.description", {
                    header: "Description",
                    cell: (props) => (
                        <span>
              {props.getValue() ? props.getValue().slice(0, 50) + "..." : "N/A"}
            </span>
                    ),
                }),
                columnHelper.accessor("tokenID", {
                    header: () => <span>Sale</span>,
                    cell: (props) => (
                        <CreateOrderButton tokenId={props.getValue()}/>
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
        <DataTable columns={columns} data={data}/>
    </Flex>)

}