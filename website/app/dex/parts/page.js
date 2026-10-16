import { DexView } from '../../../components/dex/DexView';

export const metadata = {
  title: 'Modular Hardware Parts | AniDex Tactical Databank',
  description: 'Browse all 190 swappable AniBot modular parts across Head, Torso, Left Arm, Right Arm, and Legs.',
};

export default function DexPartsPage() {
  return <DexView mode="parts" />;
}
