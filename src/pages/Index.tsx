import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import Tenders from './Tenders';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Header />
      <main className="min-h-[calc(100vh-theme(spacing.14))] sm:min-h-[calc(100vh-theme(spacing.16))]">
        <Tenders />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
