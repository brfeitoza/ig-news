import Prismic from "@prismicio/client";

export function getPrismicClient(request?: unknown) {
  const prismic = Prismic.client(process.env.PRISMIC_ENDPOINT, {
    req: request,
    accessToken: process.env.PRISMIC_ACCESS_TOKEN,
  });

  return prismic;
}
