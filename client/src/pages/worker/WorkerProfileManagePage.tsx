import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import {
  UserCheck,
  ShieldCheck,
  Upload,
  Plus,
  Coins,
  Camera,
  CheckCircle2,
  Clock,
} from 'lucide-react';

export const WorkerProfileManagePage: React.FC = () => {
  const { user } = useAuth();
  const worker = user?.workerProfile;

  const [tagline, setTagline] = useState(worker?.tagline || '');
  const [bio, setBio] = useState(worker?.bio || '');
  const [skills, setSkills] = useState(worker?.skills || '');
  const [serviceArea, setServiceArea] = useState(worker?.serviceArea || '');
  const [upiId, setUpiId] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Portfolio modal
  const [portfolioModalOpen, setPortfolioModalOpen] = useState(false);
  const [portfolioTitle, setPortfolioTitle] = useState('');
  const [portfolioImg, setPortfolioImg] = useState('https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600');
  const [portfolioDesc, setPortfolioDesc] = useState('');

  // KYC modal
  const [kycModalOpen, setKycModalOpen] = useState(false);
  const [kycDocType, setKycDocType] = useState('AADHAAR');
  const [kycDocNum, setKycDocNum] = useState('');

  useEffect(() => {
    if (worker) {
      setTagline(worker.tagline || '');
      setBio(worker.bio || '');
      setSkills(worker.skills || '');
      setServiceArea(worker.serviceArea || '');
      if (worker.bankUpiDetails) {
        try {
          const parsed = JSON.parse(worker.bankUpiDetails);
          setUpiId(parsed.upiId || '');
        } catch {}
      }
    }
  }, [worker]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const token = localStorage.getItem('dd_token');

    try {
      const res = await fetch('/api/workers/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          tagline,
          bio,
          skills,
          serviceArea,
          bankUpiDetails: { upiId },
        }),
      });

      const data = await res.json();
      if (data.success) {
        alert('Profile updated successfully!');
      } else {
        alert(data.message || 'Failed to update profile.');
      }
    } catch (err) {
      alert('Error updating profile.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddPortfolio = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('dd_token');

    try {
      const res = await fetch('/api/workers/portfolio', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: portfolioTitle,
          description: portfolioDesc,
          imageUrl: portfolioImg,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setPortfolioModalOpen(false);
        alert('Portfolio project added!');
      }
    } catch (err) {
      alert('Failed to add portfolio item.');
    }
  };

  const handleUploadKYC = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('dd_token');

    try {
      const res = await fetch('/api/workers/kyc', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          docType: kycDocType,
          docNumber: kycDocNum,
          fileUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=500',
        }),
      });

      const data = await res.json();
      if (data.success) {
        setKycModalOpen(false);
        alert('KYC document submitted for verification!');
      }
    } catch (err) {
      alert('Failed to submit KYC.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="font-dot text-2xl sm:text-3xl font-black text-[#0A0A0A] tracking-tight">
          PROFILE, PORTFOLIO & KYC
        </h1>
        <p className="text-xs font-mono text-neutral-500 mt-1">
          Manage your public craftsman presence and verification credentials
        </p>
      </div>

      {/* KYC Status Banner */}
      <Card className="p-6 bg-white border-[#D9D9D9] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white border border-neutral-200 flex items-center justify-center">
            {worker?.verificationState === 'VERIFIED' ? (
              <ShieldCheck className="w-5 h-5 text-[#10B981]" />
            ) : (
              <Clock className="w-5 h-5 text-amber-500" />
            )}
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#0A0A0A] flex items-center gap-2">
              VERIFICATION STATUS: {worker?.verificationState || 'PENDING'}
              <Badge variant={worker?.verificationState === 'VERIFIED' ? 'verified' : 'orange'}>
                {worker?.badgeLevel || 'BASIC'}
              </Badge>
            </h3>
            <p className="text-xs font-mono text-neutral-500">
              {worker?.verificationState === 'VERIFIED'
                ? 'Your Aadhaar & trade credentials are fully verified by platform admin.'
                : 'Documents pending administrative approval.'}
            </p>
          </div>
        </div>

        <Button variant="outline" size="sm" onClick={() => setKycModalOpen(true)}>
          Upload New Document
        </Button>
      </Card>

      {/* Profile Form */}
      <Card className="p-8 bg-white border-neutral-200 space-y-6">
        <h2 className="font-dot text-lg font-bold text-neutral-900 border-b border-neutral-100 pb-3">
          PUBLIC PROFILE DETAILS
        </h2>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <Input
            label="Professional Tagline"
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
            placeholder="e.g. Master Carpenter & Teak Wood Craftsman with 14 Years Experience"
          />

          <div>
            <label className="block text-xs font-mono uppercase text-neutral-600 mb-1.5">
              Bio & Artisan Philosophy
            </label>
            <textarea
              rows={4}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell customers about your craftsmanship process, tools used, and specializations..."
              className="w-full bg-white border border-[#D9D9D9] rounded-nothing-sm p-3.5 text-xs focus:outline-none focus:border-black"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Service Area & Radius"
              value={serviceArea}
              onChange={(e) => setServiceArea(e.target.value)}
              placeholder="e.g. Bengaluru & Whitefield (25km)"
            />
            <Input
              label="Bank UPI ID (for Escrow Payouts)"
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
              placeholder="e.g. rajesh.sharma@okaxis"
            />
          </div>

          <Input
            label="Specialized Skills (comma separated)"
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
            placeholder="Solid Teak Doors, Modular Wardrobes, Antique Wood Polish"
          />

          <div className="flex justify-end pt-2">
            <Button variant="orange" type="submit" isLoading={isSaving} size="md">
              Save Profile Changes
            </Button>
          </div>
        </form>
      </Card>

      {/* Portfolio Gallery Controls */}
      <Card className="p-8 bg-white border-neutral-200 space-y-4">
        <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
          <div>
            <h2 className="font-dot text-lg font-bold text-neutral-900">
              PORTFOLIO PROJECTS
            </h2>
            <p className="text-xs font-mono text-neutral-500">
              Highlight your best craftsmanship to win higher-budget bids
            </p>
          </div>

          <Button variant="outline" size="sm" onClick={() => setPortfolioModalOpen(true)} icon={<Plus className="w-3.5 h-3.5" />}>
            Add Project
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          {worker?.portfolioItems?.map((item: any) => (
            <div key={item.id} className="border border-[#D9D9D9] rounded-nothing-sm p-4 bg-white flex items-center gap-3 shadow-xs">
              <img src={item.imageUrl} alt={item.title} className="w-16 h-16 rounded object-cover shrink-0" />
              <div>
                <h4 className="text-sm font-bold text-[#0A0A0A]">{item.title}</h4>
                <p className="text-xs text-[#4A4A4A] line-clamp-1">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* ADD PORTFOLIO MODAL */}
      <Modal
        isOpen={portfolioModalOpen}
        onClose={() => setPortfolioModalOpen(false)}
        title="ADD PORTFOLIO CRAFT"
        subtitle="Upload photos of your completed projects"
      >
        <form onSubmit={handleAddPortfolio} className="space-y-4">
          <Input
            label="Project Title"
            value={portfolioTitle}
            onChange={(e) => setPortfolioTitle(e.target.value)}
            placeholder="e.g. Hand-Carved Burma Teak Entrance Door"
            required
          />
          <Input
            label="Image URL"
            value={portfolioImg}
            onChange={(e) => setPortfolioImg(e.target.value)}
            required
          />
          <div>
            <label className="block text-xs font-mono uppercase text-neutral-600 mb-1">
              Short Description
            </label>
            <textarea
              rows={3}
              value={portfolioDesc}
              onChange={(e) => setPortfolioDesc(e.target.value)}
              placeholder="Custom 8ft double door with antique brass handles..."
              className="w-full bg-white border border-[#D9D9D9] rounded p-2 text-xs focus:outline-none focus:border-black"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={() => setPortfolioModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="orange" type="submit">
              Save Project
            </Button>
          </div>
        </form>
      </Modal>

      {/* KYC UPLOAD MODAL */}
      <Modal
        isOpen={kycModalOpen}
        onClose={() => setKycModalOpen(false)}
        title="SUBMIT KYC IDENTIFICATION"
        subtitle="Documents will be reviewed by admin before issuing verification badge"
      >
        <form onSubmit={handleUploadKYC} className="space-y-4">
          <div>
            <label className="block text-xs font-mono uppercase text-neutral-600 mb-1">
              Document Type
            </label>
            <select
              value={kycDocType}
              onChange={(e) => setKycDocType(e.target.value)}
              className="w-full bg-white border border-[#D9D9D9] rounded p-2.5 text-xs font-mono focus:outline-none focus:border-black"
            >
              <option value="AADHAAR">Aadhaar Card (UIDAI)</option>
              <option value="PAN">PAN Card</option>
              <option value="TRADE_LICENSE">Trade License / Municipal Reg</option>
              <option value="CERTIFICATE">Artisan Guild / ITI Certificate</option>
            </select>
          </div>

          <Input
            label="Document Identification Number"
            value={kycDocNum}
            onChange={(e) => setKycDocNum(e.target.value)}
            placeholder="e.g. XXXX-XXXX-8921"
            required
          />

          <div className="p-3 bg-white rounded border border-[#D9D9D9] text-xs font-mono text-neutral-600 shadow-2xs">
            Simulated file: aadhaar_document_scanned.pdf (Attached)
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={() => setKycModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="orange" type="submit">
              Submit for Admin Verification
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
