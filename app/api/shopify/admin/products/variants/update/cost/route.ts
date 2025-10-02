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
  try {
    const url = new URL(request.url);
    const productId = url.searchParams.get('productId');
    const variantId = url.searchParams.get('variantId');
    const costParam = url.searchParams.get('cost');

    if (!productId || !variantId || !costParam) {
      return NextResponse.json(
        { error: 'Missing one or more requestuired query parameters: productId, variantId, cost' },
        { status: 400 }
      );
    }

    const cost = parseFloat(costParam);
    if (isNaN(cost)) {
      return NextResponse.json({ error: 'Invalid cost value' }, { status: 400 });
    }

    const CUSTOMER_QUERY = gql`
          mutation UpdateVariantCost {
            productVariantsBulkUpdate(
              productId: "${productId}"
              variants: {
                id: "${variantId}"
                inventoryItem: { cost: ${cost} }
              }
            ) {
              product {
                id
              }
              productVariants {
                id
              }
              userErrors {
                field
                message
              }
            }
          }
        `;

    const data = await client.request(CUSTOMER_QUERY);
    return NextResponse.json(data);
  } catch (error) {
    console.error('GraphQL requestuest failed:', error);
    return NextResponse.json({ error: 'Failed to update variant cost' }, { status: 500 });
  }
}