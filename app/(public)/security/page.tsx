"use client";

import { Shield, Lock, Eye, CheckCircle, AlertTriangle, Users, Database, Server, Award, Globe, FileCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import Link from "next/link";
import { PublicHero } from "@/components/layout/public-hero";
import { useMemo } from "react";
import { cn } from "@/lib/utils";

type ComplianceStatus = "certified" | "compliant" | "in-progress" | "planned";

interface SecurityFeature {
  icon: React.ReactNode;
  title: string;
  description: string;
  status: "active";
  details?: string[];
}

interface ComplianceStandard {
  name: string;
  status: ComplianceStatus;
  description: string;
  progress: number;
  lastUpdated?: string;
}

export default function SecurityPage() {
  const securityFeatures: SecurityFeature[] = useMemo(() => [
    {
      icon: <Shield className="h-6 w-6" aria-hidden="true" />,
      title: "End-to-End Encryption",
      description: "All data is encrypted in transit and at rest using industry-standard AES-256 encryption.",
      status: "active",
      details: [
        "TLS encryption for data in transit",
        "AES-256-GCM for data at rest",
        "Secure key management",
        "Encrypted storage for sensitive data"
      ]
    },
    {
      icon: <Lock className="h-6 w-6" aria-hidden="true" />,
      title: "Multi-Factor Authentication",
      description: "Secure your account with MFA, SMS, and authenticator app support.",
      status: "active",
      details: [
        "TOTP authenticator apps",
        "SMS-based verification",
        "Multi-factor authentication via Clerk",
        "Secure session management"
      ]
    },
    {
      icon: <Eye className="h-6 w-6" aria-hidden="true" />,
      title: "Audit Logging",
      description: "Comprehensive audit trails for all user actions and system changes.",
      status: "active",
      details: [
        "Real-time activity monitoring",
        "Immutable log storage",
        "90-day retention period",
        "Compliance-ready reporting"
      ]
    },
    {
      icon: <Users className="h-6 w-6" aria-hidden="true" />,
      title: "Role-Based Access Control",
      description: "Granular permissions and access controls for team members.",
      status: "active",
      details: [
        "Custom role definitions",
        "Least privilege enforcement",
        "Access review workflows",
        "Permission inheritance"
      ]
    },
    {
      icon: <Database className="h-6 w-6" aria-hidden="true" />,
      title: "Data Backup & Recovery",
      description: "Automated backups with point-in-time recovery capabilities.",
      status: "active",
      details: [
        "Daily automated backups",
        "Point-in-time recovery capabilities",
        "Data redundancy and replication",
        "High availability infrastructure"
      ]
    },
    {
      icon: <Server className="h-6 w-6" aria-hidden="true" />,
      title: "Infrastructure Security",
      description: "Secure cloud infrastructure with regular security updates.",
      status: "active",
      details: [
        "SOC 2 Type II in progress",
        "Regular security assessments",
        "Automated security patches",
        "DDoS protection via cloud provider"
      ]
    }
  ], []);

  const complianceStandards: ComplianceStandard[] = useMemo(() => [
    { 
      name: "SOC 2 Type II", 
      status: "in-progress" as ComplianceStatus, 
      description: "Security controls and processes in progress",
      progress: 75,
      lastUpdated: "2024"
    },
    { 
      name: "ISO 27001", 
      status: "planned" as ComplianceStatus, 
      description: "Information security management system - planned for 2026",
      progress: 25,
      lastUpdated: "2024"
    },
    { 
      name: "GDPR", 
      status: "compliant" as ComplianceStatus, 
      description: "European data protection regulations",
      progress: 100,
      lastUpdated: "2024"
    },
    { 
      name: "CCPA", 
      status: "compliant" as ComplianceStatus, 
      description: "California Consumer Privacy Act",
      progress: 100,
      lastUpdated: "2024"
    },
    { 
      name: "HIPAA", 
      status: "in-progress" as ComplianceStatus, 
      description: "Healthcare data protection in progress",
      progress: 85,
      lastUpdated: "2024"
    },
    { 
      name: "PCI DSS", 
      status: "in-progress" as ComplianceStatus, 
      description: "Payment card industry standards - in progress",
      progress: 90,
      lastUpdated: "2024"
    }
  ], []);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <PublicHero
        subtitle={
          <span className="inline-flex items-center">
            <Shield className="h-4 w-4 mr-2" aria-hidden="true" /> Security & Compliance
          </span>
        }
        title="Enterprise-Grade Security"
        description="Your data security is our top priority. We implement industry‑leading controls to protect your financial information and business data."
        primaryAction={{ text: "Contact Security Team", href: "/contact" }}
        secondaryAction={{ text: "Security Documentation", href: "/docs/security" }}
        background="pattern"
        size="lg"
      />

      {/* Security Features */}
      <section className="py-20" aria-labelledby="security-features-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 id="security-features-heading" className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Security Features
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Comprehensive security measures to protect your data and ensure compliance
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {securityFeatures.map((feature, index) => (
              <Card 
                key={`security-feature-${index}`} 
                className="relative overflow-hidden group hover:shadow-lg transition-shadow duration-300 border-border"
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between mb-4">
                    <div className={cn(
                      "p-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600",
                      "dark:from-blue-600 dark:to-blue-700",
                      "group-hover:scale-110 transition-transform duration-300",
                      "shadow-lg"
                    )} aria-hidden="true">
                      <div className="text-white">
                      {feature.icon}
                      </div>
                    </div>
                    <Badge 
                      variant="secondary" 
                      className="bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20"
                    >
                      <CheckCircle className="h-3 w-3 mr-1" aria-hidden="true" />
                      {feature.status}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl mb-2">{feature.title}</CardTitle>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
                {feature.details && feature.details.length > 0 && (
                  <CardContent className="pt-0">
                    <Accordion type="single" collapsible className="w-full">
                      <AccordionItem value={`feature-${index}`} className="border-0">
                        <AccordionTrigger className="py-2 text-sm text-muted-foreground hover:no-underline">
                          View Details
                        </AccordionTrigger>
                        <AccordionContent>
                          <ul className="space-y-2 mt-2">
                            {feature.details.map((detail, idx) => (
                              <li key={idx} className="flex items-start text-sm text-muted-foreground">
                                <CheckCircle className="h-4 w-4 mr-2 mt-0.5 text-green-500 flex-shrink-0" aria-hidden="true" />
                                <span>{detail}</span>
                              </li>
                            ))}
                          </ul>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                </CardContent>
                )}
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Compliance Standards */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900" aria-labelledby="compliance-standards-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 id="compliance-standards-heading" className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Compliance & Certifications
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              We maintain the highest standards of compliance and security certifications
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              * Compliance status reflects current implementation state. Some certifications are in progress.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {complianceStandards.map((standard, index) => {
              const getStatusColor = (status: ComplianceStatus) => {
                if (status === "certified") {
                  return {
                    badge: "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20",
                    progress: "bg-green-500",
                    icon: Award
                  };
                }
                if (status === "compliant") {
                  return {
                    badge: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
                    progress: "bg-blue-500",
                    icon: FileCheck
                  };
                }
                if (status === "in-progress") {
                  return {
                    badge: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
                    progress: "bg-blue-500",
                    icon: FileCheck
                  };
                }
                // "planned" status
                return {
                  badge: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
                  progress: "bg-amber-500",
                  icon: Globe
                };
              };

              const statusColors = getStatusColor(standard.status);
              const StatusIcon = statusColors.icon;

              return (
                <Card 
                  key={`compliance-standard-${standard.name}-${index}`}
                  className="hover:shadow-lg transition-shadow duration-300"
                >
                <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "p-2 rounded-lg",
                          standard.status === "certified" && "bg-green-500/10",
                          standard.status === "compliant" && "bg-blue-500/10",
                          standard.status === "in-progress" && "bg-blue-500/10",
                          standard.status === "planned" && "bg-amber-500/10"
                        )}>
                          <StatusIcon className={cn(
                            "h-5 w-5",
                            standard.status === "certified" && "text-green-600 dark:text-green-400",
                            standard.status === "compliant" && "text-blue-600 dark:text-blue-400",
                            standard.status === "in-progress" && "text-blue-600 dark:text-blue-400",
                            standard.status === "planned" && "text-amber-600 dark:text-amber-400"
                          )} aria-hidden="true" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold mb-1">{standard.name}</h3>
                    <Badge 
                            variant="outline"
                            className={statusColors.badge}
                            aria-label={`Status: ${standard.status}`}
                    >
                      {standard.status}
                    </Badge>
                  </div>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">{standard.description}</p>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Compliance Progress</span>
                        <span className="font-semibold">{standard.progress}%</span>
                      </div>
                      <div className="relative w-full h-2 rounded-full bg-secondary overflow-hidden">
                        <div 
                          className={cn(
                            "h-full transition-all duration-500 rounded-full",
                            statusColors.progress
                          )}
                          style={{ width: `${standard.progress}%` }}
                          role="progressbar"
                          aria-valuenow={standard.progress}
                          aria-valuemin={0}
                          aria-valuemax={100}
                        />
                      </div>
                      {standard.lastUpdated && (
                        <p className="text-xs text-muted-foreground mt-2">
                          Last updated: {standard.lastUpdated}
                        </p>
                      )}
                    </div>
                </CardContent>
              </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Security Best Practices */}
      <section className="py-20" aria-labelledby="security-best-practices-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 id="security-best-practices-heading" className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
                Security Best Practices
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
                We follow industry best practices to ensure your data remains secure and your business stays compliant.
              </p>
              <ul className="space-y-4" role="list">
                <li className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-green-500 mr-3 mt-1 flex-shrink-0" aria-hidden="true" />
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Regular Security Audits</h3>
                    <p className="text-gray-600 dark:text-gray-300">Quarterly security assessments and penetration testing</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-green-500 mr-3 mt-1 flex-shrink-0" aria-hidden="true" />
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Employee Training</h3>
                    <p className="text-gray-600 dark:text-gray-300">Regular security awareness training for all team members</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-green-500 mr-3 mt-1 flex-shrink-0" aria-hidden="true" />
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Incident Response</h3>
                    <p className="text-gray-600 dark:text-gray-300">24/7 security monitoring and rapid incident response</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-6 w-6 text-green-500 mr-3 mt-1 flex-shrink-0" aria-hidden="true" />
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Data Privacy</h3>
                    <p className="text-gray-600 dark:text-gray-300">Privacy by design principles and data minimization</p>
                  </div>
                </li>
              </ul>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950 dark:to-indigo-900 p-8 rounded-2xl">
              <div className="text-center">
                <AlertTriangle className="h-16 w-16 text-blue-600 mx-auto mb-4" aria-hidden="true" />
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
        className="py-20 relative"
        style={{
          background: "linear-gradient(to bottom right, oklch(var(--brand-primary)), oklch(var(--brand-primary-dark)), oklch(var(--brand-primary-dark)))",
        }}
        aria-labelledby="cta-heading"
      >
        <div className="max-w-6xl mx-auto px-6 text-center relative z-10">
          <h2 
            id="cta-heading" 
            className="text-3xl md:text-4xl font-bold mb-6"
            style={{ color: "white" }}
          >
            Ready to Secure Your Business?
          </h2>
          <p 
            className="text-xl mb-8 max-w-2xl mx-auto text-foreground/90"
          >
            Join thousands of businesses that trust Financbase with their most sensitive financial data.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/auth/sign-up"
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-semibold h-11 px-8 bg-white hover:bg-gray-100 shadow-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer relative z-30"
              style={{
                color: "oklch(var(--primary))",
                textDecoration: "none",
              }}
            >
              Get Started Free
            </Link>
            <Link 
              href="/contact"
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-semibold h-11 px-8 border-2 bg-transparent text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer relative z-30 hover:bg-white [&:hover]:text-[oklch(var(--primary))]"
              style={{
                borderColor: "white",
                color: "white",
              }}
            >
              Schedule Demo
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
