import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import type { DishWithAllergens, Venue } from '@/types';
import type { AllergenKey } from '@/lib/allergens';

const styles = StyleSheet.create({
  page: { padding: 24, fontFamily: 'Helvetica', fontSize: 7 },
  header: { marginBottom: 12 },
  title: { fontSize: 16, fontFamily: 'Helvetica-Bold', color: '#15803d', marginBottom: 2 },
  subtitle: { fontSize: 9, color: '#6b7280', marginBottom: 4 },
  disclaimer: {
    fontSize: 6, color: '#ef4444', backgroundColor: '#fef2f2',
    border: '1pt solid #fca5a5', borderRadius: 3, padding: 4, marginBottom: 10,
  },
  table: { width: '100%' },
  headerRow: { flexDirection: 'row', backgroundColor: '#15803d', borderRadius: 2 },
  row: { flexDirection: 'row', borderBottom: '0.5pt solid #e5e7eb' },
  rowEven: { backgroundColor: '#f9fafb' },
  dishCell: { width: 120, padding: '4pt 6pt', color: '#111827', fontFamily: 'Helvetica-Bold' },
  dishCellHeader: { width: 120, padding: '4pt 6pt', color: '#fff', fontFamily: 'Helvetica-Bold', fontSize: 7 },
  allergenCell: { flex: 1, padding: '4pt 2pt', textAlign: 'center' },
  allergenHeader: { flex: 1, padding: '4pt 2pt', textAlign: 'center', color: '#fff', fontFamily: 'Helvetica-Bold', fontSize: 6 },
  dot: { fontSize: 9, color: '#15803d', fontFamily: 'Helvetica-Bold' },
  dotNA: { fontSize: 9, color: '#d1d5db' },
  footer: { position: 'absolute', bottom: 16, left: 24, right: 24, fontSize: 6, color: '#9ca3af', flexDirection: 'row', justifyContent: 'space-between' },
});

interface Props {
  venue: Venue;
  dishes: DishWithAllergens[];
  allergens: ReadonlyArray<{ key: string; short: string; label: string }>;
}

export function AllergenMatrixDocument({ venue, dishes, allergens }: Props) {
  const now = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <Document title={`Allergen Matrix — ${venue.name}`}>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Allergen Matrix — {venue.name}</Text>
          {venue.address && <Text style={styles.subtitle}>{venue.address}</Text>}
          <Text style={styles.subtitle}>Generated {now} | UK FSA 14 Declared Allergens</Text>
        </View>

        <Text style={styles.disclaimer}>
          ⚠ DISCLAIMER: This document is an aid only. The business remains legally responsible for verifying all allergen information against current supplier specifications before serving food. Always check for cross-contamination risks. Do not rely solely on this matrix.
        </Text>

        <View style={styles.table}>
          {/* Header row */}
          <View style={styles.headerRow}>
            <Text style={styles.dishCellHeader}>Dish</Text>
            {allergens.map(a => (
              <Text key={a.key} style={styles.allergenHeader}>{a.short}</Text>
            ))}
          </View>

          {dishes.length === 0 ? (
            <View style={styles.row}>
              <Text style={{ padding: 8, color: '#9ca3af' }}>No dishes added yet.</Text>
            </View>
          ) : (
            dishes.map((dish, idx) => (
              <View key={dish.id} style={[styles.row, idx % 2 === 0 ? styles.rowEven : {}]}>
                <Text style={styles.dishCell}>{dish.name}</Text>
                {allergens.map(a => {
                  const has = dish.allergens[a.key as AllergenKey];
                  return (
                    <View key={a.key} style={styles.allergenCell}>
                      <Text style={has ? styles.dot : styles.dotNA}>{has ? '●' : '○'}</Text>
                    </View>
                  );
                })}
              </View>
            ))
          )}
        </View>

        {/* Legend */}
        <View style={{ marginTop: 8, flexDirection: 'row', gap: 16 }}>
          <Text style={{ fontSize: 6, color: '#374151' }}>● = Contains allergen   ○ = Not present</Text>
        </View>
        <View style={{ marginTop: 4 }}>
          <Text style={{ fontSize: 6, color: '#6b7280' }}>
            {allergens.map(a => `${a.short} = ${a.label}`).join('  |  ')}
          </Text>
        </View>

        <View style={styles.footer}>
          <Text>AllerSafe — allergen management for food businesses</Text>
          <Text>Printed {now}</Text>
        </View>
      </Page>
    </Document>
  );
}
