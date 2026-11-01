export const siteConfig = {
  name: 'Atunde Suleiman Shola',
  shortName: 'Atunde S.S.',
  headline: 'I build and ship products and solutions end to end.',
  githubUser: '0xdfinity',
  links: {
    github: 'https://github.com/0xdfinity',
    x: 'https://x.com/0xDfinity',
    // Supplied from prior context but not verified against the CV in this build.
    linkedin: { url: 'https://www.linkedin.com/in/atunde-ss', verified: false },
    email: { value: '', placeholder: true },
  },
  featuredRepos: ['corridorproof', 'fhevm-agent-skill', 'SignalArc', 'Aztec-AI', 'edQorta'],
};

export const featuredCopy: Record<string, { title: string; problem: string; contribution: string; fallback: string; status: string }> = {
  corridorproof: {
    title: 'CorridorProof', problem: 'Cross-border FX deals need a trustworthy record both sides can verify.',
    contribution: 'Built a Celo-based flow for signed FX trade receipts.', fallback: 'Signed FX trade receipts on Celo.', status: 'open source',
  },
  'fhevm-agent-skill': {
    title: 'FHEVM Agent Skill', problem: 'Building with encrypted smart contracts is hard to navigate without focused tooling.',
    contribution: 'Created an agent skill for working with Zama FHEVM tooling.', fallback: 'Tooling for Zama FHEVM development.', status: 'open source',
  },
  SignalArc: {
    title: 'SignalArc', problem: 'Onchain agents need clear policy controls before they can move stablecoins.',
    contribution: 'Built a policy-controlled USDC agent kit.', fallback: 'A policy-controlled USDC agent kit.', status: 'open source',
  },
  'Aztec-AI': {
    title: 'Aztec AI', problem: 'Privacy-focused applications need practical tools for exploring encrypted computation.',
    contribution: 'Building AI-assisted tooling for the Aztec ecosystem.', fallback: 'AI tooling for exploring the Aztec ecosystem.', status: 'open source',
  },
  'edQorta': {
    title: 'edQorta', problem: 'Property buyers and renters in Nigeria often face fragmented listings and agent friction.',
    contribution: 'Founder, shaping the product and building a direct connection between people and property.',
    fallback: 'A private social real estate product connecting buyers to owners and renters to landlords.',
    status: 'private · in development',
  },
};
