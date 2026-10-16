import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

export const ContactPage: React.FC = () => {
  const [sent, setSent] = useState(false);

  return (
    <div className="max-w-4xl mx-auto py-16 px-4 space-y-12 bg-white">
      <div className="text-center">
        <h1 className="font-dot text-4xl font-black text-[#0A0A0A] tracking-tight mb-2">
          HELP CENTRE & SUPPORT
        </h1>
        <p className="text-xs font-mono text-neutral-500">
          Our escrow mediators and dispute desk are here 24/7
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="p-8 bg-white border border-[#D9D9D9] shadow-xs space-y-6">
          <h3 className="font-dot text-lg font-bold text-neutral-900">Contact Information</h3>
          <div className="space-y-4 text-xs font-mono text-neutral-600">
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-[#FF5A1F]" />
              <span>support@dealanddemand.in</span>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-[#FF5A1F]" />
              <span>+91 80 4912 8800 (Mon - Sat, 9am - 8pm)</span>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="w-4 h-4 text-[#FF5A1F]" />
              <span>Indiranagar 100ft Road, Bengaluru, KA 560038</span>
            </div>
          </div>
        </Card>

        <Card className="p-8 bg-white border border-[#D9D9D9] shadow-xs">
          {sent ? (
            <div className="text-center py-8">
              <h4 className="text-base font-bold text-[#0A0A0A] mb-1">Message Received!</h4>
              <p className="text-xs text-[#4A4A4A] font-medium">Our support desk will reply within 2 business hours.</p>
            </div>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); setSent(true); }} className="space-y-4">
              <Input label="Your Name" placeholder="Aarav Mehta" required />
              <Input label="Your Email" type="email" placeholder="aarav@example.com" required />
              <div>
                <label className="block text-xs font-mono uppercase text-neutral-600 mb-1">Message</label>
                <textarea rows={3} placeholder="How can we help?" className="w-full bg-white border border-[#D9D9D9] rounded p-3 text-xs text-[#0A0A0A]" required />
              </div>
              <Button variant="orange" type="submit" size="md" className="w-full justify-center">
                Submit Inquiry
              </Button>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
};
