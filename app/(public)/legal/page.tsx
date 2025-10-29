"use client";

import { FileText, Shield, Users, Mail, Phone, MapPin, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function LegalPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-slate-50 to-gray-100 dark:from-slate-950 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Badge variant="outline" className="mb-4">
              <FileText className="h-4 w-4 mr-2" />
              LEGAL INFORMATION
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              Legal Center
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8">
              Find all our legal documents, compliance information, and contact details in one place. 
              We're committed to transparency and protecting your rights.
            </p>
          </div>
        </div>
      </section>

      {/* Quick Access to Legal Documents */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Legal Documents
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Access our comprehensive legal documentation and policies
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Privacy Policy */}
            <Card className="group hover:shadow-lg transition-shadow">
              <CardHeader className="text-center">
                <div className="p-4 bg-blue-100 dark:bg-blue-900 rounded-lg w-fit mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <FileText className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
                <CardTitle className="text-xl">Privacy Policy</CardTitle>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  How we collect, use, and protect your personal information
                </p>
                <Badge variant="outline" className="text-xs mt-2">
                  Last updated: December 15, 2024
                </Badge>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <Link href="/privacy">
                    Read Privacy Policy
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Terms of Service */}
            <Card className="group hover:shadow-lg transition-shadow">
              <CardHeader className="text-center">
                <div className="p-4 bg-green-100 dark:bg-green-900 rounded-lg w-fit mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <FileText className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <CardTitle className="text-xl">Terms of Service</CardTitle>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  The rules and guidelines for using our platform
                </p>
                <Badge variant="outline" className="text-xs mt-2">
                  Last updated: December 15, 2024
                </Badge>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full group-hover:bg-green-600 group-hover:text-white transition-colors">
                  <Link href="/terms">
                    Read Terms of Service
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Security Information */}
            <Card className="group hover:shadow-lg transition-shadow">
              <CardHeader className="text-center">
                <div className="p-4 bg-purple-100 dark:bg-purple-900 rounded-lg w-fit mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Shield className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                </div>
                <CardTitle className="text-xl">Security</CardTitle>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Our security measures and compliance certifications
                </p>
                <Badge variant="outline" className="text-xs mt-2">
                  SOC 2, ISO 27001, GDPR
                </Badge>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full group-hover:bg-purple-600 group-hover:text-white transition-colors">
                  <Link href="/security">
                    View Security Details
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Contact Legal Team */}
            <Card className="group hover:shadow-lg transition-shadow">
              <CardHeader className="text-center">
                <div className="p-4 bg-orange-100 dark:bg-orange-900 rounded-lg w-fit mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Users className="h-8 w-8 text-orange-600 dark:text-orange-400" />
                </div>
                <CardTitle className="text-xl">Legal Support</CardTitle>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Contact our legal team for questions or concerns
                </p>
                <Badge variant="outline" className="text-xs mt-2">
                  Available 24/7
                </Badge>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full group-hover:bg-orange-600 group-hover:text-white transition-colors">
                  <Link href="/contact">
                    Contact Legal Team
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Compliance Overview */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Compliance & Certifications
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              We maintain the highest standards of security and compliance to protect your data.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="text-center">
              <CardContent className="p-6">
                <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg w-fit mx-auto mb-4">
                  <Shield className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold mb-2">GDPR</h3>
                <Badge className="mb-3 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  compliant
                </Badge>
                <p className="text-gray-600 dark:text-gray-300 text-sm">European data protection regulations</p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-6">
                <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg w-fit mx-auto mb-4">
                  <Shield className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-lg font-semibold mb-2">SOC 2 Type II</h3>
                <Badge className="mb-3 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  certified
                </Badge>
                <p className="text-gray-600 dark:text-gray-300 text-sm">Security controls and processes</p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-6">
                <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg w-fit mx-auto mb-4">
                  <Shield className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-lg font-semibold mb-2">ISO 27001</h3>
                <Badge className="mb-3 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  certified
                </Badge>
                <p className="text-gray-600 dark:text-gray-300 text-sm">Information security management</p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-6">
                <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-lg w-fit mx-auto mb-4">
                  <Shield className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
                <h3 className="text-lg font-semibold mb-2">CCPA</h3>
                <Badge className="mb-3 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  compliant
                </Badge>
                <p className="text-gray-600 dark:text-gray-300 text-sm">California Consumer Privacy Act</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Legal Contact Information */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Legal Contact Information
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Need to reach our legal team? Here's how you can contact us for legal matters.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg w-fit mx-auto mb-4">
                  <Mail className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Email</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-2">legal@financbase.com</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">For legal inquiries and data requests</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg w-fit mx-auto mb-4">
                  <Phone className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Phone</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-2">+1 (555) 123-4567</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Legal department direct line</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg w-fit mx-auto mb-4">
                  <MapPin className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Address</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-2">123 Financial Street, San Francisco, CA 94105</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Our headquarters location</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-slate-600 to-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <FileText className="h-8 w-8 text-white mr-3" />
            <Badge variant="secondary" className="bg-white text-slate-700">
              IMPORTANT NOTICE
            </Badge>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Questions About Our Legal Policies?
          </h2>
          <p className="text-xl text-slate-200 mb-8 max-w-2xl mx-auto">
            Our legal team is here to help. Contact us if you have any questions about our policies, 
            need to request data, or have legal concerns.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" variant="secondary">
              <Link href="/contact">
                <Users className="h-4 w-4 mr-2" />
                Contact Legal Team
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-slate-700">
              <Link href="/privacy">
                <FileText className="h-4 w-4 mr-2" />
                Read Privacy Policy
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}