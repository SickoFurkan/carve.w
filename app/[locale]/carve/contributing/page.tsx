import { ContactForm } from '@/components/carve/ContactForm';
import { Bug, Lightbulb, FileEdit, MessageSquare } from 'lucide-react';

export const metadata = {
  title: 'Contributing - Carve',
  description: 'Help improve Carve by reporting bugs, suggesting features, or contributing to the Wiki.',
};

export default function ContributingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-4xl mx-auto px-6 py-16">
        {/* Hero */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Contributing to Carve
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Help make Carve better for everyone. Your feedback shapes the future of this project.
          </p>
        </div>

        {/* Ways to Contribute */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Ways to Contribute</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <ContributionCard
              icon={<Bug className="w-8 h-8" />}
              title="Report Bugs"
              description="Found something broken? Let us know! Include steps to reproduce, expected behavior, and screenshots if possible."
              gradient="from-red-500 to-pink-500"
            />
            <ContributionCard
              icon={<Lightbulb className="w-8 h-8" />}
              title="Suggest Features"
              description="Have an idea for a new feature or improvement? We'd love to hear it. Explain the problem it solves and how it would work."
              gradient="from-yellow-500 to-orange-500"
            />
            <ContributionCard
              icon={<FileEdit className="w-8 h-8" />}
              title="Improve the Wiki"
              description="Know your stuff about fitness? Contribute articles, fix errors, or suggest new topics for the knowledge base."
              gradient="from-blue-500 to-cyan-500"
            />
            <ContributionCard
              icon={<MessageSquare className="w-8 h-8" />}
              title="General Feedback"
              description="Thoughts on the app? UX suggestions? Questions about the project? All feedback is welcome."
              gradient="from-purple-500 to-indigo-500"
            />
          </div>
        </section>

        {/* Guidelines */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Guidelines</h2>
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
            <ul className="space-y-4">
              <GuidelineItem
                title="Be Specific"
                description="The more details you provide, the better we can understand and address your feedback."
              />
              <GuidelineItem
                title="Be Constructive"
                description="Criticism is welcome, but please keep it constructive and respectful."
              />
              <GuidelineItem
                title="Search First"
                description="Check the FAQ and existing Updates to see if your question has already been answered or your issue addressed."
              />
              <GuidelineItem
                title="One Issue Per Submission"
                description="If you have multiple bugs or suggestions, please submit them separately."
              />
            </ul>
          </div>
        </section>

        {/* Contact Form */}
        <section>
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Submit Your Feedback
          </h2>
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
            <ContactForm />
          </div>
        </section>

        {/* Thank You */}
        <div className="mt-16 text-center p-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl">
          <h3 className="text-2xl font-bold text-gray-900 mb-3">
            Thank You!
          </h3>
          <p className="text-gray-600">
            Every piece of feedback helps make Carve better. We read and consider every submission.
          </p>
        </div>
      </div>
    </div>
  );
}

function ContributionCard({
  icon,
  title,
  description,
  gradient
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  gradient: string;
}) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <div className={`inline-block p-3 rounded-lg bg-gradient-to-r ${gradient} text-white mb-4`}>
        {icon}
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

function GuidelineItem({ title, description }: { title: string; description: string }) {
  return (
    <li className="flex items-start gap-3">
      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold mt-0.5">
        ✓
      </div>
      <div>
        <h4 className="font-semibold text-gray-900 mb-1">{title}</h4>
        <p className="text-gray-600 text-sm">{description}</p>
      </div>
    </li>
  );
}
