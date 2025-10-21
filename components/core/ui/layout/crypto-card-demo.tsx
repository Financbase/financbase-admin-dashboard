import { Bitcoin, Coins, DollarSign } from "lucide-react";
// components/ui/crypto-card-demo.tsx
import * as React from "react";
import { CryptoCard } from "./crypto-card";

const CryptoCardDemo = () => {
	return (
		<div className="w-full h-screen bg-background flex flex-col md:flex-row items-center justify-center gap-8 p-4">
			{/* Example 1: Negative Change */}
			<CryptoCard
				icon={<Coins className="w-5 h-5" />}
				name="Hedera"
				ticker="USDT"
				percentageChange={-10.35}
				currentPrice={0.0607}
				portfolioValue={13590.0}
				portfolioChange={-2493}
				leverage={10}
				gradientFrom="from-red-600"
			/>

			{/* Example 2: Positive Change */}
			<CryptoCard
				icon={<Bitcoin className="w-5 h-5" />}
				name="Ethereum"
				ticker="USDT"
				percentageChange={5.18}
				currentPrice={3801.44}
				portfolioValue={22450.8}
				portfolioChange={1120.5}
				leverage={5}
				gradientFrom="from-green-600"
			/>

			{/* Example 3: Neutral/Stable */}
			<CryptoCard
				icon={<DollarSign className="w-5 h-5" />}
				name="Tether"
				ticker="USDT"
				percentageChange={0.02}
				currentPrice={1.0}
				portfolioValue={5000.0}
				portfolioChange={1.0}
				leverage={1}
				gradientFrom="from-blue-600"
			/>
		</div>
	);
};

export default CryptoCardDemo;
