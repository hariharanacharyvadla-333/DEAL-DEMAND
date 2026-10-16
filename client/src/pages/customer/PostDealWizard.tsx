import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Stepper } from '../../components/ui/Stepper';
import { Drawer } from '../../components/ui/Drawer';
import { Badge } from '../../components/ui/Badge';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Upload,
  Mic,
  MapPin,
  CheckCircle2,
  Calendar,
  Layers,
  Wrench,
  HelpCircle,
  FileText,
  DollarSign,
  Camera,
  Flame,
  Hammer,
  Paintbrush,
  BrickWall,
  Zap,
} from 'lucide-react';

export const PostDealWizard: React.FC = () => {
  const navigate = useNavigate();

  // Wizard State
  const [step, setStep] = useState(1);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dynamicValues, setDynamicValues] = useState<Record<string, any>>({});
  const [commonFields, setCommonFields] = useState({
    materialsSupplied: false,
    installationReq: true,
    siteVisitReq: false,
    workLocationType: 'ON_SITE',
    specialInstructions: '',
  });

  // Media
  const [imageUrls, setImageUrls] = useState<string[]>([
    'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600',
  ]);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [hasVoiceNote, setHasVoiceNote] = useState(false);

  // Logistics & Budget
  const [minBudget, setMinBudget] = useState(15000);
  const [maxBudget, setMaxBudget] = useState(25000);
  const [isNegotiable, setIsNegotiable] = useState(true);
  const [city, setCity] = useState('Bengaluru');
  const [address, setAddress] = useState('Indiranagar 100ft Road, Bengaluru, Karnataka');
  const [deadline, setDeadline] = useState(
    new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [urgency, setUrgency] = useState<'NORMAL' | 'URGENT'>('NORMAL');

  // AI Assistant Drawer
  const [isAIDrawerOpen, setIsAIDrawerOpen] = useState(false);
  const [aiKeywords, setAiKeywords] = useState('');
  const [aiExpandedSpec, setAiExpandedSpec] = useState<any>(null);
  const [aiPriceEstimate, setAiPriceEstimate] = useState<any>(null);
  const [isAILoading, setIsAILoading] = useState(false);

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmittedSuccess, setIsSubmittedSuccess] = useState(false);
  const [createdDealId, setCreatedDealId] = useState('');

  // 1. Fetch categories
  useEffect(() => {
    fetch('/api/categories')
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.categories.length > 0) {
          setCategories(d.categories);
          // Default to Carpenter
          const carp = d.categories.find((c: any) => c.slug === 'carpenter') || d.categories[0];
          setSelectedCategory(carp);
          setTitle(`Custom Woodwork Project`);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  // Update dynamic values when category changes
  const handleSelectCategory = (cat: any) => {
    setSelectedCategory(cat);
    setTitle(`Custom ${cat.name} Requirement`);
    setDynamicValues({});
  };

  const handleDynamicChange = (field: string, val: any) => {
    setDynamicValues((prev) => ({ ...prev, [field]: val }));
  };

  // AI Expansion Handler
  const handleAIExpand = async () => {
    if (!aiKeywords.trim()) return;
    setIsAILoading(true);
    try {
      const res = await fetch('/api/ai/expand-requirement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          categorySlug: selectedCategory?.slug || 'carpenter',
          keywords: aiKeywords,
          rawDetails: dynamicValues,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setAiExpandedSpec(data.result);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsAILoading(false);
    }
  };

  // AI Price Estimation Handler
  const handleAIEstimatePrice = async () => {
    setIsAILoading(true);
    try {
      const res = await fetch('/api/ai/estimate-price', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          categorySlug: selectedCategory?.slug || 'carpenter',
          specs: dynamicValues,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setAiPriceEstimate(data.result);
        setMinBudget(data.result.minPrice);
        setMaxBudget(data.result.maxPrice);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsAILoading(false);
    }
  };

  // Apply AI Specification to main form
  const applyAISpecToForm = () => {
    if (aiExpandedSpec) {
      setDescription(aiExpandedSpec.expandedDescription);
      setIsAIDrawerOpen(false);
    }
  };

  // Final Deal Submission
  const handleSubmitDeal = async () => {
    setIsSubmitting(true);
    const token = localStorage.getItem('dd_token');

    try {
      const res = await fetch('/api/deals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          categoryId: selectedCategory?.id,
          title,
          description: description || `Custom ${selectedCategory?.name} craftsmanship job in ${city}.`,
          dynamicValues,
          minBudget: Number(minBudget),
          maxBudget: Number(maxBudget),
          isNegotiable,
          city,
          address,
          deadline,
          urgency,
          workLocationType: commonFields.workLocationType,
          materialsSupplied: commonFields.materialsSupplied,
          installationReq: commonFields.installationReq,
          siteVisitReq: commonFields.siteVisitReq,
          imageUrls,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setCreatedDealId(data.deal.id);
        setIsSubmittedSuccess(true);
        // Trigger celebratory confetti animation
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#FF5A1F', '#0A0A0A', '#10B981'],
        });
      } else {
        alert(data.message || 'Failed to submit deal.');
      }
    } catch (err) {
      alert('Error submitting deal. Please verify backend connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmittedSuccess) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center">
        <Card className="p-10 bg-white border-neutral-200 shadow-lg animate-in zoom-in-95">
          <div className="w-16 h-16 rounded-full bg-[#ECFDF5] border border-[#A7F3D0] flex items-center justify-center mx-auto mb-6 text-[#10B981]">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="font-dot text-3xl font-black text-[#0A0A0A] tracking-tight mb-2">
            DEAL POSTED SUCCESSFULLY!
          </h2>
          <p className="text-sm text-neutral-600 font-mono max-w-md mx-auto mb-8">
            Your requirement is now live. Local verified {selectedCategory?.name}s in {city} have been alerted and will submit itemized quotations.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              variant="orange"
              size="md"
              onClick={() => navigate(`/customer/deals/${createdDealId}`)}
            >
              View Deal Status & Quotations
            </Button>
            <Button
              variant="outline"
              size="md"
              onClick={() => navigate('/customer/dashboard')}
            >
              Return to Dashboard
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const stepsList = ['Category', 'Specifications', 'Drawings & Media', 'Logistics', 'Review'];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Wizard Header */}
      <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
        <div>
          <h1 className="font-dot text-2xl font-black text-[#0A0A0A] tracking-tight">
            POST A NEW DEAL
          </h1>
          <p className="text-xs font-mono text-neutral-500">
            Step {step} of 5 • AI-powered requirement assistant available
          </p>
        </div>

        {/* AI Assistant Open Button */}
        <Button
          variant="orange"
          size="sm"
          onClick={() => setIsAIDrawerOpen(true)}
          icon={<Sparkles className="w-4 h-4" />}
        >
          AI Assistant
        </Button>
      </div>

      {/* Stepper Progress Bar */}
      <Stepper
        steps={stepsList}
        currentStep={step}
        onStepClick={(s) => setStep(s)}
      />

      {/* STEP 1: CATEGORY SELECTION */}
      {step === 1 && (
        <Card className="p-6 bg-white border-neutral-200">
          <h2 className="font-dot text-lg font-bold text-neutral-900 mb-1">
            01. SELECT PROFESSIONAL TRADE CATEGORY
          </h2>
          <p className="text-xs text-neutral-500 mb-6 font-mono">
            Choose the core trade craft for your project requirement
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {categories.map((cat) => {
              const isSelected = selectedCategory?.id === cat.id;
              return (
                <div
                  key={cat.id}
                  onClick={() => handleSelectCategory(cat)}
                  className={`p-4 rounded-nothing-sm border cursor-pointer transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'bg-black text-white border-black shadow-md ring-2 ring-[#FF5A1F]'
                      : 'bg-white border-[#D9D9D9] hover:border-black text-neutral-800'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-3 ${
                    isSelected ? 'bg-neutral-800 text-white' : 'bg-white border border-neutral-200 text-neutral-700'
                  }`}>
                    <Hammer className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className={`text-xs font-semibold leading-tight ${isSelected ? 'text-white' : 'text-[#0A0A0A]'}`}>{cat.name}</h4>
                    <span className={`text-[10px] font-mono block mt-1 ${isSelected ? 'text-neutral-300' : 'text-[#4A4A4A]'}`}>
                      {cat.commissionPct}% Escrow
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-8 flex justify-end">
            <Button
              variant="primary"
              size="md"
              icon={<ArrowRight className="w-4 h-4" />}
              onClick={() => setStep(2)}
            >
              Continue to Specifications
            </Button>
          </div>
        </Card>
      )}

      {/* STEP 2: DYNAMIC SPECIFICATIONS */}
      {step === 2 && (
        <Card className="p-6 bg-white border-neutral-200 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
            <div>
              <h2 className="font-dot text-lg font-bold text-neutral-900 mb-1">
                02. SPECIFICATIONS FOR {selectedCategory?.name.toUpperCase()}
              </h2>
              <p className="text-xs text-neutral-500 font-mono">
                Fill in the dimensions, materials, and specialized requirements
              </p>
            </div>
            <button
              onClick={() => setIsAIDrawerOpen(true)}
              className="inline-flex items-center gap-1.5 text-xs font-mono text-[#FF5A1F] hover:underline font-semibold"
            >
              <Sparkles className="w-3.5 h-3.5" /> Auto-Fill with AI
            </button>
          </div>

          <Input
            label="Deal Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Handcrafted Solid Teak Main Entrance Double Door"
            required
          />

          <div>
            <label className="block text-xs font-mono uppercase text-neutral-600 mb-1.5">
              Requirement Description
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what needs to be made, any specific aesthetic preferences, tolerances, and timeline expectations..."
              className="w-full bg-white border border-[#D9D9D9] focus:border-black rounded-nothing-sm p-3.5 text-sm focus:outline-none focus:ring-1 focus:ring-black"
            />
          </div>

          {/* Dynamic Fields for Selected Category */}
          {selectedCategory?.fields && selectedCategory.fields.length > 0 && (
            <div className="bg-white p-5 rounded-nothing-sm border border-[#D9D9D9] space-y-4">
              <span className="font-mono text-xs uppercase text-neutral-500 font-bold block mb-2">
                {selectedCategory.name} Specific Parameters
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {selectedCategory.fields.map((f: any) => {
                  let optionsList: string[] = [];
                  if (f.options) {
                    try {
                      optionsList = typeof f.options === 'string' ? JSON.parse(f.options) : f.options;
                    } catch {}
                  }

                  if (f.fieldType === 'dropdown') {
                    return (
                      <Select
                        key={f.id}
                        label={f.label}
                        value={dynamicValues[f.fieldName] || ''}
                        onChange={(e) => handleDynamicChange(f.fieldName, e.target.value)}
                        options={[
                          { value: '', label: `-- Select ${f.label} --` },
                          ...optionsList.map((opt) => ({ value: opt, label: opt })),
                        ]}
                      />
                    );
                  }

                  if (f.fieldType === 'toggle') {
                    return (
                      <div key={f.id} className="flex items-center justify-between p-3 bg-white rounded-nothing-sm border border-neutral-200">
                        <span className="text-xs font-mono text-neutral-700">{f.label}</span>
                        <input
                          type="checkbox"
                          checked={Boolean(dynamicValues[f.fieldName])}
                          onChange={(e) => handleDynamicChange(f.fieldName, e.target.checked)}
                          className="w-4 h-4 accent-[#0A0A0A] rounded cursor-pointer"
                        />
                      </div>
                    );
                  }

                  return (
                    <Input
                      key={f.id}
                      label={f.label}
                      type={f.fieldType === 'number' ? 'number' : 'text'}
                      placeholder={f.placeholder || ''}
                      value={dynamicValues[f.fieldName] || ''}
                      onChange={(e) => handleDynamicChange(f.fieldName, e.target.value)}
                    />
                  );
                })}
              </div>
            </div>
          )}

          {/* Common toggles */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="flex items-center justify-between p-3 bg-white rounded-nothing-sm border border-[#D9D9D9]">
              <span className="text-xs font-mono text-neutral-700">I Supply Materials</span>
              <input
                type="checkbox"
                checked={commonFields.materialsSupplied}
                onChange={(e) => setCommonFields({ ...commonFields, materialsSupplied: e.target.checked })}
                className="w-4 h-4 accent-black rounded cursor-pointer"
              />
            </div>
            <div className="flex items-center justify-between p-3 bg-white rounded-nothing-sm border border-[#D9D9D9]">
              <span className="text-xs font-mono text-neutral-700">Installation Required</span>
              <input
                type="checkbox"
                checked={commonFields.installationReq}
                onChange={(e) => setCommonFields({ ...commonFields, installationReq: e.target.checked })}
                className="w-4 h-4 accent-black rounded cursor-pointer"
              />
            </div>
            <div className="flex items-center justify-between p-3 bg-white rounded-nothing-sm border border-[#D9D9D9]">
              <span className="text-xs font-mono text-neutral-700">Site Visit Required</span>
              <input
                type="checkbox"
                checked={commonFields.siteVisitReq}
                onChange={(e) => setCommonFields({ ...commonFields, siteVisitReq: e.target.checked })}
                className="w-4 h-4 accent-black rounded cursor-pointer"
              />
            </div>
          </div>

          <div className="flex justify-between pt-4">
            <Button variant="secondary" onClick={() => setStep(1)}>
              Back
            </Button>
            <Button variant="primary" icon={<ArrowRight className="w-4 h-4" />} onClick={() => setStep(3)}>
              Continue to Drawings & Media
            </Button>
          </div>
        </Card>
      )}

      {/* STEP 3: MEDIA & DRAWINGS */}
      {step === 3 && (
        <Card className="p-6 bg-white border-neutral-200 space-y-6">
          <h2 className="font-dot text-lg font-bold text-neutral-900 mb-1">
            03. PHOTOS, DRAWINGS & REFERENCE LINKS
          </h2>
          <p className="text-xs text-neutral-500 font-mono">
            Upload sketches, architectural CAD plans, reference photos, or record an audio note
          </p>

          {/* Upload Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="border-2 border-dashed border-[#D9D9D9] rounded-nothing p-8 text-center bg-white flex flex-col items-center justify-center">
              <Upload className="w-8 h-8 text-neutral-400 mb-2" />
              <p className="text-xs font-mono font-semibold text-neutral-800">
                Click or Drop Files Here
              </p>
              <p className="text-[11px] text-neutral-400 mt-1">
                PNG, JPG, PDF plans up to 10MB
              </p>
              <input
                type="file"
                className="hidden"
                id="file-upload"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setImageUrls((prev) => [
                      ...prev,
                      'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?w=600',
                    ]);
                  }
                }}
              />
              <label
                htmlFor="file-upload"
                className="mt-4 px-4 py-1.5 rounded-full bg-white border border-[#D9D9D9] text-xs font-mono cursor-pointer hover:border-black"
              >
                Browse Files
              </label>
            </div>

            {/* Simulated Voice Note Recorder */}
            <div className="border border-[#D9D9D9] rounded-nothing p-6 bg-white flex flex-col justify-between">
              <div>
                <span className="font-mono text-xs uppercase text-neutral-500 font-bold block mb-1">
                  Optional Voice Note
                </span>
                <p className="text-xs text-neutral-500 mb-4">
                  Explain complex details in your regional language (English, Hindi, Malayalam).
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsRecordingVoice(!isRecordingVoice);
                    if (!isRecordingVoice) setHasVoiceNote(true);
                  }}
                  className={`px-4 py-2 rounded-full font-mono text-xs flex items-center gap-2 transition-all ${
                    isRecordingVoice
                      ? 'bg-alert text-white animate-pulse'
                      : hasVoiceNote
                      ? 'bg-neutral-800 text-white'
                      : 'bg-white border border-neutral-300 text-neutral-800'
                  }`}
                >
                  <Mic className="w-4 h-4" />
                  {isRecordingVoice ? 'Recording... Click to Stop' : hasVoiceNote ? 'Voice Note Attached (0:42)' : 'Record Voice Note'}
                </button>
              </div>
            </div>
          </div>

          {/* Attached Files Preview */}
          <div>
            <span className="font-mono text-xs uppercase text-neutral-500 font-bold block mb-2">
              Attached References ({imageUrls.length})
            </span>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {imageUrls.map((url, idx) => (
                <div key={idx} className="relative w-24 h-24 rounded-nothing-sm overflow-hidden border border-neutral-200 shrink-0">
                  <img src={url} alt="Attached Ref" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-between pt-4">
            <Button variant="secondary" onClick={() => setStep(2)}>
              Back
            </Button>
            <Button variant="primary" icon={<ArrowRight className="w-4 h-4" />} onClick={() => setStep(4)}>
              Continue to Logistics & Budget
            </Button>
          </div>
        </Card>
      )}

      {/* STEP 4: BUDGET & LOGISTICS */}
      {step === 4 && (
        <Card className="p-6 bg-white border-neutral-200 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
            <div>
              <h2 className="font-dot text-lg font-bold text-neutral-900 mb-1">
                04. BUDGET & LOGISTICS
              </h2>
              <p className="text-xs text-neutral-500 font-mono">
                Set budget boundaries, target deadline, and location
              </p>
            </div>
            <button
              onClick={handleAIEstimatePrice}
              className="inline-flex items-center gap-1.5 text-xs font-mono text-[#FF5A1F] hover:underline font-semibold"
            >
              <Sparkles className="w-3.5 h-3.5" /> AI Price Estimator
            </button>
          </div>

          {/* Budget Range Inputs */}
          <div className="bg-white p-5 rounded-nothing-sm border border-[#D9D9D9] shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <span className="font-mono text-xs uppercase text-neutral-600 font-bold">
                Budget Range (₹ INR)
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-neutral-500">Negotiable:</span>
                <input
                  type="checkbox"
                  checked={isNegotiable}
                  onChange={(e) => setIsNegotiable(e.target.checked)}
                  className="w-4 h-4 accent-black rounded cursor-pointer"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Minimum Budget (₹)"
                type="number"
                value={minBudget}
                onChange={(e) => setMinBudget(Number(e.target.value))}
              />
              <Input
                label="Maximum Budget (₹)"
                type="number"
                value={maxBudget}
                onChange={(e) => setMaxBudget(Number(e.target.value))}
              />
            </div>
          </div>

          {/* Location & City */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Job Location City"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              options={[
                { value: 'Bengaluru', label: 'Bengaluru, Karnataka' },
                { value: 'Mumbai', label: 'Mumbai, Maharashtra' },
                { value: 'Delhi NCR', label: 'Delhi NCR' },
                { value: 'Kochi', label: 'Kochi, Kerala' },
                { value: 'Hyderabad', label: 'Hyderabad, Telangana' },
                { value: 'Pune', label: 'Pune, Maharashtra' },
                { value: 'Chennai', label: 'Chennai, Tamil Nadu' },
                { value: 'Kolkata', label: 'Kolkata, West Bengal' },
              ]}
            />
            <Input
              label="Detailed Address / Landmark"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              prefixIcon={<MapPin className="w-4 h-4 text-neutral-400" />}
            />
          </div>

          {/* Deadline & Urgency */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Target Completion Deadline"
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
            />
            <Select
              label="Project Urgency"
              value={urgency}
              onChange={(e) => setUrgency(e.target.value as any)}
              options={[
                { value: 'NORMAL', label: 'Normal Timeline' },
                { value: 'URGENT', label: 'Urgent / Priority Execution' },
              ]}
            />
          </div>

          <div className="flex justify-between pt-4">
            <Button variant="secondary" onClick={() => setStep(3)}>
              Back
            </Button>
            <Button variant="primary" icon={<ArrowRight className="w-4 h-4" />} onClick={() => setStep(5)}>
              Continue to Review & Confirm
            </Button>
          </div>
        </Card>
      )}

      {/* STEP 5: REVIEW & SUBMIT */}
      {step === 5 && (
        <Card className="p-6 bg-white border-neutral-200 space-y-6">
          <h2 className="font-dot text-lg font-bold text-neutral-900 mb-1">
            05. FINAL REVIEW & POST DEAL
          </h2>
          <p className="text-xs text-neutral-500 font-mono">
            Verify requirement parameters before publishing to the artisan marketplace
          </p>

          {/* Summary Box */}
          <div className="border border-[#D9D9D9] rounded-nothing p-6 bg-white space-y-4">
            <div className="flex items-start justify-between pb-4 border-b border-[#D9D9D9]">
              <div>
                <Badge variant="orange" className="mb-1">{selectedCategory?.name}</Badge>
                <h3 className="font-dot text-xl font-bold text-[#0A0A0A]">{title}</h3>
                <p className="text-xs text-neutral-500 font-mono mt-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" /> {address}, {city}
                </p>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-mono text-neutral-400 uppercase">Budget</span>
                <p className="font-mono text-lg font-bold text-black">
                  ₹{Number(minBudget).toLocaleString()} - ₹{Number(maxBudget).toLocaleString()}
                </p>
              </div>
            </div>

            <div>
              <span className="font-mono text-xs uppercase text-neutral-500 font-bold block mb-1">
                Description
              </span>
              <p className="text-xs text-neutral-700 leading-relaxed">
                {description || 'Standard physical crafting requirements.'}
              </p>
            </div>

            {/* Dynamic specs summary */}
            {Object.keys(dynamicValues).length > 0 && (
              <div className="border-t border-dashed border-[#D9D9D9] pt-3">
                <span className="font-mono text-xs uppercase text-neutral-500 font-bold block mb-2">
                  Technical Specifications
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-mono text-neutral-600">
                  {Object.entries(dynamicValues).map(([k, v]) => (
                    <div key={k} className="bg-white p-2 rounded border border-[#D9D9D9]">
                      <span className="text-neutral-400 text-[10px] block uppercase">{k}:</span>
                      <span className="font-semibold text-black">{String(v)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="p-4 bg-white border border-[#D9D9D9] text-[#0A0A0A] rounded-nothing-sm flex items-center gap-3 text-xs font-mono shadow-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] animate-ping" />
            <span className="font-semibold">Platform Escrow Protection will hold all funds until each milestone is approved.</span>
          </div>

          <div className="flex justify-between pt-4">
            <Button variant="secondary" onClick={() => setStep(4)}>
              Back
            </Button>
            <Button
              variant="orange"
              size="lg"
              isLoading={isSubmitting}
              onClick={handleSubmitDeal}
              icon={<Sparkles className="w-4 h-4" />}
            >
              Confirm & Post Deal
            </Button>
          </div>
        </Card>
      )}

      {/* AI ASSISTANT DRAWER */}
      <Drawer
        isOpen={isAIDrawerOpen}
        onClose={() => setIsAIDrawerOpen(false)}
        title="AI REQUIREMENT BUILDER"
        subtitle="Turns keywords into rich craftsmanship specifications"
        isAIPanel
        width="lg"
      >
        <div className="space-y-6">
          <div className="p-4 rounded-nothing-sm bg-white border border-[#D9D9D9] text-[#0A0A0A] shadow-xs">
            <label className="block text-xs font-mono uppercase text-[#4A4A4A] font-semibold mb-1.5">
              Enter rough keywords or materials:
            </label>
            <input
              type="text"
              value={aiKeywords}
              onChange={(e) => setAiKeywords(e.target.value)}
              placeholder="e.g. teak wood double door carved handles"
              className="w-full bg-white border border-[#D9D9D9] rounded-nothing-sm p-2.5 text-sm text-[#0A0A0A] focus:outline-none focus:ring-1 focus:ring-[#FF5A1F]"
            />
            <Button
              variant="orange"
              size="sm"
              isLoading={isAILoading}
              onClick={handleAIExpand}
              className="mt-3 w-full justify-center font-semibold"
            >
              Generate Professional Specs
            </Button>
          </div>

          {/* AI Result Card */}
          {aiExpandedSpec && (
            <div className="space-y-4">
              <div className="p-4 rounded-nothing-sm bg-white border border-[#D9D9D9] shadow-xs">
                <span className="font-mono text-xs uppercase text-neutral-500 font-bold block mb-1">
                  Generated Description:
                </span>
                <p className="text-xs text-neutral-800 leading-relaxed whitespace-pre-line">
                  {aiExpandedSpec.expandedDescription}
                </p>
              </div>

              <div className="p-4 rounded-nothing-sm bg-white border border-[#D9D9D9] shadow-xs space-y-2">
                <span className="font-mono text-xs uppercase text-neutral-500 font-bold block">
                  Suggested Materials & Finish:
                </span>
                <ul className="text-xs font-mono text-neutral-700 space-y-1">
                  {aiExpandedSpec.suggestedMaterials?.map((m: string) => (
                    <li key={m}>• {m}</li>
                  ))}
                  <li>• Dimensions: {aiExpandedSpec.suggestedDimensions}</li>
                  <li>• Finish: {aiExpandedSpec.suggestedFinish}</li>
                </ul>
              </div>

              {aiExpandedSpec.missingDetailsQuestions?.length > 0 && (
                <div className="p-4 rounded-nothing-sm bg-amber-50 border border-amber-200 text-xs text-amber-900">
                  <span className="font-mono uppercase font-bold block mb-1">
                    Questions to Consider:
                  </span>
                  <ul className="space-y-1 font-mono">
                    {aiExpandedSpec.missingDetailsQuestions.map((q: string) => (
                      <li key={q}>? {q}</li>
                    ))}
                  </ul>
                </div>
              )}

              <Button
                variant="primary"
                size="md"
                className="w-full justify-center"
                onClick={applyAISpecToForm}
              >
                Apply to My Deal Form
              </Button>
            </div>
          )}
        </div>
      </Drawer>
    </div>
  );
};
