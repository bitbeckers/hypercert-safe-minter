import {useHypercertExchange} from "@/hooks/useHypercertsExchange";
import {useWalletClient} from "wagmi";
import {BigNumberish} from "ethers";

export const useCancelOrders = () => {
    const hypercertExchangeClient = useHypercertExchange();

    const cancelOrders = async (nonces: BigNumberish[]) => {
        if (!hypercertExchangeClient) return;

        return hypercertExchangeClient.cancelOrders(nonces);

    }

    return {cancelOrders};
}