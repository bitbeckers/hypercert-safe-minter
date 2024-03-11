"use client";
import {Box, Flex, Spacer, Text} from "@chakra-ui/react";
import {ConnectKitButton} from "connectkit";
import {useAccount} from "wagmi";
import {useAutoConnect} from "@/hooks/useAutoConnect";
import {MintPage} from "@/components/MintPage";
import {Link} from '@chakra-ui/next-js'
import {useState} from "react";
import {ReportPage} from "@/components/ReportPage";


export default function Home() {
    const {address} = useAccount();
    const [page, setPage] = useState<"minting" | "reports">("minting")

    useAutoConnect();

    const handlePageSelection = (page: "minting" | "reports") => {
        setPage(page);
    }

    // if (!address) {
    //     return (
    //         <Flex
    //             direction={"column"}
    //             justifyContent={"space-between"}
    //             p={"2rem"}
    //             color={"white"}
    //         >
    //             <Flex w={"100%"} justifyContent={"space-around"}>
    //                 <Box
    //                     maxW="sm"
    //                     borderWidth="1px"
    //                     borderRadius="lg"
    //                     p={4}
    //                     bgColor={"rgba(49, 74, 62, 0.5)"}
    //                 >
    //                     <Text>
    //                         No account connected. Please connect via app.safe.global.
    //                     </Text>
    //                 </Box>
    //                 <Spacer/>
    //                 <ConnectKitButton/>
    //             </Flex>
    //         </Flex>
    //     );
    // }

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
                <Box>
                    <Link href={'/'} onClick={() => handlePageSelection("minting")}>
                        Minting
                    </Link>
                    <Link href={'/'} onClick={() => handlePageSelection("reports")}>
                        Reports
                    </Link>
                </Box>
                <Spacer/>
                <ConnectKitButton/>
            </Flex>

            {page === "minting" && <MintPage/>}
            {page === "reports" && <ReportPage/>}
        </Flex>
    );
}
