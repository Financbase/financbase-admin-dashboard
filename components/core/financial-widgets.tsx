"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import StatisticsCard5 from "@/components/ui/statistics-card-5";
import List01 from "./list-01";
import List02 from "./list-02";

export default function FinancialWidgets() {
	return (
		<div className="space-y-6">
			{/* Enhanced Statistics Card - Featured prominently */}
			<div>
				<Card className="border-0 shadow-lg bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-zinc-800">
					<CardHeader className="pb-3">
						<CardTitle className="text-lg flex items-center gap-2">
							<div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full" />
							Interactive Portfolio Overview
						</CardTitle>
					</CardHeader>
					<CardContent>
						<StatisticsCard5
							data={{
								balance: 125000,
								delta: 8.5,
								currencies: [
									{
										code: "USD",
										percent: 45,
										color: "bg-gradient-to-r from-green-400 to-green-600",
										amount: 56250,
									},
									{
										code: "EUR",
										percent: 30,
										color: "bg-gradient-to-r from-blue-400 to-blue-600",
										amount: 37500,
									},
									{
										code: "BTC",
										percent: 15,
										color: "bg-gradient-to-r from-orange-400 to-orange-600",
										amount: 18750,
									},
									{
										code: "ETH",
										percent: 10,
										color: "bg-gradient-to-r from-purple-400 to-purple-600",
										amount: 12500,
									},
								],
							}}
							animated={true}
							showDetails={true}
							className="w-full"
						/>
					</CardContent>
				</Card>
			</div>

			<div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2">
				{/* Account Balance Widget */}
				<div className="space-y-3 sm:space-y-4">
					<h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white px-1">
						Account Balance
					</h3>
					<List01 />
				</div>

				{/* Transaction History Widget */}
				<div className="space-y-3 sm:space-y-4">
					<h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white px-1">
						Recent Transactions
					</h3>
					<List02 />
				</div>
			</div>
		</div>
	);
}
