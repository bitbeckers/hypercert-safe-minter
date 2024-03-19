import { useCreateOrder } from "@/hooks/useCreateOrder";
import { Button } from "@chakra-ui/react";
import { useHypercertExchange } from "@/hooks/useHypercertsExchange";
import { useEffect, useState } from "react";
import { useChainId, useWalletClient } from "wagmi";
import { Maker } from "@hypercerts-org/marketplace-sdk";
import { useCancelOrders } from "@/hooks/useCancelOrders";

export const CreateOrderButton = ({ tokenId }: { tokenId: string }) => {
  const hypercertExchange = useHypercertExchange();
  const { createOrder } = useCreateOrder();
  const { cancelOrders } = useCancelOrders();
  const chainId = useChainId();
  const { data: walletClient } = useWalletClient();

  const [orders, setOrders] = useState<Maker[]>();
  const [isTransferManagerApproved, setTransferManagerApproved] =
    useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkApprovals = async () => {
      if (hypercertExchange) {
        const isTransferManagerApproved =
          await hypercertExchange.isTransferManagerApproved();
        setTransferManagerApproved(isTransferManagerApproved);
        setIsLoading(false);
      }
    };

    checkApprovals();
  }, [hypercertExchange]);

  useEffect(() => {
    const fetchOrderForTokenId = async (tokenId: string) => {
      if (hypercertExchange && hypercertExchange.api && tokenId) {
        const _orders = await hypercertExchange.api.fetchOrders({
          claimTokenIds: [tokenId],
        });

        if (!_orders || !_orders.data) return;

        setOrders(_orders.data);
      }
    };

    fetchOrderForTokenId(tokenId);
  }, [hypercertExchange, chainId, tokenId]);

  const createOrderOnClick = async () => {
    const res = await createOrder(tokenId);
    if (!res) {
      console.log("Error creating order");
      return;
    }
    const { maker, isTransferManagerApproved } = res;
    setTransferManagerApproved(isTransferManagerApproved);
    setOrders([maker]);
  };

  const cancelOrdersOnClick = async () => {
    console.log(orders);
    if (!orders) return;
    const res = await cancelOrders(orders?.map((order) => order.orderNonce));
    if (!walletClient || !res) {
      console.log("Error cancelling orders: no wallet client or no response");
      return;
    }
    await res.call();
  };

  const isDisabled = orders
    ? orders
        ?.map((order) => order?.itemIds?.find((itemId) => itemId === tokenId))
        .flatMap((x) => x).length > 0
    : false;

  if (orders && orders.length > 0) {
    return (
      <Button onClick={cancelOrdersOnClick} colorScheme={"red"}>
        Cancel sale
      </Button>
    );
  }

  const label = isTransferManagerApproved
    ? "Create sale"
    : "Approve marketplace";
  return (
    <Button
      onClick={createOrderOnClick}
      isDisabled={isDisabled}
      isLoading={isLoading}
    >
      {label}
    </Button>
  );
};
