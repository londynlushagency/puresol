"use server";

// import bizSdk from "facebook-nodejs-business-sdk";
import * as bizSdk from "facebook-nodejs-business-sdk";
import { AdAccount, Campaign } from "facebook-nodejs-business-sdk";

// const AdAccount = AdAccount;
// const Campaign = bizSdk.Campaign;
// const AdSet = bizSdk.AdSet;
// const AdSetFields = AdSet.Fields;

const ACCESS_TOKEN = process.env.META_ACCESS_TOKEN!;
const AD_ACCOUNT_ID = process.env.META_AD_ACCOUNT_ID!;

bizSdk.FacebookAdsApi.init(ACCESS_TOKEN);
const account = new AdAccount(AD_ACCOUNT_ID);

const upscaleMax = 1.2;


export async function readCampaigns() {
  try {
    const campaigns = await account.getCampaigns(
      [
        Campaign.Fields.id,
        Campaign.Fields.name,
        Campaign.Fields.status,
        Campaign.Fields.objective,
        Campaign.Fields.start_time,
        Campaign.Fields.stop_time,
        Campaign.Fields.daily_budget,
      ],
      { effective_status: ["ACTIVE"] }
    );

    for (const campaign of campaigns) {
      const insights_7d = await campaign.getInsights(
        [
          "spend",
          "impressions",
          "clicks",
          "website_purchase_roas",
          "actions",
        ],
        { date_preset: "last_7d" }
      );
      const insights_max = await campaign.getInsights(
        [
          "spend",
          "impressions",
          "clicks",
          "website_purchase_roas",
          "actions",
        ],
        { date_preset: "maximum" }
      );

      // console.log("Campaign:", campaign.id, campaign.name);
      // console.log(parseFloat(campaign.name.split("@")[1]?.trim()));
      const sevenDayTargetROAS = parseFloat(campaign.name.split("@")[1]?.trim())

      if (insights_7d && insights_7d.length > 0 && insights_7d[0]?.website_purchase_roas?.length > 0) {
        // console.log("ROAS:", insights_7d[0].website_purchase_roas[0].value);
        console.log("Spend:", insights_7d[0].spend);
        console.log("ID:", insights_max[0].spend);
        const sevenDayROAS = parseFloat(insights_7d[0].website_purchase_roas[0].value);
        const sevenDayROASRatio = sevenDayROAS / sevenDayTargetROAS
        const lifetimeSpend = insights_max[0].spend

        if (lifetimeSpend > 300) {
          if (sevenDayROASRatio < 1.0) {
            const biasAdjustment = .1
            const scaler = sevenDayROASRatio + biasAdjustment

            // Scale down
            const currentBudget = parseInt(campaign.daily_budget!, 10);
            // const newBudget = Math.round(currentBudget / scaleFactor);
            const newBudget = Math.round(currentBudget * scaler)

            await new Campaign(campaign.id).update([], {
              [Campaign.Fields.daily_budget]: newBudget.toString(),
            });

            console.log(`Scaled Down Campaign ${campaign.id} from ${currentBudget} → ${newBudget} (ROAS: ${sevenDayROAS})`);
          } else if (sevenDayROASRatio >= 1.0) {
            // Scale up
            const scaler = Math.min(1 + (sevenDayROASRatio / 10), upscaleMax)
            const currentBudget = parseInt(campaign.daily_budget!, 10);

            const newBudget = Math.round(currentBudget * scaler);
            await new Campaign(campaign.id).update([], {
              [Campaign.Fields.daily_budget]: newBudget.toString(),
            });
            console.log(`Scaled Up Campaign ${campaign.id} from ${currentBudget} → ${newBudget} (ROAS: ${sevenDayROAS})`);
          } else {
            console.log(`No scaling needed for Campaign ${campaign.id} (ROAS: ${sevenDayROAS})`);
          }
        } else {
          console.log("No ROAS data available for this campaign.");
        }
      }
      // if (campaign.name.includes("Bug Brush")) {
      //   bugBrushCampaignScaler(insights_7d[0]?.website_purchase_roas?.[0]?.value ? parseFloat(insights_7d[0].website_purchase_roas[0].value) : 0);
      // }
      // if (insights_7d && insights_7d.length > 0) {
      //   const roasValues = insights_7d[0].website_purchase_roas;
      //   if (roasValues && roasValues.length > 0) {
      //     const roas = parseFloat(roasValues[0].value);
      //     if (roas >= minROAS && roas <= maxROAS) {
      //       const currentBudget = parseInt(adSet.daily_budget, 10);
      //       const newBudget = Math.round(currentBudget * scaleFactor);

      //       await new AdSet(adSet.id).update({
      //         [AdSetFields.daily_budget]: newBudget.toString(),
      //       });

      //       console.log(`Scaled AdSet ${adSet.id} from ${currentBudget} → ${newBudget} (ROAS: ${roas})`);
      //     }
      //   }
      // }


      // if (insights_7d.length > 0) {
      //   const row = insights_7d[0];
      //   console.log("ROAS:", row.website_purchase_roas[0]?.value || 0);
      // }
      // console.log("Campaign:", campaign.id, campaign.name, campaign.status, campaign.daily_budget);
    }
  } catch (err) {
    console.error("Error reading campaigns:", err);
  }
}

readCampaigns();

// export async function scaleAdSetsByROAS(minROAS: number, maxROAS: number, scaleFactor: number) {
//   const account = new AdAccount(AD_ACCOUNT_ID);
//   const campaigns = await account.getCampaigns();
//   console.log("Found campaigns:", campaigns.length);
//   console.dir(campaigns[0]);
//   console.log(campaigns[0].read().then((account) => {
//     console.log(account);
//   })
//   .catch((error) => {
//   }));
//   const insights_7d = await campaigns[0].getinsights_7d([], { date_preset: "last_7d" });
//   console.log("Found insights_7d:", insights_7d.read(["website_purchase_roas"]));

// //   for (const campaign of campaigns) {
// //     console.dir(campaign);
// //   }

// //   const adSets = await account.getAdSets(
// //     [AdSetFields.id, AdSetFields.name, AdSetFields.daily_budget],
// //     {
// //       limit: 10,
// //       date_preset: "last_7d",
// //       fields: "adset_id,adset_name,spend,website_purchase_roas,impressions",
// //     }
// //   );

// //   for (const adSet of adSets) {
// //     const insights_7d = await adSet.getinsights_7d([], { date_preset: "last_7d" });

// //     if (insights_7d && insights_7d.length > 0) {
// //       const roasValues = insights_7d[0].website_purchase_roas;
// //       if (roasValues && roasValues.length > 0) {
// //         const roas = parseFloat(roasValues[0].value);
// //         if (roas >= minROAS && roas <= maxROAS) {
// //           const currentBudget = parseInt(adSet.daily_budget, 10);
// //           const newBudget = Math.round(currentBudget * scaleFactor);

// //           await new AdSet(adSet.id).update({
// //             [AdSetFields.daily_budget]: newBudget.toString(),
// //           });

// //           console.log(`Scaled AdSet ${adSet.id} from ${currentBudget} → ${newBudget} (ROAS: ${roas})`);
// //         }
// //       }
// //     }
// //   }
// }


// function bugBrushCampaignScaler(roas: number) {
//   console.log(roas)
// }