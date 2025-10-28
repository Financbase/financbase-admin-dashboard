import { ContentSearchModule } from '@/components/search/content-search-module';

export default function SearchPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <ContentSearchModule />
      </div>
    </div>
  );
}
