// app/api/customers/route.js
import { NextResponse } from 'next/server';

const KATANA_API_KEY = process.env.KATANA_API_KEY;

if (!KATANA_API_KEY) {
    throw new Error("Missing Katana API key in environment variables.");
}

export async function GET() {
    try {
        let page = 1;
        let results = [];
        let pageData = await fetchResults(page);

        while (pageData.length > 0) {
            results.push(...pageData);
            page += 1;
            pageData = await fetchResults(page);
        }

        console.log("Total items fetched:", results.length);

        return NextResponse.json({
            success: true,
            results
        });
    } catch (error: unknown) {
        let errorMessage = "Unknown error";
        if (error instanceof Error) {
            errorMessage = error.message;
        }
        console.error(errorMessage);

        return NextResponse.json({
            success: false,
            error: errorMessage
        }, { status: 500 });
    }
}

async function fetchResults(page = 1) {
    const url = `https://api.katanamrp.com/v1/inventory?extend=variant&page=${page}`;
    const options = {
        method: 'GET',
        headers: {
            accept: 'application/json',
            Authorization: `Bearer ${KATANA_API_KEY}`
        }
    };

    const res = await fetch(url, options);
    if (!res.ok) {
        throw new Error(`Katana API error: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    // Assuming the API returns items in data.data or just data
    return data.data || data;
}