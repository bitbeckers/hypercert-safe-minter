import {useHypercertClient} from "@/hooks/useHypercertClient";
import {useEffect, useState} from "react";
import {useAccount} from "wagmi";

export const useFetchFractionsForAccount = () => {
    const {address} = useAccount();
    const {client} = useHypercertClient();
    const [fractions, setFractions] = useState<unknown[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (client && address) {
            setIsLoading(true);
            const getFractionsForAccount = async () => {
                const claims = await client.indexer.fractionsByOwner(address);
                if (claims && claims.claimTokens.length > 0)
                    console.log(claims.claimTokens);
                setFractions(claims.claimTokens);
            };

            getFractionsForAccount();
            setIsLoading(false);
        }
    }, [client, address]);

    return {
        fractions,
        isLoading
    };
}