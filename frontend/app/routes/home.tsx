import type { Route } from "./+types/home";
import { Welcome } from "../welcome/welcome";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Composable DeFi Automations - IFTTT for DeFi" },
    { name: "description", content: "Automate complex DeFi strategies across multiple blockchains with zero code required. Cross-chain automation, AI-powered suggestions, and risk management built on 1inch." },
    { name: "keywords", content: "DeFi, automation, cross-chain, no-code, 1inch, IFTTT, blockchain, yield farming, portfolio management" },
    { property: "og:title", content: "Composable DeFi Automations - IFTTT for DeFi" },
    { property: "og:description", content: "Automate complex DeFi strategies across multiple blockchains with zero code required." },
    { property: "og:type", content: "website" },
  ];
}

export default function Home() {
  return <Welcome />;
}
