"use client";
import {Box, Button, Flex, Spacer, Text} from "@chakra-ui/react";
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
                    <Spacer/>
                    <ConnectKitButton/>
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
            <Flex w={"100%"} justifyContent={"space-around"} pb={4}>
                <Flex>
                    <Link href={'/'} onClick={() => handlePageSelection("minting")} pr={4}>
                        <Button
                            colorScheme="teal"
                            size="lg">Minting</Button>
                    </Link>
                    <Link href={'/'} onClick={() => handlePageSelection("reports")} pr={4}>
                        <Button colorScheme="teal"
                                size="lg">Reports</Button>
                    </Link>
                </Flex>
                <Spacer/>


                <Spacer/>
                <ConnectKitButton/>
            </Flex>
            <Flex
                borderWidth="1px"
                borderRadius="lg"
                bgColor={"rgba(253,253,150,0.75)"}
                justifyContent={"center"}
                alignItems={"center"}
            >
                <Text p={2} color={"black"}>
                    Very PoC, use at own risk. This is a demo app for the Hypercert SDK
                    and VoiceDeck
                </Text>
            </Flex>

            <Flex p={2}>
                {page === "minting" && <MintPage/>}
                {page === "reports" && <ReportPage/>}
            </Flex>

        </Flex>
    );
}
