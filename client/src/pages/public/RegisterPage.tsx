import React, { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { Stepper } from '../../components/ui/Stepper';
import { useAuth } from '../../context/AuthContext';
import { User, Wrench, ShieldCheck, CheckCircle2, UploadCloud } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get('role') || 'customer';

  const [role, setRole] = useState<string>(initialRole);
  const [workerStep, setWorkerStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { login } = useAuth();
  const navigate = useNavigate();

  // Customer Form State
  const [customerForm, setCustomerForm] = useState({
    name: '',
    email: '',
    phone: '',
    city: 'Bengaluru',
    password: '',
    otp: '',
  });

  // Worker Form State
  const [workerForm, setWorkerForm] = useState({
    name: '',
    email: '',
    phone: '',
    city: 'Bengaluru',
    password: '',
    categorySlug: 'carpenter',
    skills: 'Custom Woodwork, Door & Window Framing, Furniture Assembly',
    yearsExperience: '5',
    serviceArea: 'Bengaluru Urban (25km radius)',
    tagline: 'Experienced Custom Woodcraft Artisan',
    bio: 'Dedicated craftsman focused on durable joinery, clean finishing, and timely delivery.',
    bankUpi: 'worker.craft@okaxis',
  });

  const handleCustomerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/register-customer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(customerForm),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.message || 'Registration failed.');
        setIsLoading(false);
        return;
      }

      login(data.token, data.user);
      navigate('/customer/dashboard');
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleWorkerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/register-worker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...workerForm,
          categorySlugs: [workerForm.categorySlug],
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.message || 'Worker registration failed.');
        setIsLoading(false);
        return;
      }

      login(data.token, data.user);
      navigate('/worker/dashboard');
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-xl w-full">
        <div className="text-center mb-8">
          <Link to="/" className="inline-block mb-3">
            <span className="font-dot text-2xl font-black text-[#0A0A0A]">
              Deal<span className="text-[#FF5A1F] text-3xl leading-none">&</span>Demand
            </span>
          </Link>
          <h2 className="font-dot text-2xl font-bold text-[#0A0A0A] tracking-tight">
            CREATE ACCOUNT
          </h2>
          <p className="text-xs font-mono text-neutral-500 mt-1">
            Join the verified craftsmanship network
          </p>
        </div>

        {/* Role Toggle */}
        <div className="flex bg-white p-1 rounded-full border border-[#D9D9D9] mb-6 font-mono text-xs shadow-xs">
          <button
            type="button"
            onClick={() => {
              setRole('customer');
              setError(null);
            }}
            className={`flex-1 py-1.5 rounded-full capitalize font-semibold transition-all ${
              role === 'customer' ? 'bg-black text-white shadow-xs' : 'text-neutral-500 hover:text-black'
            }`}
          >
            Customer Account
          </button>
          <button
            type="button"
            onClick={() => {
              setRole('worker');
              setError(null);
            }}
            className={`flex-1 py-1.5 rounded-full capitalize font-semibold transition-all ${
              role === 'worker' ? 'bg-[#FF5A1F] text-white shadow-xs' : 'text-neutral-500 hover:text-black'
            }`}
          >
            Worker Partner Account
          </button>
        </div>

        <Card className="p-8 bg-white border-neutral-200 shadow-sm">
          {error && (
            <div className="mb-4 p-3 rounded-nothing-sm bg-red-50 border border-red-200 text-xs text-red-600 font-mono">
              {error}
            </div>
          )}

          {/* CUSTOMER SIGNUP FORM */}
          {role === 'customer' && (
            <form onSubmit={handleCustomerSubmit} className="space-y-4">
              <Input
                label="Full Name"
                placeholder="Aarav Mehta"
                value={customerForm.name}
                onChange={(e) => setCustomerForm({ ...customerForm, name: e.target.value })}
                required
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="aarav@example.com"
                  value={customerForm.email}
                  onChange={(e) => setCustomerForm({ ...customerForm, email: e.target.value })}
                  required
                />
                <Input
                  label="Phone Number"
                  placeholder="+91 98765 43210"
                  value={customerForm.phone}
                  onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                <Input
                  label="Create Password"
                  type="password"
                  placeholder="••••••••"
                  value={customerForm.password}
                  onChange={(e) => setCustomerForm({ ...customerForm, password: e.target.value })}
                  required
                />
              </div>

              {/* SMS OTP Verification */}
              <div className="p-3 bg-white rounded-nothing-sm border border-[#D9D9D9] shadow-xs">
                <label className="block text-xs font-semibold text-[#0A0A0A] uppercase tracking-wider mb-1">
                  SMS Verification OTP
                </label>
                <input
                  type="text"
                  value={customerForm.otp}
                  onChange={(e) => setCustomerForm({ ...customerForm, otp: e.target.value })}
                  className="w-full bg-white border border-neutral-300 rounded px-3 py-2 text-sm text-[#0A0A0A] placeholder-[#6B6B6B] focus:outline-none focus:ring-1 focus:ring-black"
                  placeholder="Enter 4-digit verification code"
                  required
                />
              </div>

              <Button type="submit" variant="primary" size="md" isLoading={isLoading} className="w-full justify-center mt-2">
                Create Customer Account
              </Button>
            </form>
          )}

          {/* WORKER MULTI-STEP SIGNUP FORM */}
          {role === 'worker' && (
            <div>
              <div className="mb-6">
                <Stepper
                  steps={['Personal Info', 'Skills & Area', 'Bank & KYC']}
                  currentStep={workerStep}
                  onStepClick={(s) => setWorkerStep(s)}
                />
              </div>

              <form onSubmit={handleWorkerSubmit} className="space-y-4">
                {workerStep === 1 && (
                  <>
                    <Input
                      label="Artisan / Professional Name"
                      placeholder="e.g. Rajesh Sharma"
                      value={workerForm.name}
                      onChange={(e) => setWorkerForm({ ...workerForm, name: e.target.value })}
                      required
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input
                        label="Email Address"
                        type="email"
                        placeholder="rajesh@craft.com"
                        value={workerForm.email}
                        onChange={(e) => setWorkerForm({ ...workerForm, email: e.target.value })}
                        required
                      />
                      <Input
                        label="Mobile Number"
                        placeholder="+91 98201 12345"
                        value={workerForm.phone}
                        onChange={(e) => setWorkerForm({ ...workerForm, phone: e.target.value })}
                        required
                      />
                    </div>
                    <Input
                      label="Password"
                      type="password"
                      placeholder="••••••••"
                      value={workerForm.password}
                      onChange={(e) => setWorkerForm({ ...workerForm, password: e.target.value })}
                      required
                    />
                    <Button
                      type="button"
                      variant="orange"
                      size="md"
                      className="w-full justify-center"
                      onClick={() => setWorkerStep(2)}
                    >
                      Continue to Step 2
                    </Button>
                  </>
                )}

                {workerStep === 2 && (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Select
                        label="Primary Trade Craft"
                        value={workerForm.categorySlug}
                        onChange={(e) => setWorkerForm({ ...workerForm, categorySlug: e.target.value })}
                        options={[
                          { value: 'carpenter', label: 'Carpenter' },
                          { value: 'welder-fabricator', label: 'Welder & Fabricator' },
                          { value: 'painter', label: 'Painter' },
                          { value: 'mason', label: 'Civil Mason' },
                          { value: 'plumber', label: 'Plumber' },
                          { value: 'electrician', label: 'Electrician' },
                          { value: 'tiler', label: 'Tiler' },
                          { value: 'modular-kitchen', label: 'Modular Kitchen Specialist' },
                          { value: 'interior-designer', label: 'Interior Designer' },
                          { value: 'false-ceiling', label: 'False Ceiling Specialist' },
                          { value: 'aluminium-glass', label: 'Aluminium & Glass Fitter' },
                          { value: 'cctv-security', label: 'CCTV & Security Installer' },
                          { value: 'waterproofing', label: 'Waterproofing Specialist' },
                          { value: 'cleaning-pest', label: 'Cleaning & Pest Control' },
                        ]}
                      />
                      <Input
                        label="Years of Experience"
                        type="number"
                        placeholder="5"
                        value={workerForm.yearsExperience}
                        onChange={(e) => setWorkerForm({ ...workerForm, yearsExperience: e.target.value })}
                        required
                      />
                    </div>

                    <Input
                      label="Service Area / Radius"
                      placeholder="e.g. Bengaluru & Whitefield (25km)"
                      value={workerForm.serviceArea}
                      onChange={(e) => setWorkerForm({ ...workerForm, serviceArea: e.target.value })}
                      required
                    />

                    <Input
                      label="Key Skills (comma separated)"
                      placeholder="Teak Doors, Modular Wardrobes, Antique Polish"
                      value={workerForm.skills}
                      onChange={(e) => setWorkerForm({ ...workerForm, skills: e.target.value })}
                      required
                    />

                    <div className="flex gap-3">
                      <Button type="button" variant="secondary" onClick={() => setWorkerStep(1)}>
                        Back
                      </Button>
                      <Button
                        type="button"
                        variant="orange"
                        className="flex-1 justify-center"
                        onClick={() => setWorkerStep(3)}
                      >
                        Continue to Step 3
                      </Button>
                    </div>
                  </>
                )}

                {workerStep === 3 && (
                  <>
                    <Input
                      label="Bank Account / UPI ID (for Escrow Payouts)"
                      placeholder="e.g. yourname@okaxis"
                      value={workerForm.bankUpi}
                      onChange={(e) => setWorkerForm({ ...workerForm, bankUpi: e.target.value })}
                      required
                    />

                    {/* ID Proof upload */}
                    <div className="p-4 border border-dashed border-[#D9D9D9] rounded-nothing-sm bg-white text-center shadow-xs">
                      <UploadCloud className="w-6 h-6 mx-auto text-[#FF5A1F] mb-1" />
                      <p className="text-sm text-[#0A0A0A] font-semibold">
                        Government ID / Trade License Upload
                      </p>
                      <p className="text-xs text-[#4A4A4A] mt-0.5">
                        Supported formats: PDF, JPG, PNG (Max size: 5MB)
                      </p>
                    </div>

                    <div className="p-3 bg-amber-50 rounded-nothing-sm border border-amber-200 text-xs text-amber-800 font-mono">
                      ℹ️ New worker accounts start as "Pending Verification". Our admin review desk will inspect your documents and grant badges.
                    </div>

                    <div className="flex gap-3">
                      <Button type="button" variant="secondary" onClick={() => setWorkerStep(2)}>
                        Back
                      </Button>
                      <Button
                        type="submit"
                        variant="orange"
                        isLoading={isLoading}
                        className="flex-1 justify-center"
                      >
                        Submit Worker Application
                      </Button>
                    </div>
                  </>
                )}
              </form>
            </div>
          )}

          <div className="mt-6 text-center text-xs text-neutral-500 font-mono border-t border-neutral-100 pt-4">
            Already have an account?{' '}
            <Link to={`/login?role=${role}`} className="text-black font-bold hover:underline">
              Sign In
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};
