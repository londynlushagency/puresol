// app/api/customers/route.js
import { GraphQLClient, gql } from 'graphql-request';
import { NextResponse } from 'next/server';

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

const START_BULK_OP = gql`
  mutation {
    bulkOperationRunQuery(
      query: """
      {
        orders {
          edges {
            node {
              id
              name
              createdAt
              processedAt
              displayFinancialStatus
              displayFulfillmentStatus
              totalPriceSet {
                shopMoney {
                  amount
                  currencyCode
                }
              }
              customer {
                id
                displayName
              }
              shippingAddress {
                name
                address1
                city
                province
                country
                zip
              }
              billingAddress {
                name
                address1
                city
                province
                country
                zip
              }
              lineItems {
                edges {
                  node {
                    id
                    sku
                    name
                    quantity
                    originalUnitPriceSet {
                      shopMoney {
                        amount
                        currencyCode
                      }
                    }
                    variant {
                      id
                      title
                      product {
                        id
                        title
                        handle
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
      """
    ) {
      bulkOperation {
        id
        status
      }
      userErrors {
        field
        message
      }
    }
  }
`;

const CHECK_BULK_OP = gql`
  {
    currentBulkOperation {
      id
      status
      errorCode
      objectCount
      fileSize
      url
      createdAt
      completedAt
    }
  }
`;

export async function GET() {
  // Step 1: Start the bulk operation
  await client.request(START_BULK_OP);

  // Step 2: Poll until complete
  let bulkOp;
  do {
    await new Promise((resolve) => setTimeout(resolve, 3000)); // wait 3s
    const statusResp = await client.request(CHECK_BULK_OP);
    bulkOp = statusResp.currentBulkOperation;
    console.log("Bulk operation status:", bulkOp.status);
  } while (bulkOp.status !== "COMPLETED" && bulkOp.status !== "FAILED");

  if (bulkOp.status === "FAILED") {
    return NextResponse.json({ error: "Bulk operation failed", details: bulkOp });
  }

  // Step 3: Fetch JSONL data from the bulk operation URL
  const res = await fetch(bulkOp.url);
  const text = await res.text();

  // Step 4: Parse JSONL into an array of objects
  const jsonData = text
    .split("\n")
    .filter(Boolean)        // remove empty lines
    .map((line) => JSON.parse(line));

  // Step 5: Return JSON
  return NextResponse.json({
    objectCount: bulkOp.objectCount,
    data: jsonData,
  });
}