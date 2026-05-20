import type { Lead } from '../types';
import { analyzePain } from './scoring';

function getPainPoint(lead: Lead): string {
  const pain = analyzePain(lead.industry, lead.title);
  return pain.painPoints[0] || 'manual workflows';
}

function getShortPain(industry: string): string {
  const shorts: Record<string, string> = {
    'Healthcare': 'appointment scheduling and patient follow-ups',
    'Dental': 'recall management and front desk overload',
    'Real Estate': 'lead follow-up and CRM management',
    'E-commerce': 'support ticket volume and order inquiries',
    'B2B SaaS': 'lead qualification and outreach',
    'Finance': 'document processing and compliance workflows',
    'Logistics': 'dispatch coordination and customer updates',
    'Legal': 'document drafting and client intake',
    'Other': 'repetitive manual workflows',
  };
  return shorts[industry] || 'repetitive manual workflows';
}

type TemplateVars = {
  name: string;
  first_name: string;
  company: string;
  industry: string;
  pain_point: string;
  title: string;
};

function fillTemplate(template: string, vars: TemplateVars): string {
  return template
    .replace(/\{\{name\}\}/g, vars.name)
    .replace(/\{\{first_name\}\}/g, vars.first_name)
    .replace(/\{\{company\}\}/g, vars.company)
    .replace(/\{\{industry\}\}/g, vars.industry)
    .replace(/\{\{pain_point\}\}/g, vars.pain_point)
    .replace(/\{\{title\}\}/g, vars.title);
}

export interface GeneratedOutreach {
  type: string;
  label: string;
  subject?: string;
  body: string;
}

export function generateOutreach(lead: Lead): GeneratedOutreach[] {
  const firstName = lead.name.split(' ')[0] || lead.name;
  const painPoint = getShortPain(lead.industry);
  const detailedPain = getPainPoint(lead);

  const vars: TemplateVars = {
    name: lead.name || 'there',
    first_name: firstName,
    company: lead.company || 'your company',
    industry: lead.industry || 'your industry',
    pain_point: painPoint,
    title: lead.title || 'team',
  };

  return [
    {
      type: 'linkedin_connection',
      label: 'LinkedIn Connection Note',
      body: fillTemplate(
        'Hi {{first_name}}, I noticed {{company}} is scaling its {{industry}} operations. We help {{industry}} businesses automate repetitive workflows with AI — specifically around {{pain_point}}. Would love to connect.',
        vars
      ),
    },
    {
      type: 'linkedin_dm',
      label: 'LinkedIn First DM',
      body: fillTemplate(
        `Hi {{first_name}}, thanks for connecting!\n\nQuick question — is {{company}} currently handling {{pain_point}} manually?\n\nWe've helped similar {{industry}} businesses cut that time by 60-70% using AI workflow automation. Takes about 2-3 weeks to implement.\n\nWould a 15-min call make sense to see if it applies to {{company}}?`,
        vars
      ),
    },
    {
      type: 'cold_email',
      label: 'Cold Email',
      subject: `AI automation for ${lead.company}'s ${painPoint}`,
      body: fillTemplate(
        `Hi {{first_name}},\n\nI came across {{company}} and noticed you likely deal with {{pain_point}} at scale — especially as a {{title}}.\n\nWe've helped {{industry}} businesses automate exactly this with AI workflows — typically saving 15-20 hours per week per team member.\n\nThe implementation takes 2-3 weeks and most clients see ROI in the first month.\n\nWould a quick 15-min call make sense to see if this applies to {{company}}?\n\nBest,\nClusterX Team`,
        vars
      ),
    },
    {
      type: 'follow_up_1',
      label: 'Follow-up 1',
      subject: `Re: AI automation for ${lead.company}`,
      body: fillTemplate(
        `Hi {{first_name}},\n\nJust following up on my last message about automating {{pain_point}} at {{company}}.\n\nWe recently helped a similar {{industry}} business reduce manual work by 65% — happy to share the case study if it's useful.\n\nStill worth a quick chat?`,
        vars
      ),
    },
    {
      type: 'follow_up_2',
      label: 'Follow-up 2',
      subject: `Last nudge — {{company}} + ClusterX`,
      body: fillTemplate(
        `Hi {{first_name}}, one last nudge — I know inboxes get busy.\n\nIf {{pain_point}} is a real challenge at {{company}}, I'd love to show you a 10-minute demo of what we've built for {{industry}} teams.\n\nIf the timing isn't right, totally understand. Just reply "not now" and I'll check back in Q2.`,
        vars
      ),
    },
    {
      type: 'breakup_email',
      label: 'Breakup Email',
      subject: `Closing the loop — {{company}}`,
      body: fillTemplate(
        `Hi {{first_name}},\n\nI'll stop reaching out — clearly the timing isn't right.\n\nIf {{company}} ever wants to explore AI automation for {{pain_point}}, we'll be here.\n\nWishing you a great quarter ahead.`,
        vars
      ),
    },
    {
      type: 'call_opener',
      label: 'Call Opener Script',
      body: fillTemplate(
        `"Hi {{first_name}}, this is [Your Name] from ClusterX. I'll be brief — I'm calling because we specialize in helping {{industry}} businesses automate {{pain_point}} with AI. Is that something {{company}} is actively looking at right now?"\n\n[If yes] → "Great, I'd love to ask you a couple quick questions to see if we'd be a fit."\n\n[If not sure] → "Totally fair — can I ask, how is your team currently handling {{pain_point}}? Just curious where it sits as a priority."`,
        vars
      ),
    },
    {
      type: 'discovery_questions',
      label: 'Discovery Questions',
      body: fillTemplate(
        `Discovery call questions for {{first_name}} at {{company}}:\n\n1. Walk me through how your team currently handles {{pain_point}} today — what does that process look like?\n\n2. How many hours per week does your team spend on this across all staff?\n\n3. What's the cost or consequence when it doesn't get done well or on time?\n\n4. Have you explored automation solutions before? What happened?\n\n5. If we could eliminate 60-70% of that manual work, what would your team focus on instead?\n\n6. What does a buying decision process look like for a tool like this at {{company}}?\n\n7. What would need to be true for you to move on this in the next 30-60 days?`,
        vars
      ),
    },
    {
      type: 'objection_responses',
      label: 'Objection Responses',
      body: `Common objections and responses:\n\n"We're already using [tool]"\n→ "That's great — most of our clients actually use [tool] alongside us. We handle the AI layer they don't cover. What's still manual?"\n\n"Not the right time"\n→ "I hear that. Quick question — is {{pain_point}} costing you time/revenue right now, or is it more of a future problem?"\n\n"Too expensive"\n→ "Completely understand. Our clients typically see 3-5x ROI in the first 90 days just from time saved. Would it help to see the math on that?"\n\n"We'll build it internally"\n→ "A lot of our clients said the same. Most found it took 6-9 months and didn't have the AI expertise in-house. We deploy in 2-3 weeks. Happy to share how we compare."`.replace(/\{\{pain_point\}\}/g, vars.pain_point),
    },
  ];
}

export function classifyReply(replyText: string): {
  classification: string;
  label: string;
  color: string;
  suggestedResponse: string;
} {
  const text = replyText.toLowerCase();

  const positiveSignals = [
    'interested', 'yes', 'sounds good', 'let\'s', 'lets', 'book', 'schedule',
    'demo', 'call', 'love to', 'tell me more', 'more info', 'when', 'available',
    'great', 'perfect', 'absolutely', 'sure', 'definitely', 'forward',
  ];

  const negativeSignals = [
    'not interested', 'unsubscribe', 'remove', 'stop', 'don\'t contact',
    'do not contact', 'no thanks', 'not for us', 'pass', 'no thank you',
    'won\'t work', 'not a fit',
  ];

  const objectionSignals = [
    'too expensive', 'budget', 'cost', 'price', 'already have', 'using',
    'not the right', 'build it', 'internally', 'competitor', 'contract',
    'concerned', 'worried', 'risk', 'security', 'compliance',
  ];

  const laterSignals = [
    'later', 'q3', 'q4', 'next year', 'next quarter', 'few months',
    'not now', 'busy', 'reach out', 'touch base', 'back to you',
    'follow up', 'revisit', 'check back',
  ];

  const positiveCount = positiveSignals.filter(s => text.includes(s)).length;
  const negativeCount = negativeSignals.filter(s => text.includes(s)).length;
  const objectionCount = objectionSignals.filter(s => text.includes(s)).length;
  const laterCount = laterSignals.filter(s => text.includes(s)).length;

  if (negativeCount > 0) {
    return {
      classification: 'not_interested',
      label: 'Not Interested',
      color: 'red',
      suggestedResponse: 'Thank you for letting me know — I appreciate the directness. I\'ll remove you from my outreach. If circumstances ever change and you want to revisit AI automation, feel free to reach out. Wishing you a great quarter.',
    };
  }

  if (positiveCount >= 2 || (positiveCount > 0 && text.length < 100)) {
    return {
      classification: 'positive',
      label: 'Positive',
      color: 'green',
      suggestedResponse: 'Fantastic — I\'m glad this resonates! I\'ll send over a calendar link to find a time that works. Looking forward to connecting and learning more about your setup.',
    };
  }

  if (objectionCount > 0) {
    return {
      classification: 'objection',
      label: 'Objection',
      color: 'amber',
      suggestedResponse: 'That\'s a fair point — and one I hear often. Most of our clients had the same concern before we worked together. Would it make sense to hop on a 15-minute call so I can address it specifically for your situation? I want to make sure it actually makes sense for you.',
    };
  }

  if (laterCount > 0) {
    return {
      classification: 'follow_up_later',
      label: 'Follow Up Later',
      color: 'blue',
      suggestedResponse: 'Totally understood — I\'ll put a reminder to follow up in a couple of months. In the meantime, I\'ll send over a brief case study relevant to your industry so you have it when the time is right. Talk soon.',
    };
  }

  return {
    classification: 'neutral',
    label: 'Neutral',
    color: 'slate',
    suggestedResponse: 'Thanks for the reply. I\'d love to understand your situation a bit better — would a 15-minute call this week work? I can share what we\'ve seen work for similar businesses and you can decide if it\'s worth exploring further.',
  };
}
