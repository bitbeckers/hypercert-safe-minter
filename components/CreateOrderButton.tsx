import {useHypercertClient} from "@/hooks/useHypercertClient";
import {useCreateOrder} from "@/hooks/useCreateOrder";
import {Button} from "@chakra-ui/react";

export const CreateOrderButton = ({tokenId}: { tokenId: string }) => {
    const {createOrder} = useCreateOrder();

    const createOrderOnClick = async () => {
        await createOrder(tokenId);
    }

    return (
        <Button onClick={createOrderOnClick}>Create sale</Button>
    )
}