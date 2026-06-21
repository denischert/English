import { ScenarioItem } from "../types";

export const SCENARIO_ITEMS: ScenarioItem[] = [
  {
    id: "sc-1",
    context: "A deadline is at risk and you need to inform your manager.",
    prompt: "Tell your manager the project will be late.",
    weakPhrase: "I think we are gonna be a little late, sorry about that.",
    strongPhrase:
      "I want to flag early that we're tracking two days behind. Here's the plan to recover the timeline.",
  },
  {
    id: "sc-2",
    context: "A client is pushing back on price during a negotiation.",
    prompt: "Respond to a client asking for a 20% discount.",
    weakPhrase: "Umm, maybe we could do a small discount, I'm not sure.",
    strongPhrase:
      "I can offer a 5% discount if we extend the contract to twelve months. Does that work for your budget?",
  },
  {
    id: "sc-3",
    context: "You disagree with a colleague's plan in a meeting.",
    prompt: "Push back on a colleague's proposal diplomatically.",
    weakPhrase: "I don't think that's a good idea, it won't work.",
    strongPhrase:
      "I see the appeal, but I'm concerned about the timeline risk. Could we stress-test the assumptions first?",
  },
  {
    id: "sc-4",
    context: "You need to ask for more resources from leadership.",
    prompt: "Request additional headcount for your team.",
    weakPhrase: "We need more people, we are very busy right now.",
    strongPhrase:
      "Based on current velocity, we're short two engineers to hit the Q3 roadmap. I'd like to discuss headcount options.",
  },
  {
    id: "sc-5",
    context: "You're closing a meeting and assigning next steps.",
    prompt: "Wrap up a meeting with clear action items.",
    weakPhrase: "Okay so yeah, let's just do the things we said.",
    strongPhrase:
      "To summarize: Sarah owns the proposal by Friday, I'll follow up with finance, and we'll reconvene Monday at 10.",
  },
  {
    id: "sc-6",
    context: "A stakeholder is unhappy with a delayed feature.",
    prompt: "Address a frustrated stakeholder's concerns.",
    weakPhrase: "Sorry, sorry, we are trying our best, it's hard.",
    strongPhrase:
      "I understand the frustration. Here's exactly what caused the delay and the steps we're taking to prevent it going forward.",
  },
  {
    id: "sc-7",
    context: "You're pitching a new idea to senior leadership.",
    prompt: "Pitch a cost-saving initiative in one breath.",
    weakPhrase: "So I had this idea, it might save us money maybe.",
    strongPhrase:
      "This initiative is projected to cut operating costs by 12% within two quarters, with minimal execution risk.",
  },
  {
    id: "sc-8",
    context: "You need to decline a meeting request tactfully.",
    prompt: "Decline a low-priority meeting invite.",
    weakPhrase: "I can't come, I'm busy, maybe another time.",
    strongPhrase:
      "I won't be able to join, but I'll review the notes and share input asynchronously beforehand.",
  },
];
