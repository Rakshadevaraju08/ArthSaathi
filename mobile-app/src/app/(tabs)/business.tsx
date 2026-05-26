import { SafeAreaView } from 'react-native-safe-area-context';

import { MandiDashboard } from '../../components/ledger/MandiDashboard';
import { TailorOrders } from '../../components/ledger/TailorOrders';
import { UdharBook } from '../../components/ledger/UdharBook';
import { WageTracker } from '../../components/ledger/WageTracker';
import { useStore } from '../../store';

export default function BusinessScreen() {
  const occupation = useStore((s) => s.occupation);

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={['top']}>
      {occupation === 'FARMER' && <MandiDashboard />}
      {occupation === 'SHOP_OWNER' && <UdharBook />}
      {occupation === 'TAILOR' && <TailorOrders />}
      {occupation === 'DAILY_WAGE' && <WageTracker />}
    </SafeAreaView>
  );
}
