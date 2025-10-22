import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Star } from "lucide-react";

const plans = [
			{
				name: "Starter",
    price: "$29",
    period: "/month",
    description: "Perfect for small businesses getting started",
				features: [
      "Up to 5 users",
      "Basic financial tracking",
      "Monthly reports",
      "Email support",
      "Mobile app access"
    ],
    popular: false
			},
			{
				name: "Professional",
    price: "$79",
    period: "/month",
    description: "Ideal for growing businesses",
				features: [
      "Up to 25 users",
      "Advanced analytics",
      "Real-time reporting",
      "Priority support",
      "API access",
      "Custom integrations"
    ],
    popular: true
			},
			{
				name: "Enterprise",
    price: "$199",
    period: "/month",
    description: "For large organizations",
				features: [
      "Unlimited users",
      "Advanced AI insights",
      "Custom dashboards",
      "Dedicated support",
      "White-label options",
      "Advanced security"
    ],
    popular: false
  }
];

export default function PricingPage() {
	return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
			{/* Hero Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Simple, Transparent Pricing
						</h1>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Choose the plan that's right for your business. All plans include our core features with no hidden fees.
          </p>
						</div>
      </section>

			{/* Pricing Cards */}
      <section className="py-20">
				<div className="max-w-6xl mx-auto px-6">
					<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan) => (
              <Card 
                key={plan.name} 
                className={`relative ${plan.popular ? 'ring-2 ring-blue-500 shadow-lg' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-blue-500 text-white px-4 py-1">
                      <Star className="h-4 w-4 mr-1" />
                      Most Popular
										</Badge>
									</div>
								)}

                <CardHeader className="text-center pb-8">
                  <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-gray-500">{plan.period}</span>
											</div>
                  <p className="text-gray-600 dark:text-gray-400 mt-2">
                    {plan.description}
                  </p>
									</CardHeader>

                <CardContent className="pt-0">
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center">
                        <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                        <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>

										<Button
                    className={`w-full ${plan.popular ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
                    variant={plan.popular ? 'default' : 'outline'}
                  >
                    Get Started
										</Button>
									</CardContent>
								</Card>
						))}
					</div>
				</div>
      </section>

			{/* FAQ Section */}
      <section className="py-20 bg-white dark:bg-gray-800">
				<div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">
							Frequently Asked Questions
						</h2>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-2">Can I change plans anytime?</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-2">Is there a free trial?</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Yes, we offer a 14-day free trial for all plans. No credit card required.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-2">What payment methods do you accept?</h3>
              <p className="text-gray-600 dark:text-gray-400">
                We accept all major credit cards, PayPal, and bank transfers for enterprise plans.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-2">Do you offer refunds?</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Yes, we offer a 30-day money-back guarantee for all plans.
              </p>
            </div>
					</div>
				</div>
      </section>

			{/* CTA Section */}
      <section className="py-20 bg-blue-600">
				<div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Get Started?
						</h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of businesses already using Financbase to manage their finances.
          </p>
          <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
										Start Your Free Trial
								</Button>
						</div>
      </section>
		</div>
	);
}