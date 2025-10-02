// app/api/customers/route.js
import { NextResponse } from 'next/server';


export async function GET() {
    const katanaResponse = await fetch('http://localhost:3000/api/katana/inventory/get');
    if (!katanaResponse.ok) {
        return NextResponse.json({ error: 'Failed to fetch katana data' }, { status: katanaResponse.status });
    }
    const katanaResponseJSON = await katanaResponse.json(); // <-- parse JSON
    const katanaData = katanaResponseJSON.results;


    for (const item of katanaData) {
        // console.log(item.variant.sku)
        if (item.variant.sku != "") {
            const shopifyResponse = await fetch(
                `http://localhost:3000/api/shopify/admin/products/variants/get/by/sku?sku=${item.variant.sku}`
            );

            const shopifyResponseJSON = await shopifyResponse.json()
            console.log(shopifyResponseJSON)
            for (const shopifyItem of shopifyResponseJSON.productVariants.nodes) {
                const shopifyUpdateResponse = fetch(
                    `http://localhost:3000/api/shopify/admin/products/variants/update/cost?productId=${shopifyItem.product.id}&variantId=${shopifyItem.id}&cost=${item.average_cost}`
                )
            }
        }
    }

    return NextResponse.json(katanaData);

    // for (const item of katanaData) {
    //     console.log(item.average_cost)
    // }

    return NextResponse.json(katanaData);
}