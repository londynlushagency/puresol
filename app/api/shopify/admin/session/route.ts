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

// const CUSTOMER_QUERY = gql`
//     query getCustomers {
//         customers(first: 5) {
//             edges {
//                 node {
//                     id
//                     displayName
//                     email
//                     firstName
//                     lastName
//                 }
//             }
//         }
//     }
// `;


const CUSTOMER_QUERY = gql`
   query customersAndOrders($first: Int!, $after: String) {
  customersCount {
    count
  }
  orders(first: $first, after: $after) {
    pageInfo {
      hasNextPage
      endCursor
    }
    edges {
      node {
        id
        name
        processedAt
        totalPriceSet {
          shopMoney {
            amount
            currencyCode
          }
        }
        customer {
          displayName
          email
        }
      }
    }
  }
}
`;

export async function GET() {
    try {
        const data = await client.request(CUSTOMER_QUERY);
        return NextResponse.json(data);
    } catch (error) {
        console.error('GraphQL request failed:', error);
        return NextResponse.json({ error: 'Failed to fetch customers' }, { status: 500 });
    }
}