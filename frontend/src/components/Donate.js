'use client';

import { useState } from 'react';
import { Copy, Send, User, Mail, CreditCard, Hash, CheckCircle2 } from 'lucide-react';
import { showToast } from '../utils/toast.js';
import { api } from '../lib/api.js';

export default function Donate() {
  const [loading, setLoading] = useState(false);
  const copyBkash = () => {
    navigator.clipboard.writeText('+8801576795376');
    showToast('bKash number +8801576795376 copied to clipboard!');
  };

  const copyBank = () => {
    const bankDetails = 'Account Name: Metropolitan University Islamic Society (MUIS)\nAccount Number: 715910100016533\nBank: NRBC Bank\nBranch: Bateshwar Branch (Islamic Window)\nRouting Number: 260270812';
    navigator.clipboard.writeText(bankDetails);
    showToast('NRBC Bank details copied to clipboard!');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    const donorName = form.querySelector('#donor-name')?.value || '';
    const contact = form.querySelector('#donor-contact')?.value || '';
    const method = form.querySelector('#payment-method')?.value || '';
    const trxId = form.querySelector('#trx-id')?.value || '';
    setLoading(true);
    try {
      await api('/donations/confirm', {
        method: 'POST',
        body: { donorName, contact, method, trxId }
      });
      showToast(`JazakAllah Khair ${donorName}! Your payment confirmation (TrxID: ${trxId}) has been received.`);
      form.reset();
    } catch (err) {
      showToast(err.message, true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="donate" className="section" style={{ paddingTop: 30 }}>
      <div className="container" style={{ maxWidth: 960 }}>
        <div className="donation-simple-grid">
          <div className="donate-info-card bkash-card">
            <div className="donate-card-header">
              <div className="donate-badge bkash-badge">bKash Personal</div>
              <button className="btn btn-sm btn-copy" id="btn-copy-bkash" type="button" onClick={copyBkash}>
                <Copy style={{ width: 14, height: 14 }} /> Copy Number
              </button>
            </div>

            <div className="donate-number-display">+8801576795376</div>

            <div className="donate-details-list">
              <div><strong>Type:</strong> Personal (Send Money)</div>
              <div><strong>Instruction:</strong> Open bKash App ➔ Send Money ➔ +8801576795376</div>
            </div>
          </div>

          <div className="donate-info-card bank-card">
            <div className="donate-card-header">
              <div className="donate-badge bank-badge">Bank Transfer</div>
              <button className="btn btn-sm btn-copy" id="btn-copy-bank" type="button" onClick={copyBank}>
                <Copy style={{ width: 14, height: 14 }} /> Copy Bank Info
              </button>
            </div>

            <div className="bank-details-grid">
              <div><small>Account Name</small><strong>Metropolitan University Islamic Society (MUIS)</strong></div>
              <div><small>Account Number</small><strong className="highlight-green">715910100016533</strong></div>
              <div><small>Bank Name</small><strong>NRBC Bank</strong></div>
              <div><small>Branch</small><strong>Bateshwar Branch (Islamic Window)</strong></div>
              <div><small>Routing Number</small><strong>260270812</strong></div>
            </div>
          </div>
        </div>

        <div className="donate-confirm-wrapper" style={{ marginTop: 36 }}>
          <div className="join-card">
            <div className="join-card-header text-center" style={{ marginBottom: 24, paddingBottom: 16 }}>
              <h3 style={{ fontSize: '1.35rem', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <Send style={{ color: '#10B981', width: 22, height: 22 }} /> Submit Payment Confirmation
              </h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--color-text-muted)' }}>
                Sent a contribution via bKash or Bank? Submit your TrxID for official acknowledgment.
              </p>
            </div>

            <form id="donation-confirm-form" onSubmit={handleSubmit}>
              <div className="form-grid-2">
                <div className="form-group">
                  <label htmlFor="donor-name">Donor / Student Name <span className="required">*</span></label>
                  <div className="input-with-icon">
                    <User className="input-icon" />
                    <input type="text" id="donor-name" className="form-control" placeholder="e.g. Niyaz Ahmad Khan" required />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="donor-contact">Email or Mobile Number <span className="required">*</span></label>
                  <div className="input-with-icon">
                    <Mail className="input-icon" />
                    <input type="text" id="donor-contact" className="form-control" placeholder="e.g. 01712345678 or student@metrouni.edu.bd" required />
                  </div>
                </div>
              </div>

              <div className="form-grid-2" style={{ marginTop: 16 }}>
                <div className="form-group">
                  <label htmlFor="payment-method">Payment Method Used <span className="required">*</span></label>
                  <div className="input-with-icon">
                    <CreditCard className="input-icon" />
                    <select id="payment-method" className="form-control" required style={{ paddingLeft: 48 }}>
                      <option value="bKash Personal (+8801576795376)">bKash Personal (+8801576795376)</option>
                      <option value="NRBC Bank Transfer (715910100016533)">NRBC Bank Transfer (A/c: 715910100016533)</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="trx-id">Transaction ID (TrxID) / Ref <span className="required">*</span></label>
                  <div className="input-with-icon">
                    <Hash className="input-icon" />
                    <input type="text" id="trx-id" className="form-control" placeholder="e.g. 9J4K2L8M1N" required style={{ fontFamily: 'monospace' }} />
                  </div>
                </div>
              </div>

              <div className="form-submit-row text-center" style={{ marginTop: 24 }}>
                <button type="submit" className="btn btn-emerald btn-lg btn-center" disabled={loading}>
                  <CheckCircle2 /> {loading ? 'Saving…' : 'Submit Confirmation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
