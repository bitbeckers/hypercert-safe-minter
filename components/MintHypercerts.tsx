import { MintData } from "@/app/page";
import { useHypercertClient } from "@/hooks/useHypercertClient";
import { Button, Flex } from "@chakra-ui/react";
import { HypercertMetadata } from "@hypercerts-org/sdk";
import { useState } from "react";

export type MintHypercertProps = {
  data: MintData[];
  onUpload: (cids: string[]) => void;
};

export function MetadataUploader({ data, onUpload }: MintHypercertProps) {
  const { client } = useHypercertClient();
  const [isUploading, setIsUploading] = useState(false);

  const uploadMetadata = async () => {
    if (client) {
      setIsUploading(true);
      Promise.all(
        data.map((metadata) =>
          client?.storage.storeMetadata(metadata as HypercertMetadata)
        )
      )
        .then((res) => {
          console.log(res);
          onUpload(res);
          setIsUploading(false);
        })
        .catch((err) => {
          console.log(err);
          setIsUploading(false);
        });
    }
  };

  return (
    <Flex
      mt="2em"
      direction={"column"}
      justifyContent={"center"}
      alignItems={"center"}
      gap={"1em"}
    >
      <Button
        colorScheme="teal"
        size="lg"
        onClick={uploadMetadata}
        isLoading={isUploading}
      >
        Upload Metadata
      </Button>
    </Flex>
  );
}
