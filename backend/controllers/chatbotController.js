const { GoogleGenerativeAI } = require('@google/generative-ai');
const Problem = require('../models/Problem');

const SYSTEM_PROMPT = `You are NagarBot, the helpful assistant for Nagar Darpan — a civic problem reporting and tracking platform in Bangladesh.

About Nagar Darpan:
- Citizens can report civic problems like Road Damage, Water Supply issues, Sewage, Street Lights, Waste Management, Public Health, Safety, and Construction problems.
- Every reported problem gets a unique reference number (e.g., ND-A1B2C3D4).
- Problems have 3 statuses: Acknowledged → In Progress → Resolved.
- Citizens can support (upvote) problems. If a problem gets 2+ supports or is unresolved for 14+ days, it can be escalated to local authorities.
- Users can track their problem by reference number on the Track page.
- The platform has a Problem Map and Area Statistics.

Problem Categories: Road Damage, Water Supply, Sewage, Street Light, Waste Management, Public Health, Safety, Construction, Other.

How to report: Go to Report page → fill title, description, category, location (Division/District/Thana), phone number, and optionally attach an image and GPS location.

How to track: Go to Track page → enter your reference number (starts with ND-).

How to escalate: On the problem detail page, an Escalate button appears if the problem has 2+ supporters or is 14+ days old and unresolved.

Email notifications: Users receive an email when their problem status changes.

Answer only questions related to Nagar Darpan. Be concise, friendly, and helpful. If asked about tracking a specific reference number, the live data will be provided to you. Respond in the same language the user writes in (English or Bangla).`;

// Keyword-based FAQ fallback — works without Gemini API
const FAQ = [
  {
    patterns: [/how.*report|report.*problem|submit.*problem|how.*submit/i],
    answer: `To report a problem:\n1. Sign in to your account\n2. Click **Report Problem** in the navigation bar\n3. Fill in the title, description, and select a category\n4. Choose your location (Division → District → Thana)\n5. Add your phone number and optionally attach a photo\n6. Click Submit\n\nYou'll receive a unique reference number (e.g., ND-XXXXXX) to track your problem.`,
  },
  {
    patterns: [/how.*track|track.*problem|check.*status|where.*my problem|find.*my problem/i],
    answer: `To track your problem:\n1. Click **Track Problem** in the navigation bar\n2. Enter your reference number (starts with ND-, e.g., ND-A1B2C3)\n3. You'll see the current status and full timeline of updates\n\nYou can also check the **My Problems** page if you're logged in.`,
  },
  {
    patterns: [/how.*escalat|what.*escalat|escalat.*problem|when.*escalat/i],
    answer: `To escalate a problem:\n- Open the problem detail page\n- An **Escalate** button appears when:\n  - The problem has 2 or more supporters, OR\n  - The problem is 14+ days old and still unresolved\n\nEscalating sends the issue to local authorities for urgent attention.`,
  },
  {
    patterns: [/what.*status|status.*mean|acknowledged|in progress|resolved/i],
    answer: `Problems go through 3 statuses:\n- **Acknowledged** — Your report has been received and noted\n- **In Progress** — Authorities are actively working on it\n- **Resolved** — The problem has been fixed\n\nYou'll receive an email notification whenever the status changes.`,
  },
  {
    patterns: [/how.*support|upvote|vote.*problem|support.*problem/i],
    answer: `To support a problem:\n- Open any problem from the All Problems page\n- Click the **Support** button\n\nProblems with 2+ supporters become eligible for escalation. Supporting shows authorities that multiple citizens are affected.`,
  },
  {
    patterns: [/categor|type.*problem|kind.*problem/i],
    answer: `Available problem categories:\n🛣️ Road Damage\n💧 Water Supply\n🚰 Sewage\n💡 Street Light\n🗑️ Waste Management\n🏥 Public Health\n🛡️ Safety\n🏗️ Construction\n❓ Other`,
  },
  {
    patterns: [/reference.*number|ref.*number|what.*ND-|nd-/i],
    answer: `Every reported problem gets a unique **reference number** starting with ND- (e.g., ND-A1B2C3D4).\n\nYou can use this number on the Track Problem page to check your problem's status anytime — even without logging in.`,
  },
  {
    patterns: [/email.*notif|notif.*email|get.*email|send.*email/i],
    answer: `You will receive an email notification when:\n- Your problem status changes (Acknowledged → In Progress → Resolved)\n\nMake sure you used a valid email address when registering.`,
  },
  {
    patterns: [/map|location.*problem|problem.*map/i],
    answer: `The **Problem Map** shows all reported problems as pins on an interactive map.\n\nYou can click any pin to see problem details. Use it to understand which areas have the most issues.`,
  },
  {
    patterns: [/area.*stat|stat.*area|division.*stat|district.*stat|most.*common/i],
    answer: `The **Area Statistics** page (📊 Stats in the navbar) shows:\n- Total problems per Division/District/Thana\n- Number resolved vs unresolved\n- Most common problem type in each area\n\nClick any area card to drill down to more specific statistics.`,
  },
  {
    patterns: [/sign.?up|register|creat.*account/i],
    answer: `To create an account:\n1. Click **Sign Up** in the navbar\n2. Enter your name, email, and password\n3. Submit\n\nOnce registered, you can report problems, support issues, and track your submissions.`,
  },
  {
    patterns: [/log.?in|sign.?in/i],
    answer: `To log in:\n1. Click **Login** in the navbar\n2. Enter your email and password\n3. Click Login\n\nYou must be logged in to report problems, support issues, or track your submissions.`,
  },
  {
    patterns: [/hello|hi|hey|হ্যালো|হ্যালো/i],
    answer: `Hi there! 👋 I'm NagarBot, your assistant for Nagar Darpan.\n\nI can help you with:\n- Reporting or tracking problems\n- Understanding statuses\n- How to escalate issues\n- Area statistics\n\nWhat would you like to know?`,
  },
];

function getFaqAnswer(message) {
  for (const faq of FAQ) {
    if (faq.patterns.some((p) => p.test(message))) {
      return faq.answer;
    }
  }
  return null;
}

exports.chat = async (req, res) => {
  try {
    const { message, history = [] } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }

    // Detect if user is asking to track a reference number — always query DB live
    const refMatch = message.match(/ND-[A-Z0-9]+/i);
    let liveContext = '';

    if (refMatch) {
      const refNumber = refMatch[0].toUpperCase();
      const problem = await Problem.findOne({ referenceNumber: refNumber })
        .select('title status category division district thana submissionTime timeline referenceNumber');

      if (problem) {
        const latest = problem.timeline?.[problem.timeline.length - 1];
        liveContext = `Here is the live data for **${refNumber}**:\n- **Title:** ${problem.title}\n- **Category:** ${problem.category}\n- **Location:** ${problem.division} → ${problem.district} → ${problem.thana}\n- **Current Status:** ${problem.status}\n- **Reported on:** ${new Date(problem.submissionTime).toLocaleDateString()}\n- **Latest update:** ${latest ? `"${latest.notes}" (${new Date(latest.timestamp).toLocaleDateString()})` : 'No updates yet'}`;
      } else {
        liveContext = `No problem found with reference number **${refNumber}**. Please double-check the number.`;
      }
      // Return live data directly — no need for AI
      return res.status(200).json({ success: true, reply: liveContext });
    }

    // Detect live stats query
    const statsKeywords = /how many|total.*problem|problem.*total|statistics|কতটি|কত সমস্যা/i;
    if (statsKeywords.test(message)) {
      const total = await Problem.countDocuments({});
      const resolved = await Problem.countDocuments({ status: 'Resolved' });
      const inProgress = await Problem.countDocuments({ status: 'In Progress' });
      const acknowledged = await Problem.countDocuments({ status: 'Acknowledged' });
      const liveStats = `Here are the current platform statistics:\n- **Total problems reported:** ${total}\n- **Resolved:** ${resolved}\n- **In Progress:** ${inProgress}\n- **Acknowledged:** ${acknowledged}\n- **Unresolved:** ${total - resolved}\n\nVisit the 📊 **Area Stats** page for a breakdown by Division, District, and Thana.`;
      return res.status(200).json({ success: true, reply: liveStats });
    }

    // Try FAQ fallback first (works without Gemini)
    const faqAnswer = getFaqAnswer(message);

    // If no Gemini API key, use FAQ or a default reply
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
      const reply = faqAnswer || `I can help with questions about reporting problems, tracking issues, escalation, statuses, and more. Could you rephrase your question?`;
      return res.status(200).json({ success: true, reply });
    }

    // Try Gemini AI
    try {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

      const chatHistory = history.map((h) => ({
        role: h.role,
        parts: [{ text: h.text }],
      }));

      const chat = model.startChat({
        history: [
          { role: 'user', parts: [{ text: SYSTEM_PROMPT }] },
          { role: 'model', parts: [{ text: 'Understood! I am NagarBot, ready to help with Nagar Darpan.' }] },
          ...chatHistory,
        ],
      });

      const result = await chat.sendMessage(message);
      const reply = result.response.text();
      return res.status(200).json({ success: true, reply });
    } catch (aiError) {
      console.error('[Chatbot] Gemini error:', aiError.message);
      // Fall back to FAQ if Gemini fails
      const reply = faqAnswer || `I'm having trouble with the AI service right now. I can answer common questions about:\n- How to report a problem\n- How to track your problem\n- How to escalate an issue\n- Problem statuses\n\nPlease try asking one of those.`;
      return res.status(200).json({ success: true, reply });
    }
  } catch (error) {
    console.error('[Chatbot] Error:', error.message);
    res.status(500).json({ success: false, message: 'Chatbot error: ' + error.message });
  }
};
