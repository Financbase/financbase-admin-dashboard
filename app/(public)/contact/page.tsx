import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, Phone, MapPin, Clock } from "lucide-react";
import { useId } from "react";

export default function ContactPage() {
	const firstNameId = useId();
	const lastNameId = useId();
	const emailId = useId();
	const companyId = useId();
	const subjectId = useId();
	const messageId = useId();

	return (
    <div className="min-h-screen bg-background">
			{/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Get in Touch
						</h1>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Have questions about Financbase? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
								</div>
      </section>

      {/* Contact Form & Info */}
      <section className="py-20">
			<div className="max-w-6xl mx-auto px-6">
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
					{/* Contact Form */}
            <div>
              <h2 className="text-3xl font-bold mb-8">Send us a message</h2>
              <Card>
                <CardContent className="p-8">
                  <form className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={firstNameId}>First Name</Label>
                        <Input id={firstNameId} placeholder="John" />
                      </div>
                      <div>
                        <Label htmlFor={lastNameId}>Last Name</Label>
                        <Input id={lastNameId} placeholder="Doe" />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor={emailId}>Email</Label>
                      <Input id={emailId} type="email" placeholder="john@example.com" />
										</div>

                    <div>
                      <Label htmlFor={companyId}>Company</Label>
                      <Input id={companyId} placeholder="Your Company" />
										</div>
                    
                    <div>
                      <Label htmlFor={subjectId}>Subject</Label>
                      <Input id={subjectId} placeholder="How can we help?" />
									</div>

                    <div>
                      <Label htmlFor={messageId}>Message</Label>
                      <Textarea 
                        id={messageId} 
                        placeholder="Tell us more about your inquiry..."
                        className="min-h-[120px]"
										/>
									</div>

                    <Button className="w-full" size="lg">
                      Send Message
                    </Button>
                  </form>
                </CardContent>
              </Card>
									</div>

            {/* Contact Information */}
            <div>
              <h2 className="text-3xl font-bold mb-8">Contact Information</h2>
              
              <div className="space-y-8">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <Mail className="h-6 w-6 text-blue-600 mt-1" />
                      <div>
                        <h3 className="font-semibold mb-2">Email</h3>
                        <p className="text-gray-600 dark:text-gray-400">
                          hello@financbase.com
                        </p>
                        <p className="text-gray-600 dark:text-gray-400">
                          support@financbase.com
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <Phone className="h-6 w-6 text-blue-600 mt-1" />
                      <div>
                        <h3 className="font-semibold mb-2">Phone</h3>
                        <p className="text-gray-600 dark:text-gray-400">
                          +1 (555) 123-4567
                        </p>
                        <p className="text-gray-600 dark:text-gray-400">
                          Mon-Fri 9AM-6PM PST
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <MapPin className="h-6 w-6 text-blue-600 mt-1" />
                      <div>
                        <h3 className="font-semibold mb-2">Office</h3>
                        <p className="text-gray-600 dark:text-gray-400">
                          123 Financial Street<br />
                          San Francisco, CA 94105<br />
                          United States
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <Clock className="h-6 w-6 text-blue-600 mt-1" />
                      <div>
                        <h3 className="font-semibold mb-2">Business Hours</h3>
                        <p className="text-gray-600 dark:text-gray-400">
                          Monday - Friday: 9:00 AM - 6:00 PM PST<br />
                          Saturday: 10:00 AM - 4:00 PM PST<br />
                          Sunday: Closed
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
											</div>
										</div>
									</div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">
            Frequently Asked Questions
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-2">How quickly can I get started?</h3>
              <p className="text-gray-600 dark:text-gray-400">
                You can start using Financbase immediately after signing up. Our setup process takes less than 5 minutes.
              </p>
						</div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Do you offer training?</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Yes, we provide comprehensive onboarding and training sessions for all new customers.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-2">What's your response time?</h3>
              <p className="text-gray-600 dark:text-gray-400">
                We typically respond to all inquiries within 24 hours during business days.
              </p>
			</div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Can I schedule a demo?</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Absolutely! Contact us to schedule a personalized demo of our platform.
              </p>
					</div>
			</div>
        </div>
      </section>
		</div>
	);
}