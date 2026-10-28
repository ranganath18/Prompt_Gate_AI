// Human-friendly labels for the values defined in backend/app/schemas/ingestion.py.
export const INTENT_LABELS = {
  greeting: "Greeting",
  order_tracking: "Order tracking",
  payment_issue: "Payment issue",
  current_time: "Current time",
  general_question: "General question",
  unknown: "Unknown",
};

// Follow-up prompts shown in the insights panel for each detected intent.
export const FOLLOW_UPS = {
  payment_issue: [
    "How long does a refund usually take?",
    "What details should I share with support?",
    "How can I avoid duplicate charges next time?",
  ],
  order_tracking: [
    "What if my order is delayed?",
    "How do I change my delivery address?",
    "Can I cancel an order that has shipped?",
  ],
  greeting: [
    "What can you help me with?",
    "How do I contact customer support?",
    "What are your refund policies?",
  ],
  current_time: [
    "What are your support hours?",
    "How fast do you usually reply?",
  ],
  general_question: [
    "Can you explain that more simply?",
    "What should I do next?",
    "How do I contact customer support?",
  ],
  unknown: [
    "What kinds of questions can you answer?",
    "I need help with a payment.",
    "I want to check my order status.",
  ],
};

export const intentLabel = (intent) => INTENT_LABELS[intent] ?? intent;
