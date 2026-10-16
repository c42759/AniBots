import { DexView } from '../../../components/dex/DexView';

export const metadata = {
  title: 'AniBots Chassis Frames | AniDex Tactical Databank',
  description: 'Browse all 38+ modular AniBots robot chassis frames and 5-part combat loadouts.',
};

export default function DexBotsPage() {
  return <DexView mode="anibots" />;
}
