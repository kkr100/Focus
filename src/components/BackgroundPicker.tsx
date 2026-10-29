import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { persistBackgroundImage } from '../storage';
import { Background, COLOR_PRESETS } from '../theme';

type Props = {
  visible: boolean;
  current: Background;
  onSelect: (bg: Background) => void;
  onClose: () => void;
};

export function BackgroundPicker({ visible, current, onSelect, onClose }: Props) {
  const [loading, setLoading] = useState(false);

  const pickPhoto = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Photos access needed', 'Allow photo access in Settings to use your own background.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
    });
    if (result.canceled) return;
    setLoading(true);
    try {
      const uri = await persistBackgroundImage(result.assets[0].uri);
      onSelect({ kind: 'image', uri });
      onClose();
    } catch {
      Alert.alert('Could not use that photo', 'Please try a different one.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={styles.sheet}>
        <View style={styles.header}>
          <Text style={styles.title}>Background</Text>
          <Pressable onPress={onClose} hitSlop={12} accessibilityRole="button">
            <Text style={styles.done}>Done</Text>
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.section}>Photo</Text>
          <Pressable
            onPress={pickPhoto}
            disabled={loading}
            accessibilityRole="button"
            style={({ pressed }) => [styles.photoButton, pressed && { opacity: 0.6 }]}
          >
            {current.kind === 'image' ? (
              <Image source={{ uri: current.uri }} style={styles.photoPreview} />
            ) : null}
            {loading ? (
              <ActivityIndicator />
            ) : (
              <Text style={styles.photoText}>
                {current.kind === 'image' ? 'Choose a different photo' : 'Choose from your photos'}
              </Text>
            )}
          </Pressable>

          <Text style={styles.section}>Solid color</Text>
          <View style={styles.grid}>
            {COLOR_PRESETS.map((color) => {
              const selected = current.kind === 'color' && current.color === color;
              return (
                <Pressable
                  key={color}
                  onPress={() => onSelect({ kind: 'color', color })}
                  accessibilityRole="button"
                  accessibilityLabel={`Color ${color}`}
                  accessibilityState={{ selected }}
                  style={[styles.swatch, { backgroundColor: color }, selected && styles.swatchSelected]}
                />
              );
            })}
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  sheet: { flex: 1, backgroundColor: '#F2F2F7' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },
  title: { fontSize: 22, fontWeight: '700', color: '#111' },
  done: { fontSize: 17, fontWeight: '600', color: '#3B82F6' },
  content: { paddingHorizontal: 20, paddingBottom: 40 },
  section: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
    textTransform: 'uppercase',
    marginTop: 20,
    marginBottom: 10,
  },
  photoButton: {
    height: 120,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  photoPreview: { ...StyleSheet.absoluteFill, opacity: 0.35 },
  photoText: { fontSize: 16, fontWeight: '600', color: '#111' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
  swatch: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  swatchSelected: { borderWidth: 4, borderColor: '#3B82F6' },
});
