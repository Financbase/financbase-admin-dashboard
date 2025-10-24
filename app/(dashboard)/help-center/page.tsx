"use client";

import { useState } from 'react';
import { HelpCenter } from '@/components/help/help-center';
import { ArticleViewer } from '@/components/help/article-viewer';
import { SupportTicketForm } from '@/components/help/support-ticket-form';

export default function HelpPage() {
  const [currentView, setCurrentView] = useState<'center' | 'article' | 'ticket'>('center');
  const [selectedArticle, setSelectedArticle] = useState<any>(null);
  const [createdTicket, setCreatedTicket] = useState<any>(null);

  const handleViewArticle = (article: any) => {
    setSelectedArticle(article);
    setCurrentView('article');
  };

  const handleBackToCenter = () => {
    setCurrentView('center');
    setSelectedArticle(null);
  };

  const handleCreateTicket = () => {
    setCurrentView('ticket');
  };

  const handleTicketSuccess = (ticket: any) => {
    setCreatedTicket(ticket);
    setCurrentView('center');
  };

  const handleTicketCancel = () => {
    setCurrentView('center');
  };

  if (currentView === 'article' && selectedArticle) {
    return (
      <ArticleViewer
        article={selectedArticle}
        onBack={handleBackToCenter}
        onRelatedArticle={handleViewArticle}
      />
    );
  }

  if (currentView === 'ticket') {
    return (
      <SupportTicketForm
        onSuccess={handleTicketSuccess}
        onCancel={handleTicketCancel}
      />
    );
  }

  return (
    <HelpCenter
      onViewArticle={handleViewArticle}
      onCreateTicket={handleCreateTicket}
    />
  );
}
