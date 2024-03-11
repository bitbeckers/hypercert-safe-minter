import {useHypercertClient} from "@/hooks/useHypercertClient";
import {useEffect, useState} from "react";
import {useAccount} from "wagmi";

export const useFetchClaimsForAccount = () => {
    const {address} = useAccount();
    const {client} = useHypercertClient();
    const [claims, setClaims] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (client && address) {
            setIsLoading(false);
            const getClaimsForAccount = async () => {
                const claims = await client.indexer.claimsByOwner(address);
                if (claims && claims.length > 0)
                    console.log(claims);
                setClaims(claims);
            };

            getClaimsForAccount();
        }
    }, [client, address]);

    return {
        claims,
        isLoading
    };
}