"use client";

import { Shield, Lock, Eye, CheckCircle, AlertTriangle, Users, Database, Server } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PublicHero } from "@/components/layout/public-hero";

export default function SecurityPage() {
  const securityFeatures = [
    {
      icon: <Shield className="h-6 w-6" />,
      title: "End-to-End Encryption",
      description: "All data is encrypted in transit and at rest using industry-standard AES-256 encryption.",
      status: "active"
    },
    {
      icon: <Lock className="h-6 w-6" />,
      title: "Multi-Factor Authentication",
      description: "Secure your account with MFA, SMS, and authenticator app support.",
      status: "active"
    },
    {
      icon: <Eye className="h-6 w-6" />,
      title: "Audit Logging",
      description: "Comprehensive audit trails for all user actions and system changes.",
      status: "active"
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Role-Based Access Control",
      description: "Granular permissions and access controls for team members.",
      status: "active"
    },
    {
      icon: <Database className="h-6 w-6" />,
      title: "Data Backup & Recovery",
      description: "Automated backups with point-in-time recovery capabilities.",
      status: "active"
    },
    {
      icon: <Server className="h-6 w-6" />,
      title: "Infrastructure Security",
      description: "Secure cloud infrastructure with regular security updates.",
      status: "active"
    }
  ];

  const complianceStandards = [
    { name: "SOC 2 Type II", status: "certified", description: "Security controls and processes certified" },
    { name: "ISO 27001", status: "certified", description: "Information security management system" },
    { name: "GDPR", status: "compliant", description: "European data protection regulations" },
    { name: "CCPA", status: "compliant", description: "California Consumer Privacy Act" },
    { name: "HIPAA", status: "ready", description: "Healthcare data protection ready" },
    { name: "PCI DSS", status: "ready", description: "Payment card industry standards" }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <PublicHero
        subtitle={(
          <span className="inline-flex items-center">
            <Shield className="h-4 w-4 mr-2" /> Security & Compliance
          </span>
        ) as unknown as string}
        title="Enterprise-Grade Security"
        description="Your data security is our top priority. We implement industry‑leading controls to protect your financial information and business data."
        primaryAction={{ text: "Contact Security Team", href: "/contact" }}
        secondaryAction={{ text: "Security Documentation", href: "/docs/security" }}
        background="pattern"
        size="lg"
      />

      {/* Security Features */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Security Features
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Comprehensive security measures to protect your data and ensure compliance
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {securityFeatures.map((feature, index) => (
              <Card key={index} className="relative overflow-hidden">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                      {feature.icon}
                    </div>
                    <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      {feature.status}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Compliance Standards */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Compliance & Certifications
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              We maintain the highest standards of compliance and security certifications
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {complianceStandards.map((standard, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">{standard.name}</h3>
                    <Badge 
                      variant={standard.status === "certified" ? "default" : standard.status === "compliant" ? "secondary" : "outline"}
                      className={
                        standard.status === "certified" 
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          : standard.status === "compliant"
                          ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                          : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                      }
                    >
                      {standard.status}
                    </Badge>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300">{standard.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Security Best Practices */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
                Security Best Practices
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
                We follow industry best practices to ensure your data remains secure and your business stays compliant.
              </p>
              <div className="space-y-4">
                <div className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-green-500 mr-3 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Regular Security Audits</h3>
                    <p className="text-gray-600 dark:text-gray-300">Quarterly security assessments and penetration testing</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-green-500 mr-3 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Employee Training</h3>
                    <p className="text-gray-600 dark:text-gray-300">Regular security awareness training for all team members</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-green-500 mr-3 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Incident Response</h3>
                    <p className="text-gray-600 dark:text-gray-300">24/7 security monitoring and rapid incident response</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-green-500 mr-3 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Data Privacy</h3>
                    <p className="text-gray-600 dark:text-gray-300">Privacy by design principles and data minimization</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950 dark:to-indigo-900 p-8 rounded-2xl">
              <div className="text-center">
                <AlertTriangle className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Security Incident?
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  If you suspect a security incident or have concerns about your account security, 
                  contact our security team immediately.
                </p>
                <Button asChild size="lg" className="w-full">
                  <Link href="/contact">Report Security Issue</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section 
        className="py-20"
        style={{
          background: `linear-gradient(to right, var(--brand-primary), var(--brand-primary-dark))`,
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Secure Your Business?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of businesses that trust Financbase with their most sensitive financial data.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              asChild 
              size="lg" 
              className="bg-white text-[var(--brand-primary)] hover:bg-gray-100"
            >
              <Link href="/auth/sign-up">Get Started Free</Link>
            </Button>
            <Button 
              asChild 
              size="lg" 
              variant="outline" 
              className="border-white text-white hover:bg-white hover:text-[var(--brand-primary)]"
            >
              <Link href="/contact">Schedule Demo</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
