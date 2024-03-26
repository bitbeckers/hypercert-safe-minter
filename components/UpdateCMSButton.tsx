import { Button } from "@chakra-ui/react";
import { Report, fetchReports } from "vd2hc";

import { VD_REPORTS_ENDPOINT } from "./MintPage";
import { ClaimData } from "./ReportPage";
import { updateCMS } from "@/lib/updateCMS";

export const UpdateCMSButton = ({ claims }: { claims: ClaimData[] }) => {
  const updateCMSOnClick = async () => {
    const item_id_array: string[] = [];
    let cmsReports: Report[] = [];

    let accessToken = process.env.NEXT_CMS_ACCESS_TOKEN as string;
    const response = await fetchReports(VD_REPORTS_ENDPOINT, accessToken);
    if (response && response.data.length > 0) {
      cmsReports = response.data;
    }

    for (const claim of claims) {
      cmsReports.find((report) => {
        if (report.title === claim.hypercert.name) {
          item_id_array.push(report.id);
        }
      });
    }

    if (item_id_array.length > 0) {
      console.log(
        `Update request is going to submit to CMS with following item ids: ${item_id_array}`,
      );
      await updateCMS(item_id_array);
    }
  };

  return <Button onClick={updateCMSOnClick}>Update minted reports to CMS</Button>;
};
