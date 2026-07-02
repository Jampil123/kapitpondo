/**
 * components/shared/AppBar.tsx
 * ----------------------------------------------------------------------------
 * Titled top bar for authenticated screens (matches the prototype's appBar):
 * optional back chevron, centered title, optional right node.
 */
import { View, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { Text } from '../ui/Text';
import { semantic } from '../../theme/colors';

export function AppBar({
  title,
  back = true,
  right,
}: {
  title: string;
  back?: boolean;
  right?: React.ReactNode;
}) {
  const router = useRouter();
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingHorizontal: 16,
        paddingTop: 8,
        paddingBottom: 12,
        backgroundColor: semantic.background,
        borderBottomWidth: 1,
        borderBottomColor: semantic.border,
      }}
    >
      <View style={{ width: 30, alignItems: 'flex-start' }}>
        {back ? (
          <Pressable onPress={() => router.back()} hitSlop={8} style={{ marginLeft: -4 }}>
            <ChevronLeft size={24} color={semantic.textPrimary} />
          </Pressable>
        ) : null}
      </View>
      <Text variant="h3" style={{ flex: 1, textAlign: 'center', fontSize: 17 }}>
        {title}
      </Text>
      <View style={{ width: 30, alignItems: 'flex-end' }}>{right}</View>
    </View>
  );
}
