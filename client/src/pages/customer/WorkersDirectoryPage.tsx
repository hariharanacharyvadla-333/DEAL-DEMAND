import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { RatingStars } from '../../components/ui/RatingStars';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Skeleton } from '../../components/ui/Skeleton';
import {
  Search,
  ShieldCheck,
  MapPin,
  Briefcase,
  Star,
  Sparkles,
  Filter,
} from 'lucide-react';

export const WorkersDirectoryPage: React.FC = () => {
  const [workers, setWorkers] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [city, setCity] = useState('');
  const [search, setSearch] = useState('');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/categories')
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setCategories(d.categories);
      })
      .catch(() => {});
  }, []);

  const fetchWorkers = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory) params.append('category', selectedCategory);
      if (city) params.append('city', city);
      if (search) params.append('search', search);
      if (verifiedOnly) params.append('verifiedOnly', 'true');

      const res = await fetch(`/api/workers?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setWorkers(data.workers);
      }
    } catch (err) {
      console.error('Failed to fetch workers:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkers();
  }, [selectedCategory, city, verifiedOnly]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchWorkers();
  };

  return (
    <div className="space-y-8">
      {/* Directory Header */}
      <div>
        <h1 className="font-dot text-2xl sm:text-3xl font-black text-[#0A0A0A] tracking-tight">
          VERIFIED ARTISANS & PROFESSIONALS
        </h1>
        <p className="text-xs font-mono text-neutral-500 mt-1">
          Browse verified craftsmen across 22 categories in Indian metros
        </p>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4 bg-white border-[#D9D9D9] shadow-xs">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="lg:col-span-2">
            <Input
              placeholder="Search by name, skill, or wood craft..."
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
              { value: '', label: 'All Cities' },
              { value: 'Bengaluru', label: 'Bengaluru' },
              { value: 'Mumbai', label: 'Mumbai' },
              { value: 'Delhi NCR', label: 'Delhi NCR' },
              { value: 'Kochi', label: 'Kochi' },
              { value: 'Pune', label: 'Pune' },
              { value: 'Hyderabad', label: 'Hyderabad' },
              { value: 'Chennai', label: 'Chennai' },
            ]}
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />

          <div className="flex items-center justify-between sm:justify-start gap-3 px-2">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="ver-only"
                checked={verifiedOnly}
                onChange={(e) => setVerifiedOnly(e.target.checked)}
                className="w-4 h-4 accent-black rounded cursor-pointer"
              />
              <label htmlFor="ver-only" className="text-xs font-mono text-neutral-700 cursor-pointer">
                Verified Only
              </label>
            </div>
            <Button type="submit" variant="primary" size="sm" className="hidden sm:inline-flex">
              Search
            </Button>
          </div>
        </form>
      </Card>

      {/* Workers Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      ) : workers.length === 0 ? (
        <Card className="p-12 text-center bg-white border-dashed border-[#D9D9D9]">
          <p className="text-sm font-mono text-neutral-600 mb-2">No professionals found matching your filters.</p>
          <Button variant="secondary" size="sm" onClick={() => { setSelectedCategory(''); setCity(''); setSearch(''); setVerifiedOnly(false); }}>
            Reset Filters
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workers.map((w) => (
            <Card
              key={w.id}
              className="p-6 bg-white border-[#D9D9D9] hover:border-black hover:shadow-nothing-hover transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={w.user?.avatarUrl || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100'}
                      alt={w.user?.name}
                      className="w-14 h-14 rounded-full object-cover border border-neutral-200 shrink-0"
                    />
                    <div>
                      <h3 className="text-base font-bold text-[#0A0A0A] flex items-center gap-1.5">
                        {w.user?.name}
                        {w.verificationState === 'VERIFIED' && (
                          <ShieldCheck className="w-4 h-4 text-[#10B981]" />
                        )}
                      </h3>
                      <p className="text-xs text-[#4A4A4A] font-medium">
                        {w.categories?.[0]?.category?.name || 'Artisan'}
                      </p>
                    </div>
                  </div>

                  <Badge variant={w.badgeLevel === 'PREMIUM' ? 'premium' : 'default'}>
                    {w.badgeLevel}
                  </Badge>
                </div>

                <p className="text-xs text-neutral-600 line-clamp-2 mb-4 leading-relaxed">
                  {w.tagline || w.bio}
                </p>

                {/* Skills tags */}
                {w.skills && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {w.skills.split(',').slice(0, 3).map((skill: string, i: number) => (
                      <span key={i} className="text-[10px] font-mono bg-white text-neutral-700 px-2 py-0.5 rounded-full border border-[#D9D9D9] shadow-2xs">
                        {skill.trim()}
                      </span>
                    ))}
                  </div>
                )}

                {/* Stats */}
                <div className="flex items-center justify-between text-xs font-mono text-neutral-600 border-t border-neutral-100 pt-3 mb-6">
                  <RatingStars value={w.rating} showNumber size="sm" />
                  <span>{w.jobsCompleted} completed</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-neutral-400" />
                    {w.serviceArea.split(' ')[0]}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <Link to={`/customer/workers/${w.id}`} className="flex-1">
                  <Button variant="secondary" size="sm" className="w-full justify-center text-xs">
                    View Portfolio
                  </Button>
                </Link>
                <Link to={`/customer/deals/new`} className="flex-1">
                  <Button variant="orange" size="sm" className="w-full justify-center text-xs">
                    Invite to Deal
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
