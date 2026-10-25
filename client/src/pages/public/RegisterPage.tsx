import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { Stepper } from '../../components/ui/Stepper';
import { useAuth } from '../../context/AuthContext';
import {
  User,
  Wrench,
  ShieldCheck,
  CheckCircle2,
  UploadCloud,
  FileCheck,
  Clock,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';

interface RegisterPageProps {
  defaultRole?: string;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ defaultRole }) => {
  const [searchParams] = useSearchParams();
  const initialRole = defaultRole || searchParams.get('role') || 'customer';

  const [role, setRole] = useState<string>(initialRole);
  const [workerStep, setWorkerStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [workerRegisteredSuccess, setWorkerRegisteredSuccess] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  // Customer Form State
  const [customerForm, setCustomerForm] = useState({
    name: '',
    email: '',
    phone: '',
    city: 'Bengaluru',
    password: '',
    confirmPassword: '',
  });

  // Worker Form State
  const [workerForm, setWorkerForm] = useState({
    name: '',
    email: '',
    phone: '',
    city: 'Bengaluru',
    password: '',
    confirmPassword: '',
    categorySlug: 'carpenter',
    skills: '',
    yearsExperience: '3',
    serviceArea: 'Bengaluru Urban',
    tagline: '',
    bio: '',
    idProofUrl: '',
    idProofFileName: '',
    workPhotoUrls: [] as string[],
    bankUpi: '',
  });

  const [isUploadingId, setIsUploadingId] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  useEffect(() => {
    // Fetch live categories for trade selection
    const fetchCats = async () => {
      try {
        const res = await fetch('/api/categories');
        const data = await res.json();
        if (data.success && data.categories?.length > 0) {
          setCategories(data.categories);
          if (!workerForm.categorySlug && data.categories[0]?.slug) {
            setWorkerForm((prev) => ({ ...prev, categorySlug: data.categories[0].slug }));
          }
        }
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    };
    fetchCats();
  }, []);

  const validateCustomerFields = () => {
    const errors: Record<string, string> = {};
    if (!customerForm.name.trim()) errors.name = 'Full name is required.';
    if (!customerForm.email.trim()) {
      errors.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerForm.email.trim())) {
      errors.email = 'Please enter a valid email address.';
    }
    const phoneDigits = customerForm.phone.replace(/\D/g, '');
    if (!customerForm.phone.trim()) {
      errors.phone = 'Phone number is required.';
    } else if (phoneDigits.length < 10) {
      errors.phone = 'Please enter a valid 10-digit mobile number.';
    }
    if (!customerForm.password) {
      errors.password = 'Password is required.';
    } else if (customerForm.password.length < 8 || !/[a-zA-Z]/.test(customerForm.password) || !/[0-9]/.test(customerForm.password)) {
      errors.password = 'Password must be at least 8 characters with a letter and a number.';
    }
    if (customerForm.password !== customerForm.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match.';
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateWorkerStep1 = () => {
    const errors: Record<string, string> = {};
    if (!workerForm.name.trim()) errors.worker_name = 'Full name is required.';
    if (!workerForm.email.trim()) {
      errors.worker_email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(workerForm.email.trim())) {
      errors.worker_email = 'Please enter a valid email address.';
    }
    const phoneDigits = workerForm.phone.replace(/\D/g, '');
    if (!workerForm.phone.trim()) {
      errors.worker_phone = 'Phone number is required.';
    } else if (phoneDigits.length < 10) {
      errors.worker_phone = 'Please enter a valid 10-digit mobile number.';
    }
    if (!workerForm.password) {
      errors.worker_password = 'Password is required.';
    } else if (workerForm.password.length < 8 || !/[a-zA-Z]/.test(workerForm.password) || !/[0-9]/.test(workerForm.password)) {
      errors.worker_password = 'Password must be at least 8 characters with a letter and a number.';
    }
    if (workerForm.password !== workerForm.confirmPassword) {
      errors.worker_confirmPassword = 'Passwords do not match.';
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCustomerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);
    if (!validateCustomerFields()) return;

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/register/customer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customerForm),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setGeneralError(data.message || 'Registration failed.');
        setIsLoading(false);
        return;
      }

      login(data.token, data.user);
      navigate('/customer/dashboard');
    } catch (err) {
      setGeneralError('Network connection error. Please ensure server is running.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleIdUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setIsUploadingId(true);
    setGeneralError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success && data.fileUrl) {
        setWorkerForm((prev) => ({
          ...prev,
          idProofUrl: data.fileUrl,
          idProofFileName: file.name,
        }));
      } else {
        setGeneralError('ID upload failed.');
      }
    } catch (err) {
      setGeneralError('Failed to upload file.');
    } finally {
      setIsUploadingId(false);
    }
  };

  const handleWorkPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setIsUploadingPhoto(true);
    setGeneralError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success && data.fileUrl) {
        setWorkerForm((prev) => ({
          ...prev,
          workPhotoUrls: [...prev.workPhotoUrls, data.fileUrl],
        }));
      }
    } catch (err) {
      setGeneralError('Failed to upload photo.');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleWorkerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/register/worker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...workerForm,
          categorySlugs: [workerForm.categorySlug],
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setGeneralError(data.message || 'Worker registration failed.');
        setIsLoading(false);
        return;
      }

      login(data.token, data.user);
      setWorkerRegisteredSuccess(true);
    } catch (err) {
      setGeneralError('Connection error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (workerRegisteredSuccess) {
    return (
      <div className="min-h-screen bg-white py-16 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-full bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto mb-6 shadow-xs">
            <Clock className="w-8 h-8" />
          </div>
          <h2 className="font-dot text-2xl sm:text-3xl font-black text-[#0A0A0A] tracking-tight mb-3">
            REGISTRATION SUBMITTED
          </h2>
          <p className="text-base text-[#4A4A4A] mb-8 leading-relaxed font-normal">
            Your profile is under admin review. You can explore available deals in your area right now, and full bidding capabilities will activate once your ID proof is verified.
          </p>
          <Button
            variant="orange"
            size="lg"
            className="w-full justify-center"
            onClick={() => navigate('/worker/dashboard')}
          >
            Enter Worker Workbench
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-xl w-full">
        <div className="text-center mb-8">
          <Link to="/" className="inline-block mb-3">
            <span className="font-dot text-2xl font-black text-[#0A0A0A]">
              Deal<span className="text-[#FF5A1F] text-3xl leading-none">&</span>Demand
            </span>
          </Link>
          <h1 className="font-dot text-2xl sm:text-3xl font-black text-[#0A0A0A] tracking-tight">
            CREATE ACCOUNT
          </h1>
          <p className="text-sm text-[#4A4A4A] mt-1 font-normal">
            Join the verified Indian physical craftsmanship and trade network
          </p>
        </div>

        {/* Role Toggle */}
        <div className="flex bg-white p-1 rounded-full border border-[#D9D9D9] mb-6 text-sm font-semibold shadow-xs">
          <button
            type="button"
            onClick={() => {
              setRole('customer');
              setGeneralError(null);
              setFieldErrors({});
            }}
            className={`flex-1 py-2 rounded-full transition-all ${
              role === 'customer' ? 'bg-[#0A0A0A] text-white shadow-xs' : 'text-[#4A4A4A] hover:text-[#0A0A0A]'
            }`}
          >
            Customer Account
          </button>
          <button
            type="button"
            onClick={() => {
              setRole('worker');
              setGeneralError(null);
              setFieldErrors({});
            }}
            className={`flex-1 py-2 rounded-full transition-all ${
              role === 'worker' ? 'bg-[#FF5A1F] text-white shadow-xs' : 'text-[#4A4A4A] hover:text-[#0A0A0A]'
            }`}
          >
            Worker Partner Account
          </button>
        </div>

        <Card className="p-8 bg-white border border-[#D9D9D9] shadow-xs rounded-nothing">
          {generalError && (
            <div className="mb-5 p-3.5 rounded-nothing-sm bg-red-50 border border-red-300 text-sm text-[#E1251B] font-medium leading-relaxed">
              {generalError}
            </div>
          )}

          {/* CUSTOMER SIGNUP FORM */}
          {role === 'customer' && (
            <form onSubmit={handleCustomerSubmit} className="space-y-4">
              <div>
                <Input
                  label="Full Name"
                  placeholder="Enter your full name"
                  value={customerForm.name}
                  onChange={(e) => {
                    setCustomerForm({ ...customerForm, name: e.target.value });
                    if (fieldErrors.name) setFieldErrors({ ...fieldErrors, name: '' });
                  }}
                  required
                />
                {fieldErrors.name && <p className="text-xs text-[#E1251B] mt-1 font-medium">{fieldErrors.name}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Input
                    label="Email Address"
                    type="email"
                    placeholder="name@example.com"
                    value={customerForm.email}
                    onChange={(e) => {
                      setCustomerForm({ ...customerForm, email: e.target.value });
                      if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: '' });
                    }}
                    required
                  />
                  {fieldErrors.email && <p className="text-xs text-[#E1251B] mt-1 font-medium">{fieldErrors.email}</p>}
                </div>
                <div>
                  <Input
                    label="Phone Number"
                    placeholder="10-digit mobile number"
                    value={customerForm.phone}
                    onChange={(e) => {
                      setCustomerForm({ ...customerForm, phone: e.target.value });
                      if (fieldErrors.phone) setFieldErrors({ ...fieldErrors, phone: '' });
                    }}
                    required
                  />
                  {fieldErrors.phone && <p className="text-xs text-[#E1251B] mt-1 font-medium">{fieldErrors.phone}</p>}
                </div>
              </div>

              <div>
                <Select
                  label="City"
                  value={customerForm.city}
                  onChange={(e) => setCustomerForm({ ...customerForm, city: e.target.value })}
                  options={[
                    { value: 'Bengaluru', label: 'Bengaluru, KA' },
                    { value: 'Mumbai', label: 'Mumbai, MH' },
                    { value: 'Delhi NCR', label: 'Delhi NCR' },
                    { value: 'Kochi', label: 'Kochi, KL' },
                    { value: 'Hyderabad', label: 'Hyderabad, TS' },
                    { value: 'Pune', label: 'Pune, MH' },
                    { value: 'Chennai', label: 'Chennai, TN' },
                  ]}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Input
                    label="Password"
                    type="password"
                    placeholder="Min 8 chars (letter + number)"
                    value={customerForm.password}
                    onChange={(e) => {
                      setCustomerForm({ ...customerForm, password: e.target.value });
                      if (fieldErrors.password) setFieldErrors({ ...fieldErrors, password: '' });
                    }}
                    required
                  />
                  {fieldErrors.password && <p className="text-xs text-[#E1251B] mt-1 font-medium">{fieldErrors.password}</p>}
                </div>
                <div>
                  <Input
                    label="Confirm Password"
                    type="password"
                    placeholder="Re-enter password"
                    value={customerForm.confirmPassword}
                    onChange={(e) => {
                      setCustomerForm({ ...customerForm, confirmPassword: e.target.value });
                      if (fieldErrors.confirmPassword) setFieldErrors({ ...fieldErrors, confirmPassword: '' });
                    }}
                    required
                  />
                  {fieldErrors.confirmPassword && (
                    <p className="text-xs text-[#E1251B] mt-1 font-medium">{fieldErrors.confirmPassword}</p>
                  )}
                </div>
              </div>

              <Button type="submit" variant="primary" size="md" isLoading={isLoading} className="w-full justify-center py-3 mt-4">
                Create Customer Account
              </Button>
            </form>
          )}

          {/* WORKER MULTI-STEP SIGNUP FORM */}
          {role === 'worker' && (
            <div>
              <div className="mb-6">
                <Stepper
                  steps={['Account Details', 'Trade & Skills', 'KYC & Proofs', 'Bank / UPI']}
                  currentStep={workerStep}
                  onStepClick={(s) => {
                    if (s < workerStep || validateWorkerStep1()) setWorkerStep(s);
                  }}
                />
              </div>

              <form onSubmit={handleWorkerSubmit} className="space-y-4">
                {/* STEP 1: ACCOUNT DETAILS */}
                {workerStep === 1 && (
                  <div className="space-y-4">
                    <div>
                      <Input
                        label="Full Name / Trade Entity"
                        placeholder="Enter your full name"
                        value={workerForm.name}
                        onChange={(e) => {
                          setWorkerForm({ ...workerForm, name: e.target.value });
                          if (fieldErrors.worker_name) setFieldErrors({ ...fieldErrors, worker_name: '' });
                        }}
                        required
                      />
                      {fieldErrors.worker_name && (
                        <p className="text-xs text-[#E1251B] mt-1 font-medium">{fieldErrors.worker_name}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Input
                          label="Email Address"
                          type="email"
                          placeholder="artisan@example.com"
                          value={workerForm.email}
                          onChange={(e) => {
                            setWorkerForm({ ...workerForm, email: e.target.value });
                            if (fieldErrors.worker_email) setFieldErrors({ ...fieldErrors, worker_email: '' });
                          }}
                          required
                        />
                        {fieldErrors.worker_email && (
                          <p className="text-xs text-[#E1251B] mt-1 font-medium">{fieldErrors.worker_email}</p>
                        )}
                      </div>
                      <div>
                        <Input
                          label="Mobile Phone"
                          placeholder="10-digit mobile number"
                          value={workerForm.phone}
                          onChange={(e) => {
                            setWorkerForm({ ...workerForm, phone: e.target.value });
                            if (fieldErrors.worker_phone) setFieldErrors({ ...fieldErrors, worker_phone: '' });
                          }}
                          required
                        />
                        {fieldErrors.worker_phone && (
                          <p className="text-xs text-[#E1251B] mt-1 font-medium">{fieldErrors.worker_phone}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <Select
                        label="Primary City"
                        value={workerForm.city}
                        onChange={(e) => setWorkerForm({ ...workerForm, city: e.target.value })}
                        options={[
                          { value: 'Bengaluru', label: 'Bengaluru, KA' },
                          { value: 'Mumbai', label: 'Mumbai, MH' },
                          { value: 'Delhi NCR', label: 'Delhi NCR' },
                          { value: 'Kochi', label: 'Kochi, KL' },
                          { value: 'Hyderabad', label: 'Hyderabad, TS' },
                          { value: 'Pune', label: 'Pune, MH' },
                          { value: 'Chennai', label: 'Chennai, TN' },
                        ]}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Input
                          label="Password"
                          type="password"
                          placeholder="Min 8 chars (letter + number)"
                          value={workerForm.password}
                          onChange={(e) => {
                            setWorkerForm({ ...workerForm, password: e.target.value });
                            if (fieldErrors.worker_password) setFieldErrors({ ...fieldErrors, worker_password: '' });
                          }}
                          required
                        />
                        {fieldErrors.worker_password && (
                          <p className="text-xs text-[#E1251B] mt-1 font-medium">{fieldErrors.worker_password}</p>
                        )}
                      </div>
                      <div>
                        <Input
                          label="Confirm Password"
                          type="password"
                          placeholder="Re-enter password"
                          value={workerForm.confirmPassword}
                          onChange={(e) => {
                            setWorkerForm({ ...workerForm, confirmPassword: e.target.value });
                            if (fieldErrors.worker_confirmPassword)
                              setFieldErrors({ ...fieldErrors, worker_confirmPassword: '' });
                          }}
                          required
                        />
                        {fieldErrors.worker_confirmPassword && (
                          <p className="text-xs text-[#E1251B] mt-1 font-medium">{fieldErrors.worker_confirmPassword}</p>
                        )}
                      </div>
                    </div>

                    <Button
                      type="button"
                      variant="orange"
                      className="w-full justify-center py-3 mt-4"
                      onClick={() => {
                        if (validateWorkerStep1()) setWorkerStep(2);
                      }}
                    >
                      Next: Trade & Skills <ArrowRight className="w-4 h-4 ml-1.5" />
                    </Button>
                  </div>
                )}

                {/* STEP 2: TRADE & SKILLS */}
                {workerStep === 2 && (
                  <div className="space-y-4">
                    <div>
                      <Select
                        label="Primary Trade Category"
                        value={workerForm.categorySlug}
                        onChange={(e) => setWorkerForm({ ...workerForm, categorySlug: e.target.value })}
                        options={
                          categories.length > 0
                            ? categories.map((c) => ({ value: c.slug, label: c.name }))
                            : [
                                { value: 'carpenter', label: 'Carpenter' },
                                { value: 'welder-fabricator', label: 'Welder & Fabricator' },
                                { value: 'painter', label: 'Painter' },
                                { value: 'plumber', label: 'Plumber' },
                                { value: 'electrician', label: 'Electrician' },
                              ]
                        }
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input
                        label="Years of Experience"
                        type="number"
                        placeholder="3"
                        value={workerForm.yearsExperience}
                        onChange={(e) => setWorkerForm({ ...workerForm, yearsExperience: e.target.value })}
                      />
                      <Input
                        label="Service Area / Radius"
                        placeholder="e.g. Bengaluru Urban (20km radius)"
                        value={workerForm.serviceArea}
                        onChange={(e) => setWorkerForm({ ...workerForm, serviceArea: e.target.value })}
                      />
                    </div>

                    <Input
                      label="Key Skills (comma-separated)"
                      placeholder="e.g. Teak Wood Joinery, Modular Wardrobes, PU Polish"
                      value={workerForm.skills}
                      onChange={(e) => setWorkerForm({ ...workerForm, skills: e.target.value })}
                    />

                    <Input
                      label="Headline / Tagline"
                      placeholder="e.g. Master Woodcraft Artisan with 10+ yrs experience"
                      value={workerForm.tagline}
                      onChange={(e) => setWorkerForm({ ...workerForm, tagline: e.target.value })}
                    />

                    <div className="flex gap-3 mt-4">
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => setWorkerStep(1)}
                        className="flex-1 justify-center"
                      >
                        <ArrowLeft className="w-4 h-4 mr-1.5" /> Back
                      </Button>
                      <Button
                        type="button"
                        variant="orange"
                        onClick={() => setWorkerStep(3)}
                        className="flex-1 justify-center"
                      >
                        Next: KYC & Proofs <ArrowRight className="w-4 h-4 ml-1.5" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* STEP 3: ID PROOF & WORK PHOTOS UPLOAD */}
                {workerStep === 3 && (
                  <div className="space-y-5">
                    <div>
                      <label className="block text-xs font-semibold text-[#0A0A0A] uppercase tracking-wider mb-1.5">
                        Government ID Proof (Aadhaar, PAN, or Trade License)
                      </label>
                      <div className="border border-dashed border-[#D9D9D9] p-4 rounded-nothing-sm text-center">
                        <UploadCloud className="w-7 h-7 text-[#4A4A4A] mx-auto mb-2" />
                        <label className="cursor-pointer inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white border border-[#0A0A0A] text-xs font-semibold text-[#0A0A0A] hover:bg-neutral-50 shadow-xs">
                          <span>{isUploadingId ? 'Uploading...' : 'Choose ID Document'}</span>
                          <input
                            type="file"
                            accept="image/*,.pdf"
                            className="hidden"
                            onChange={handleIdUpload}
                            disabled={isUploadingId}
                          />
                        </label>
                        {workerForm.idProofFileName && (
                          <div className="mt-2 text-xs text-[#10B981] font-semibold flex items-center justify-center gap-1">
                            <FileCheck className="w-3.5 h-3.5" /> {workerForm.idProofFileName} uploaded
                          </div>
                        )}
                        <p className="text-[11px] text-[#6B6B6B] mt-1.5">PNG, JPG, PDF up to 10MB</p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#0A0A0A] uppercase tracking-wider mb-1.5">
                        Work Photos / Portfolio Samples (Optional)
                      </label>
                      <div className="border border-dashed border-[#D9D9D9] p-4 rounded-nothing-sm text-center">
                        <label className="cursor-pointer inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white border border-[#D9D9D9] text-xs font-semibold text-[#0A0A0A] hover:border-[#0A0A0A] shadow-xs">
                          <span>{isUploadingPhoto ? 'Uploading...' : 'Upload Work Photo'}</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleWorkPhotoUpload}
                            disabled={isUploadingPhoto}
                          />
                        </label>
                        {workerForm.workPhotoUrls.length > 0 && (
                          <div className="mt-2 text-xs text-[#10B981] font-semibold">
                            {workerForm.workPhotoUrls.length} work sample(s) attached
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-3 mt-4">
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => setWorkerStep(2)}
                        className="flex-1 justify-center"
                      >
                        <ArrowLeft className="w-4 h-4 mr-1.5" /> Back
                      </Button>
                      <Button
                        type="button"
                        variant="orange"
                        onClick={() => setWorkerStep(4)}
                        className="flex-1 justify-center"
                      >
                        Next: Bank / UPI <ArrowRight className="w-4 h-4 ml-1.5" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* STEP 4: BANK OR UPI DETAILS */}
                {workerStep === 4 && (
                  <div className="space-y-4">
                    <div>
                      <Input
                        label="UPI ID for Direct Payouts"
                        placeholder="yourname@okhdfcbank or yourname@paytm"
                        value={workerForm.bankUpi}
                        onChange={(e) => setWorkerForm({ ...workerForm, bankUpi: e.target.value })}
                      />
                      <p className="text-xs text-[#6B6B6B] mt-1">
                        Funds from completed and approved milestones are credited here.
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#0A0A0A] uppercase tracking-wider mb-1.5">
                        Short Artisan Bio
                      </label>
                      <textarea
                        rows={3}
                        value={workerForm.bio}
                        onChange={(e) => setWorkerForm({ ...workerForm, bio: e.target.value })}
                        placeholder="Tell customers about your experience, tools, and craftsmanship standards..."
                        className="w-full bg-white border border-[#D9D9D9] rounded-nothing-sm p-3 text-sm text-[#0A0A0A] focus:outline-none focus:ring-1 focus:ring-black"
                      />
                    </div>

                    <div className="flex gap-3 mt-4">
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => setWorkerStep(3)}
                        className="flex-1 justify-center"
                      >
                        <ArrowLeft className="w-4 h-4 mr-1.5" /> Back
                      </Button>
                      <Button
                        type="submit"
                        variant="orange"
                        isLoading={isLoading}
                        className="flex-1 justify-center py-3"
                      >
                        Submit Registration
                      </Button>
                    </div>
                  </div>
                )}
              </form>
            </div>
          )}

          <div className="mt-6 text-center text-sm text-[#4A4A4A] border-t border-[#D9D9D9] pt-5 font-normal">
            Already have an account?{' '}
            <Link to={`/login?role=${role}`} className="text-[#0A0A0A] font-semibold hover:underline">
              Sign In to {role === 'worker' ? 'Worker' : 'Customer'} Portal
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};
