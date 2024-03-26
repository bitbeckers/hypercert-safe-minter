"use server";

import { createDirectus, rest, updateItems, staticToken } from "@directus/sdk";

export const updateCMS = async (ids: string[]) => {
  const accessToken = process.env.NEXT_CMS_ACCESS_TOKEN as string;
  const client = createDirectus("https://directus.voicedeck.org")
    .with(staticToken(accessToken))
    .with(rest());

  try {
    await client.request(
      updateItems("reports", ids, {
        Minted: true,
      }),
    );
  } catch (error) {
    throw error;
  }
};
