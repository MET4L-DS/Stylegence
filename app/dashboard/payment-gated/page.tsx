"use client";

import Pricing from "@/components/pricing";
import PricingComparator from "@/components/pricing-comparator";
import { PricingTable, Protect } from "@clerk/clerk-react";

export function Features() {
  return (
    <div>
        List of features
    </div>
  )
}

function UpgradeCard() {
    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-bold">Upgrade to Pro</h1>
                <p className="text-sm text-gray-500">Unlock all features by upgrading to the Pro plan.</p>
            </div>
            <div className="flex flex-col gap-2">
                <PricingTable />
            </div>
        </div>
    );
}

export default function PaymentGatedPage() {
    return(
        <div className="flex flex-col fap-4 px-8">
            <Protect
                condition={(has)=> {
                    return !has({ plan: "free_user" })
                }}
                fallback={<UpgradeCard />}
            >
                <Features />
            </Protect>
        </div>
    )
}