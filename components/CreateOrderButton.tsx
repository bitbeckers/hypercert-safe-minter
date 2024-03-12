import {useCreateOrder} from "@/hooks/useCreateOrder";
import {Button} from "@chakra-ui/react";
import {useHypercertExchange} from "@/hooks/useHypercertsExchange";
import {useEffect, useState} from "react";
import {useChainId} from "wagmi";
import {Maker} from "@hypercerts-org/marketplace-sdk";
import {useCancelOrders} from "@/hooks/useCancelOrders";

export const CreateOrderButton = ({tokenId}: { tokenId: string }) => {
    const hypercertExchange = useHypercertExchange();
    const {createOrder} = useCreateOrder();
    const {cancelOrders} = useCancelOrders();
    const chainId = useChainId();

    const [orders, setOrders] = useState<Maker[]>();
    const [isTransferManagerApproved, setTransferManagerApproved] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);


    useEffect(() => {
        const checkApprovals = async () => {
            if (hypercertExchange) {
                const isTransferManagerApproved = await hypercertExchange.isTransferManagerApproved();
                setTransferManagerApproved(isTransferManagerApproved);
                setIsLoading(false);
            }
        }

        checkApprovals();
    }, [hypercertExchange]);

    useEffect(() => {
            const fetchOrderForTokenId = async (tokenId: string) => {
                if (hypercertExchange && hypercertExchange.api && tokenId) {
                    const _orders = await hypercertExchange.api.fetchOrdersByHypercertId({hypercertId: tokenId, chainId});

                    console.log(_orders);
                    if (!_orders || !_orders.data) return;

                    setOrders(_orders.data);
                }
            }

            fetchOrderForTokenId(tokenId);
        }, [hypercertExchange, chainId, tokenId]
    );

    const createOrderOnClick = async () => {
        const res = await createOrder(tokenId);
        if (!res) {
            console.log("Error creating order");
            return;
        }
        const {maker, isTransferManagerApproved} = res;
        console.log(res);
        setTransferManagerApproved(isTransferManagerApproved);
        setOrders([maker]);
    };

    const cancelOrdersOnClick = async () => {
        if (!orders) return;
        const res = await cancelOrders(orders?.map((order) => order.orderNonce));
        console.log(res);
    }

    const isDisabled = orders ? orders?.map((order) => order?.itemIds?.find((itemId) => itemId === tokenId)).flatMap((x) => x).length > 0 : false;

    if (orders && orders.length > 0) {
        return (<Button onClick={cancelOrdersOnClick} isDisabled={true} colorScheme={"red"}>Cancel sale</Button>)
    }

    const label = isTransferManagerApproved ? "Create sale" : "Approve marketplace";
    return (<Button onClick={createOrderOnClick}
                    isDisabled={isDisabled} isLoading={isLoading}> {label} </Button>)
}