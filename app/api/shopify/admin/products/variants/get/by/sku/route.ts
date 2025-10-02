// app/api/customers/route.js
import { GraphQLClient, gql } from 'graphql-request';
import { NextResponse, NextRequest } from 'next/server';

const shopDomain = process.env.SHOPIFY_STORE_DOMAIN;
const adminAccessToken = process.env.SHOPIFY_ADMIN_API_ACCESS_TOKEN;

const endpoint = `https://${shopDomain}/admin/api/2024-07/graphql.json`;

if (!shopDomain || !adminAccessToken) {
    throw new Error("Missing Shopify Admin API credentials in environment variables.");
}

const client = new GraphQLClient(endpoint, {
    headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': adminAccessToken,
    },
});

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const sku = searchParams.get("sku");

    const CUSTOMER_QUERY = gql`
    query getVariantBySku($sku: String!) {
      productVariants(first: 250, query: $sku) {
        nodes {
          id
          sku
          product {
            id
          }
        }
      }
    }
  `;

    try {
        const data = await client.request(CUSTOMER_QUERY, { sku: `sku:${sku}` });
        return NextResponse.json(data);
    } catch (error) {
        console.error("GraphQL request failed:", error);
        return NextResponse.json({ error: "Failed to fetch variant" }, { status: 500 });
    }
}