"use client";

import * as React from "react";
import { FileText, Shield, Users, Mail, Phone, MapPin, ArrowRight, CheckCircle, Award, Clock, Globe, Lock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PublicHero } from "@/components/layout/public-hero";
import { PublicCTA } from "@/components/layout/public-form";
import { motion } from "framer-motion";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

const cardHoverVariants = {
  rest: { scale: 1, y: 0 },
  hover: { 
    scale: 1.02, 
    y: -8,
    transition: {
      duration: 0.3,
      ease: "easeOut",
    },
  },
};

const iconVariants = {
  rest: { scale: 1, rotate: 0 },
  hover: { 
    scale: 1.1, 
    rotate: [0, -5, 5, 0],
    transition: {
      duration: 0.4,
      ease: "easeInOut",
    },
  },
};

export default function LegalPage() {
  const [hoveredCard, setHoveredCard] = React.useState<string | null>(null);

  const legalDocuments = [
    {
      icon: FileText,
      title: "Privacy Policy",
      description: "How we collect, use, and protect your personal information",
      badge: "Last updated: December 15, 2024",
      href: "/privacy",
      color: "blue",
      gradient: "from-blue-500/10 via-blue-400/5 to-transparent",
      iconBg: "bg-blue-100 dark:bg-blue-900",
      iconColor: "text-blue-600 dark:text-blue-400",
      buttonHover: "hover:bg-blue-600",
    },
    {
      icon: FileText,
      title: "Terms of Service",
      description: "The rules and guidelines for using our platform",
      badge: "Last updated: December 15, 2024",
      href: "/terms",
      color: "green",
      gradient: "from-green-500/10 via-green-400/5 to-transparent",
      iconBg: "bg-green-100 dark:bg-green-900",
      iconColor: "text-green-600 dark:text-green-400",
      buttonHover: "hover:bg-green-600",
    },
    {
      icon: Shield,
      title: "Security",
      description: "Our security measures and compliance certifications",
      badge: "SOC 2, ISO 27001, GDPR",
      href: "/security",
      color: "purple",
      gradient: "from-purple-500/10 via-purple-400/5 to-transparent",
      iconBg: "bg-purple-100 dark:bg-purple-900",
      iconColor: "text-purple-600 dark:text-purple-400",
      buttonHover: "hover:bg-purple-600",
    },
    {
      icon: Users,
      title: "Legal Support",
      description: "Contact our legal team for questions or concerns",
      badge: "Available 24/7",
      href: "/contact",
      color: "orange",
      gradient: "from-orange-500/10 via-orange-400/5 to-transparent",
      iconBg: "bg-orange-100 dark:bg-orange-900",
      iconColor: "text-orange-600 dark:text-orange-400",
      buttonHover: "hover:bg-orange-600",
    },
  ];

  const complianceStandards = [
    { 
      name: "GDPR", 
      status: "compliant", 
      description: "European data protection regulations",
      icon: Globe,
      color: "blue",
    },
    { 
      name: "SOC 2 Type II", 
      status: "certified", 
      description: "Security controls and processes",
      icon: Shield,
      color: "green",
    },
    { 
      name: "ISO 27001", 
      status: "certified", 
      description: "Information security management",
      icon: Award,
      color: "purple",
    },
    { 
      name: "CCPA", 
      status: "compliant", 
      description: "California Consumer Privacy Act",
      icon: Lock,
      color: "orange",
    },
  ];

  const contactMethods = [
    {
      icon: Mail,
      title: "Email",
      value: "legal@financbase.com",
      description: "For legal inquiries and data requests",
      color: "blue",
    },
    {
      icon: Phone,
      title: "Phone",
      value: "+1 (555) 123-4567",
      description: "Legal department direct line",
      color: "green",
    },
    {
      icon: MapPin,
      title: "Address",
      value: "123 Financial Street, San Francisco, CA 94105",
      description: "Our headquarters location",
      color: "purple",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <PublicHero
        title="Legal Center"
        subtitle={
          <span className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            LEGAL INFORMATION
          </span>
        }
        description="Find all our legal documents, compliance information, and contact details in one place. We're committed to transparency and protecting your rights."
        size="lg"
        background="pattern"
      />

      {/* Quick Access to Legal Documents */}
      <section className="py-20 bg-background relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />
        <div 
          className="absolute inset-0 opacity-[0.02] dark:opacity-[0.05]"
          style={{
            backgroundImage: `
              linear-gradient(to right, currentColor 1px, transparent 1px),
              linear-gradient(to bottom, currentColor 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
          }}
        />
        
        {/* Animated background orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl"
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.5, 0.3, 0.5],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Legal Documents
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Access our comprehensive legal documentation and policies
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8"
          >
            {legalDocuments.map((doc, index) => {
              const Icon = doc.icon;
              const docId = doc.title.toLowerCase().replace(/\s+/g, '-');
              return (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  onHoverStart={() => setHoveredCard(docId)}
                  onHoverEnd={() => setHoveredCard(null)}
                  className="group relative"
                >
                  <motion.div
                    className="relative h-full group"
                    whileHover={{ y: -8 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <Link
                      href={doc.href}
                      className="block relative h-full"
                    >
                      <div className="relative h-full rounded-2xl border border-border bg-card overflow-hidden backdrop-blur-sm">
                        {/* Gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        
                        {/* Radial gradient on hover */}
                        <motion.div
                          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                          style={{
                            background: `radial-gradient(circle at 50% 100%, oklch(var(--primary) / 0.15), transparent 60%)`,
                          }}
                        />

                      <div className="relative p-8 h-full flex flex-col">
                        <motion.div
                          className={`inline-flex items-center justify-center w-14 h-14 rounded-xl ${doc.iconBg} ${doc.iconColor} mb-6`}
                          whileHover={{ rotate: 360, scale: 1.1 }}
                          transition={{ duration: 0.6 }}
                        >
                          <Icon className="w-6 h-6" />
                        </motion.div>

                        <h3 className="text-2xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors duration-300">
                          {doc.title}
                        </h3>

                        <p className="text-muted-foreground mb-6 flex-grow text-sm">
                          {doc.description}
                        </p>

                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className="text-xs bg-background/50 backdrop-blur-sm">
                            <Clock className="h-3 w-3 mr-1" />
                            {doc.badge}
                          </Badge>
                          <motion.div
                            className="flex items-center gap-2 text-sm font-medium text-primary"
                            animate={{
                              x: hoveredCard === docId ? 4 : 0,
                            }}
                            transition={{ duration: 0.3 }}
                          >
                            Read More
                            <ArrowRight className="w-4 h-4" />
                          </motion.div>
                        </div>
                      </div>

                        {/* Animated bottom border */}
                        <motion.div
                          className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-secondary to-primary"
                          initial={{ scaleX: 0 }}
                          animate={{
                            scaleX: hoveredCard === docId ? 1 : 0,
                          }}
                          transition={{ duration: 0.4 }}
                          style={{ transformOrigin: "left" }}
                        />
                      </div>
                    </Link>
                    
                    {/* Enhanced shadow on hover */}
                    <motion.div
                      className="absolute inset-0 rounded-2xl pointer-events-none"
                      animate={{
                        boxShadow:
                          hoveredCard === docId
                            ? "0 20px 60px -10px oklch(var(--primary) / 0.3)"
                            : "0 0 0 0 transparent",
                      }}
                      transition={{ duration: 0.4 }}
                    />
                  </motion.div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Compliance Overview */}
      <section className="py-20 bg-gradient-to-b from-background via-muted/30 to-background relative overflow-hidden">
        {/* Animated background elements */}
        <div 
          className="absolute inset-0 opacity-[0.02] dark:opacity-[0.05]"
          style={{
            backgroundImage: `
              linear-gradient(to right, currentColor 1px, transparent 1px),
              linear-gradient(to bottom, currentColor 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
          }}
        />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 mb-4">
              <Award className="h-6 w-6 text-primary" />
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                Compliance & Certifications
              </h2>
            </div>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              We maintain the highest standards of security and compliance to protect your data.
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="flex flex-wrap justify-center gap-3 mb-12"
          >
            {complianceStandards.map((standard, index) => {
              const Icon = standard.icon;
              const badgeVariants = {
                compliant: "default" as const,
                certified: "secondary" as const,
              };
              
              return (
                <motion.div
                  key={standard.name}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                >
                  <Badge 
                    variant={badgeVariants[standard.status as keyof typeof badgeVariants] || "outline"} 
                    className="gap-1.5 px-3 py-1.5"
                  >
                    <Icon className="w-3 h-3" />
                    {standard.name} - {standard.status}
                  </Badge>
                </motion.div>
              );
            })}
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {complianceStandards.map((standard, index) => {
              const Icon = standard.icon;
              const colorClasses = {
                blue: "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400",
                green: "bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400",
                purple: "bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400",
                orange: "bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-400",
              };

              return (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  whileHover={{ scale: 1.05, y: -5 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className="text-center h-full border-2 hover:border-primary/50 transition-all duration-300 group">
                    <CardContent className="p-6">
                      <motion.div
                        whileHover={{ rotate: [0, -10, 10, 0] }}
                        transition={{ duration: 0.5 }}
                        className={`p-3 ${colorClasses[standard.color as keyof typeof colorClasses]} rounded-lg w-fit mx-auto mb-4`}
                      >
                        <Icon className="h-6 w-6" />
                      </motion.div>
                      <h3 className="text-lg font-semibold mb-2">{standard.name}</h3>
                      <Badge variant={standard.status === "certified" ? "secondary" : "default"} className="mb-3">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        {standard.status}
                      </Badge>
                      <p className="text-muted-foreground text-sm">
                        {standard.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Legal Contact Information */}
      <section className="py-20 bg-background relative overflow-hidden">
        {/* Decorative background elements */}
        <div 
          className="absolute inset-0 opacity-[0.02] dark:opacity-[0.05]"
          style={{
            backgroundImage: `
              linear-gradient(to right, currentColor 1px, transparent 1px),
              linear-gradient(to bottom, currentColor 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
          }}
        />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Legal Contact Information
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Need to reach our legal team? Here's how you can contact us for legal matters.
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-8"
          >
            {contactMethods.map((method, index) => {
              const Icon = method.icon;
              const iconBgClasses = {
                blue: "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400",
                green: "bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400",
                purple: "bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400",
              };

              return (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  whileHover={{ scale: 1.03, y: -5 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className="h-full border-2 hover:border-primary/50 transition-all duration-300 group">
                    <CardContent className="p-6 text-center">
                      <motion.div
                        whileHover={{ 
                          scale: 1.1,
                          rotate: [0, -5, 5, 0],
                        }}
                        transition={{ duration: 0.4 }}
                        className={`p-3 ${iconBgClasses[method.color as keyof typeof iconBgClasses]} rounded-lg w-fit mx-auto mb-4`}
                      >
                        <Icon className="h-6 w-6" />
                      </motion.div>
                      <h3 className="text-lg font-semibold mb-2">{method.title}</h3>
                      <p className="text-gray-900 dark:text-white mb-2 font-medium">
                        {method.value}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {method.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <PublicCTA
        title="Questions About Our Legal Policies?"
        description="Our legal team is here to help. Contact us if you have any questions about our policies, need to request data, or have legal concerns."
        primaryAction={{
          text: "Contact Legal Team",
          href: "/contact",
        }}
        secondaryAction={{
          text: "Read Privacy Policy",
          href: "/privacy",
        }}
      />

      {/* Footer badge */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.9, duration: 0.6 }}
        className="py-12 text-center"
      >
        <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-card border border-border backdrop-blur-sm">
          <CheckCircle className="w-5 h-5 text-primary" />
          <span className="text-sm text-muted-foreground">
            Last reviewed and updated: December 2024
          </span>
        </div>
      </motion.div>
    </div>
  );
}