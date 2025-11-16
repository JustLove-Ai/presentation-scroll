import {
  Presentation,
  Youtube,
  GraduationCap,
  Target,
  TrendingUp,
} from "lucide-react";

export interface ScriptTemplateSlide {
  slideTemplate: string; // ID of existing slide template to use
  purpose: string; // What this slide accomplishes
  instruction: string; // Guidance for user
  placeholderText?: { // Text to show when loading without AI
    [blockType: string]: string;
  };
  aiPrompt: string; // Prompt for AI generation
}

export interface ScriptTemplateSection {
  name: string;
  description: string;
  slides: ScriptTemplateSlide[];
}

export interface ScriptTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: any;
  estimatedSlides: number;
  bestUsedFor: string; // When to use this template
  targetAudience: string; // Who this works best for
  keyBenefits: string[]; // Main benefits of using this template
  sections: ScriptTemplateSection[];
}

export const scriptTemplates: ScriptTemplate[] = [
  {
    id: "webinar-russell-brunson",
    name: "Russell Brunson Perfect Webinar",
    description: "Proven webinar framework for selling high-ticket offers",
    category: "webinar",
    icon: Presentation,
    estimatedSlides: 15,
    bestUsedFor: "Selling high-ticket courses, coaching programs, or services through webinars. Perfect for value-first sales presentations that educate while converting.",
    targetAudience: "Coaches, course creators, consultants, and service providers selling premium offers ($997+)",
    keyBenefits: [
      "Battle-tested framework used to generate millions in sales",
      "Builds value and authority before the pitch",
      "Creates urgency and FOMO naturally",
      "Addresses objections throughout the presentation"
    ],
    sections: [
      {
        name: "Hook & Introduction",
        description: "Grab attention and establish credibility",
        slides: [
          {
            slideTemplate: "title",
            purpose: "Hook: Big promise",
            instruction: "Create an attention-grabbing title with a big promise. Example: 'How to [Get Desired Result] Without [Common Pain Point]'",
            placeholderText: {
              heading: "How to [Get Desired Result] Without [Common Pain Point]",
              text: "[Your Name / Company]"
            },
            aiPrompt: "Generate a compelling webinar title that promises {desiredResult} without {painPoint}. Use the 'how to X without Y' formula. Make it specific and benefit-driven."
          },
          {
            slideTemplate: "content",
            purpose: "Origin Story - Who You Are",
            instruction: "Brief personal story establishing credibility. Share your journey and why you're qualified to teach this.",
            placeholderText: {
              heading: "My Story",
              "bullet-list": "[Your background]\n[Key achievement]\n[Why you're qualified]"
            },
            aiPrompt: "Create 3-4 bullet points for an origin story about {speakerName} in the {industry} space. Establish credibility and relatability around teaching {topic}."
          },
          {
            slideTemplate: "content",
            purpose: "Origin Story - Where You're Going",
            instruction: "Paint the picture of the promised land. What's possible with this knowledge?",
            placeholderText: {
              heading: "What's Possible",
              "bullet-list": "[Benefit 1]\n[Benefit 2]\n[Benefit 3]"
            },
            aiPrompt: "List 3-4 compelling benefits/transformations possible by learning {topic}. Focus on outcomes, not features."
          }
        ]
      },
      {
        name: "The One Thing",
        description: "Core teaching moment",
        slides: [
          {
            slideTemplate: "text-left-image-right",
            purpose: "The Big Idea",
            instruction: "The main concept you're teaching. This is THE thing they need to know.",
            placeholderText: {
              heading: "The One Thing",
              text: "[Explain your core concept or framework]"
            },
            aiPrompt: "Explain the core concept/framework for {topic} in 1-2 clear sentences. This should be the 'aha moment' insight."
          }
        ]
      },
      {
        name: "Three Secrets Framework",
        description: "Break down your teaching into 3 key secrets",
        slides: [
          {
            slideTemplate: "content",
            purpose: "Secret #1 - Vehicle",
            instruction: "First secret: The vehicle/method that makes this possible",
            placeholderText: {
              heading: "Secret #1: [The Vehicle]",
              "bullet-list": "[Key point 1]\n[Key point 2]\n[Key point 3]"
            },
            aiPrompt: "Create Secret #1 for {topic}: The vehicle or method. Include heading and 3 key points explaining why this approach works."
          },
          {
            slideTemplate: "text-left-image-right",
            purpose: "Secret #1 - Story",
            instruction: "Story/case study demonstrating Secret #1 in action",
            placeholderText: {
              heading: "[Client/Case Study Name]",
              text: "[Brief story showing Secret #1 working]"
            },
            aiPrompt: "Write a brief case study or story (3-4 sentences) demonstrating {secret1} in action for {topic}. Include specific results."
          },
          {
            slideTemplate: "content",
            purpose: "Secret #2 - Internal Belief",
            instruction: "Second secret: The internal belief they need to have",
            placeholderText: {
              heading: "Secret #2: [The Belief]",
              "bullet-list": "[Key point 1]\n[Key point 2]\n[Key point 3]"
            },
            aiPrompt: "Create Secret #2 for {topic}: The internal belief or mindset shift needed. Include heading and 3 key points."
          },
          {
            slideTemplate: "text-right-image-left",
            purpose: "Secret #2 - Story",
            instruction: "Story/case study demonstrating Secret #2 in action",
            placeholderText: {
              heading: "[Client/Case Study Name]",
              text: "[Brief story showing Secret #2 working]"
            },
            aiPrompt: "Write a brief case study or story (3-4 sentences) demonstrating {secret2} in action for {topic}. Include specific results."
          },
          {
            slideTemplate: "content",
            purpose: "Secret #3 - External Strategy",
            instruction: "Third secret: The external strategy or tactic they'll use",
            placeholderText: {
              heading: "Secret #3: [The Strategy]",
              "bullet-list": "[Key point 1]\n[Key point 2]\n[Key point 3]"
            },
            aiPrompt: "Create Secret #3 for {topic}: The external strategy or tactics. Include heading and 3 key points."
          },
          {
            slideTemplate: "text-left-image-right",
            purpose: "Secret #3 - Story",
            instruction: "Story/case study demonstrating Secret #3 in action",
            placeholderText: {
              heading: "[Client/Case Study Name]",
              text: "[Brief story showing Secret #3 working]"
            },
            aiPrompt: "Write a brief case study or story (3-4 sentences) demonstrating {secret3} in action for {topic}. Include specific results."
          }
        ]
      },
      {
        name: "The Stack & Close",
        description: "Present your offer and create urgency",
        slides: [
          {
            slideTemplate: "content",
            purpose: "The Offer - What They Get",
            instruction: "Stack slide showing everything included in your offer",
            placeholderText: {
              heading: "What You Get",
              "bullet-list": "[Component 1 - Value]\n[Component 2 - Value]\n[Component 3 - Value]\n[Total Value: $X,XXX]"
            },
            aiPrompt: "Create a stack slide for {offerName}. List 4-5 components with their individual values. Make it compelling and valuable."
          },
          {
            slideTemplate: "title",
            purpose: "The Price Reveal",
            instruction: "Big reveal of the actual price vs. total value",
            placeholderText: {
              heading: "Today's Investment",
              text: "Just $[Price] (Value: $[Total Value])"
            },
            aiPrompt: "Create a price reveal for {offerName}. Total value is {totalValue}, actual price is {price}. Make it impactful."
          },
          {
            slideTemplate: "content",
            purpose: "Bonuses & Urgency",
            instruction: "Additional bonuses and reason to act now (scarcity/urgency)",
            placeholderText: {
              heading: "Act Now & Get These Bonuses",
              "bullet-list": "[Bonus 1]\n[Bonus 2]\n[Limited spots/time available]"
            },
            aiPrompt: "Create 2-3 compelling bonuses for {offerName} and add urgency (limited spots, deadline, or fast-action bonus)."
          },
          {
            slideTemplate: "title",
            purpose: "Call to Action",
            instruction: "Clear, direct call to action. What to do next?",
            placeholderText: {
              heading: "[Go to URL / Click Below / Call Now]",
              text: "[Simple instruction on how to purchase]"
            },
            aiPrompt: "Create a clear, direct call-to-action for {offerName}. Tell them exactly what to do next to purchase/sign up."
          }
        ]
      }
    ]
  },
  {
    id: "youtube-hook-setup-payoff",
    name: "YouTube Hook-Setup-Payoff",
    description: "Classic YouTube video structure for high retention",
    category: "youtube",
    icon: Youtube,
    estimatedSlides: 8,
    bestUsedFor: "Educational or tutorial YouTube videos where you want to maximize watch time and engagement. Perfect for how-to content and explainer videos.",
    targetAudience: "YouTubers, content creators, educators, and coaches creating educational video content",
    keyBenefits: [
      "Hooks viewers in the first 5 seconds",
      "Maintains engagement throughout the video",
      "Delivers on the promise to prevent drop-off",
      "Natural structure for calls-to-action"
    ],
    sections: [
      {
        name: "Hook",
        description: "First 5-10 seconds to grab attention",
        slides: [
          {
            slideTemplate: "title",
            purpose: "The Hook",
            instruction: "Attention-grabbing opening. State the big promise or curiosity gap.",
            placeholderText: {
              heading: "[Hook: Big promise or shocking statement]",
              text: "In this video..."
            },
            aiPrompt: "Create a compelling hook for a YouTube video about {topic}. Start with a promise, question, or bold statement that creates curiosity."
          }
        ]
      },
      {
        name: "Setup",
        description: "Context and credibility",
        slides: [
          {
            slideTemplate: "content",
            purpose: "Why This Matters",
            instruction: "Explain why the viewer should care. What problem does this solve?",
            placeholderText: {
              heading: "Why This Matters",
              "bullet-list": "[Problem]\n[Impact]\n[Why now]"
            },
            aiPrompt: "Explain why {topic} matters to the viewer. Cover the problem, its impact, and why they should learn this now."
          },
          {
            slideTemplate: "text-left-image-right",
            purpose: "What You'll Learn",
            instruction: "Quick overview of what's covered. Create curiosity for each point.",
            placeholderText: {
              heading: "What You'll Learn",
              text: "[Teaser for point 1]\n[Teaser for point 2]\n[Teaser for point 3]"
            },
            aiPrompt: "Create 3 teasers for what viewers will learn about {topic}. Make each point intriguing without giving everything away."
          }
        ]
      },
      {
        name: "Content",
        description: "Deliver the value",
        slides: [
          {
            slideTemplate: "content",
            purpose: "Main Point #1",
            instruction: "First key concept, tip, or strategy",
            placeholderText: {
              heading: "[Point 1 Title]",
              "bullet-list": "[Sub-point]\n[Example]\n[Action step]"
            },
            aiPrompt: "Create the first main point for {topic}. Include the concept, an example, and an actionable step."
          },
          {
            slideTemplate: "text-left-image-right",
            purpose: "Main Point #2",
            instruction: "Second key concept, tip, or strategy",
            placeholderText: {
              heading: "[Point 2 Title]",
              text: "[Explanation with example]"
            },
            aiPrompt: "Create the second main point for {topic}. Explain it clearly with a relevant example."
          },
          {
            slideTemplate: "content",
            purpose: "Main Point #3",
            instruction: "Third key concept, tip, or strategy",
            placeholderText: {
              heading: "[Point 3 Title]",
              "bullet-list": "[Sub-point]\n[Example]\n[Action step]"
            },
            aiPrompt: "Create the third main point for {topic}. Include the concept, an example, and an actionable step."
          }
        ]
      },
      {
        name: "Payoff",
        description: "Deliver on the promise and CTA",
        slides: [
          {
            slideTemplate: "quote",
            purpose: "Key Takeaway",
            instruction: "Summarize the main lesson or insight in one powerful statement",
            placeholderText: {
              quote: "[Memorable key insight or quote]",
              text: "Remember this..."
            },
            aiPrompt: "Create a memorable key takeaway or insight that summarizes the main lesson from {topic}. Make it quotable."
          },
          {
            slideTemplate: "title",
            purpose: "Call to Action",
            instruction: "What should viewers do next? (Subscribe, watch next video, get resource, etc.)",
            placeholderText: {
              heading: "[Clear CTA]",
              text: "[Link / Action / Next video suggestion]"
            },
            aiPrompt: "Create a call-to-action for a YouTube video about {topic}. Could be subscribe, get a free resource, or watch the next video."
          }
        ]
      }
    ]
  },
  {
    id: "educational-lecture",
    name: "Educational Lecture / Workshop",
    description: "Standard educational presentation structure",
    category: "educational",
    icon: GraduationCap,
    estimatedSlides: 10,
    bestUsedFor: "Academic lectures, training workshops, professional development sessions. Ideal when you need to teach complex concepts with clear learning outcomes.",
    targetAudience: "Teachers, professors, corporate trainers, and workshop facilitators",
    keyBenefits: [
      "Clear learning objectives upfront",
      "Structured progression from concept to application",
      "Includes examples and case studies",
      "Emphasizes practical application"
    ],
    sections: [
      {
        name: "Introduction",
        description: "Set context and learning objectives",
        slides: [
          {
            slideTemplate: "title",
            purpose: "Title Slide",
            instruction: "Course/lecture title and presenter information",
            placeholderText: {
              heading: "[Lecture Title]",
              text: "[Your Name] | [Institution/Organization]"
            },
            aiPrompt: "Create a professional title for a lecture about {topic}. Include presenter name: {speakerName}."
          },
          {
            slideTemplate: "content",
            purpose: "Learning Objectives",
            instruction: "What students will be able to do after this lecture",
            placeholderText: {
              heading: "Learning Objectives",
              "bullet-list": "By the end of this lecture, you will be able to:\n[Objective 1]\n[Objective 2]\n[Objective 3]"
            },
            aiPrompt: "Create 3-4 learning objectives for {topic}. Use action verbs (understand, explain, apply, analyze). Make them specific and measurable."
          }
        ]
      },
      {
        name: "Core Content",
        description: "Main teaching sections",
        slides: [
          {
            slideTemplate: "content",
            purpose: "Key Concept #1",
            instruction: "First major concept or topic",
            placeholderText: {
              heading: "[Concept 1]",
              "bullet-list": "[Definition]\n[Key points]\n[Why it matters]"
            },
            aiPrompt: "Explain the first key concept for {topic}. Include a clear definition and 2-3 key points."
          },
          {
            slideTemplate: "text-left-image-right",
            purpose: "Example / Case Study #1",
            instruction: "Real-world example demonstrating the concept",
            placeholderText: {
              heading: "Example",
              text: "[Brief case study or example illustrating the concept]"
            },
            aiPrompt: "Provide a clear, relevant example or case study that demonstrates {concept1} in {topic}."
          },
          {
            slideTemplate: "content",
            purpose: "Key Concept #2",
            instruction: "Second major concept or topic",
            placeholderText: {
              heading: "[Concept 2]",
              "bullet-list": "[Definition]\n[Key points]\n[Why it matters]"
            },
            aiPrompt: "Explain the second key concept for {topic}. Include a clear definition and 2-3 key points."
          },
          {
            slideTemplate: "text-right-image-left",
            purpose: "Example / Case Study #2",
            instruction: "Real-world example demonstrating the concept",
            placeholderText: {
              heading: "Example",
              text: "[Brief case study or example illustrating the concept]"
            },
            aiPrompt: "Provide a clear, relevant example or case study that demonstrates {concept2} in {topic}."
          },
          {
            slideTemplate: "content",
            purpose: "Key Concept #3",
            instruction: "Third major concept or topic",
            placeholderText: {
              heading: "[Concept 3]",
              "bullet-list": "[Definition]\n[Key points]\n[Why it matters]"
            },
            aiPrompt: "Explain the third key concept for {topic}. Include a clear definition and 2-3 key points."
          }
        ]
      },
      {
        name: "Application & Summary",
        description: "Help students apply and remember",
        slides: [
          {
            slideTemplate: "content",
            purpose: "Practical Application",
            instruction: "How to apply this knowledge. Practice activities or assignments.",
            placeholderText: {
              heading: "How to Apply This",
              "bullet-list": "[Application scenario 1]\n[Application scenario 2]\n[Practice activity]"
            },
            aiPrompt: "Provide 2-3 ways students can apply {topic} in real situations. Include practical scenarios or activities."
          },
          {
            slideTemplate: "content",
            purpose: "Key Takeaways",
            instruction: "Summary of the most important points to remember",
            placeholderText: {
              heading: "Key Takeaways",
              "bullet-list": "[Main point 1]\n[Main point 2]\n[Main point 3]"
            },
            aiPrompt: "Summarize the 3-4 most important takeaways from {topic}. Keep them concise and memorable."
          },
          {
            slideTemplate: "content",
            purpose: "Questions & Resources",
            instruction: "Where students can learn more and how to get help",
            placeholderText: {
              heading: "Questions? Next Steps",
              "bullet-list": "[Office hours / Contact info]\n[Recommended reading]\n[Additional resources]"
            },
            aiPrompt: "Create a final slide for {topic} with ways to get help, recommended resources, and next steps for continued learning."
          }
        ]
      }
    ]
  }
];
