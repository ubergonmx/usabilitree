import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/treetest/", "/api/"],
      },
    ],
    sitemap: "https://usabilitree.com/sitemap.xml",
  };
}
