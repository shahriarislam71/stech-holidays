"use client";
import { useState } from "react";
import Link from "next/link";
import Offer from "@/promotion/Offer";
import PromotionsBanner from "@/promotion/PromotionsBanner";

export default function Promotions() {
  return (
    <div>
      <PromotionsBanner />
      <Offer></Offer>
    </div>
  );
}
