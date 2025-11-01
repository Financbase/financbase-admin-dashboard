"use client";

import { PublicPageTemplate } from "@/components/layout/public-templates";
import { PublicSection, PublicCard, PublicGrid } from "@/components/layout/public-section";
import { PublicForm, PublicFormField } from "@/components/layout/public-form";
import { Mail, Phone, MapPin, Clock } from "lucide-react";
import { useState } from "react";

interface ContactFormData {
  name: string;
  email: string;
  company: string;
  message: string;
}

export default function ContactPage() {
  const [formData, setFormData] = useState<ContactFormData>({
    name: "",
    email: "",
    company: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");
  const [errors, setErrors] = useState<Partial<ContactFormData>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<ContactFormData> = {};

    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    if (!formData.message.trim()) newErrors.message = "Message is required";
    else if (formData.message.length < 10) {
      newErrors.message = "Message must be at least 10 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (formDataObj: Record<string, string>) => {
    // Extract form data and ensure honeypot is empty
    const data = {
      name: formDataObj.name || formData.name,
      email: formDataObj.email || formData.email,
      company: formDataObj.company || formData.company,
      message: formDataObj.message || formData.message,
      website: formDataObj.website || '', // Honeypot field should be empty
    };

    // Update form state
    setFormData({
      name: data.name,
      email: data.email,
      company: data.company,
      message: data.message,
    });

    // Validate
    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmitMessage("");

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        setSubmitMessage("✅ Thank you! We've received your message and will respond within 24 hours.");
        setFormData({
          name: "",
          email: "",
          company: "",
          message: "",
        });
      } else {
        setSubmitMessage(`❌ ${result.error || 'Something went wrong. Please try again.'}`);
        
        // Show validation errors if provided
        if (result.details && Array.isArray(result.details)) {
          const newErrors: Partial<ContactFormData> = {};
          result.details.forEach((detail: { field: string; message: string }) => {
            if (detail.field === 'name' || detail.field === 'email' || detail.field === 'message') {
              newErrors[detail.field] = detail.message;
            }
          });
          setErrors(newErrors);
        }
      }
    } catch (error) {
      console.error('Contact form error:', error);
      setSubmitMessage("❌ Something went wrong. Please try again or contact us directly.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: <Mail className="h-6 w-6 text-blue-600" />,
      title: "Email",
      details: ["hello@financbase.com", "support@financbase.com"],
    },
    {
      icon: <Phone className="h-6 w-6 text-blue-600" />,
      title: "Phone",
      details: ["+1 (555) 123-4567", "Mon-Fri 9AM-6PM PST"],
    },
    {
      icon: <MapPin className="h-6 w-6 text-blue-600" />,
      title: "Office",
      details: ["123 Financial Street", "San Francisco, CA 94105", "United States"],
    },
    {
      icon: <Clock className="h-6 w-6 text-blue-600" />,
      title: "Business Hours",
      details: ["Monday - Friday: 9:00 AM - 6:00 PM PST", "Saturday: 10:00 AM - 4:00 PM PST", "Sunday: Closed"],
    },
  ];

  const faqItems = [
    {
      question: "How quickly can I get started?",
      answer: "You can start using Financbase immediately after signing up. Our setup process takes less than 5 minutes.",
    },
    {
      question: "Do you offer training?",
      answer: "Yes, we provide comprehensive onboarding and training sessions for all new customers.",
    },
    {
      question: "What's your response time?",
      answer: "We typically respond to all inquiries within 24 hours during business days.",
    },
    {
      question: "Can I schedule a demo?",
      answer: "Absolutely! Contact us to schedule a personalized demo of our platform.",
    },
  ];

  return (
    <PublicPageTemplate
      hero={{
        title: "Get in Touch",
        description: "Have questions about Financbase? We'd love to hear from you. Send us a message and we'll respond as soon as possible.",
      }}
    >
      {/* Contact Form & Info */}
      <PublicSection>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div>
            <h2 className="text-3xl font-bold mb-8">Send us a message</h2>
            <PublicCard>
              {submitMessage && (
                <div className={`mb-6 p-4 rounded-lg border ${
                  submitMessage.includes('✅')
                    ? 'bg-green-50 border-green-200 text-green-800'
                    : 'bg-red-50 border-red-200 text-red-800'
                }`}>
                  {submitMessage}
                </div>
              )}

              <PublicForm onSubmit={handleSubmit} isLoading={isSubmitting}>
                {/* Honeypot field - hidden from users, visible to bots */}
                <input
                  type="text"
                  name="website"
                  tabIndex={-1}
                  autoComplete="off"
                  style={{ position: 'absolute', left: '-9999px' }}
                  aria-hidden="true"
                />
                
                <PublicFormField
                  label="Full Name"
                  name="name"
                  placeholder="John Doe"
                  required
                  error={errors.name}
                />
                
                <PublicFormField
                  label="Email Address"
                  name="email"
                  type="email"
                  placeholder="john@example.com"
                  required
                  error={errors.email}
                />

                <PublicFormField
                  label="Company"
                  name="company"
                  placeholder="Your Company"
                />

                <PublicFormField
                  label="Message"
                  name="message"
                  type="textarea"
                  placeholder="Tell us more about your inquiry..."
                  required
                  error={errors.message}
                />
              </PublicForm>
            </PublicCard>
          </div>

          {/* Contact Information */}
          <div>
            <h2 className="text-3xl font-bold mb-8">Contact Information</h2>
            
            <PublicGrid columns={1} gap="lg">
              {contactInfo.map((info, infoIndex) => (
                <PublicCard key={`contact-info-${info.title}`}>
                  <div className="flex items-start space-x-4">
                    <div className="mt-1">{info.icon}</div>
                    <div>
                      <h3 className="font-semibold mb-2">{info.title}</h3>
                      {info.details.map((detail, detailIndex) => (
                        <p key={`detail-${info.title}-${detailIndex}`} className="text-gray-600 dark:text-gray-400">
                          {detail}
                        </p>
                      ))}
                    </div>
                  </div>
                </PublicCard>
              ))}
            </PublicGrid>
          </div>
        </div>
      </PublicSection>

      {/* FAQ Section */}
      <PublicSection
        title="Frequently Asked Questions"
        background="muted"
      >
        <PublicGrid columns={2}>
          {faqItems.map((item, itemIndex) => (
            <PublicCard key={`faq-item-${item.question}`}>
              <h3 className="text-lg font-semibold mb-2">{item.question}</h3>
              <p className="text-gray-600 dark:text-gray-400">
                {item.answer}
              </p>
            </PublicCard>
          ))}
        </PublicGrid>
      </PublicSection>
    </PublicPageTemplate>
  );
}