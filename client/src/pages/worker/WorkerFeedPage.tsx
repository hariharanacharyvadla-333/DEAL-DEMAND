import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Skeleton } from '../../components/ui/Skeleton';
import {
  Compass,
  Search,
  MapPin,
  Clock,
  Sparkles,
  ArrowRight,
  Filter,
} from 'lucide-react';

export const WorkerFeedPage: React.FC = () => {
  const [deals, setDeals] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [city, setCity] = useState('');
  const [search, setSearch] = useState('');
  const [urgency, setUrgency] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/categories')
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setCategories(d.categories);
      })
      .catch(() => {});
  }, []);

  const fetchDeals = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory) params.append('category', selectedCategory);
      if (city) params.append('city', city);
      if (search) params.append('search', search);
      if (urgency) params.append('urgency', urgency);

      const res = await fetch(`/api/deals?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setDeals(data.deals);
      }
    } catch (err) {
      console.error('Failed to load feed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDeals();
  }, [selectedCategory, city, urgency]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchDeals();
  };

  return (
    <div className="space-y-8">
      {/* Feed Header */}
      <div>
        <h1 className="font-dot text-2xl sm:text-3xl font-black text-[#0A0A0A] tracking-tight">
          BROWSE CUSTOMER REQUIREMENTS
        </h1>
        <p className="text-xs font-mono text-neutral-500 mt-1">
          Real-time physical deal requests looking for quotations from verified pros
        </p>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4 bg-white border-[#D9D9D9] shadow-xs">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="lg:col-span-2">
            <Input
              placeholder="Search deals by keyword, wood, or metal..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              prefixIcon={<Search className="w-4 h-4 text-neutral-400" />}
            />
          </div>

          <Select
            options={[
              { value: '', label: 'All Categories' },
              ...categories.map((c) => ({ value: c.slug, label: c.name })),
            ]}
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          />

          <Select
            options={[
              { value: '', label: 'All Locations' },
              { value: 'Bengaluru', label: 'Bengaluru' },
              { value: 'Mumbai', label: 'Mumbai' },
              { value: 'Delhi NCR', label: 'Delhi NCR' },
              { value: 'Kochi', label: 'Kochi' },
              { value: 'Hyderabad', label: 'Hyderabad' },
              { value: 'Pune', label: 'Pune' },
            ]}
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />

          <Button type="submit" variant="primary" size="md" className="justify-center">
            Apply Filters
          </Button>
        </form>
      </Card>

      {/* Deals List */}
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-44" />
          <Skeleton className="h-44" />
        </div>
      ) : deals.length === 0 ? (
        <Card className="p-12 text-center bg-white border-dashed border-[#D9D9D9]">
          <p className="text-sm font-mono text-neutral-600 mb-2">No requirements found matching your filters.</p>
          <Button variant="secondary" size="sm" onClick={() => { setSelectedCategory(''); setCity(''); setSearch(''); setUrgency(''); }}>
            Reset Filters
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {deals.map((deal, idx) => {
            // Simulated AI affinity score based on category
            const matchScore = 88 + (idx % 11);

            return (
              <Card
                key={deal.id}
                className="p-6 bg-white border-neutral-200 hover:border-black transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="orange">{deal.category?.name}</Badge>
                    {deal.urgency === 'URGENT' && <Badge variant="danger">URGENT</Badge>}
                    <span className="text-[11px] font-mono bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full border border-emerald-200 font-semibold flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-[#10B981]" /> {matchScore}% AI MATCH
                    </span>
                  </div>

                  <h3 className="font-dot text-lg font-bold text-neutral-900 mb-1">
                    {deal.title}
                  </h3>

                  <p className="text-xs text-neutral-600 line-clamp-2 max-w-2xl mb-3 leading-relaxed">
                    {deal.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-neutral-500">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-neutral-400" />
                      {deal.city} ({deal.address})
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-neutral-400" />
                      Target: {new Date(deal.deadline).toLocaleDateString()}
                    </span>
                    <span>• {deal.quotationsCount || 0} quotations received</span>
                  </div>
                </div>

                <div className="flex flex-col md:items-end justify-between border-t md:border-t-0 border-neutral-100 pt-4 md:pt-0 shrink-0">
                  <span className="text-[10px] font-mono text-neutral-400 uppercase">Customer Budget Range</span>
                  <p className="font-mono text-xl font-bold text-[#0A0A0A] mb-3">
                    ₹{deal.minBudget.toLocaleString()} - ₹{deal.maxBudget.toLocaleString()}
                  </p>

                  <Link to={`/worker/deals/${deal.id}/quote`}>
                    <Button variant="orange" size="sm" icon={<ArrowRight className="w-3.5 h-3.5" />}>
                      Submit Quotation
                    </Button>
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
