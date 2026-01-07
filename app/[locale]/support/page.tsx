'use client';

import { useState } from 'react';
import { Mail, MessageSquare, HelpCircle, ChevronDown, ChevronUp, Send, CheckCircle, AlertCircle } from 'lucide-react';

export default function SupportPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [formState, setFormState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    type: 'general',
    message: ''
  });

  const faqs = [
    {
      question: 'How do I create an account?',
      answer: 'You can create an account by downloading the Carve app from the App Store or Google Play. Tap "Sign Up" and follow the registration process using your email address or social login.'
    },
    {
      question: 'How do I track my workouts?',
      answer: 'After logging in, tap the "+" button to start a new workout. Select exercises from our library, log your sets, reps, and weights. The app will automatically track your progress and calculate XP earned.'
    },
    {
      question: 'What is XP and how does the leveling system work?',
      answer: 'XP (Experience Points) is earned through completing workouts, hitting personal records, and maintaining consistency. As you accumulate XP, you level up your profile, unlock achievements, and climb the leaderboards.'
    },
    {
      question: 'How do I connect with friends?',
      answer: 'Go to the Social tab and search for friends by username or email. You can also share your profile link. Once connected, you can see each other\'s progress, compete on leaderboards, and cheer each other on.'
    },
    {
      question: 'Can I export my workout data?',
      answer: 'Yes! Go to Settings > Data & Privacy > Export Data. You can download all your workout history, measurements, and progress data in a portable format.'
    },
    {
      question: 'How do I delete my account?',
      answer: 'You can delete your account by going to Settings > Account > Delete Account. Please note this action is permanent and will remove all your data. You can export your data before deletion.'
    },
    {
      question: 'Is my data private and secure?',
      answer: 'Yes, we take privacy seriously. Your data is encrypted, we don\'t sell personal information, and you control what\'s public on your profile. Read our full Privacy Policy for details.'
    },
    {
      question: 'The app is not syncing properly. What should I do?',
      answer: 'First, ensure you have a stable internet connection. Try pulling down to refresh, or force close and reopen the app. If issues persist, go to Settings > Sync > Force Sync. Contact support if the problem continues.'
    }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormState('loading');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          type: formData.type === 'general' ? 'other' : formData.type,
          message: formData.message
        })
      });

      if (response.ok) {
        setFormState('success');
        setFormData({ name: '', email: '', type: 'general', message: '' });
      } else {
        setFormState('error');
      }
    } catch {
      setFormState('error');
    }
  };

  return (
    <div className="h-full overflow-y-auto bg-white">
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl mb-6">
            <HelpCircle className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Support Center</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            We're here to help! Find answers to common questions or contact our support team.
          </p>
        </div>

        {/* Quick Contact Options */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <a
            href="mailto:support@carve.wiki"
            className="flex items-center gap-4 bg-gray-50 rounded-xl p-6 border border-gray-200 hover:bg-gray-100 transition-colors"
          >
            <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Mail className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Email Support</h3>
              <p className="text-gray-600 text-sm">support@carve.wiki</p>
              <p className="text-gray-500 text-xs mt-1">Response within 24-48 hours</p>
            </div>
          </a>
          <div className="flex items-center gap-4 bg-gray-50 rounded-xl p-6 border border-gray-200">
            <div className="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">In-App Support</h3>
              <p className="text-gray-600 text-sm">Settings &gt; Help &gt; Contact</p>
              <p className="text-gray-500 text-xs mt-1">Available in the Carve app</p>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-gray-50 rounded-xl border border-gray-200 p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="border-b border-gray-200 last:border-0 pb-4 last:pb-0">
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full flex items-center justify-between text-left py-2 hover:text-blue-600 transition-colors"
                >
                  <span className="font-medium text-gray-900 pr-4">{faq.question}</span>
                  {openFaq === index ? (
                    <ChevronUp className="w-5 h-5 text-gray-500 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />
                  )}
                </button>
                {openFaq === index && (
                  <p className="text-gray-600 mt-2 pb-2 leading-relaxed">
                    {faq.answer}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Contact Form */}
        <div id="contact" className="bg-gray-50 rounded-xl border border-gray-200 p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Contact Support</h2>
          <p className="text-gray-600 mb-6">
            Can't find what you're looking for? Send us a message and we'll get back to you as soon as possible.
          </p>

          {formState === 'success' ? (
            <div className="flex items-center gap-4 p-6 bg-green-50 rounded-xl border border-green-200">
              <CheckCircle className="w-8 h-8 text-green-600 flex-shrink-0" />
              <div>
                <h3 className="font-bold text-green-900">Message Sent!</h3>
                <p className="text-green-700">We've received your message and will respond within 24-48 hours.</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Your Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors bg-white"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors bg-white"
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                  What can we help you with?
                </label>
                <select
                  id="type"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors bg-white"
                >
                  <option value="general">General Question</option>
                  <option value="bug">Report a Bug</option>
                  <option value="feature">Feature Request</option>
                  <option value="account">Account Issue</option>
                  <option value="billing">Billing Question</option>
                </select>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  Your Message
                </label>
                <textarea
                  id="message"
                  required
                  rows={5}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors resize-none bg-white"
                  placeholder="Please describe your question or issue in detail..."
                />
              </div>

              {formState === 'error' && (
                <div className="flex items-center gap-3 p-4 bg-red-50 rounded-lg border border-red-200">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                  <p className="text-red-700 text-sm">Something went wrong. Please try again or email us directly.</p>
                </div>
              )}

              <button
                type="submit"
                disabled={formState === 'loading'}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
              >
                {formState === 'loading' ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Send Message
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Additional Resources */}
        <div className="bg-gray-50 rounded-xl border border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Additional Resources</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <a
              href="/privacy"
              className="p-4 rounded-lg border border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50 transition-colors"
            >
              <h3 className="font-medium text-gray-900">Privacy Policy</h3>
              <p className="text-gray-600 text-sm mt-1">How we protect your data</p>
            </a>
            <a
              href="/terms"
              className="p-4 rounded-lg border border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50 transition-colors"
            >
              <h3 className="font-medium text-gray-900">Terms of Service</h3>
              <p className="text-gray-600 text-sm mt-1">Usage terms and conditions</p>
            </a>
            <a
              href="/"
              className="p-4 rounded-lg border border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50 transition-colors"
            >
              <h3 className="font-medium text-gray-900">Fitness Wiki</h3>
              <p className="text-gray-600 text-sm mt-1">Exercise guides and tips</p>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
